-- supabase/migrations/20260720164500_cascade_delete_papers.sql
-- Alter the foreign key constraint on the questions table to cascade delete when a paper sitting is deleted.

-- 1. Drop existing foreign key constraint if it exists
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_paper_id_fkey;

-- 2. Add the foreign key constraint back with ON DELETE CASCADE
ALTER TABLE public.questions
ADD CONSTRAINT questions_paper_id_fkey 
FOREIGN KEY (paper_id) 
REFERENCES public.papers(id) 
ON DELETE CASCADE;
