// src/services/questionService.js
import questionsData from '../data/questions.js';

/**
 * Retrieves all available questions.
 * @returns {Promise<Array>} A promise resolving to the list of questions.
 */
export async function getAllQuestions() {
  // Simulate network latency if needed, or resolve immediately
  return Promise.resolve([...questionsData]);
}

/**
 * Retrieves a single question by its numeric ID.
 * @param {number|string} id - The ID of the question to retrieve.
 * @returns {Promise<Object|null>} A promise resolving to the question object or null if not found.
 */
export async function getQuestionById(id) {
  const numericId = Number(id);
  const question = questionsData.find((q) => q.id === numericId);
  return Promise.resolve(question ? { ...question } : null);
}

/**
 * Searches and filters questions based on a text query and active filters.
 *
 * @param {string} [query=''] - The search text (matches question text, subject, topic, exam, or year)
 * @param {Object} [filters={}] - Optional filters
 * @param {string} [filters.subject] - Subject filter
 * @param {string} [filters.topic] - Topic filter
 * @param {string} [filters.exam] - Exam filter
 * @param {string|number} [filters.year] - Year filter
 * @returns {Promise<Array>} A promise resolving to the filtered questions.
 */
export async function searchQuestions(query = '', filters = {}) {
  let results = [...questionsData];

  // 1. Text Query Search
  if (query.trim()) {
    const trimmedQuery = query.toLowerCase().trim();
    results = results.filter((q) => {
      return (
        q.question.toLowerCase().includes(trimmedQuery) ||
        q.subject.toLowerCase().includes(trimmedQuery) ||
        q.topic.toLowerCase().includes(trimmedQuery) ||
        q.exam.toLowerCase().includes(trimmedQuery) ||
        String(q.year).includes(trimmedQuery)
      );
    });
  }

  // 2. Exact Filters
  if (filters.subject) {
    results = results.filter(
      (q) => q.subject.toLowerCase() === filters.subject.toLowerCase()
    );
  }
  if (filters.topic) {
    results = results.filter(
      (q) => q.topic.toLowerCase() === filters.topic.toLowerCase()
    );
  }
  if (filters.exam) {
    results = results.filter(
      (q) => q.exam.toLowerCase() === filters.exam.toLowerCase()
    );
  }
  if (filters.year) {
    results = results.filter(
      (q) => String(q.year) === String(filters.year)
    );
  }
  if (filters.shift) {
    results = results.filter(
      (q) => q.shift && q.shift.toLowerCase() === filters.shift.toLowerCase()
    );
  }

  return Promise.resolve(results);
}

/**
 * Gets unique filter options (subjects, topics, exams, years, shifts) based on current dataset.
 * Useful for building dynamic dropdowns or filter sidebars.
 * @returns {Promise<Object>} A promise resolving to lists of unique filter options.
 */
export async function getFilterMetaData() {
  const subjects = [...new Set(questionsData.map((q) => q.subject))];
  const topics = [...new Set(questionsData.map((q) => q.topic))];
  const exams = [...new Set(questionsData.map((q) => q.exam))];
  const years = [...new Set(questionsData.map((q) => q.year))].sort((a, b) => b - a);
  const shifts = [...new Set(questionsData.map((q) => q.shift).filter(Boolean))];

  return Promise.resolve({ subjects, topics, exams, years, shifts });
}
