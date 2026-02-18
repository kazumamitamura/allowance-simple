-- ========================================
-- 新規登録エラー「Database error saving new user」の修正
-- profiles の NOT NULL 制約によるエラーを一括で解消
-- ========================================
-- 対象: name, grade, class_name など、トリガーが値を渡さないカラムを
--       NULL 可・デフォルト空文字にし、登録が通るようにする。
-- 実行: Supabase Dashboard → SQL Editor でこのファイルを実行
-- ========================================

-- 各カラムについて「存在する場合のみ」NOT NULL を外す（デフォルトは型によっては設定しない）
DO $$
DECLARE
  col TEXT;
  cols TEXT[] := ARRAY['name', 'grade', 'class_name', 'email'];
  data_type TEXT;
BEGIN
  FOREACH col IN ARRAY cols
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.profiles ALTER COLUMN %I DROP NOT NULL',
        col
      );
      SELECT c.data_type INTO data_type
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = 'profiles' AND c.column_name = col;
      IF data_type IN ('text', 'character varying', 'character') THEN
        EXECUTE format(
          'ALTER TABLE public.profiles ALTER COLUMN %I SET DEFAULT %L',
          col, ''
        );
      END IF;
      RAISE NOTICE 'profiles.% を NULL 可にしました', col;
    END IF;
  END LOOP;
END $$;

-- 実行結果確認: profiles の主要カラムの状態
SELECT
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('name', 'grade', 'class_name')
ORDER BY column_name;
