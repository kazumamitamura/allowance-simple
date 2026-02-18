-- ========================================
-- profiles の「id 以外」の全カラムを NULL 可にする（強力版）
-- ========================================
-- name / grade / class_name 以外にも NOT NULL が残っている場合に実行。
-- id (主キー) 以外のすべてのカラムの NOT NULL を外します。
-- 実行: Supabase Dashboard → SQL Editor（手当アプリ用プロジェクトで実行）
-- ========================================

DO $$
DECLARE
  r RECORD;
BEGIN
  -- id 以外で、まだ NOT NULL のカラムをすべて NULL 可にする
  FOR r IN
    SELECT c.column_name, c.data_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = 'profiles'
      AND c.is_nullable = 'NO'
      AND c.column_name NOT IN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = 'profiles' AND tc.constraint_type = 'PRIMARY KEY'
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE public.profiles ALTER COLUMN %I DROP NOT NULL',
      r.column_name
    );
    IF r.data_type IN ('text', 'character varying', 'character') THEN
      EXECUTE format(
        'ALTER TABLE public.profiles ALTER COLUMN %I SET DEFAULT %L',
        r.column_name, ''
      );
    END IF;
    RAISE NOTICE 'profiles.% を NULL 可にしました', r.column_name;
  END LOOP;
END $$;

-- 結果確認: すべて NULL 可になっているか（id 以外）
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
