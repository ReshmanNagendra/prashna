// src/services/bookmarkService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all question IDs bookmarked by the current authenticated user.
 * @returns {Promise<string[]>} Array of question UUIDs
 */
export async function getBookmarkedIds() {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('question_id');
  if (error) throw error;
  return (data ?? []).map((b) => b.question_id);
}

/**
 * Fetches all bookmarks with full question data for the current user.
 * @returns {Promise<Array>}
 */
export async function getBookmarkedQuestions() {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      notes,
      created_at,
      questions (
        id, type, content, image_urls, difficulty, status,
        exams ( id, name, code ),
        subjects ( id, name ),
        chapters ( id, name ),
        topics ( id, name ),
        papers ( id, year, session, shift ),
        question_options ( id, option_letter, content, image_urls, is_correct ),
        question_solutions ( id, content, image_urls, video_url )
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((b) => ({ ...b.questions, _bookmark_id: b.id, _notes: b.notes }));
}

/**
 * Adds a bookmark for a question. Silently handles duplicates.
 * @param {string} questionId - UUID of the question
 * @param {string} [notes=''] - Optional user note
 */
export async function addBookmark(questionId, notes = '') {
  const { error } = await supabase
    .from('bookmarks')
    .upsert({ question_id: questionId, notes }, { onConflict: 'user_id,question_id' });
  if (error) throw error;
}

/**
 * Removes a bookmark for a question.
 * @param {string} questionId - UUID of the question
 */
export async function removeBookmark(questionId) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('question_id', questionId);
  if (error) throw error;
}

/**
 * Toggles a bookmark on/off for a question.
 * @param {string} questionId
 * @param {boolean} isCurrentlyBookmarked
 */
export async function toggleBookmark(questionId, isCurrentlyBookmarked) {
  if (isCurrentlyBookmarked) {
    await removeBookmark(questionId);
  } else {
    await addBookmark(questionId);
  }
}
