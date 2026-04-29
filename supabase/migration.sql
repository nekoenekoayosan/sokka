-- ファイル・文字起こし管理
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT,
  file_type TEXT NOT NULL, -- 'text' / 'image' / 'audio'
  transcribed_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 要約・語句管理
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id),
  summary TEXT NOT NULL,
  terms JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 単語帳
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES summaries(id),
  term TEXT NOT NULL,
  meaning TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  saved_at TIMESTAMP DEFAULT now()
);

-- コース管理
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- チャプター管理
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  day_number INT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 要約テーブルにチャプター紐付けを追加
ALTER TABLE summaries ADD COLUMN chapter_id UUID REFERENCES chapters(id);
