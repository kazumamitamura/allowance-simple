-- ========================================
-- 新規登録エラー「Database error saving new user」の修正
-- ========================================
-- 原因: auth.users にトリガーがあるが user_profiles が無い、
--       またはトリガー関数の権限不足で挿入に失敗している。
-- 対処: user_profiles テーブルを作成し、SECURITY DEFINER の
--       トリガーで新規ユーザー作成時にプロフィールを自動作成する。
-- 実行: Supabase Dashboard → SQL Editor でこのファイルを実行
-- ========================================

-- 1. user_profiles テーブル（存在しない場合のみ作成）
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- RLS を有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除してから作成
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    email IN (
      'mitamuraka@haguroko.ed.jp',
      'tomonoem@haguroko.ed.jp'
    )
  );

-- 2. 新規ユーザー作成時に user_profiles に1行挿入するトリガー関数
--    SECURITY DEFINER で RLS を通過させる
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 既にレコードがある場合は更新のみ
    UPDATE public.user_profiles
    SET email = COALESCE(NEW.email, ''),
        display_name = COALESCE(NEW.raw_user_meta_data->>'full_name', display_name),
        updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 3. auth.users に対するトリガー（既存があれば削除してから作成）
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. 既存の auth.users で user_profiles にいないユーザーを補完（任意）
-- ========================================
INSERT INTO public.user_profiles (user_id, email, display_name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), user_profiles.display_name),
  updated_at = NOW();

-- 実行結果確認（任意）
-- SELECT * FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
