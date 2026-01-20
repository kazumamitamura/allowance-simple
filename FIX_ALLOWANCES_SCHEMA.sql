-- ========================================
-- allowancesテーブルのスキーマ修正
-- ========================================
-- 実行日: 2026-01-20
-- 目的: custom_amount, custom_description カラムを追加

-- 1. 現在のallowancesテーブルのスキーマを確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'allowances'
ORDER BY ordinal_position;

-- 2. custom_amount カラムを追加（存在しない場合）
ALTER TABLE allowances 
ADD COLUMN IF NOT EXISTS custom_amount INTEGER DEFAULT NULL;

-- 3. custom_description カラムを追加（存在しない場合）
ALTER TABLE allowances 
ADD COLUMN IF NOT EXISTS custom_description TEXT DEFAULT NULL;

-- 4. 追加後のスキーマを確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'allowances'
ORDER BY ordinal_position;

-- ========================================
-- 実行手順:
-- ========================================
-- 1. Supabase Dashboard → SQL Editor を開く
-- 2. 上記のSQLを貼り付けて実行
-- 3. "Success. No rows returned" と表示されればOK
-- ========================================
