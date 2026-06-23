-- supabase/seed.sql
-- Seed file for Prashna PYQ Platform
-- Run this AFTER the migration (20260624013148_init_schema.sql) has been applied.
-- All UUIDs are deterministic for reproducibility.

--------------------------------------------------------------------------------
-- EXAMS
--------------------------------------------------------------------------------
INSERT INTO public.exams (id, name, code, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'JEE Main',  'jee_main',  'Joint Entrance Examination (Main) — Engineering UG admissions'),
  ('00000000-0000-0000-0000-000000000002', 'NEET UG',   'neet',      'National Eligibility cum Entrance Test — Medical UG admissions'),
  ('00000000-0000-0000-0000-000000000003', 'GATE',      'gate',      'Graduate Aptitude Test in Engineering'),
  ('00000000-0000-0000-0000-000000000004', 'UPSC CSE',  'upsc_cse',  'UPSC Civil Services Examination')
ON CONFLICT (code) DO NOTHING;

--------------------------------------------------------------------------------
-- SUBJECTS (JEE Main)
--------------------------------------------------------------------------------
INSERT INTO public.subjects (id, exam_id, name, slug) VALUES
  ('00000000-0001-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Physics',     'physics'),
  ('00000000-0001-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Chemistry',   'chemistry'),
  ('00000000-0001-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Mathematics', 'mathematics')
ON CONFLICT (exam_id, slug) DO NOTHING;

-- SUBJECTS (NEET)
INSERT INTO public.subjects (id, exam_id, name, slug) VALUES
  ('00000000-0002-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Physics',  'physics'),
  ('00000000-0002-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Chemistry','chemistry'),
  ('00000000-0002-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Biology',  'biology')
ON CONFLICT (exam_id, slug) DO NOTHING;

--------------------------------------------------------------------------------
-- CHAPTERS (JEE Main → Physics)
--------------------------------------------------------------------------------
INSERT INTO public.chapters (id, subject_id, name, sequence_order) VALUES
  ('00000000-0000-0001-0000-000000000001', '00000000-0001-0000-0000-000000000001', 'Mechanics',               1),
  ('00000000-0000-0001-0000-000000000002', '00000000-0001-0000-0000-000000000001', 'Electrostatics',          2),
  ('00000000-0000-0001-0000-000000000003', '00000000-0001-0000-0000-000000000001', 'Thermodynamics',          3),
  ('00000000-0000-0001-0000-000000000004', '00000000-0001-0000-0000-000000000001', 'Optics',                  4),
  ('00000000-0000-0001-0000-000000000005', '00000000-0001-0000-0000-000000000001', 'Modern Physics',          5)
ON CONFLICT DO NOTHING;

-- CHAPTERS (JEE Main → Chemistry)
INSERT INTO public.chapters (id, subject_id, name, sequence_order) VALUES
  ('00000000-0000-0002-0000-000000000001', '00000000-0001-0000-0000-000000000002', 'Physical Chemistry',      1),
  ('00000000-0000-0002-0000-000000000002', '00000000-0001-0000-0000-000000000002', 'Organic Chemistry',       2),
  ('00000000-0000-0002-0000-000000000003', '00000000-0001-0000-0000-000000000002', 'Inorganic Chemistry',     3)
ON CONFLICT DO NOTHING;

