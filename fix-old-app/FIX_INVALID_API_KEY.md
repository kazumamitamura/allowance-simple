# Invalid API Key エラーの解決方法

## 🔍 問題の原因

「Invalid API key」エラーは、**Vercel の環境変数が正しく設定されていない**ことが原因です。

## 🔧 解決手順

### ステップ1: Supabase Dashboard で API キーを確認

1. **Supabase Dashboard** を開く
2. **Settings** → **API** を開く
3. 以下の情報をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** キー: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### ステップ2: Vercel の環境変数を設定

1. **Vercel Dashboard** を開く
   - https://vercel.com/dashboard
2. **プロジェクトを選択**（`haguro-allowance-app`）
3. **Settings** → **Environment Variables** を開く
4. 以下の環境変数を設定：

#### 環境変数の追加

**変数名**: `NEXT_PUBLIC_SUPABASE_URL`
**値**: Supabase Dashboard でコピーした **Project URL**
**環境**: Production, Preview, Development すべてにチェック

**変数名**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**値**: Supabase Dashboard でコピーした **anon public** キー
**環境**: Production, Preview, Development すべてにチェック

### ステップ3: 環境変数の確認

設定した環境変数が以下と一致しているか確認：

- **NEXT_PUBLIC_SUPABASE_URL**: `https://xxxxx.supabase.co` の形式
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` の形式（長い文字列）

### ステップ4: Vercel を再デプロイ

環境変数を設定した後、**必ず再デプロイ**してください：

1. **Vercel Dashboard** → **Deployments** を開く
2. **最新のデプロイメント**の右側の **「...」** をクリック
3. **「Redeploy」** をクリック
4. または、**GitHub にプッシュ**して自動デプロイをトリガー

### ステップ5: 動作確認

再デプロイ後、以下を確認：

1. **アプリケーションにアクセス**（`https://haguro-allowance-app.vercel.app`）
2. **ログインページ**でログインを試す
3. **エラーが出ないか確認**

## ⚠️ 重要なポイント

### 環境変数の命名規則

- **`NEXT_PUBLIC_` プレフィックスが必要**: Next.js でクライアント側からアクセスする環境変数には、必ず `NEXT_PUBLIC_` プレフィックスが必要です
- **大文字小文字を正確に**: `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` は正確に

### 環境変数の設定場所

- **Vercel**: 本番環境用（`haguro-allowance-app.vercel.app`）
- **ローカル**: `.env.local` ファイル（開発用）

### よくある間違い

1. **`NEXT_PUBLIC_` プレフィックスを忘れる**: クライアント側からアクセスできない
2. **環境変数を設定したが再デプロイしない**: 変更が反映されない
3. **間違った Supabase プロジェクトのキーを使用**: 別のプロジェクトを参照している
4. **ANON_KEY の代わりに SERVICE_ROLE_KEY を使用**: セキュリティ上の問題

## 🔍 トラブルシューティング

### まだエラーが出る場合

1. **Vercel のログを確認**:
   - Vercel Dashboard → **Deployments** → **最新のデプロイメント** → **「View Function Logs」**
   - エラーメッセージを確認

2. **ブラウザのコンソールを確認**:
   - F12 キーを押して開発者ツールを開く
   - **Console** タブでエラーメッセージを確認

3. **環境変数が正しく設定されているか確認**:
   - Vercel Dashboard → **Settings** → **Environment Variables**
   - 各環境変数の値が正しいか確認

4. **Supabase プロジェクトが正しいか確認**:
   - Supabase Dashboard の URL と、Vercel の環境変数の URL が一致しているか確認

## 📝 確認チェックリスト

- [ ] Supabase Dashboard で API キーを確認
- [ ] Vercel の環境変数 `NEXT_PUBLIC_SUPABASE_URL` を設定
- [ ] Vercel の環境変数 `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- [ ] 環境変数を Production, Preview, Development すべてに設定
- [ ] Vercel を再デプロイ
- [ ] アプリケーションでログインを試す
- [ ] エラーが出ないか確認

## 💡 次のステップ

環境変数を設定して再デプロイした後、ログインが正常に動作するか確認してください。

もし、まだエラーが出る場合は、Vercel のログとブラウザのコンソールのエラーメッセージを共有してください。
