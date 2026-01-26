# Storageポリシーの正しい作成場所

## 🔍 問題点

画像を確認したところ、ポリシーが**間違った場所**に作成されています：

- ❌ **「Schema」セクション**（`STORAGE.OBJECTS`）にポリシーが作成されている
- ✅ **「Buckets」セクション**で `documents` バケットに対してポリシーを作成する必要がある

## ✅ 正しい作成場所

### ステップ1: 正しい場所を確認

1. **Supabase Dashboard → Storage → Files → Policies** を開く
2. **「Buckets」セクション**を確認
3. `documents` バケットの下に「No policies created yet」と表示されていることを確認

### ステップ2: 間違ったポリシーを削除

1. **「Schema」セクション**の「OTHER POLICIES UNDER STORAGE.OBJECTS」にある3つのポリシーを削除
   - 各ポリシーの右側の「...」メニューから「Delete」を選択
   - 以下の3つを削除：
     - `authenticated_view flreew_0`
     - `admin_upload flreew_0`
     - `admin_delete flreew_1`

### ステップ3: 正しい場所にポリシーを作成

1. **「Buckets」セクション**で `documents` バケットを探す
2. `documents` バケットの右側にある**「New policy」ボタン**をクリック
   - ⚠️ 重要: 「Schema」セクションの「New policy」ボタンではなく、**「Buckets」セクション**の「New policy」ボタンをクリックしてください

### ステップ4: ポリシー1を設定（認証ユーザーは資料を閲覧可能）

1. **「For full customization」** を選択
2. 以下の設定を入力：
   - **Policy name**: `Authenticated users can view documents`
   - **Allowed operations**: `SELECT` にチェック
   - **Policy definition**: 以下の**のみ**をコピー（`bucket_id` は含めない）:
     ```
     auth.role() = 'authenticated'
     ```
3. **「Review」** → **「Create policy」** をクリック

### ステップ5: ポリシー2を設定（管理者のみ資料をアップロード可能）

1. **「Buckets」セクション**の `documents` バケットの右側にある**「New policy」ボタン**をクリック
2. **「For full customization」** を選択
3. 以下の設定を入力：
   - **Policy name**: `Admins can upload documents`
   - **Allowed operations**: `INSERT` にチェック
   - **Policy definition**: 以下の**のみ**をコピー（`bucket_id` は含めない）:
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

### ステップ6: ポリシー3を設定（管理者のみ資料を削除可能）

1. **「Buckets」セクション**の `documents` バケットの右側にある**「New policy」ボタン**をクリック
2. **「For full customization」** を選択
3. 以下の設定を入力：
   - **Policy name**: `Admins can delete documents`
   - **Allowed operations**: `DELETE` にチェック
   - **Policy definition**: 以下の**のみ**をコピー（`bucket_id` は含めない、ポリシー2と同じ）:
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

## ✅ 設定後の確認

ポリシーを正しく設定した後、以下のように表示されるはずです：

1. **「Buckets」セクション**の `documents` バケットの下に、3つのポリシーが表示される
2. 「No policies created yet」というメッセージが消える
3. **「Schema」セクション**には、間違ったポリシーが表示されない（削除済み）

## 📋 正しい場所と間違った場所の違い

### ✅ 正しい場所: 「Buckets」セクション

- `documents` バケットの右側にある「New policy」ボタンをクリック
- バケット固有のポリシーが作成される
- `bucket_id` が自動的に追加される

### ❌ 間違った場所: 「Schema」セクション

- 「OTHER POLICIES UNDER STORAGE.OBJECTS」の「New policy」ボタンをクリック
- すべてのバケットに適用される汎用的なポリシーが作成される
- `bucket_id` を手動で指定する必要がある

## 🧪 動作確認

ポリシーを正しく設定した後、以下を確認してください：

1. **スキーマキャッシュをリフレッシュ**
   - Settings → API → 「Reload schema cache」

2. **アプリケーションで動作確認**
   - 管理者でログイン
   - 資料管理ページでPDFをアップロード
   - エラーが出ないか確認

## 📝 まとめ

- **「Buckets」セクション**で `documents` バケットに対してポリシーを作成してください
- **「Schema」セクション**のポリシーは削除してください
- `bucket_id` は含めないでください（自動的に追加されます）
