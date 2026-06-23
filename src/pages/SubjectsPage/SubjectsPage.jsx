// src/pages/SubjectsPage/SubjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { getFilterMetaData } from '../../services/questionService.js';
import { Loader2, ArrowRight, BookOpen, GraduationCap, Atom, TestTube2 } from 'lucide-react';

/**
 * SubjectsPage - Dedicated page to list all subjects with metadata.
 * Uses cached metadata instead of fetching all questions.
 *
 * @component
 */
export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFilterMetaData()
      .then((meta) => {
        // Use subjects directly from cache, sorted alphabetically
        const list = [...meta.subjects].sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getSubjectIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'physics':     return <Atom size={24} className="text-blue-500" />;
      case 'chemistry':   return <TestTube2 size={24} className="text-amber-500" />;
      case 'mathematics': return <GraduationCap size={24} className="text-purple-500" />;
      default:            return <BookOpen size={24} className="text-emerald-500" />;
    }
  };

  const getSubjectDescription = (name) => {
    switch (name.toLowerCase()) {
      case 'physics':
        return 'Master Kinematics, Laws of Motion, Work Energy, Electrostatics, and Modern Physics.';
      case 'chemistry':
        return 'Explore Organic mechanisms, s-block/p-block elements, Physical chemistry formulas, and pH calculations.';
      case 'mathematics':
        return 'Build strength in Differential Calculus, Integration methods, Quadratic equations, and Probability theory.';
      default:
        return 'Explore authentic Previous Year Questions sorted by topics and difficulty.';
    }
  };

  const getCardStyle = (name) => {
    switch (name.toLowerCase()) {
      case 'physics':     return 'hover:border-blue-500/40 hover:shadow-blue-500/5';
      case 'chemistry':   return 'hover:border-amber-500/40 hover:shadow-amber-500/5';
      case 'mathematics': return 'hover:border-purple-500/40 hover:shadow-purple-500/5';
      default:            return 'hover:border-emerald-500/40 hover:shadow-emerald-500/5';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6 text-left">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <span className="text-slate-650 dark:text-slate-400 font-bold">Subjects</span>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Browse by Subject
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Select a subject to explore topic-wise PYQs
          </p>
        </div>

        {/* Subjects List */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
              {subjects.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/questions?subjectId=${encodeURIComponent(sub.id)}`}
                  className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between group hover:shadow-lg ${getCardStyle(sub.name)}`}
                >
                  <div className="space-y-4">
                    {/* Icon Header */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 shrink-0 w-fit">
                      {getSubjectIcon(sub.name)}
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                        {sub.name}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                        {getSubjectDescription(sub.name)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                        Exam
                      </p>
                      <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350">
                        {sub.name}
                      </p>
                    </div>

                    <div className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/30 text-slate-400 group-hover:text-emerald-500 transition-all shrink-0">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
              <BookOpen size={40} className="text-slate-400 opacity-60" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Subjects Found
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
