// src/components/QuestionCard/QuestionCard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bookmark, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import mockQuestions from '../../data/questions.js';

/**
 * Reusable presentational card for displaying question summaries.
 * Extensively redesigned to support interactive quizzes, bookmark toggles,
 * expandable explanation panels, and related topics, matching picture 2.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.question - The question data object
 */
export default function QuestionCard({ question }) {
  const { id, question: text, subject, topic, exam, year, options, correctOption, explanation } = question;
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Sync bookmarks from localStorage on mount and when id changes
  useEffect(() => {
    const saved = localStorage.getItem('prashna_bookmarks');
    if (saved) {
      const ids = JSON.parse(saved);
      setIsBookmarked(ids.includes(id));
    }
  }, [id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const saved = localStorage.getItem('prashna_bookmarks');
    let ids = saved ? JSON.parse(saved) : [];
    
    if (ids.includes(id)) {
      ids = ids.filter(item => item !== id);
      setIsBookmarked(false);
    } else {
      ids.push(id);
      setIsBookmarked(true);
    }
    localStorage.setItem('prashna_bookmarks', JSON.stringify(ids));
  };

  const handleOptionClick = (index) => {
    if (selectedOption === null) {
      setSelectedOption(index);
    }
  };

  const getSubjectStyle = () => {
    switch (subject.toLowerCase()) {
      case 'physics':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'chemistry':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'mathematics':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
  };

  // Dynamically query related topics under the same subject from the list
  const relatedTopics = Array.from(
    new Set(
      mockQuestions
        .filter(q => q.subject.toLowerCase() === subject.toLowerCase() && q.topic.toLowerCase() !== topic.toLowerCase())
        .map(q => q.topic)
    )
  ).slice(0, 3); // limit to 3 topics

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
              {subject}
            </span>
            {/* Exam & Year Badge */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-455">
              {exam} • {year}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
            >
              <Bookmark
                size={14}
                className={isBookmarked ? "fill-emerald-500 text-emerald-500" : "text-slate-400"}
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
          {text}
        </p>

        {/* 2x2 Options Grid (matching picture 2) */}
        {options && options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {options.map((opt, idx) => {
              const label = String.fromCharCode(97 + idx); // a, b, c, d
              let btnClass = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
              let labelClass = "text-slate-400 dark:text-slate-500 font-bold";

              if (selectedOption !== null) {
                if (idx === correctOption) {
                  // Correct option styling
                  btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                  labelClass = "text-emerald-500";
                } else if (idx === selectedOption) {
                  // Selected incorrect option styling
                  btnClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                  labelClass = "text-red-500";
                } else {
                  // Non-selected option styling after a choice
                  btnClass = "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={`p-4 rounded-2xl border text-sm sm:text-base text-left transition-all font-semibold flex items-center gap-3.5 w-full cursor-pointer ${btnClass}`}
                >
                  <span className={`text-xs uppercase shrink-0 ${labelClass}`}>
                    {label}.
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags, Explanation trigger, and Related topics section */}
      <div className="mt-2 space-y-4">
        {/* Row with Topic tags and Explanation toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <span>Topic:</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">{topic}</span>
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

        {/* Related Topics Row (matching picture 2) */}
        {relatedTopics.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 text-left">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Related topics in {subject}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {relatedTopics.map((top) => (
                <button
                  key={top}
                  onClick={() => navigate(`/questions?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(top)}`)}
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
