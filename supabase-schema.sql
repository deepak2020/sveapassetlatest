-- ============================================================
-- STEP 1: Drop everything cleanly (safe on empty database)
-- ============================================================
DROP TABLE IF EXISTS public.user_srs_cards   CASCADE;
DROP TABLE IF EXISTS public.user_vocabulary  CASCADE;
DROP TABLE IF EXISTS public.quiz_results     CASCADE;
DROP TABLE IF EXISTS public.generation_jobs  CASCADE;
DROP TABLE IF EXISTS public.cloze_sentences  CASCADE;
DROP TABLE IF EXISTS public.profiles         CASCADE;
DROP TABLE IF EXISTS public.lessons          CASCADE;
DROP TABLE IF EXISTS public.civic_topics     CASCADE;
DROP TABLE IF EXISTS public.test_entities    CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- STEP 2: Recreate all tables
-- ============================================================

-- ── Profiles (extends auth.users) ────────────────────────────
CREATE TABLE public.profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role               TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name          TEXT,
  sfi_level          TEXT CHECK (sfi_level IN ('A', 'B', 'C', 'D')),
  goal               TEXT,
  daily_goal_minutes INTEGER DEFAULT 10,
  xp_total           INTEGER DEFAULT 0,
  streak_days        INTEGER DEFAULT 0,
  last_active_date   DATE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── Lessons ──────────────────────────────────────────────────
CREATE TABLE public.lessons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  title_sv         TEXT,
  topic            TEXT,
  sfi_course       TEXT CHECK (sfi_course IN ('A', 'B', 'C', 'D')),
  category         TEXT CHECK (category IN ('vocabulary','grammar','phrases','pronunciation','reading','writing','speaking','listening')),
  skill            TEXT CHECK (skill IN ('reading','writing','speaking','listening','vocabulary','grammar')),
  level            TEXT NOT NULL CHECK (level IN ('beginner','intermediate','advanced')),
  content          TEXT,
  word_pairs       JSONB DEFAULT '[]',
  fill_in_blanks   JSONB DEFAULT '[]',
  writing_prompts  JSONB DEFAULT '[]',
  speaking_phrases JSONB DEFAULT '[]',
  listening_phrases JSONB DEFAULT '[]',
  quiz_questions   JSONB DEFAULT '[]',
  review_questions JSONB DEFAULT '[]',
  match_pairs      JSONB DEFAULT '[]',
  "order"          INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_select_all"   ON public.lessons FOR SELECT USING (TRUE);
CREATE POLICY "lessons_insert_admin" ON public.lessons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "lessons_update_admin" ON public.lessons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "lessons_delete_admin" ON public.lessons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX lessons_sfi_course_idx       ON public.lessons(sfi_course);
CREATE INDEX lessons_topic_idx            ON public.lessons(topic);
CREATE INDEX lessons_order_idx            ON public.lessons("order");
CREATE INDEX lessons_sfi_course_order_idx ON public.lessons(sfi_course, "order");

-- ── Civic Topics ─────────────────────────────────────────────
CREATE TABLE public.civic_topics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  subtitle       TEXT,
  chapter        TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('government','history','culture','rights_duties','society','geography')),
  content        TEXT,
  key_facts      JSONB DEFAULT '[]',
  quiz_questions JSONB DEFAULT '[]',
  "order"        INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.civic_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "civic_topics_select_all"   ON public.civic_topics FOR SELECT USING (TRUE);
CREATE POLICY "civic_topics_insert_admin" ON public.civic_topics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "civic_topics_update_admin" ON public.civic_topics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "civic_topics_delete_admin" ON public.civic_topics FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Quiz Results ─────────────────────────────────────────────
CREATE TABLE public.quiz_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type    TEXT NOT NULL CHECK (quiz_type IN ('language', 'civic')),
  source_id    TEXT,
  source_title TEXT,
  sfi_course   TEXT CHECK (sfi_course IN ('A', 'B', 'C', 'D')),
  skill        TEXT,
  score        INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  percentage   INTEGER NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_results_select" ON public.quiz_results FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_results_insert" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_results_delete" ON public.quiz_results FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX quiz_results_user_idx       ON public.quiz_results(user_id);
CREATE INDEX quiz_results_created_at_idx ON public.quiz_results(created_at DESC);
CREATE INDEX quiz_results_quiz_type_idx  ON public.quiz_results(quiz_type);

-- ── User Vocabulary ───────────────────────────────────────────
CREATE TABLE public.user_vocabulary (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swedish          TEXT NOT NULL,
  english          TEXT NOT NULL,
  lesson_id        TEXT,
  lesson_title     TEXT,
  example_sentence TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_vocabulary_own" ON public.user_vocabulary
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX user_vocabulary_user_idx ON public.user_vocabulary(user_id);

-- ── User SRS Cards ────────────────────────────────────────────
CREATE TABLE public.user_srs_cards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloze_sentence_id   UUID NOT NULL,
  interval_days       INTEGER DEFAULT 1,
  due_date            DATE,
  ease_factor         NUMERIC(4,2) DEFAULT 2.5,
  times_seen          INTEGER DEFAULT 0,
  times_correct       INTEGER DEFAULT 0,
  correct_streak      INTEGER DEFAULT 0,
  last_answer_correct BOOLEAN,
  mastery_percentage  INTEGER DEFAULT 0 CHECK (mastery_percentage IN (0, 25, 50, 75, 100)),
  status              TEXT DEFAULT 'new' CHECK (status IN ('new','learning','review','mastered')),
  description         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_srs_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_srs_cards_own" ON public.user_srs_cards
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX user_srs_cards_user_idx     ON public.user_srs_cards(user_id);
CREATE INDEX user_srs_cards_due_date_idx ON public.user_srs_cards(due_date);

-- ── Cloze Sentences ───────────────────────────────────────────
CREATE TABLE public.cloze_sentences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentence_sv         TEXT NOT NULL,
  sentence_en         TEXT,
  answer              TEXT NOT NULL,
  distractors         JSONB DEFAULT '[]',
  sfi_level           TEXT NOT NULL CHECK (sfi_level IN ('A', 'B', 'C', 'D')),
  topic               TEXT,
  word_frequency_rank INTEGER,
  grammar_note        TEXT,
  pronunciation_tip   TEXT,
  source              TEXT DEFAULT 'manual' CHECK (source IN ('tatoeba','generated','manual')),
  description         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cloze_sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cloze_sentences_select_all"  ON public.cloze_sentences FOR SELECT USING (TRUE);
CREATE POLICY "cloze_sentences_write_admin" ON public.cloze_sentences FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX cloze_sentences_sfi_level_idx ON public.cloze_sentences(sfi_level);

-- ── Generation Jobs ───────────────────────────────────────────
CREATE TABLE public.generation_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status     TEXT DEFAULT 'pending',
  job_type   TEXT,
  params     JSONB DEFAULT '{}',
  result     JSONB,
  error      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generation_jobs_admin" ON public.generation_jobs
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