-- CHAPTERS (JEE Main → Mathematics)
INSERT INTO public.chapters (id, subject_id, name, sequence_order) VALUES
  ('00000000-0000-0003-0000-000000000001', '00000000-0001-0000-0000-000000000003', 'Calculus',                1),
  ('00000000-0000-0003-0000-000000000002', '00000000-0001-0000-0000-000000000003', 'Algebra',                 2),
  ('00000000-0000-0003-0000-000000000003', '00000000-0001-0000-0000-000000000003', 'Coordinate Geometry',     3),
  ('00000000-0000-0003-0000-000000000004', '00000000-0001-0000-0000-000000000003', 'Probability & Statistics',4)
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------------------
-- TOPICS
--------------------------------------------------------------------------------
INSERT INTO public.topics (id, chapter_id, name, sequence_order) VALUES
  -- Mechanics
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000001', 'Work, Energy and Power',  1),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000001', 'Projectile Motion',       2),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0001-0000-000000000001', 'Rotational Motion',       3),
  -- Electrostatics
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0001-0000-000000000002', 'Coulombs Law',            1),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0001-0000-000000000002', 'Gauss Law',               2),
  -- Physical Chemistry
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0002-0000-000000000001', 'Ionic Equilibrium',       1),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0002-0000-000000000001', 'Thermochemistry',         2),
  -- Inorganic Chemistry
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0002-0000-000000000003', 's-Block Elements',        1),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0002-0000-000000000003', 'Chemical Bonding',        2),
  -- Calculus
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0003-0000-000000000001', 'Differential Calculus',   1),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0003-0000-000000000001', 'Integral Calculus',       2),
  -- Algebra
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0003-0000-000000000002', 'Quadratic Equations',     1),
  -- Probability
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0003-0000-000000000004', 'Probability',             1)
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------------------
-- PAPERS (JEE Main)
--------------------------------------------------------------------------------
INSERT INTO public.papers (id, exam_id, year, session, shift, date, duration_minutes, total_marks) VALUES
  ('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000001', 2024, 'Session 1', 'Shift 1', '2024-01-27', 180, 300),
  ('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000001', 2024, 'Session 1', 'Shift 2', '2024-01-27', 180, 300),
  ('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-000000000001', 2023, 'Session 1', 'Shift 1', '2023-01-24', 180, 300),
  ('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000001', 2023, 'Session 2', 'Shift 1', '2023-04-06', 180, 300),
  ('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000001', 2022, 'Session 1', 'Shift 1', '2022-06-23', 180, 300),
  ('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-000000000001', 2022, 'Session 1', 'Shift 2', '2022-06-23', 180, 300)
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------------------
-- QUESTIONS
--------------------------------------------------------------------------------

