-- Create the migration file for Prashna schema initialization
-- Timestamp: 20260624013148
-- Description: Initialize production-ready PostgreSQL / Supabase schema for PYQ Platform (Prashna)

-- Enable UUID-OSSP extension for generating random UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. ENUMS AND UTILITIES
--------------------------------------------------------------------------------

-- Enum for question types: single-choice MCQ, multiple-choice MCQ, and numerical input
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'question_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.question_type AS ENUM ('mcq_single', 'mcq_multiple', 'numerical');
  END IF;
END $$;

-- Reusable function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 2. ACADEMIC HIERARCHY TABLES
--------------------------------------------------------------------------------

-- Exams table (e.g., JEE Main, NEET, GATE, UPSC)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- E.g., 'jee_main', 'neet', 'gate'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subjects table (e.g., Physics, Chemistry, Mathematics, History)
-- Each subject is linked to a specific exam.
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL, -- E.g., 'physics', 'organic-chemistry'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subjects_exam_id_slug_key UNIQUE (exam_id, slug)
);

-- Chapters table (e.g., Electrostatics, Rotational Mechanics, Organic Synthesis)
-- Each chapter belongs to a specific subject.
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sequence_order INT NOT NULL DEFAULT 0, -- Used for ordering chapters chronologically/logically
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topics table (e.g., Coulomb's Law, Gauss's Law, Torque, SN1 vs SN2 Reactions)
-- Each topic belongs to a specific chapter.
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sequence_order INT NOT NULL DEFAULT 0, -- Used for ordering topics chronologically/logically
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 3. EXAM PAPERS & SITTINGS
--------------------------------------------------------------------------------

-- Papers table represents a specific exam sitting (e.g., JEE Main 2024 Session 1 Shift 1)
CREATE TABLE IF NOT EXISTS public.papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    year INT NOT NULL CHECK (year >= 1900 AND year <= 2100),
    session TEXT, -- E.g., 'Session 1', 'January', 'June'
    shift TEXT,   -- E.g., 'Shift 1', 'Morning', 'Forenoon'
    date DATE,    -- Date when the paper was administered
    duration_minutes INT, -- Total minutes allocated
    total_marks INT,      -- Maximum achievable marks
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate papers under the same exam, year, session, and shift.
-- Uses COALESCE since NULL values do not conflict under standard UNIQUE constraints.
CREATE UNIQUE INDEX IF NOT EXISTS papers_exam_year_session_shift_idx 
ON public.papers (exam_id, year, COALESCE(session, ''), COALESCE(shift, ''));

--------------------------------------------------------------------------------
-- 4. QUESTIONS ENGINE
--------------------------------------------------------------------------------

-- Questions table stores individual questions.
-- Denormalized foreign keys (exam_id, subject_id, chapter_id, topic_id) are used to
-- bypass deep multi-table joins during high-frequency list and filter queries.
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    paper_id UUID REFERENCES public.papers(id) ON DELETE SET NULL,
    question_number INT, -- Order of appearance in the paper
    type public.question_type NOT NULL,
    content TEXT NOT NULL, -- The question text. Supports Markdown, LaTeX, and HTML.
    image_urls TEXT[] DEFAULT '{}', -- Array of image URLs stored in Supabase Storage buckets
    marks NUMERIC NOT NULL DEFAULT 4.0,
    negative_marks NUMERIC NOT NULL DEFAULT -1.0,
    numerical_answer NUMERIC, -- Correct decimal value (only used if type is 'numerical')
    numerical_tolerance NUMERIC NOT NULL DEFAULT 0.0, -- Allowed error margin for numerical questions
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'flagged')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MCQ Options table (for MCQ single/multiple choice questions)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_letter TEXT NOT NULL, -- E.g., 'A', 'B', 'C', 'D'
    content TEXT NOT NULL, -- Option text/math formula
    image_urls TEXT[] DEFAULT '{}', -- Optional image URLs for visual options
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT question_options_question_id_option_letter_key UNIQUE (question_id, option_letter)
);

-- Question Solutions table (keeps solution content isolated for faster question index loads)
CREATE TABLE IF NOT EXISTS public.question_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE UNIQUE,
    content TEXT NOT NULL, -- Explanation detail (supports LaTeX/Markdown)
    image_urls TEXT[] DEFAULT '{}', -- Array of image URLs showing step-by-step logic
    video_url TEXT, -- Optional URL for video walkthrough
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 5. USER ACCOUNTS & ENGAGEMENT
--------------------------------------------------------------------------------

-- Public user profiles (references auth.users in Supabase Auth schema)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    preferred_exams UUID[] DEFAULT '{}', -- Array of exam IDs the user is tracking
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookmarks table allowing users to save questions with personalized study notes
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    notes TEXT, -- User comments / formula references
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bookmarks_user_id_question_id_key UNIQUE (user_id, question_id)
);

