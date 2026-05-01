-- 各テーブルにuser_idカラムを追加（既存データはnull許容）
ALTER TABLE files ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE summaries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- RLS（Row Level Security）を有効化
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- ポリシー：ユーザーは自分のデータのみアクセス可能
-- files
CREATE POLICY "Users can view own files" ON files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON files FOR INSERT WITH CHECK (auth.uid() = user_id);

-- summaries
CREATE POLICY "Users can view own summaries" ON summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON summaries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- vocabulary
CREATE POLICY "Users can view own vocabulary" ON vocabulary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vocabulary" ON vocabulary FOR INSERT WITH CHECK (auth.uid() = user_id);

-- courses
CREATE POLICY "Users can view own courses" ON courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own courses" ON courses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- chapters
CREATE POLICY "Users can view own chapters" ON chapters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chapters" ON chapters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- service_role用のポリシー（APIルートで使用）
CREATE POLICY "Service role full access files" ON files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access summaries" ON summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access vocabulary" ON vocabulary FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access chapters" ON chapters FOR ALL USING (true) WITH CHECK (true);
