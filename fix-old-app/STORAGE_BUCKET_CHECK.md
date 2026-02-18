# Storageバケットの確認と作成ガイド

## 📋 Storageバケットが必要な理由

PDFファイルをアップロード・保存するために、Supabase Storageの`documents`バケットが必要です。

- ✅ テーブル（`documents`）: メタデータを保存（タイトル、ファイル名など）
- ✅ RLSポリシー: データベースのアクセス制御
- ❓ Storageバケット（`documents`）: **実際のPDFファイルを保存する場所**

## 🔍 Storageバケットの確認方法

### ステップ1: Storageセクションを開く

1. **Supabase Dashboard** を開く
2. 左サイドバーから **「Storage」** をクリック

### ステップ2: バケットの存在確認

**`documents`** という名前のバケットが表示されるか確認してください。

- ✅ **表示される場合**: バケットは作成済みです。次のステップ（Storageポリシーの確認）に進んでください。
- ❌ **表示されない場合**: バケットを作成する必要があります。以下の手順で作成してください。

## 📦 Storageバケットの作成手順（存在しない場合）

### ステップ1: 新しいバケットを作成

1. **Storage セクション** で **「New bucket」** ボタンをクリック
2. 以下の設定を入力:
   - **Name**: `documents`（必ずこの名前で）
   - **Public bucket**: **チェックを外す**（プライベートバケットとして作成）
3. **「Create bucket」** をクリック

### ステップ2: Storageポリシーの設定

バケットを作成した後、以下の3つのポリシーを設定します。

#### ポリシー1: 認証ユーザーは資料を閲覧可能

1. **Storage → `documents` バケット → Policies タブ** に移動
2. **「New Policy」** をクリック
3. **「For full customization」** を選択
4. 以下の設定を入力:
   - **Policy name**: `Authenticated users can view documents`
   - **Allowed operations**: `SELECT` にチェック
   - **Policy definition**: 以下のSQLコードをコピー:
     ```
     auth.role() = 'authenticated'
     ```
5. **「Review」** → **「Create policy」** をクリック

#### ポリシー2: 管理者のみ資料をアップロード可能

1. **「New Policy」** をクリック
2. **「For full customization」** を選択
3. 以下の設定を入力:
   - **Policy name**: `Admins can upload documents`
   - **Allowed operations**: `INSERT` にチェック
   - **Policy definition**: 以下のSQLコードをコピー:
     ```
     EXISTS (
       SELECT 1 FROM user_profiles
       WHERE user_profiles.user_id = auth.uid()
       AND user_profiles.email IN (
         'mitamuraka@haguroko.ed.jp',
         'tomonoem@haguroko.ed.jp'
       )
     )
     ```
4. **「Review」** → **「Create policy」** をクリック

#### ポリシー3: 管理者のみ資料を削除可能

1. **「New Policy」** をクリック
2. **「For full customization」** を選択
3. 以下の設定を入力:
   - **Policy name**: `Admins can delete documents`
   - **Allowed operations**: `DELETE` にチェック
   - **Policy definition**: 以下のSQLコードをコピー（ポリシー2と同じ）:
     ```
     EXISTS (
       SELECT 1 FROM user_profiles
       WHERE user_profiles.user_id = auth.uid()
       AND user_profiles.email IN (
         'mitamuraka@haguroko.ed.jp',
         'tomonoem@haguroko.ed.jp'
       )
     )
     ```
4. **「Review」** → **「Create policy」** をクリック

## ✅ セットアップ完了の確認

以下のすべてが完了していれば、セットアップは完了です：

- [x] `user_profiles` テーブルが存在する
- [x] `inquiries` テーブルが存在する
- [x] `documents` テーブルが存在する
- [x] すべてのテーブルでRLSが有効
- [x] すべてのテーブルに十分なポリシーが設定されている
- [ ] **Storage バケット `documents` が作成されている** ← これを確認
- [ ] **Storage ポリシーが設定されている** ← これを確認
- [ ] スキーマキャッシュがリフレッシュされている

## 🧪 動作確認

### 1. 規約閲覧機能の確認

1. アプリケーションにログイン
2. **「📄 規約閲覧」** ボタンをクリック
3. 資料一覧が表示されるか確認（まだ資料がない場合は空のリストが表示されます）

### 2. 資料アップロード機能の確認（管理者のみ）

1. **管理者でログイン**
2. **管理者ダッシュボード → 「📄 資料管理」** をクリック
3. **PDFファイルをアップロード**してみる
4. エラーが出ないか確認

### 3. エラーが出た場合

#### エラー: 「Bucket not found」

**原因**: Storageバケット `documents` が作成されていない

**解決方法**: 上記の「Storageバケットの作成手順」を実行してください

#### エラー: 「permission denied」

**原因**: Storageポリシーが設定されていない、または正しく設定されていない

**解決方法**: 上記の「Storageポリシーの設定」を実行してください

## 📝 まとめ

- **Storageバケットは必要です**（PDFファイルを保存するため）
- バケットが存在しない場合は、上記の手順で作成してください
- バケットを作成した後、必ずStorageポリシーも設定してください
