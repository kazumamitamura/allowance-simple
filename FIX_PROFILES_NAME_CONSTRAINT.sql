-- ========================================
-- 新規登録エラー「Database error saving new user」の修正
-- （null value in column "name" of relation "profiles"）
-- ========================================
-- 重要: 手当アプリの .env / Vercel の NEXT_PUBLIC_SUPABASE_URL で
--       指定している「同じ Supabase プロジェクト」の SQL Editor で実行してください。
-- ========================================

-- 1. public.profiles の name を NULL 可・デフォルト空文字にする
ALTER TABLE public.profiles
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN name SET DEFAULT '';

-- 2. 実行結果確認（オプション）: name の制約が外れているか確認
SELECT
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'name';
