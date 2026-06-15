// src/pages/QuestionsPage/QuestionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import QuestionCard from '../../components/QuestionCard/QuestionCard.jsx';
import { searchQuestions, getFilterMetaData } from '../../services/questionService.js';
import questionsData from '../../data/questions.js';
import { Loader2, BookOpen } from 'lucide-react';

/**
 * QuestionsPage - Page to browse and search all previous year questions.
 * Extensively updated to include breadcrumbs, title count with inline year dropdowns,
 * bookmark filtration, and custom focus border indicators matching picture 2.
 *
 * @component
 */
export default function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showSavedOnly = searchParams.get('saved') === 'true';
  const getSubjectForTopic = (topicName) => {
    if (!topicName) return '';
    const match = questionsData.find(
      (q) => q.topic.toLowerCase() === topicName.toLowerCase()
    );
    return match ? match.subject : '';
  };

  const focusParam = searchParams.get('focus') || '';

  const initTopic = searchParams.get('topic') || '';
  const initSubject = searchParams.get('subject') || getSubjectForTopic(initTopic) || '';

  const [selectedFilters, setSelectedFilters] = useState({
    subject: initSubject,
    topic: initTopic,
    exam: searchParams.get('exam') || '',
    year: searchParams.get('year') || '',
    shift: searchParams.get('shift') || ''
  });

  const [questions, setQuestions] = useState([]);
  const [metaData, setMetaData] = useState({
    subjects: [],
    topics: [],
    exams: [],
    years: [],
    shifts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync internal filter state with URL queries (e.g. from Past Papers page or Navbar link)
  useEffect(() => {
    const topic = searchParams.get('topic') || '';
    const subject = searchParams.get('subject') || getSubjectForTopic(topic) || '';
    setSelectedFilters({
      subject,
      topic,
      exam: searchParams.get('exam') || '',
      year: searchParams.get('year') || '',
      shift: searchParams.get('shift') || ''
    });
  }, [searchParams]);

  // Fetch unique filter metadata on mount
  useEffect(() => {
    async function fetchMeta() {
      const meta = await getFilterMetaData();
      setMetaData(meta);
    }
    fetchMeta();
  }, []);

  // Fetch questions whenever filters or bookmark toggles change
  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      let results = await searchQuestions('', selectedFilters);
      
      // If user clicked "Saved" in the navbar, filter by saved bookmark IDs
      if (showSavedOnly) {
        const saved = localStorage.getItem('prashna_bookmarks');
        const savedIds = saved ? JSON.parse(saved) : [];
        results = results.filter(q => savedIds.includes(q.id));
      }

      setQuestions(results);
      setIsLoading(false);
    }
    fetchQuestions();
  }, [selectedFilters, showSavedOnly]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };

    // Clear topic if it is not valid under the newly selected subject
    if (key === 'subject') {
      if (value) {
        const validTopics = questionsData
          .filter((q) => q.subject.toLowerCase() === value.toLowerCase())
          .map((q) => q.topic);
        if (selectedFilters.topic && !validTopics.includes(selectedFilters.topic)) {
          newFilters.topic = '';
        }
      } else {
        newFilters.topic = '';
      }
    }

    // Automatically select corresponding subject when a topic is selected
    if (key === 'topic' && value) {
      const subj = getSubjectForTopic(value);
      if (subj) {
        newFilters.subject = subj;
      }
    }

    setSelectedFilters(newFilters);

    const params = {};
    if (showSavedOnly) params.saved = 'true';
    if (newFilters.subject) params.subject = newFilters.subject;
    if (newFilters.topic) params.topic = newFilters.topic;
    if (newFilters.exam) params.exam = newFilters.exam;
    if (newFilters.year) params.year = newFilters.year;
    if (newFilters.shift) params.shift = newFilters.shift;
    
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      subject: '',
      topic: '',
      exam: '',
      year: '',
      shift: ''
    });
    setSearchParams(showSavedOnly ? { saved: 'true' } : {});
  };

  // Build breadcrumbs path matching the design from picture 2
  const renderBreadcrumbs = () => {
    const crumbs = [
      <Link key="home" to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
    ];

    if (showSavedOnly) {
      crumbs.push(<span key="sep-saved" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      crumbs.push(<span key="saved" className="text-slate-650 dark:text-slate-400 font-bold">Saved Questions</span>);
      return crumbs;
    }

    crumbs.push(<span key="sep-all" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);

    if (selectedFilters.exam && selectedFilters.year) {
      crumbs.push(<Link key="papers" to="/papers" className="hover:text-emerald-500 transition-colors">Past Papers</Link>);
      crumbs.push(<span key="sep-paper" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      if (selectedFilters.shift) {
        crumbs.push(<Link key="paper-name" to={`/questions?year=${selectedFilters.year}&exam=${encodeURIComponent(selectedFilters.exam)}`} className="hover:text-emerald-500 transition-colors">{selectedFilters.exam} — {selectedFilters.year}</Link>);
        crumbs.push(<span key="sep-shift" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
        crumbs.push(<span key="shift-name" className="text-slate-655 dark:text-slate-400 font-bold">{selectedFilters.shift}</span>);
      } else {
        crumbs.push(<span key="paper-name" className="text-slate-655 dark:text-slate-400 font-bold">{selectedFilters.exam} — {selectedFilters.year}</span>);
      }
    } else if (selectedFilters.subject) {
      crumbs.push(<span key="subj-label" className="text-slate-400 dark:text-slate-500">Subjects</span>);
      crumbs.push(<span key="sep-subj" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      if (selectedFilters.topic) {
        crumbs.push(<Link key="subj" to={`/questions?subject=${encodeURIComponent(selectedFilters.subject)}`} className="hover:text-emerald-500 transition-colors">{selectedFilters.subject}</Link>);
        crumbs.push(<span key="sep-topic" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
        crumbs.push(<span key="topic" className="text-slate-650 dark:text-slate-400 font-bold">{selectedFilters.topic}</span>);
      } else {
        crumbs.push(<span key="subj" className="text-slate-650 dark:text-slate-400 font-bold">{selectedFilters.subject}</span>);
      }
    } else if (selectedFilters.topic) {
      crumbs.push(<span key="topic-label" className="text-slate-400 dark:text-slate-500">Topics</span>);
      crumbs.push(<span key="sep-topic" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      crumbs.push(<span key="topic" className="text-slate-655 dark:text-slate-400 font-bold">{selectedFilters.topic}</span>);
    } else if (selectedFilters.year) {
      crumbs.push(<Link key="papers" to="/papers" className="hover:text-emerald-500 transition-colors">Past Papers</Link>);
      crumbs.push(<span key="sep-year" className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>);
      crumbs.push(<span key="year" className="text-slate-655 dark:text-slate-400 font-bold">{selectedFilters.year}</span>);
    } else {
      crumbs.push(<span key="all" className="text-slate-655 dark:text-slate-400 font-bold">All Questions</span>);
    }

    return crumbs;
  };

  // Build page title details matching picture 2
  const getPageTitle = () => {
    if (showSavedOnly) {
      return `Saved Questions (${questions.length})`;
    }
    if (selectedFilters.subject) {
      return `Subject: ${selectedFilters.subject} (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
    }
    if (selectedFilters.topic) {
      return `Topic: ${selectedFilters.topic} (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
    }
    if (selectedFilters.exam && selectedFilters.year) {
      if (selectedFilters.shift) {
        return `${selectedFilters.exam} — ${selectedFilters.year} • ${selectedFilters.shift} (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
      }
      return `${selectedFilters.exam} — ${selectedFilters.year} (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
    }
    if (selectedFilters.exam) {
      return `Exam: ${selectedFilters.exam} (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
    }
    if (selectedFilters.year) {
      return `Year: ${selectedFilters.year} (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
    }
    return `Explore Previous Year Questions (${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'})`;
  };

  const getSelectClass = (field) => {
    const base = "px-3.5 py-2 rounded-xl text-sm border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer font-semibold transition-all";
    if (focusParam === field) {
      return `${base} border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-500/80 animate-pulse`;
    }
    return `${base} border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700`;
  };
  const getFilteredTopics = () => {
    if (!selectedFilters.subject) {
      return metaData.topics;
    }
    const filtered = questionsData
      .filter((q) => q.subject.toLowerCase() === selectedFilters.subject.toLowerCase())
      .map((q) => q.topic);
    return [...new Set(filtered)];
  };

  const hasActiveFilters = selectedFilters.subject || selectedFilters.topic || selectedFilters.exam || selectedFilters.year || selectedFilters.shift;

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      {/* Global Navbar */}
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Navigation Breadcrumbs (matching picture 2) */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 text-left">
          {renderBreadcrumbs()}
        </div>

        {/* Page Heading & Inline Year Filter aligned on the right (matching picture 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-850 pb-4 text-left">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {getPageTitle()}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {showSavedOnly 
                ? "Your handpicked bookmarks saved locally"
                : selectedFilters.subject 
                ? `Browse official exam questions related to ${selectedFilters.subject}`
                : "Query and select from authentic questions of the last 10 years"
              }
            </p>
          </div>

          {/* Inline Year dropdown next to title (matching picture 2) */}
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

        {/* Inline Filters Panel (minimalist horizontal row replacing chuncky card drawer) */}
        {!showSavedOnly && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Selector */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Subject</span>
              <select
                value={selectedFilters.subject || ''}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className={getSelectClass('subject')}
              >
                <option value="">All Subjects</option>
                {metaData.subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Topic Selector */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Topic</span>
              <select
                value={selectedFilters.topic || ''}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
                className={getSelectClass('topic')}
              >
                <option value="">All Topics</option>
                {getFilteredTopics().map((top) => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
            </div>

            {/* Exam Selector */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Exam</span>
              <select
                value={selectedFilters.exam || ''}
                onChange={(e) => handleFilterChange('exam', e.target.value)}
                className={getSelectClass('exam')}
              >
                <option value="">All Exams</option>
                {metaData.exams.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            {/* Shift Selector */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Shift</span>
              <select
                value={selectedFilters.shift || ''}
                onChange={(e) => handleFilterChange('shift', e.target.value)}
                className={getSelectClass('shift')}
              >
                <option value="">All Shifts</option>
                {metaData.shifts && metaData.shifts.map((sh) => (
                  <option key={sh} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

            {/* Clear Button */}
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

        {/* Dynamic Questions List */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-6 pb-12 w-full">
                {questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
              <BookOpen size={40} className="text-slate-400 opacity-60" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                {showSavedOnly ? "No Saved Questions Yet" : "No Questions Found"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">
                {showSavedOnly 
                  ? "Mark questions with the bookmark icon on cards to save them here."
                  : "We couldn't find any questions matching your active filter configuration."
                }
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