-- PDF Exports metadata (for asynchronous PDF generation from filtered questions)
CREATE TABLE IF NOT EXISTS public.pdf_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    filter_criteria JSONB NOT NULL DEFAULT '{}'::jsonb, -- Stores filter states for reproducible exports
    question_ids UUID[] NOT NULL DEFAULT '{}', -- Preserves exact question sequence in the PDF
    storage_path TEXT, -- Supabase Storage path/URL to the output PDF file
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 6. AUTOMATED TRIGGERS AND FUNCTIONS
--------------------------------------------------------------------------------

-- Bind update triggers to update updated_at timestamps automatically
DROP TRIGGER IF EXISTS update_exams_updated_at ON public.exams;
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON public.chapters;
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON public.topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_papers_updated_at ON public.papers;
CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON public.papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_question_solutions_updated_at ON public.question_solutions;
CREATE TRIGGER update_question_solutions_updated_at BEFORE UPDATE ON public.question_solutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_exports_updated_at ON public.pdf_exports;
CREATE TRIGGER update_pdf_exports_updated_at BEFORE UPDATE ON public.pdf_exports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function and trigger to auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists to guarantee idempotency in migration re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- 7. SECURITY AND ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security (RLS) across all tables
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_exports ENABLE ROW LEVEL SECURITY;

-- 7a. Public Read-Only Access Policies
DROP POLICY IF EXISTS "Allow public read access" ON public.exams;
CREATE POLICY "Allow public read access" ON public.exams FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.subjects;
CREATE POLICY "Allow public read access" ON public.subjects FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.chapters;
CREATE POLICY "Allow public read access" ON public.chapters FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.topics;
CREATE POLICY "Allow public read access" ON public.topics FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.papers;
CREATE POLICY "Allow public read access" ON public.papers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.questions;
CREATE POLICY "Allow public read access" ON public.questions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.question_options;
CREATE POLICY "Allow public read access" ON public.question_options FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.question_solutions;
CREATE POLICY "Allow public read access" ON public.question_solutions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT TO public USING (true);

-- 7b. Profile Security (Owning user can edit)
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 7c. Bookmark Security (Strict user separation)
DROP POLICY IF EXISTS "Allow users to read own bookmarks" ON public.bookmarks;
CREATE POLICY "Allow users to read own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to create own bookmarks" ON public.bookmarks;
CREATE POLICY "Allow users to create own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update own bookmarks" ON public.bookmarks;
CREATE POLICY "Allow users to update own bookmarks" ON public.bookmarks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Allow users to delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7d. PDF Export Security (Strict user separation)
DROP POLICY IF EXISTS "Allow users to read own pdf exports" ON public.pdf_exports;
CREATE POLICY "Allow users to read own pdf exports" ON public.pdf_exports FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to create own pdf exports" ON public.pdf_exports;
CREATE POLICY "Allow users to create own pdf exports" ON public.pdf_exports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update own pdf exports" ON public.pdf_exports;
CREATE POLICY "Allow users to update own pdf exports" ON public.pdf_exports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete own pdf exports" ON public.pdf_exports;
CREATE POLICY "Allow users to delete own pdf exports" ON public.pdf_exports FOR DELETE TO authenticated USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
--------------------------------------------------------------------------------

-- Foreign Key Indexes to optimize JOIN queries and cascade delete triggers
CREATE INDEX IF NOT EXISTS subjects_exam_id_idx ON public.subjects (exam_id);
CREATE INDEX IF NOT EXISTS chapters_subject_id_idx ON public.chapters (subject_id);
CREATE INDEX IF NOT EXISTS topics_chapter_id_idx ON public.topics (chapter_id);
CREATE INDEX IF NOT EXISTS papers_exam_id_idx ON public.papers (exam_id);
CREATE INDEX IF NOT EXISTS question_options_question_id_idx ON public.question_options (question_id);
CREATE INDEX IF NOT EXISTS bookmarks_question_id_idx ON public.bookmarks (question_id);

-- Composite query index for hierarchical question filtering
-- Accelerates queries filtering by exam_id, subject_id, chapter_id, and topic_id in any prefix sequence.
CREATE INDEX IF NOT EXISTS questions_filtering_hierarchy_idx ON public.questions (exam_id, subject_id, chapter_id, topic_id);

-- Composite query index for question ordering within a specific PYQ paper
CREATE INDEX IF NOT EXISTS questions_paper_order_idx ON public.questions (paper_id, question_number);

-- Index for retrieving a user's bookmarks in reverse chronological order
CREATE INDEX IF NOT EXISTS bookmarks_user_time_idx ON public.bookmarks (user_id, created_at DESC);

-- Index for paper catalog browsing by exam, year, and administration date
CREATE INDEX IF NOT EXISTS papers_exam_year_date_idx ON public.papers (exam_id, year, date);

-- Full-Text Search (FTS) Integration
-- Adds a materialized English search vector to index and search question texts instantly
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS fts tsvector 
GENERATED ALWAYS AS (to_tsvector('english', COALESCE(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS questions_fts_idx ON public.questions USING GIN (fts);
