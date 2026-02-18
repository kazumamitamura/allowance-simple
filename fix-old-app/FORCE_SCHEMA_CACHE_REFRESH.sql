-- スキーマキャッシュを強制的にリフレッシュするSQL

-- 1. PostgRESTにスキーマリロードを通知
NOTIFY pgrst, 'reload schema';

-- 2. 各テーブルに直接アクセスしてキャッシュを更新
-- （PostgRESTがテーブルを認識するようにする）
SELECT * FROM inquiries LIMIT 1;
SELECT * FROM documents LIMIT 1;
SELECT * FROM user_profiles LIMIT 1;

-- 3. テーブルのメタデータにアクセス
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('inquiries', 'documents', 'user_profiles')
ORDER BY table_name;

-- 4. 再度COUNT(*)を実行して確認
SELECT COUNT(*) as inquiries_count FROM inquiries;
SELECT COUNT(*) as documents_count FROM documents;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
