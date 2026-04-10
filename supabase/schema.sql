-- ============================================
-- 누가기록장 Supabase 스키마
-- ============================================
-- Supabase 대시보드 > SQL Editor에서 실행하세요.
-- Auth > Settings에서 "Enable email confirmations" 비활성화 권장 (개발 중)

-- 학급 테이블
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_year INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  semester INT NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 학생 테이블
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  num INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, num)
);

-- 관찰 기록 테이블
CREATE TABLE observations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  author_type TEXT NOT NULL CHECK (author_type IN ('teacher', 'student')),
  author_name TEXT NOT NULL,
  author_student_id UUID REFERENCES students(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 초안 테이블
CREATE TABLE drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 관찰 미션 테이블
CREATE TABLE missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 학급 데이터 전체 접근
CREATE POLICY "teachers_own_classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "teachers_class_students" ON students
  FOR ALL USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));

CREATE POLICY "teachers_class_observations" ON observations
  FOR ALL USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));

CREATE POLICY "teachers_class_drafts" ON drafts
  FOR ALL USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));

CREATE POLICY "teachers_class_missions" ON missions
  FOR ALL USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));

-- 학생(비인증): anon 키로 학급코드 검색 및 데이터 읽기/쓰기 허용
CREATE POLICY "anon_read_classes_by_code" ON classes
  FOR SELECT USING (true);

CREATE POLICY "anon_read_students" ON students
  FOR SELECT USING (true);

CREATE POLICY "anon_read_observations" ON observations
  FOR SELECT USING (true);

CREATE POLICY "anon_insert_observations" ON observations
  FOR INSERT WITH CHECK (author_type = 'student');

CREATE POLICY "anon_read_missions" ON missions
  FOR SELECT USING (true);

CREATE POLICY "anon_read_drafts" ON drafts
  FOR SELECT USING (true);
