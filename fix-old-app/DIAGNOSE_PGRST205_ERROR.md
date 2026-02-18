# PGRST205 エラーの詳細診断

## 🔍 考えられる原因

`PGRST205` エラーが続く場合、以下の原因が考えられます：

### 1. **Supabase プロジェクトの設定問題**
- API キーが正しく設定されていない
- プロジェクトが異なる環境（本番/開発）を参照している
- PostgREST のバージョンや設定の問題

### 2. **環境変数の問題**
- Vercel の環境変数が正しく設定されていない
- ローカル環境と本番環境で異なる Supabase プロジェクトを参照している

### 3. **PostgREST のスキーマキャッシュの問題**
- スキーマキャッシュが完全に更新されていない
- PostgREST の再起動が必要

### 4. **テーブルの可視性の問題**
- テーブルが `public` スキーマに存在しない
- テーブル名の大文字小文字の問題
- スキーマの検索パスが正しく設定されていない

## 🔧 診断手順

### ステップ1: 環境変数の確認

#### Vercel の環境変数を確認

1. **Vercel Dashboard** を開く
2. **プロジェクト** → **Settings** → **Environment Variables** を開く
3. 以下の環境変数が正しく設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### ローカル環境変数の確認

`.env.local` ファイルを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**確認ポイント**:
- URL と ANON_KEY が正しい Supabase プロジェクトを指しているか
- 本番環境とローカル環境で同じプロジェクトを参照しているか

### ステップ2: Supabase API に直接アクセスして確認

ブラウザの開発者ツール（F12）のコンソールで、以下のコードを実行してください：

```javascript
// Supabase の URL と ANON_KEY を確認
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// 直接 API にアクセスしてテーブルが認識されているか確認
fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/inquiries?select=*&limit=1`, {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
  }
})
  .then(res => res.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

### ステップ3: PostgREST のスキーマ検索パスを確認

SQL Editor で以下を実行：

```sql
-- 現在の検索パスを確認
SHOW search_path;

-- 検索パスを設定（必要に応じて）
SET search_path = public, auth;
```

### ステップ4: テーブルの完全な存在確認

SQL Editor で以下を実行：

```sql
-- 1. テーブルが public スキーマに存在するか確認
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'inquiries';

-- 2. テーブルの権限を確認
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'inquiries';

-- 3. RLS が有効か確認
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'inquiries';
```

### ステップ5: PostgREST のログを確認

1. **Supabase Dashboard** → **Logs** → **Postgres Logs** を開く
2. エラーログを確認
3. `PGRST205` に関連するエラーがないか確認

## 🔧 追加の解決方法

### 方法1: Supabase プロジェクトの再作成（最終手段）

もし上記の方法で解決しない場合：

1. **新しい Supabase プロジェクトを作成**
2. **SETUP_INQUIRIES_AND_DOCUMENTS.sql を実行**
3. **環境変数を更新**
4. **アプリケーションを再デプロイ**

### 方法2: PostgREST の設定を確認

Supabase の PostgREST 設定を確認するには、Supabase サポートに問い合わせる必要がある場合があります。

### 方法3: 一時的な回避策

スキーマキャッシュの問題を回避するために、直接 SQL を実行する方法：

```typescript
// app/contact/actions.ts で、直接 SQL を実行する方法を試す
const { data, error } = await supabase.rpc('insert_inquiry', {
  p_user_id: user.id,
  p_user_email: data.userEmail,
  p_user_name: data.userName,
  p_subject: data.subject,
  p_message: data.message
});
```

ただし、この方法には関数の作成が必要です。

## 📝 確認チェックリスト

- [ ] Vercel の環境変数が正しく設定されている
- [ ] ローカル環境変数が正しく設定されている
- [ ] 本番環境とローカル環境で同じ Supabase プロジェクトを参照している
- [ ] テーブルが `public` スキーマに存在する
- [ ] RLS が有効になっている
- [ ] RLS ポリシーが正しく設定されている
- [ ] PostgREST のログにエラーがない

## 💡 次のステップ

1. **ステップ1（環境変数の確認）**を実行してください
2. **ステップ2（API に直接アクセス）**を実行してください
3. 結果を共有してください

特に、**環境変数が正しい Supabase プロジェクトを指しているか**を確認してください。
