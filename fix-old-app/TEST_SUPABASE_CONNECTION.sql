-- Supabase 接続とテーブル認識のテスト

-- 1. 現在のデータベース名を確認
SELECT current_database();

-- 2. 現在のスキーマ検索パスを確認
SHOW search_path;

-- 3. inquiries テーブルが public スキーマに存在するか確認
SELECT 
  schemaname,
  tablename,
  tableowner,
  tablespace
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'inquiries';

-- 4. テーブルの完全な情報を取得
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'inquiries';

-- 5. テーブルのカラム情報を取得
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'inquiries'
ORDER BY ordinal_position;

-- 6. RLS の状態を確認
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '有効'
    ELSE '無効'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'inquiries';

-- 7. RLS ポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'inquiries';

-- 8. テーブルに直接アクセスしてテスト
SELECT COUNT(*) as count FROM inquiries;

-- 9. PostgREST がテーブルを認識できるように、テーブルにアクセス
SELECT * FROM inquiries LIMIT 1;

-- 10. PostgREST にスキーマリロードを通知
NOTIFY pgrst, 'reload schema';
