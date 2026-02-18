-- profiles の email を NULL 可にする（登録エラー解消）
-- 実行: Supabase SQL Editor でこのファイル全体をコピーして実行

ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN email SET DEFAULT '';

-- 確認（任意）
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email';
