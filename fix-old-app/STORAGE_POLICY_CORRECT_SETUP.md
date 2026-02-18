# Storageポリシーの正しい設定方法

## ⚠️ 重要な注意事項

**`bucket_id = 'documents'` は削除しないでください！**

この条件は、どのStorageバケットに対するポリシーなのかを指定するために必要です。

## 📋 正しい設定方法

### ポリシー1: 認証ユーザーは資料を閲覧可能

**Policy definition** フィールドに、以下の**すべて**をコピーして貼り付けてください：

```
bucket_id = 'documents' AND auth.role() = 'authenticated'
```

**⚠️ 注意**: 
- `bucket_id = 'documents'` を削除しないでください
- `AND` でつなげてください
- 全体を1行で入力してください

### ポリシー2: 管理者のみ資料をアップロード可能

**Policy definition** フィールドに、以下の**すべて**をコピーして貼り付けてください：

```
bucket_id = 'documents' AND EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.user_id = auth.uid()
  AND user_profiles.email IN (
    'mitamuraka@haguroko.ed.jp',
    'tomonoem@haguroko.ed.jp'
  )
)
```

**⚠️ 注意**: 
- `bucket_id = 'documents'` を削除しないでください
- `AND` でつなげてください
- 複数行でも問題ありません

### ポリシー3: 管理者のみ資料を削除可能

**Policy definition** フィールドに、以下の**すべて**をコピーして貼り付けてください（ポリシー2と同じ）：

```
bucket_id = 'documents' AND EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.user_id = auth.uid()
  AND user_profiles.email IN (
    'mitamuraka@haguroko.ed.jp',
    'tomonoem@haguroko.ed.jp'
  )
)
```

## 🔍 設定画面での入力例

### ポリシー1の設定例

```
Policy name: Authenticated users can view documents
Allowed operations: SELECT ✓
Policy definition: 
  bucket_id = 'documents' AND auth.role() = 'authenticated'
```

### ポリシー2の設定例

```
Policy name: Admins can upload documents
Allowed operations: INSERT ✓
Policy definition: 
  bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.email IN (
      'mitamuraka@haguroko.ed.jp',
      'tomonoem@haguroko.ed.jp'
    )
  )
```

## ❌ よくある間違い

### 間違い1: `bucket_id = 'documents'` を削除する

```
❌ 間違い:
auth.role() = 'authenticated'

✅ 正しい:
bucket_id = 'documents' AND auth.role() = 'authenticated'
```

### 間違い2: `AND` を忘れる

```
❌ 間違い:
bucket_id = 'documents' auth.role() = 'authenticated'

✅ 正しい:
bucket_id = 'documents' AND auth.role() = 'authenticated'
```

## ✅ 設定後の確認

ポリシーを正しく設定した後、以下のように表示されるはずです：

1. **Storage → Files → Policies → Buckets** セクション
2. `documents` バケットの下に、3つのポリシーが表示される
3. 「No policies created yet」というメッセージが消える

## 🧪 動作確認

ポリシーを設定した後、以下を確認してください：

1. **スキーマキャッシュをリフレッシュ**
   - Settings → API → 「Reload schema cache」

2. **アプリケーションで動作確認**
   - 管理者でログイン
   - 資料管理ページでPDFをアップロード
   - エラーが出ないか確認

## 🆘 まだエラーが出る場合

1. **ポリシーが正しく設定されているか確認**
   - Storage → Files → Policies → Buckets
   - `documents` バケットの下に3つのポリシーが表示されているか

2. **ポリシーの内容を確認**
   - 各ポリシーをクリックして、Policy definition に `bucket_id = 'documents'` が含まれているか確認

3. **ブラウザのコンソールを確認**
   - F12 → Console タブ
   - エラーメッセージを確認
