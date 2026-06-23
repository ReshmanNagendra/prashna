// src/pages/QuestionsPage/QuestionsPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import QuestionCard from '../../components/QuestionCard/QuestionCard.jsx';
import { searchQuestions, getFilterMetaData } from '../../services/questionService.js';
import { getBookmarkedQuestions } from '../../services/bookmarkService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import { Loader2, BookOpen } from 'lucide-react';

export default function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showSavedOnly = searchParams.get('saved') === 'true';
  const { user } = useAuth();

  const focusParam = searchParams.get('focus') || '';

  // Filters keyed by UUID — kept in sync with URL params
  const [selectedFilters, setSelectedFilters] = useState({
    subjectId: searchParams.get('subjectId') || '',
    topicId:   searchParams.get('topicId')   || '',
    examId:    searchParams.get('examId')    || '',
    year:      searchParams.get('year')      || '',
    shift:     searchParams.get('shift')     || '',
  });

  const [questions, setQuestions]   = useState([]);
  // chapters MUST be in the initial state — getFilteredTopics() calls metaData.chapters.filter(...)
  const [metaData, setMetaData] = useState({
    subjects: [],
    topics:   [],
    chapters: [],   // ← critical: prevents crash before first fetch resolves
    exams:    [],
    years:    [],
    shifts:   [],
    papers:   [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const debounceRef = useRef(null);

  // Keep filter state in sync with URL (handles browser back/forward + direct links)
  useEffect(() => {
    setSelectedFilters({
      subjectId: searchParams.get('subjectId') || '',
      topicId:   searchParams.get('topicId')   || '',
      examId:    searchParams.get('examId')    || '',
      year:      searchParams.get('year')      || '',
      shift:     searchParams.get('shift')     || '',
    });
  }, [searchParams]);

  // Fetch metadata once on mount (cached in module scope after first load)
  useEffect(() => {
    getFilterMetaData()
      .then(setMetaData)
      .catch((err) => {
        console.error('Metadata fetch error:', err);
      });
  }, []);

  // Fetch questions when filters change — debounced 200ms
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      if (showSavedOnly) {
        if (!user) {
          setQuestions([]);
          return;
        }
        // Use bookmarkService which fetches questions WITH full join in one query
        const bookmarked = await getBookmarkedQuestions();
        setQuestions(bookmarked);
      } else {
        const results = await searchQuestions('', selectedFilters);
        setQuestions(results);
      }
    } catch (err) {
      console.error('QuestionsPage fetch error:', err);
      setFetchError(err?.message ?? 'Failed to load questions. Please try again.');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilters, showSavedOnly, user]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchQuestions, 200);
    return () => clearTimeout(debounceRef.current);
  }, [fetchQuestions]);

  // ── Filter helpers ──────────────────────────────────────────────────────────

  const handleFilterChange = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };
    if (key === 'subjectId') newFilters.topicId = ''; // reset dependent filter

    // Auto-select parent subject when a topic is picked
    if (key === 'topicId' && value) {
      const topic   = metaData.topics.find((t) => t.id === value);
      const chapter = topic ? metaData.chapters.find((c) => c.id === topic.chapter_id) : null;
      const subject = chapter ? metaData.subjects.find((s) => s.id === chapter.subject_id) : null;
      if (subject) newFilters.subjectId = subject.id;
    }

    setSelectedFilters(newFilters);

    const params = {};
    if (showSavedOnly)          params.saved     = 'true';
    if (newFilters.subjectId)   params.subjectId = newFilters.subjectId;
    if (newFilters.topicId)     params.topicId   = newFilters.topicId;
    if (newFilters.examId)      params.examId    = newFilters.examId;
    if (newFilters.year)        params.year      = newFilters.year;
    if (newFilters.shift)       params.shift     = newFilters.shift;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSelectedFilters({ subjectId: '', topicId: '', examId: '', year: '', shift: '' });
    setSearchParams(showSavedOnly ? { saved: 'true' } : {});
  };

  // Topics filtered to those under the currently selected subject
  const getFilteredTopics = () => {
    if (!selectedFilters.subjectId) return metaData.topics;
    const chapterIds = new Set(
      metaData.chapters
        .filter((c) => c.subject_id === selectedFilters.subjectId)
        .map((c) => c.id)
    );
    return metaData.topics.filter((t) => chapterIds.has(t.chapter_id));
  };

  // ── Derived display values ──────────────────────────────────────────────────

  const activeSubject = metaData.subjects.find((s) => s.id === selectedFilters.subjectId);
  const activeTopic   = metaData.topics.find((t)   => t.id === selectedFilters.topicId);
  const activeExam    = metaData.exams.find((e)     => e.id === selectedFilters.examId);

  const hasActiveFilters =
    selectedFilters.subjectId || selectedFilters.topicId ||
    selectedFilters.examId    || selectedFilters.year    || selectedFilters.shift;

  const getPageTitle = () => {
    const n = questions.length;
    const q = n === 1 ? 'Question' : 'Questions';
    if (showSavedOnly)                       return `Saved Questions (${n})`;
    if (activeSubject && activeTopic)        return `${activeTopic.name} — ${activeSubject.name} (${n} ${q})`;
    if (activeSubject)                       return `Subject: ${activeSubject.name} (${n} ${q})`;
    if (activeTopic)                         return `Topic: ${activeTopic.name} (${n} ${q})`;
    if (activeExam && selectedFilters.year && selectedFilters.shift)
                                             return `${activeExam.name} — ${selectedFilters.year} • ${selectedFilters.shift} (${n} ${q})`;
    if (activeExam && selectedFilters.year)  return `${activeExam.name} — ${selectedFilters.year} (${n} ${q})`;
    if (activeExam)                          return `Exam: ${activeExam.name} (${n} ${q})`;
    if (selectedFilters.year)                return `Year: ${selectedFilters.year} (${n} ${q})`;
    return `Explore Previous Year Questions (${n} ${q})`;
  };

  const getSelectClass = (field) => {
    const base = 'px-3.5 py-2 rounded-xl text-sm border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer font-semibold transition-all';
    if (focusParam === field) return `${base} border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-500/80 animate-pulse`;
    return `${base} border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700`;
  };

  const renderBreadcrumbs = () => {
    const crumbs = [
      <Link key="home" to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
    ];
    crumbs.push(<span key="sep" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);

    if (showSavedOnly) {
      crumbs.push(<span key="saved" className="text-slate-650 dark:text-slate-400 font-bold">Saved Questions</span>);
    } else if (activeExam && selectedFilters.year) {
      crumbs.push(<Link key="papers" to="/papers" className="hover:text-emerald-500 transition-colors">Past Papers</Link>);
      crumbs.push(<span key="sep2" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      crumbs.push(<span key="paper" className="text-slate-655 dark:text-slate-400 font-bold">{activeExam.name} — {selectedFilters.year}{selectedFilters.shift ? ` • ${selectedFilters.shift}` : ''}</span>);
    } else if (activeSubject) {
      crumbs.push(<Link key="subjects" to="/subjects" className="hover:text-emerald-500 transition-colors">Subjects</Link>);
      crumbs.push(<span key="sep2" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      if (activeTopic) {
        crumbs.push(<Link key="subj" to={`/questions?subjectId=${activeSubject.id}`} className="hover:text-emerald-500 transition-colors">{activeSubject.name}</Link>);
        crumbs.push(<span key="sep3" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
        crumbs.push(<span key="topic" className="text-slate-650 dark:text-slate-400 font-bold">{activeTopic.name}</span>);
      } else {
        crumbs.push(<span key="subj" className="text-slate-650 dark:text-slate-400 font-bold">{activeSubject.name}</span>);
      }
    } else if (activeTopic) {
      crumbs.push(<Link key="topics" to="/topics" className="hover:text-emerald-500 transition-colors">Topics</Link>);
      crumbs.push(<span key="sep2" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      crumbs.push(<span key="topic" className="text-slate-655 dark:text-slate-400 font-bold">{activeTopic.name}</span>);
    } else if (selectedFilters.year) {
      crumbs.push(<Link key="papers" to="/papers" className="hover:text-emerald-500 transition-colors">Past Papers</Link>);
      crumbs.push(<span key="sep2" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      crumbs.push(<span key="year" className="text-slate-655 dark:text-slate-400 font-bold">{selectedFilters.year}</span>);
    } else {
      crumbs.push(<span key="all" className="text-slate-655 dark:text-slate-400 font-bold">All Questions</span>);
    }
    return crumbs;
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 text-left">
          {renderBreadcrumbs()}
        </div>

        {/* Page heading + year filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4 text-left">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {getPageTitle()}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {showSavedOnly
                ? 'Your bookmarked questions'
                : activeSubject
                ? `Browse official exam questions related to ${activeSubject.name}`
                : 'Query and select from authentic questions of the last 10 years'}
            </p>
          </div>

          {!showSavedOnly && (
            <div className="shrink-0">
              <select
                value={selectedFilters.year || ''}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className={getSelectClass('year')}
              >
                <option value="">All Years</option>
                {metaData.years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filter panel */}
        {!showSavedOnly && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Subject</span>
              <select value={selectedFilters.subjectId || ''} onChange={(e) => handleFilterChange('subjectId', e.target.value)} className={getSelectClass('subject')}>
                <option value="">All Subjects</option>
                {metaData.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Topic</span>
              <select value={selectedFilters.topicId || ''} onChange={(e) => handleFilterChange('topicId', e.target.value)} className={getSelectClass('topic')}>
                <option value="">All Topics</option>
                {getFilteredTopics().map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Exam</span>
              <select value={selectedFilters.examId || ''} onChange={(e) => handleFilterChange('examId', e.target.value)} className={getSelectClass('exam')}>
                <option value="">All Exams</option>
                {metaData.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Shift</span>
              <select value={selectedFilters.shift || ''} onChange={(e) => handleFilterChange('shift', e.target.value)} className={getSelectClass('shift')}>
                <option value="">All Shifts</option>
                {metaData.shifts.map((sh) => <option key={sh} value={sh}>{sh}</option>)}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Questions list */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : fetchError ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-red-200 dark:border-red-900 rounded-2xl bg-red-50/50 dark:bg-red-950/20">
              <p className="text-base font-bold text-red-600 dark:text-red-400">Something went wrong</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{fetchError}</p>
              <button
                onClick={fetchQuestions}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : questions.length > 0 ? (
            <div className="flex flex-col gap-6 pb-12 w-full">
              {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
              <BookOpen size={40} className="text-slate-400 opacity-60" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                {showSavedOnly ? 'No Saved Questions Yet' : 'No Questions Found'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">
                {showSavedOnly
                  ? 'Mark questions with the bookmark icon on cards to save them here.'
                  : hasActiveFilters
                  ? "No questions match your current filters. Try clearing some filters."
                  : "The database is empty. Run supabase/seed.sql in your Supabase dashboard to add sample questions."}
              </p>
              {hasActiveFilters && !showSavedOnly && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer active:scale-[0.98]"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
