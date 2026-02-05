-- ========================================
-- 新規登録エラー「violates check constraint profiles_class_name_check」の修正
-- ========================================
-- class_name に CHECK 制約があり、トリガーが入れる値（NULL や空文字）が
-- 制約に引っかかって失敗しています。この制約を削除します。
-- 実行: Supabase SQL Editor（手当アプリ用プロジェクト）
-- ========================================

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_class_name_check;

-- 確認: 制約が消えたか（結果が 0 行なら OK）
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND conname = 'profiles_class_name_check';
