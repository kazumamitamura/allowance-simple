-- inquiriesテーブルの構造を確認し、必要に応じて修正するSQL

-- 1. 現在のテーブル構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'inquiries'
ORDER BY ordinal_position;

-- 2. テーブルが存在しない場合、または構造が間違っている場合は再作成
-- まず、既存のテーブルを削除（データは失われます）
DROP TABLE IF EXISTS inquiries CASCADE;

-- 3. 正しい構造でテーブルを作成
CREATE TABLE inquiries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- 5. RLS (Row Level Security) の設定
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシーの作成
-- ポリシー: ユーザーは自分の問い合わせのみ閲覧可能
CREATE POLICY "Users can view their own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分の問い合わせを作成可能
CREATE POLICY "Users can create their own inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: 管理者はすべての問い合わせを閲覧・更新可能
CREATE POLICY "Admins can view all inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.email IN (
        'mitamuraka@haguroko.ed.jp',
        'tomonoem@haguroko.ed.jp'
      )
    )
  );

CREATE POLICY "Admins can update all inquiries"
  ON inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.email IN (
        'mitamuraka@haguroko.ed.jp',
        'tomonoem@haguroko.ed.jp'
      )
    )
  );

-- 7. updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inquiries_updated_at_trigger ON inquiries;
CREATE TRIGGER update_inquiries_updated_at_trigger
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- 8. テーブルに直接アクセスしてキャッシュを更新
SELECT * FROM inquiries LIMIT 1;

-- 9. PostgRESTにスキーマリロードを通知（複数回実行）
NOTIFY pgrst, 'reload schema';

-- 10. 確認: COUNT(*)を実行
SELECT COUNT(*) as inquiries_count FROM inquiries;
