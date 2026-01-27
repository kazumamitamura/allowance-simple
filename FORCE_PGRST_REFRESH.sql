-- PostgRESTのスキーマキャッシュを強制的にリフレッシュするSQL
-- このSQLは複数回実行しても安全です

-- 1. すべてのテーブルに直接アクセスしてキャッシュを更新
SELECT * FROM inquiries LIMIT 1;
SELECT * FROM documents LIMIT 1;
SELECT * FROM user_profiles LIMIT 1;

-- 2. テーブルのメタデータにアクセス
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('inquiries', 'documents', 'user_profiles')
ORDER BY table_name;

-- 3. PostgRESTにスキーマリロードを通知（複数回実行）
NOTIFY pgrst, 'reload schema';

-- 4. 少し待ってから再度通知（PostgreSQLでは待機できないので、手動で数秒待ってから実行）
-- NOTIFY pgrst, 'reload schema';

-- 5. 再度テーブルにアクセス
SELECT COUNT(*) as inquiries_count FROM inquiries;
SELECT COUNT(*) as documents_count FROM documents;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
