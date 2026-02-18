'use client'

import { useState, useTransition } from 'react'
import { resetPassword } from '../auth/actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await resetPassword(formData)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">💰</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">パスワードをお忘れですか？</h2>
          <p className="text-sm text-gray-600 mt-2">
            登録したメールアドレスを入力してください
          </p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {success ? (
            /* 送信完了メッセージ */
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">メールを送信しました</h3>
                <p className="text-sm text-gray-700 mb-4">
                  パスワードリセット用のリンクを記載したメールを送信しました。<br />
                  メールボックスを確認してください。
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
                  <p className="text-xs text-blue-900">
                    <strong>📧 メールが届かない場合：</strong>
                  </p>
                  <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>迷惑メールフォルダを確認してください</li>
                    <li>メールアドレスが正しいか確認してください</li>
                    <li>数分待ってから再度お試しください</li>
                  </ul>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                ログイン画面に戻る
              </Link>
            </div>
          ) : (
            /* メールアドレス入力フォーム */
            <>
              {/* エラーメッセージ */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-bold text-gray-900"
                    disabled={isPending}
                  />
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>送信中...</span>
                    </>
                  ) : (
                    <span>リセットメールを送信</span>
                  )}
                </button>
              </form>

              {/* 戻るリンク */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 font-bold underline"
                >
                  ← ログイン画面に戻る
                </Link>
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2026 手当管理システム
          </p>
        </div>
      </div>
    </div>
  )
}
