// src/pages/ExamsPage/ExamsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { Lock, ArrowRight } from 'lucide-react';

/**
 * ExamsPage - Dedicated page to list available examinations.
 * JEE Main is operational, while all others are marked "Coming Soon".
 *
 * @component
 */
export default function ExamsPage() {
  const exams = [
    {
      id: 'jee-main',
      name: 'JEE Main',
      description: 'Joint Entrance Examination for engineering admission in India. Covers Physics, Chemistry, and Mathematics.',
      status: 'active',
      questionsCount: '10 Questions',
      path: '/papers?exam=JEE%2520Main' // URL encoded JEE Main
    },
    {
      id: 'neet',
      name: 'NEET',
      description: 'National Eligibility cum Entrance Test for medical admission in India. Covers Physics, Chemistry, and Biology.',
      status: 'coming-soon'
    },
    {
      id: 'upsc',
      name: 'UPSC Civil Services',
      description: 'Union Public Service Commission civil services examination. Covers General Studies, Aptitude, and Optional Subjects.',
      status: 'coming-soon'
    },
    {
      id: 'gate',
      name: 'GATE',
      description: 'Graduate Aptitude Test in Engineering for postgraduate admissions and public sector recruitment.',
      status: 'coming-soon'
    },
    {
      id: 'clat',
      name: 'CLAT',
      description: 'Common Law Admission Test for admission to undergraduate and postgraduate law courses.',
      status: 'coming-soon'
    }
  ];

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
        </div>

        {/* Examinations List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {exams.map((exam) => {
            const isActive = exam.status === 'active';
            
            if (isActive) {
              return (
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

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Available Papers
                      </p>
                      <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350">
                        {exam.questionsCount}
                      </p>
                    </div>

                    <div className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/30 text-slate-400 group-hover:text-emerald-500 transition-all shrink-0">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            }

            // Render disabled/Coming Soon cards
            return (
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
            );
          })}
        </div>
      </main>
    </div>
  );
}