-- Q1: Physics — KE (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000001',
   '00000000-0000-0001-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-100000000001',
   1, 'mcq_single',
   'A body of mass **2 kg** moves with a velocity of **10 m/s**. What is its kinetic energy?',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q2: Physics — Projectile Motion (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000001',
   '00000000-0000-0001-0000-000000000001',
   '00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-100000000003',
   2, 'mcq_single',
   'A projectile is launched at **45°** with the horizontal. What is the relation between its horizontal range R and maximum height H?',
   4, -1, 'medium', 'published')
ON CONFLICT DO NOTHING;

-- Q3: Physics — Electrostatics (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000001',
   '00000000-0000-0001-0000-000000000002',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0000-100000000005',
   3, 'mcq_single',
   'A charge **q** is placed at a distance **r** from another identical charge **q**. The electrostatic force between them is:',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q4: Maths — Calculus (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000003',
   '00000000-0000-0003-0000-000000000001',
   '00000000-0000-0000-0005-000000000001',
   '00000000-0000-0000-0000-100000000001',
   4, 'mcq_single',
   'Find the derivative of **sin(x²)**.',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q5: Maths — Integral Calculus (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000003',
   '00000000-0000-0003-0000-000000000001',
   '00000000-0000-0000-0005-000000000002',
   '00000000-0000-0000-0000-100000000003',
   5, 'mcq_single',
   'Find the value of ∫(2x + 1) dx.',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q6: Maths — Quadratic Equations (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000003',
   '00000000-0000-0003-0000-000000000002',
   '00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0000-100000000005',
   6, 'mcq_single',
   'Solve: **x² − 5x + 6 = 0**.',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q7: Maths — Probability (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000007',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000003',
   '00000000-0000-0003-0000-000000000004',
   '00000000-0000-0000-0007-000000000001',
   '00000000-0000-0000-0000-100000000003',
   7, 'mcq_single',
   'Find the probability of getting **exactly two heads** when three fair coins are tossed.',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q8: Chemistry — s-Block Elements (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000008',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000002',
   '00000000-0000-0002-0000-000000000003',
   '00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0000-100000000002',
   8, 'mcq_single',
   'Which of the following is the **strongest reducing agent** among alkali metals in aqueous solution?',
   4, -1, 'medium', 'published')
ON CONFLICT DO NOTHING;

-- Q9: Chemistry — Ionic Equilibrium (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000002',
   '00000000-0000-0002-0000-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0000-100000000004',
   9, 'mcq_single',
   'Calculate the **pH** of a solution having H⁺ concentration of **10⁻³ M**.',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q10: Chemistry — Chemical Bonding (MCQ)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000002',
   '00000000-0000-0002-0000-000000000003',
   '00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0000-100000000005',
   10, 'mcq_single',
   'What is the hybridization of carbon in **methane (CH₄)**?',
   4, -1, 'easy', 'published')
ON CONFLICT DO NOTHING;

-- Q11: Physics — Numerical (Spring constant)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, numerical_answer, numerical_tolerance, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000001',
   '00000000-0000-0001-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-100000000001',
   11, 'numerical',
   'A spring of spring constant **k = 200 N/m** is compressed by **0.1 m**. The potential energy stored in the spring (in Joules) is:',
   4, 0, 1.0, 0.05, 'medium', 'published')
ON CONFLICT DO NOTHING;

-- Q12: Maths — Numerical (Integration)
INSERT INTO public.questions
  (id, exam_id, subject_id, chapter_id, topic_id, paper_id, question_number, type, content, marks, negative_marks, numerical_answer, numerical_tolerance, difficulty, status)
VALUES
  ('10000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0001-0000-0000-000000000003',
   '00000000-0000-0003-0000-000000000001',
   '00000000-0000-0000-0005-000000000002',
   '00000000-0000-0000-0000-100000000003',
   12, 'numerical',
   'The value of the definite integral ∫₀¹ (3x²) dx is:',
   4, 0, 1.0, 0.0, 'easy', 'published')
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------------------
-- MCQ OPTIONS
--------------------------------------------------------------------------------

-- Q1 options (KE)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000001', 'A', '50 J',  false),
  ('10000000-0000-0000-0000-000000000001', 'B', '100 J', true),
  ('10000000-0000-0000-0000-000000000001', 'C', '150 J', false),
  ('10000000-0000-0000-0000-000000000001', 'D', '200 J', false)
ON CONFLICT DO NOTHING;

-- Q2 options (Projectile)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000002', 'A', 'R = H',   false),
  ('10000000-0000-0000-0000-000000000002', 'B', 'R = 2H',  false),
  ('10000000-0000-0000-0000-000000000002', 'C', 'R = 4H',  true),
  ('10000000-0000-0000-0000-000000000002', 'D', 'R = H/4', false)
ON CONFLICT DO NOTHING;

-- Q3 options (Coulombs Law)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000003', 'A', 'kq²/r',   false),
  ('10000000-0000-0000-0000-000000000003', 'B', 'kq²/r²',  true),
  ('10000000-0000-0000-0000-000000000003', 'C', 'k²q²/r²', false),
  ('10000000-0000-0000-0000-000000000003', 'D', 'kq/r²',   false)
ON CONFLICT DO NOTHING;

-- Q4 options (Derivative of sin(x²))
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000004', 'A', 'cos(x²)',        false),
  ('10000000-0000-0000-0000-000000000004', 'B', '2x · cos(x²)',   true),
  ('10000000-0000-0000-0000-000000000004', 'C', '2 · cos(x)',     false),
  ('10000000-0000-0000-0000-000000000004', 'D', '−2x · cos(x²)',  false)
ON CONFLICT DO NOTHING;

-- Q5 options (Integration)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000005', 'A', 'x² + x + C',   true),
  ('10000000-0000-0000-0000-000000000005', 'B', '2x² + x + C',  false),
  ('10000000-0000-0000-0000-000000000005', 'C', 'x² + C',       false),
  ('10000000-0000-0000-0000-000000000005', 'D', 'x² + 2x + C',  false)
ON CONFLICT DO NOTHING;

-- Q6 options (Quadratic)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000006', 'A', 'x = 1, 6',    false),
  ('10000000-0000-0000-0000-000000000006', 'B', 'x = −2, −3',  false),
  ('10000000-0000-0000-0000-000000000006', 'C', 'x = 2, 3',    true),
  ('10000000-0000-0000-0000-000000000006', 'D', 'x = 1, 5',    false)
ON CONFLICT DO NOTHING;

-- Q7 options (Probability)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000007', 'A', '1/8', false),
  ('10000000-0000-0000-0000-000000000007', 'B', '3/8', true),
  ('10000000-0000-0000-0000-000000000007', 'C', '1/2', false),
  ('10000000-0000-0000-0000-000000000007', 'D', '5/8', false)
ON CONFLICT DO NOTHING;

-- Q8 options (Alkali metals)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000008', 'A', 'Sodium (Na)',    false),
  ('10000000-0000-0000-0000-000000000008', 'B', 'Potassium (K)', false),
  ('10000000-0000-0000-0000-000000000008', 'C', 'Lithium (Li)',  true),
  ('10000000-0000-0000-0000-000000000008', 'D', 'Rubidium (Rb)', false)
ON CONFLICT DO NOTHING;

-- Q9 options (pH)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000009', 'A', 'pH = 1',  false),
  ('10000000-0000-0000-0000-000000000009', 'B', 'pH = 3',  true),
  ('10000000-0000-0000-0000-000000000009', 'C', 'pH = 7',  false),
  ('10000000-0000-0000-0000-000000000009', 'D', 'pH = 10', false)
ON CONFLICT DO NOTHING;

-- Q10 options (Hybridization)
INSERT INTO public.question_options (question_id, option_letter, content, is_correct) VALUES
  ('10000000-0000-0000-0000-000000000010', 'A', 'sp',    false),
  ('10000000-0000-0000-0000-000000000010', 'B', 'sp²',   false),
  ('10000000-0000-0000-0000-000000000010', 'C', 'sp³',   true),
  ('10000000-0000-0000-0000-000000000010', 'D', 'sp³d',  false)
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------------------
-- SOLUTIONS
--------------------------------------------------------------------------------
INSERT INTO public.question_solutions (question_id, content) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Kinetic Energy formula: **KE = ½mv²**

Given: m = 2 kg, v = 10 m/s

KE = ½ × 2 × 10² = **100 J**'),

  ('10000000-0000-0000-0000-000000000002',
   'For a projectile at angle θ:
- Maximum Height: H = u²sin²θ / 2g
- Range: R = u²sin2θ / g

At θ = 45°: sin45° = 1/√2, sin90° = 1

H = u²/4g, R = u²/g ⟹ **R = 4H**'),

  ('10000000-0000-0000-0000-000000000003',
   'Coulombs Law: **F = kq₁q₂/r²**

With q₁ = q₂ = q: **F = kq²/r²**

where k = 1/4πε₀ ≈ 9 × 10⁹ N·m²/C²'),

  ('10000000-0000-0000-0000-000000000004',
   'Using the **Chain Rule**: d/dx[f(g(x))] = f''(g(x)) · g''(x)

Let f(u) = sin(u) and g(x) = x²

d/dx[sin(x²)] = cos(x²) · 2x = **2x·cos(x²)**'),

  ('10000000-0000-0000-0000-000000000005',
   'Power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C

∫(2x + 1) dx = 2·(x²/2) + x + C = **x² + x + C**'),

  ('10000000-0000-0000-0000-000000000006',
   'Factor x² − 5x + 6 = 0

Find two numbers that multiply to 6 and add to −5: **−2 and −3**

(x − 2)(x − 3) = 0 ⟹ **x = 2, x = 3**'),

  ('10000000-0000-0000-0000-000000000007',
   'Sample space for 3 coins: 2³ = **8 outcomes**

Favorable (exactly 2H): {HHT, HTH, THH} → **3 outcomes**

P(E) = 3/8'),

  ('10000000-0000-0000-0000-000000000008',
   'Despite having the highest ionization energy among alkali metals, **Lithium (Li)** has the smallest ionic radius, giving it an exceptionally high hydration energy.

This results in the most negative standard electrode potential (E° = −3.05 V), making Li the strongest reducing agent.'),

  ('10000000-0000-0000-0000-000000000009',
   'pH = −log₁₀[H⁺]

[H⁺] = 10⁻³ M

pH = −log₁₀(10⁻³) = **3**'),

  ('10000000-0000-0000-0000-000000000010',
   'Carbon in CH₄ has 4 bond pairs and 0 lone pairs.

Steric number = 4 + 0 = 4 → **sp³ hybridization**

Geometry: Tetrahedral, bond angle ≈ 109.5°'),

  ('10000000-0000-0000-0000-000000000011',
   'Elastic potential energy: **PE = ½kx²**

k = 200 N/m, x = 0.1 m

PE = ½ × 200 × (0.1)² = 100 × 0.01 = **1.0 J**'),

  ('10000000-0000-0000-0000-000000000012',
   '∫₀¹ 3x² dx = [x³]₀¹ = 1³ − 0³ = **1**')
ON CONFLICT DO NOTHING;
