-- ========================================
-- 既存ユーザーを「メール確認済み」にする
-- ========================================
-- 用途: Supabase で「Confirm email」が有効だった場合、
--       既存ユーザーがログインできるようにするため実行
-- 実行: Supabase Dashboard → SQL Editor で実行
-- ========================================

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
