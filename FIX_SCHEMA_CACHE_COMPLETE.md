# スキーマキャッシュ問題の完全解決手順

## 🔍 現状確認

`NOTIFY pgrst, 'reload schema';` を実行した後も、まだ「テーブルがない」というエラーが出ている場合、以下の手順で確認・解決してください。

## ステップ1: テーブルの存在確認

### 1-1. SQLでテーブルが存在するか確認

Supabase Dashboard の SQL Editor で、以下のSQLを実行してください：

```sql
-- VERIFY_TABLES_EXIST.sql の内容を実行
```

**期待される結果**:
- `inquiries` テーブルが存在する
- `documents` テーブルが存在する
- `user_profiles` テーブルが存在する
- 各テーブルのカラム情報が表示される
- RLSが有効になっている
- `COUNT(*)` が正常に実行される（エラーが出ない）

**もしテーブルが存在しない場合**:
1. `SETUP_INQUIRIES_AND_DOCUMENTS.sql` を再実行してください

## ステップ2: スキーマキャッシュの強制リフレッシュ

### 2-1. Supabase Dashboard でリフレッシュ

1. **Supabase Dashboard** を開く
2. **Settings** → **API** を開く
3. **「Reload schema cache」** または **「Refresh schema」** ボタンをクリック
4. **数秒待つ**（10-30秒）

### 2-2. 再度 NOTIFY コマンドを実行

SQL Editor で以下を実行：

```sql
NOTIFY pgrst, 'reload schema';
```

### 2-3. テーブルに直接アクセスしてキャッシュを更新

SQL Editor で以下を実行：

```sql
-- 各テーブルに直接アクセスしてキャッシュを更新
SELECT * FROM inquiries LIMIT 1;
SELECT * FROM documents LIMIT 1;
SELECT * FROM user_profiles LIMIT 1;
```

## ステップ3: プロジェクトの一時停止と再開（最終手段）

もし上記の方法で解決しない場合：

1. **Supabase Dashboard** → **Settings** → **General**
2. **「Pause project」** をクリック
3. **30秒待つ**
4. **「Resume project」** をクリック
5. **数分待つ**（プロジェクトが完全に再起動するまで）

## ステップ4: ブラウザのキャッシュを完全にクリア

1. **ブラウザで `Ctrl + Shift + Delete`**（Windows）または `Cmd + Shift + Delete`（Mac）
2. **「すべての期間」**を選択
3. **以下をすべてチェック**:
   - 閲覧履歴
   - Cookie と他のサイトデータ
   - キャッシュされた画像とファイル
4. **「データを削除」**をクリック
5. **ブラウザを完全に再起動**

## ステップ5: アプリケーションで再度試す

### 5-1. お問い合わせ機能

1. アプリケーションにログイン
2. **「📧 お問い合わせ」**ボタンをクリック
3. 件名とメッセージを入力して送信
4. **エラーが出ないか確認**

### 5-2. 管理者画面

1. 管理者でログイン
2. **「📧 お問い合わせ管理」**を開く
3. **「📄 資料管理」**を開く
4. **エラーが出ないか確認**

### 5-3. 規約閲覧機能

1. **「📄 規約閲覧」**ボタンをクリック
2. **エラーが出ないか確認**

## 🔧 まだエラーが出る場合

### エラーメッセージを確認

エラーメッセージの**詳細**（エラーコード、メッセージ全文）を確認してください。

### よくあるエラーと対処法

#### エラー: `PGRST205` または `Could not find the table 'public.inquiries' in the schema cache`

**対処法**:
1. **ステップ2**を再度実行
2. **ステップ3**（プロジェクトの一時停止と再開）を試す
3. **数分待ってから再度試す**（スキーマキャッシュの更新には時間がかかる場合があります）

#### エラー: `relation "inquiries" does not exist` または `42P01`

**対処法**:
1. **ステップ1**でテーブルが存在するか確認
2. テーブルが存在しない場合は、`SETUP_INQUIRIES_AND_DOCUMENTS.sql` を再実行

#### エラー: `permission denied` または `42501`

**対処法**:
1. RLSポリシーが正しく設定されているか確認
2. `CHECK_RLS_POLICIES.sql` を実行してポリシーを確認
3. 必要に応じて `SETUP_INQUIRIES_AND_DOCUMENTS.sql` を再実行

## 📝 確認チェックリスト

- [ ] テーブルが存在する（`VERIFY_TABLES_EXIST.sql` で確認）
- [ ] RLSが有効になっている
- [ ] RLSポリシーが正しく設定されている
- [ ] Supabase Dashboard で「Reload schema cache」を実行
- [ ] `NOTIFY pgrst, 'reload schema';` を実行
- [ ] テーブルに直接アクセスしてキャッシュを更新
- [ ] ブラウザのキャッシュを完全にクリア
- [ ] ブラウザを完全に再起動
- [ ] アプリケーションで再度試す

## 💡 ヒント

- **スキーマキャッシュの更新には時間がかかる場合があります**（数秒から数分）
- **複数の方法を組み合わせて試す**と効果的です
- **エラーメッセージの詳細を確認**すると、問題の原因を特定しやすくなります
