// src/pages/ExamsPage/ExamsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { getFilterMetaData } from '../../services/questionService.js';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';

// Exams that are fully operational (matched by code from DB)
const ACTIVE_CODES = new Set(['jee_main']);

// Static descriptions — extend as more exams go live
const EXAM_META = {
  jee_main:  { description: 'Joint Entrance Examination for engineering admission. Covers Physics, Chemistry, and Mathematics.' },
  neet:      { description: 'National Eligibility cum Entrance Test for medical admission. Covers Physics, Chemistry, and Biology.' },
  gate:      { description: 'Graduate Aptitude Test in Engineering for postgraduate admissions and PSU recruitment.' },
  upsc_cse:  { description: 'UPSC Civil Services Examination covering General Studies, Aptitude, and Optional Subjects.' },
};

/**
 * ExamsPage - Live exam catalog sourced from Supabase.
 * Active exams link to their papers; inactive show "Coming Soon".
 *
 * @component
 */
export default function ExamsPage() {
  const [exams, setExams]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    getFilterMetaData()
      .then((meta) => {
        const list = meta.exams.map((exam) => ({
          id:          exam.id,
          code:        exam.code,
          name:        exam.name,
          description: EXAM_META[exam.code]?.description ?? exam.description ?? 'Explore official past papers for this examination.',
          isActive:    ACTIVE_CODES.has(exam.code),
        }));
        // Active exams first, then by name
        list.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0) || a.name.localeCompare(b.name));
        setExams(list);
      })
      .catch((err) => {
        console.error('Exams fetch error:', err);
        setFetchError(err?.message ?? 'Failed to load exams.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6 text-left">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <span className="text-slate-650 dark:text-slate-400 font-bold">Examinations</span>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Examinations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Select an examination to explore and practice official past papers
          </p>
        </div>        {/* Examinations List Grid */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : fetchError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-red-200 dark:border-red-900 rounded-2xl bg-red-50/50 dark:bg-red-950/20">
            <p className="text-base font-bold text-red-650 dark:text-red-400">Failed to load exams</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{fetchError}</p>
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {exams.map((exam) =>
              exam.isActive ? (
                <Link
                  key={exam.id}
                  to={`/papers?exam=${encodeURIComponent(exam.name)}`}
                  className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer block text-left"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Operational
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                        {exam.name}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                        {exam.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end">
                    <div className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/30 text-slate-400 group-hover:text-emerald-500 transition-all shrink-0">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={exam.id}
                  className="p-6 rounded-3xl border bg-white/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-850/50 flex flex-col justify-between opacity-75 relative select-none"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                        Coming Soon
                      </span>
                      <Lock size={14} className="text-slate-400 dark:text-slate-600" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-extrabold text-slate-400 dark:text-slate-600">
                        {exam.name}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-400 dark:text-slate-600 font-medium">
                        {exam.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-850/30 flex items-center justify-between text-slate-400">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-350 dark:text-slate-600 uppercase tracking-wider">
                        Available Papers
                      </p>
                      <p className="text-sm font-bold text-slate-350 dark:text-slate-600">
                        Coming Soon
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
            <Lock size={40} className="text-slate-400 opacity-60 animate-bounce" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              No Exams Found
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
