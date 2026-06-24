-- supabase/migrations/20260624140027_add_role_system.sql
-- Add role column to profiles table and set up RLS write permissions for admins/moderators.

-- 1. Add role column if it doesn't already exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Enable write access for authenticated users with role 'admin' or 'moderator'

-- 2.1 exams
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.exams;
CREATE POLICY "Allow admin/mod insert" ON public.exams FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.exams;
CREATE POLICY "Allow admin/mod update" ON public.exams FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.exams;
CREATE POLICY "Allow admin/mod delete" ON public.exams FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.2 subjects
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.subjects;
CREATE POLICY "Allow admin/mod insert" ON public.subjects FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.subjects;
CREATE POLICY "Allow admin/mod update" ON public.subjects FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.subjects;
CREATE POLICY "Allow admin/mod delete" ON public.subjects FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.3 chapters
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.chapters;
CREATE POLICY "Allow admin/mod insert" ON public.chapters FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.chapters;
CREATE POLICY "Allow admin/mod update" ON public.chapters FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.chapters;
CREATE POLICY "Allow admin/mod delete" ON public.chapters FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.4 topics
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.topics;
CREATE POLICY "Allow admin/mod insert" ON public.topics FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.topics;
CREATE POLICY "Allow admin/mod update" ON public.topics FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.topics;
CREATE POLICY "Allow admin/mod delete" ON public.topics FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.5 papers
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.papers;
CREATE POLICY "Allow admin/mod insert" ON public.papers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.papers;
CREATE POLICY "Allow admin/mod update" ON public.papers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.papers;
CREATE POLICY "Allow admin/mod delete" ON public.papers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.6 questions
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.questions;
CREATE POLICY "Allow admin/mod insert" ON public.questions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.questions;
CREATE POLICY "Allow admin/mod update" ON public.questions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.questions;
CREATE POLICY "Allow admin/mod delete" ON public.questions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.7 question_options
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.question_options;
CREATE POLICY "Allow admin/mod insert" ON public.question_options FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.question_options;
CREATE POLICY "Allow admin/mod update" ON public.question_options FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.question_options;
CREATE POLICY "Allow admin/mod delete" ON public.question_options FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- 2.8 question_solutions
DROP POLICY IF EXISTS "Allow admin/mod insert" ON public.question_solutions;
CREATE POLICY "Allow admin/mod insert" ON public.question_solutions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod update" ON public.question_solutions;
CREATE POLICY "Allow admin/mod update" ON public.question_solutions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Allow admin/mod delete" ON public.question_solutions;
CREATE POLICY "Allow admin/mod delete" ON public.question_solutions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
