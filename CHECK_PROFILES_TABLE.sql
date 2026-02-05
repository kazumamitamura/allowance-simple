-- ========================================
-- 実行前の確認用（新規登録エラー修正前に実行）
-- ========================================
-- この Supabase プロジェクトが手当アプリで使っているか確認し、
-- public.profiles と name カラムの状態を表示します。
-- ========================================

-- profiles テーブルがあるか・name の制約
SELECT
  c.table_schema,
  c.table_name,
  c.column_name,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_name = 'profiles'
  AND c.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY c.table_schema, c.table_name, c.ordinal_position;
