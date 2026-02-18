# Storageポリシーの設定ガイド

## 🔍 問題点

画像を確認したところ、以下の問題が見つかりました：

1. ✅ **Storageバケット `documents` は存在する**（確認済み）
2. ❌ **Storageバケットのポリシーが設定されていない**（"No policies created yet" と表示）
3. ⚠️ **`storage.objects` テーブルのRLSポリシーは設定されているが、Storageバケット自体のポリシーが必要**

## 📋 解決方法：Storageバケットのポリシーを設定

### ステップ1: Storageポリシー設定画面を開く

1. **Supabase Dashboard → Storage → Files** を開く
2. **「Policies」タブ** をクリック
3. **「Buckets」セクション** で `documents` バケットを探す
4. **「New policy」ボタン** をクリック

### ステップ2: ポリシー1を設定（認証ユーザーは資料を閲覧可能）

1. **「For full customization」** を選択
2. 以下の設定を入力：
   - **Policy name**: `Authenticated users can view documents`
   - **Allowed operations**: `SELECT` にチェック
   - **Policy definition**: 以下のSQLコードをコピー:
     ```
     bucket_id = 'documents' AND auth.role() = 'authenticated'
     ```
3. **「Review」** → **「Create policy」** をクリック

### ステップ3: ポリシー2を設定（管理者のみ資料をアップロード可能）

1. **「New policy」** をクリック
2. **「For full customization」** を選択
3. 以下の設定を入力：
   - **Policy name**: `Admins can upload documents`
   - **Allowed operations**: `INSERT` にチェック
   - **Policy definition**: 以下のSQLコードをコピー:
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
4. **「Review」** → **「Create policy」** をクリック

### ステップ4: ポリシー3を設定（管理者のみ資料を削除可能）

1. **「New policy」** をクリック
2. **「For full customization」** を選択
3. 以下の設定を入力：
   - **Policy name**: `Admins can delete documents`
   - **Allowed operations**: `DELETE` にチェック
   - **Policy definition**: 以下のSQLコードをコピー（ポリシー2と同じ）:
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
4. **「Review」** → **「Create policy」** をクリック

## ✅ 設定後の確認

ポリシーを設定した後、以下のように表示されるはずです：

- **Buckets セクション** の `documents` バケットの下に、3つのポリシーが表示される
- 「No policies created yet」というメッセージが消える

## 🔍 その他の確認事項

### 1. スキーマキャッシュのリフレッシュ

1. **Supabase Dashboard → Settings → API** を開く
2. **「Reload schema cache」** または **「Refresh schema」** ボタンをクリック
3. 数秒待つ

### 2. 動作確認

#### 2-1. 規約閲覧機能の確認

1. アプリケーションにログイン
2. **「📄 規約閲覧」** ボタンをクリック
3. 資料一覧が表示されるか確認（まだ資料がない場合は空のリストが表示されます）

#### 2-2. 資料アップロード機能の確認（管理者のみ）

1. **管理者でログイン**
2. **管理者ダッシュボード → 「📄 資料管理」** をクリック
3. **PDFファイルをアップロード**してみる
4. エラーが出ないか確認

### 3. エラーが出た場合の確認

#### エラー: 「Bucket not found」

**原因**: Storageバケット `documents` が存在しない

**解決方法**: 
- Storage → Files → Buckets で `documents` バケットが存在するか確認
- 存在しない場合は作成（既に存在しているので、このエラーは出ないはず）

#### エラー: 「permission denied」または「new row violates row-level security policy」

**原因**: Storageポリシーが設定されていない、または正しく設定されていない

**解決方法**: 
- 上記の「Storageバケットのポリシーを設定」を実行
- ポリシーが正しく設定されているか確認

#### エラー: 「スキーマキャッシュが更新されていません」（PGRST205）

**原因**: PostgRESTのスキーマキャッシュが更新されていない

**解決方法**: 
- 上記の「スキーマキャッシュのリフレッシュ」を実行

## 📝 完全なセットアップチェックリスト

以下のすべてが完了していれば、セットアップは完了です：

- [x] `user_profiles` テーブルが存在する
- [x] `inquiries` テーブルが存在する
- [x] `documents` テーブルが存在する
- [x] すべてのテーブルでRLSが有効
- [x] すべてのテーブルに十分なポリシーが設定されている
- [x] Storage バケット `documents` が作成されている
- [ ] **Storage バケット `documents` のポリシーが設定されている** ← **これを設定**
- [ ] スキーマキャッシュがリフレッシュされている ← **これを確認**

## 🆘 まだ問題が解決しない場合

1. **ブラウザのコンソールを確認**（F12 → Console）
2. **エラーメッセージを確認**（画面に表示されたもの）
3. **Storageポリシーが正しく設定されているか確認**（Policies タブで確認）
4. **スキーマキャッシュをリフレッシュ**（Settings → API）
