'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function uploadDocument(data: {
  title: string
  file: File
  userEmail: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // ユーザー認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'ログインが必要です' }
  }

  try {
    // ファイル名を生成（タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const fileName = `${timestamp}_${data.file.name}`
    const filePath = fileName

    // Supabase Storageにアップロード
    const fileBuffer = await data.file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Storageアップロードエラー:', uploadError)
      // バケットが存在しない場合の詳細なエラーメッセージ
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        return { error: 'ファイルのアップロードに失敗しました: Bucket not found\n\nSupabase Dashboard で Storage バケット「documents」を作成してください。\n詳細は SETUP_INQUIRIES_AND_DOCUMENTS.md を参照してください。' }
      }
      return { error: 'ファイルのアップロードに失敗しました: ' + uploadError.message }
    }

    // データベースにレコードを保存
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: data.title,
        file_path: filePath,
        file_name: data.file.name,
        file_size: data.file.size,
        uploaded_by: data.userEmail
      })
      .select()
      .single()

    if (insertError) {
      console.error('データベース保存エラー（詳細）:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        fullError: insertError
      })
      
      // Storageからファイルを削除（ロールバック）
      try {
        await supabase.storage.from('documents').remove([filePath])
      } catch (removeError) {
        console.error('Storage削除エラー（ロールバック）:', removeError)
      }
      
      // テーブルが存在しない場合のエラーメッセージ（複数のパターンをチェック）
      const errorMessage = insertError.message || ''
      const errorCode = insertError.code || ''
      const errorDetails = insertError.details || ''
      const errorHint = insertError.hint || ''
      
      // スキーマキャッシュのエラー（PGRST205）の特別処理
      const isSchemaCacheError = (
        errorCode === 'PGRST205' ||
        (errorMessage.includes('schema cache') && errorMessage.includes('Could not find'))
      )
      
      // テーブルが存在しない場合
      const isTableNotFound = (
        errorMessage.includes('does not exist') || 
        errorMessage.includes('schema cache') || 
        errorMessage.includes('relation') ||
        errorMessage.includes('table') ||
        errorMessage.includes('documents') ||
        errorCode === '42P01' ||
        errorCode === 'PGRST116' ||
        errorDetails.includes('documents') ||
        errorHint.includes('documents')
      )
      
      if (isSchemaCacheError) {
        return { 
          error: 'データの保存に失敗しました: スキーマキャッシュが更新されていません。\n\n【解決方法】\n1. Supabase Dashboard → Settings → API を開く\n2. "Reload schema cache" または "Refresh schema" ボタンをクリック\n3. 数秒待ってから再度お試しください\n\nまたは、以下のSQLを実行してください：\nSELECT COUNT(*) FROM documents;\n\nエラー詳細:\nメッセージ: ' + errorMessage + '\nコード: ' + errorCode 
        }
      }
      
      if (isTableNotFound) {
        return { 
          error: 'データの保存に失敗しました: 資料テーブルが作成されていません。\n\n【解決方法】\n1. Supabase Dashboard の SQL Editor を開く\n2. SETUP_INQUIRIES_AND_DOCUMENTS.sql の内容をコピー\n3. SQL Editor に貼り付けて実行\n\nエラー詳細:\nメッセージ: ' + errorMessage + '\nコード: ' + errorCode 
        }
      }
      
      return { 
        error: 'データの保存に失敗しました: ' + errorMessage + (errorCode ? ' (コード: ' + errorCode + ')' : '') + '\n\n詳細: ' + (errorDetails || 'なし') + (errorHint ? '\nヒント: ' + errorHint : '')
      }
    }

    return { success: true, documentId: document.id }
  } catch (err) {
    console.error('文書アップロード処理エラー:', err)
    return { error: '予期しないエラーが発生しました' }
  }
}
