# スキーマキャッシュのリフレッシュ方法

## 🔍 問題の原因

エラーメッセージ `PGRST205: Could not find the table 'public.inquiries' in the schema cache` は、**スキーマキャッシュが更新されていない**ことを示しています。

テーブルは作成されているが、SupabaseのAPI層（PostgREST）のスキーマキャッシュが更新されていないため、アプリケーション側でテーブルが見つからない状態です。

## ✅ 解決方法（順番に試してください）

### 方法1: Supabase Dashboard からスキーマキャッシュをリフレッシュ（推奨）

1. **Supabase Dashboard を開く**
2. **Settings → API** に移動
3. **「Reload schema cache」** または **「Refresh schema」** ボタンを探す
   - ボタンが見つからない場合は、方法2を試してください

### 方法2: テーブルに直接アクセスしてキャッシュを更新

以下のSQLを Supabase Dashboard の SQL Editor で実行してください：

```sql
-- テーブルに直接アクセスしてキャッシュを更新
SELECT COUNT(*) FROM inquiries;
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM user_profiles;
```

これにより、PostgRESTがスキーマを再読み込みする可能性があります。

### 方法3: 少し待つ（自動更新）

通常、テーブルを作成してから数分で自動的にスキーマキャッシュが更新されます。

1. **5-10分待つ**
2. **ブラウザをハードリロード**（`Ctrl + Shift + R`）
3. **アプリケーションで再度試す**

### 方法4: Supabaseプロジェクトを再起動（最終手段）

1. **Supabase Dashboard → Settings → General**
2. **プロジェクトを一時停止**（Pause Project）
3. **数分待つ**
4. **プロジェクトを再開**（Resume Project）
5. **数分待ってから再度試す**

## 🔍 確認方法

スキーマキャッシュが更新されたかどうかを確認するには：

1. **ブラウザのコンソール**（F12 → Console）を開く
2. **アプリケーションで「問い合わせ管理」または「資料管理」を開く**
3. **エラーが出なくなれば成功**

## 📋 手順（詳細）

### ステップ1: SQL Editor でテーブルにアクセス

1. **Supabase Dashboard → SQL Editor** を開く
2. 以下のSQLを実行：

```sql
-- テーブルの存在を確認
SELECT 
  'inquiries' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inquiries')
    THEN '✓ 存在します'
    ELSE '✗ 存在しません'
  END as status;

SELECT 
  'documents' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents')
    THEN '✓ 存在します'
    ELSE '✗ 存在しません'
  END as status;

-- テーブルに直接アクセスしてキャッシュを更新
SELECT COUNT(*) FROM inquiries;
SELECT COUNT(*) FROM documents;
```

3. **結果を確認**:
   - すべて「✓ 存在します」と表示されれば、テーブルは作成されています
   - `COUNT(*)` が正常に実行されれば、テーブルにアクセスできます

### ステップ2: スキーマキャッシュをリフレッシュ

1. **Supabase Dashboard → Settings → API** を開く
2. **「Reload schema cache」** または **「Refresh schema」** ボタンをクリック
3. **数秒待つ**

### ステップ3: ブラウザのキャッシュをクリア

1. **ブラウザで `Ctrl + Shift + Delete`**（Windows）または `Cmd + Shift + Delete`（Mac）
2. **「キャッシュされたファイルと画像」**を選択して削除
3. **ブラウザを再起動**

### ステップ4: アプリケーションで再度試す

1. **アプリケーションにログイン**
2. **管理者ダッシュボード → 「📧 お問い合わせ管理」**を開く
3. **エラーが出ないか確認**
4. **管理者ダッシュボード → 「📄 資料管理」**を開く
5. **エラーが出ないか確認**

## 🆘 まだエラーが出る場合

### エラー: 「Could not find the table 'public.inquiries' in the schema cache」

**解決方法**:
1. 上記の方法1-4を順番に試してください
2. それでも解決しない場合は、`FORCE_REFRESH_SCHEMA.sql` を実行してください

### エラー: 「Could not find the table 'public.documents' in the schema cache」

**解決方法**:
1. 上記の方法1-4を順番に試してください
2. それでも解決しない場合は、`FORCE_REFRESH_SCHEMA.sql` を実行してください

## 📝 まとめ

- **スキーマキャッシュのリフレッシュが必要です**
- まず、SQL Editor でテーブルに直接アクセスしてみてください
- それでも解決しない場合は、Supabase Dashboard の Settings → API からスキーマキャッシュをリフレッシュしてください
