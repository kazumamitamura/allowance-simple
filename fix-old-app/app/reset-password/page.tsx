'use client'

import { useState, useTransition } from 'react'
import { updatePassword } from '../auth/actions'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await updatePassword(formData)
      
      if (result?.error) {
        setError(result.error)
      }
      // 成功時は自動的に / にリダイレクトされる
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">🔐</h1>
          <h2 className="text-2xl font-bold text-gray-900">新しいパスワードを設定</h2>
          <p className="text-sm text-gray-600 mt-2">
            新しいパスワードを入力してください
          </p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 新しいパスワード */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                新しいパスワード
              </label>
              <input
                type="password"
                name="password"
                placeholder="6文字以上"
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-bold text-gray-900"
                disabled={isPending}
              />
              <p className="text-xs text-gray-600 mt-1">6文字以上で設定してください</p>
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                パスワード（確認用）
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="もう一度入力してください"
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition font-bold text-gray-900"
                disabled={isPending}
              />
            </div>

            {/* 変更ボタン */}
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
                  <span>更新中...</span>
                </>
              ) : (
                <span>パスワードを変更</span>
              )}
            </button>
          </form>

          {/* 注意事項 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-bold mb-2">
                💡 パスワード設定のヒント
              </p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>推測されにくいパスワードを設定しましょう</li>
                <li>他のサービスと同じパスワードは避けましょう</li>
                <li>定期的にパスワードを変更することをお勧めします</li>
              </ul>
            </div>
          </div>
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
