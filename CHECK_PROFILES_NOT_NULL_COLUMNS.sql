-- ========================================
-- 確認用: profiles でまだ NOT NULL のカラムを一覧
-- ========================================
-- 新規登録がまだ失敗する場合、この SQL を実行して
-- 「is_nullable = NO」のカラムが残っていないか確認してください。
-- 一覧に出たカラム名を FIX_PROFILES_ALL_NULLABLE.sql の配列に追加するか、
-- FIX_PROFILES_EVERY_COLUMN_NULLABLE.sql を実行してください。
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
