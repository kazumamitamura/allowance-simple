-- テーブルの存在確認と詳細情報の取得

-- 1. テーブルの存在確認
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('inquiries', 'documents', 'user_profiles')
ORDER BY table_name;

-- 2. inquiriesテーブルの詳細確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'inquiries'
ORDER BY ordinal_position;

-- 3. documentsテーブルの詳細確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
ORDER BY ordinal_position;

-- 4. user_profilesテーブルの詳細確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. RLSが有効か確認
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('inquiries', 'documents', 'user_profiles');

-- 6. 実際にデータを取得してみる（エラーが出ないか確認）
SELECT COUNT(*) as inquiries_count FROM inquiries;
SELECT COUNT(*) as documents_count FROM documents;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
