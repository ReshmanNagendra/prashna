// src/components/QuestionCard/QuestionCard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bookmark, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { toggleBookmark, getBookmarkedIds } from '../../services/bookmarkService.js';

/**
 * Reusable presentational card for displaying question summaries.
 * Supports interactive quizzes, bookmark toggles (Supabase-backed when logged in,
 * localStorage fallback when anonymous), expandable explanation panels,
 * and related topics derived from cached metadata.
 *
 * @component
 * @param {Object} props.question - The Supabase question row with joined relations
 * @param {string[]} [props.siblingTopics] - Optional pre-filtered related topic names (avoids re-computation)
 */
export default function QuestionCard({ question, siblingTopics }) {
  const {
    id,
    content,          // Supabase field (was `question` in mock)
    type,
    subjects,
    topics,
    exams,
    papers,
    question_options: options = [],
    question_solutions: solutions = [],
  } = question;

  // Resolve display strings from joined objects
  const subjectName = subjects?.name  ?? '';
  const topicName   = topics?.name    ?? '';
  const examName    = exams?.name     ?? '';
  const year        = papers?.year    ?? '';
  const explanation = solutions?.[0]?.content ?? solutions?.content ?? null;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked]       = useState(false);
  const [selectedOption, setSelectedOption]   = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarkBusy, setBookmarkBusy]       = useState(false);

  // --------------------------------------------------------------------------
  // Bookmark state hydration
  // Logged-in: fetch from Supabase (bookmarkService).
  // Anonymous: read from localStorage as fallback.
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (user) {
        try {
          const ids = await getBookmarkedIds();
          if (!cancelled) setIsBookmarked(ids.includes(id));
        } catch { /* ignore */ }
      } else {
        const raw = localStorage.getItem('prashna_bookmarks');
        const ids = raw ? JSON.parse(raw) : [];
        if (!cancelled) setIsBookmarked(ids.includes(id));
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, [id, user]);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    const next = !isBookmarked;
    setIsBookmarked(next);           // optimistic update

    if (user) {
      try {
        await toggleBookmark(id, isBookmarked);
      } catch {
        setIsBookmarked(isBookmarked); // revert on error
      }
    } else {
      // Anonymous: persist to localStorage
      const raw  = localStorage.getItem('prashna_bookmarks');
      let ids    = raw ? JSON.parse(raw) : [];
      ids        = next ? [...ids, id] : ids.filter((x) => x !== id);
      localStorage.setItem('prashna_bookmarks', JSON.stringify(ids));
    }
    setBookmarkBusy(false);
  };

  const handleOptionClick = (index) => {
    if (selectedOption === null) setSelectedOption(index);
  };

  const getSubjectStyle = () => {
    switch (subjectName.toLowerCase()) {
      case 'physics':     return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'chemistry':   return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'mathematics': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default:            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
  };

  // Use pre-computed sibling topics when available (passed from parent list renders)
  // to avoid recomputing on every card render. Falls back to empty array.
  const relatedTopics = useMemo(() => (siblingTopics ?? []).slice(0, 3), [siblingTopics]);

  // Determine correct MCQ option index (options sorted by option_letter A/B/C/D)
  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.option_letter.localeCompare(b.option_letter)),
    [options]
  );
  const correctIndex = useMemo(
    () => sortedOptions.findIndex((o) => o.is_correct),
    [sortedOptions]
  );

  return (
    <div className="p-6 sm:p-8 rounded-3xl border transition-all duration-300 group hover:shadow-lg relative overflow-hidden flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40">
      {/* Decorative vertical glow bar */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Badges, Detail Link and Bookmark Toggle */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {/* Subject Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getSubjectStyle()}`}>
              {subjectName}
            </span>
            {/* Exam & Year Badge */}
            {(examName || year) && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-455">
                {examName}{year ? ` • ${year}` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarkBusy}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-60"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
            >
              <Bookmark
                size={14}
                className={isBookmarked ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400'}
              />
            </button>
            {/* View Details Link */}
            <Link
              to={`/question/${id}`}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label={`View details for question ${id}`}
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Question Text */}
        <p className="text-lg sm:text-xl font-bold leading-relaxed tracking-tight text-slate-850 dark:text-slate-50 mb-6 select-all">
          {content}
        </p>

        {/* MCQ Options Grid */}
        {type !== 'numerical' && sortedOptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {sortedOptions.map((opt, idx) => {
              const label = opt.option_letter.toLowerCase();
              let btnClass  = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300';
              let labelClass = 'text-slate-400 dark:text-slate-500 font-bold';

              if (selectedOption !== null) {
                if (idx === correctIndex) {
                  btnClass  = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
                  labelClass = 'text-emerald-500';
                } else if (idx === selectedOption) {
                  btnClass  = 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400';
                  labelClass = 'text-red-500';
                } else {
                  btnClass  = 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={`p-4 rounded-2xl border text-sm sm:text-base text-left transition-all font-semibold flex items-center gap-3.5 w-full cursor-pointer ${btnClass}`}
                >
                  <span className={`text-xs uppercase shrink-0 ${labelClass}`}>{label}.</span>
                  <span>{opt.content}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Numerical answer field placeholder */}
        {type === 'numerical' && (
          <div className="mb-4 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Numerical answer — enter your value and reveal the solution below.
          </div>
        )}
      </div>

      {/* Tags, Explanation trigger, and Related topics section */}
      <div className="mt-2 space-y-4">
        {/* Row with Topic tags and Explanation toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <span>Topic:</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">{topicName}</span>
          </div>

          {explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
              <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
              {showExplanation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Explanation expanding block */}
        {showExplanation && explanation && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#fbfdfc] dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line text-left transition-all duration-300">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-900 pb-1.5">
              Solution & Explanation
            </h4>
            {explanation}
          </div>
        )}

        {/* Related Topics Row */}
        {relatedTopics.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 text-left">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Related topics in {subjectName}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {relatedTopics.map((top) => (
                <button
                  key={top}
                  onClick={() => navigate(`/questions?subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(top)}`)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-50 hover:bg-emerald-500/10 dark:bg-slate-850 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 transition-all cursor-pointer"
                >
                  {top}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
