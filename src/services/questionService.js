// src/services/questionService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Base query that selects questions with joined relations for display.
 * Always filters to published questions only.
 */
function baseQuery() {
  return supabase
    .from('questions')
    .select(`
      id,
      question_number,
      type,
      content,
      image_urls,
      marks,
      negative_marks,
      numerical_answer,
      numerical_tolerance,
      difficulty,
      status,
      exams ( id, name, code ),
      subjects ( id, name ),
      chapters ( id, name ),
      topics ( id, name ),
      papers ( id, year, session, shift ),
      question_options ( id, option_letter, content, image_urls, is_correct ),
      question_solutions ( id, content, image_urls, video_url )
    `)
    .eq('status', 'published');
}

// ---------------------------------------------------------------------------
// Module-level metadata cache — survives for the lifetime of the browser tab.
// Prevents repeated round-trips on every page mount.
// ---------------------------------------------------------------------------
let _metaCache = null;

/**
 * Retrieves all published questions.
 * @returns {Promise<Array>}
 */
export async function getAllQuestions() {
  const { data, error } = await baseQuery().order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Retrieves a single question by its UUID.
 * @param {string} id - UUID of the question
 * @returns {Promise<Object|null>}
 */
export async function getQuestionById(id) {
  const { data, error } = await baseQuery().eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Searches and filters questions based on a text query and active filters.
 *
 * @param {string} [query=''] - Free-text search (uses Postgres FTS)
 * @param {Object} [filters={}] - Optional structured filters
 * @param {string} [filters.examId]     - UUID of the exam
 * @param {string} [filters.subjectId]  - UUID of the subject
 * @param {string} [filters.chapterId]  - UUID of the chapter
 * @param {string} [filters.topicId]    - UUID of the topic
 * @param {string} [filters.paperId]    - UUID of the paper
 * @param {number} [filters.year]       - Paper year (integer)
 * @param {string} [filters.shift]      - Shift name (e.g. 'Shift 1')
 * @param {string} [filters.difficulty] - 'easy' | 'medium' | 'hard'
 * @param {string} [filters.type]       - 'mcq_single' | 'mcq_multiple' | 'numerical'
 * @returns {Promise<Array>}
 */
export async function searchQuestions(query = '', filters = {}) {
  let q = baseQuery();

  // --- Structured filters (use indexed columns on questions table) ---
  if (filters.examId)     q = q.eq('exam_id', filters.examId);
  if (filters.subjectId)  q = q.eq('subject_id', filters.subjectId);
  if (filters.chapterId)  q = q.eq('chapter_id', filters.chapterId);
  if (filters.topicId)    q = q.eq('topic_id', filters.topicId);
  if (filters.paperId)    q = q.eq('paper_id', filters.paperId);
  if (filters.difficulty) q = q.eq('difficulty', filters.difficulty);
  if (filters.type)       q = q.eq('type', filters.type);

  // --- Year / shift: join against papers table via paper_id ---
  if (filters.year || filters.shift) {
    let paperQuery = supabase.from('papers').select('id');
    if (filters.year)  paperQuery = paperQuery.eq('year', filters.year);
    if (filters.shift) paperQuery = paperQuery.ilike('shift', `%${filters.shift}%`);
    const { data: papers, error: pErr } = await paperQuery;
    if (pErr) throw pErr;
    const paperIds = (papers ?? []).map((p) => p.id);
    if (paperIds.length === 0) return [];
    q = q.in('paper_id', paperIds);
  }

  // --- Search: combine keyword full-text search with metadata lookup (exam, subject, topic, shift, year) ---
  if (query.trim()) {
    const terms = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 2 || /^\d+$/.test(word));

    if (terms.length > 0) {
      try {
        // Load filter metadata (will return instantly from the Tab-lifetime cache)
        const meta = await getFilterMetaData();

        const matchedExamIds = meta.exams
          .filter(e => terms.some(t => e.name.toLowerCase().includes(t) || e.code.toLowerCase().includes(t)))
          .map(e => e.id);

        const matchedSubjectIds = meta.subjects
          .filter(s => terms.some(t => s.name.toLowerCase().includes(t)))
          .map(s => s.id);

        const matchedTopicIds = meta.topics
          .filter(top => terms.some(t => top.name.toLowerCase().includes(t)))
          .map(top => top.id);

        const matchedPaperIds = meta.papers
          .filter(p => terms.some(t => 
            (p.shift && p.shift.toLowerCase().includes(t)) || 
            (p.session && p.session.toLowerCase().includes(t)) || 
            p.year.toString() === t
          ))
          .map(p => p.id);

        const orClauses = [];
        if (matchedExamIds.length > 0)    orClauses.push(`exam_id.in.(${matchedExamIds.join(',')})`);
        if (matchedSubjectIds.length > 0) orClauses.push(`subject_id.in.(${matchedSubjectIds.join(',')})`);
        if (matchedTopicIds.length > 0)   orClauses.push(`topic_id.in.(${matchedTopicIds.join(',')})`);
        if (matchedPaperIds.length > 0)   orClauses.push(`paper_id.in.(${matchedPaperIds.join(',')})`);

        // Join terms with OR to allow a wider search space matching parts of the query
        const ftsQuery = terms.join(' | ');
        orClauses.push(`fts.wfts.${ftsQuery}`);

        q = q.or(orClauses.join(','));
      } catch (metaErr) {
        console.error('Metadata lookup failed during search, falling back to simple full-text search:', metaErr);
        q = q.textSearch('fts', query.trim(), { type: 'websearch', config: 'english' });
      }
    }
  }

  q = q.order('created_at', { ascending: false });

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/**
 * Returns unique filter metadata from the DB for building dropdown filters.
 * Results are cached in memory for the duration of the browser session to
 * avoid redundant round-trips on every page mount.
 *
 * @param {boolean} [bust=false] - Pass true to bypass the cache and refetch.
 * @returns {Promise<{exams, subjects, chapters, topics, papers, years, shifts}>}
 */
export async function getFilterMetaData(bust = false) {
  if (_metaCache && !bust) return _metaCache;

  const [examsRes, subjectsRes, chaptersRes, topicsRes, papersRes] = await Promise.all([
    supabase.from('exams').select('id, name, code').order('name'),
    supabase.from('subjects').select('id, name, exam_id').order('name'),
    supabase.from('chapters').select('id, name, subject_id').order('name'),
    supabase.from('topics').select('id, name, chapter_id').order('name'),
    supabase.from('papers').select('id, year, session, shift, exam_id').order('year', { ascending: false }),
  ]);

  for (const res of [examsRes, subjectsRes, chaptersRes, topicsRes, papersRes]) {
    if (res.error) throw res.error;
  }

  const years  = [...new Set((papersRes.data ?? []).map((p) => p.year))].sort((a, b) => b - a);
  const shifts = [...new Set((papersRes.data ?? []).map((p) => p.shift).filter(Boolean))];

  _metaCache = {
    exams:    examsRes.data    ?? [],
    subjects: subjectsRes.data ?? [],
    chapters: chaptersRes.data ?? [],
    topics:   topicsRes.data   ?? [],
    papers:   papersRes.data   ?? [],
    years,
    shifts,
  };

  return _metaCache;
}

/** Clears the metadata cache (e.g., after an admin inserts new content). */
export function clearMetaCache() {
  _metaCache = null;
}
