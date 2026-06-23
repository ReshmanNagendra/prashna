// src/pages/QuestionDetailPage/QuestionDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { getQuestionById } from '../../services/questionService.js';
import { ArrowLeft, Copy, Check, Calendar, Landmark, Book, FileQuestion } from 'lucide-react';

/**
 * QuestionDetailPage - Dynamic route detail view.
 * Uses routing param `id` to lookup dynamic question object,
 * handles loading, copies query text, and renders all question properties.
 *
 * @component
 */
export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadQuestion() {
      setIsLoading(true);
      try {
        const data = await getQuestionById(id);
        if (data) {
          setQuestion(data);
        } else {
          // Graceful redirect back if parameter ID doesn't exist
          navigate('/questions');
        }
      } catch (err) {
        console.error('Question detail load error:', err);
        navigate('/questions');
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestion();
  }, [id, navigate]);

  const handleCopy = () => {
    if (question) {
      navigator.clipboard.writeText(question.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      {/* Global Navbar */}
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6 text-left">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 text-left">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <Link to="/questions" className="hover:text-emerald-500 transition-colors">Questions</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <span className="text-slate-655 dark:text-slate-400 font-bold">Question #{question.id}</span>
        </div>

        {/* Detailed Question Block */}
        <div className="p-8 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-300">
          <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Question #{question.id}
            </span>
            
            {/* Clipboard Copy Option */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Question</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-lg md:text-xl font-medium leading-relaxed tracking-tight text-slate-800 dark:text-slate-100 select-all">
              {question.content}
            </p>
          </div>
        </div>

        {/* Category Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
          {/* Subject Badge */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Book size={20} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Subject</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{question.subjects?.name ?? '—'}</p>
            </div>
          </div>

          {/* Topic Badge */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <FileQuestion size={20} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Topic</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{question.topics?.name ?? '—'}</p>
            </div>
          </div>

          {/* Exam Badge */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
              <Landmark size={20} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Exam</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{question.exams?.name ?? '—'}</p>
            </div>
          </div>

          {/* Year Badge */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Year</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{question.papers?.year ?? '—'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
