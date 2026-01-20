-- ========================================
-- user_profiles の全レコードを確認
-- ========================================

-- 1. 全ユーザーを確認（emailとuser_idの対応）
SELECT 
  user_id,
  email,
  display_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- ========================================
-- 2. auth.users テーブルも確認
-- ========================================

-- 認証テーブルのユーザー情報を確認
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ========================================
-- 3. user_id で直接更新（確実な方法）
-- ========================================

-- mitamuraka@haguroko.ed.jp のuser_idを使用
UPDATE user_profiles 
SET display_name = '三田村 和真'
WHERE user_id = '0948a58e-6b9b-42ca-8088-e135d96e45aa';

-- 更新確認
SELECT * FROM user_profiles WHERE user_id = '0948a58e-6b9b-42ca-8088-e135d96e45aa';

-- ========================================
-- 4. もしレコードが存在しない場合は挿入
-- ========================================

-- user_profiles にレコードがない場合は作成
INSERT INTO user_profiles (user_id, email, display_name)
VALUES (
  '0948a58e-6b9b-42ca-8088-e135d96e45aa',
  'mitamuraka@haguroko.ed.jp',
  '三田村 和真'
)
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    email = EXCLUDED.email;

-- ========================================
-- 5. すべてのユーザーを一括更新
-- ========================================

-- 友野工三
INSERT INTO user_profiles (user_id, email, display_name)
SELECT id, email, '友野 工三'
FROM auth.users
WHERE email = 'tomonoem@haguroko.ed.jp'
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name;

-- 羽黒太郎
INSERT INTO user_profiles (user_id, email, display_name)
SELECT id, email, '羽黒 太郎'
FROM auth.users
WHERE email = 'waw2716@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name;

-- 羽黒花子
INSERT INTO user_profiles (user_id, email, display_name)
SELECT id, email, '羽黒 花子'
FROM auth.users
WHERE email = 'waw27215@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name;

-- 三田村和真
INSERT INTO user_profiles (user_id, email, display_name)
SELECT id, email, '三田村 和真'
FROM auth.users
WHERE email = 'mitamuraka@haguroko.ed.jp'
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name;

-- ========================================
-- 6. 最終確認
-- ========================================

SELECT 
  up.user_id,
  up.email,
  up.display_name,
  au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;
