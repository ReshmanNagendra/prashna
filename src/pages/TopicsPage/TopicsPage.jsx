// src/pages/TopicsPage/TopicsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { getFilterMetaData } from '../../services/questionService.js';
import { Loader2, ArrowRight, BookOpen, GraduationCap, Atom, TestTube2 } from 'lucide-react';

/**
 * TopicsPage - Dedicated page to list all topics grouped by Subject.
 * Uses cached metadata instead of fetching all questions.
 *
 * @component
 */
export default function TopicsPage() {
  const [subjectsData, setSubjectsData] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);

  useEffect(() => {
    getFilterMetaData()
      .then((meta) => {
        // Build subject → topics hierarchy from cached metadata
        const list = meta.subjects
          .map((sub) => {
            const exam = meta.exams.find((e) => e.id === sub.exam_id);
            const examName = exam ? exam.name : 'Unknown Exam';

            // chapters that belong to this subject
            const subjectChapters = new Set(
              meta.chapters
                .filter((c) => c.subject_id === sub.id)
                .map((c) => c.id)
            );
            // topics that belong to those chapters
            const topics = meta.topics
              .filter((t) => subjectChapters.has(t.chapter_id))
              .map((t) => ({ id: t.id, name: t.name }))
              .sort((a, b) => a.name.localeCompare(b.name));

            return { subjectId: sub.id, subjectName: sub.name, examName, topics };
          })
          .filter((s) => s.topics.length > 0)
          .sort((a, b) => a.examName.localeCompare(b.examName) || a.subjectName.localeCompare(b.subjectName));

        setSubjectsData(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getSubjectIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'physics':     return <Atom size={18} className="text-blue-500" />;
      case 'chemistry':   return <TestTube2 size={18} className="text-amber-500" />;
      case 'mathematics': return <GraduationCap size={18} className="text-purple-500" />;
      default:            return <BookOpen size={18} className="text-emerald-500" />;
    }
  };

  const getSubjectBadgeStyle = (name) => {
    switch (name.toLowerCase()) {
      case 'physics':     return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'chemistry':   return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'mathematics': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default:            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
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
          <span className="text-slate-650 dark:text-slate-400 font-bold">Topics</span>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Browse by Topic
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Explore authentic questions grouped by subjects and core concepts
          </p>
        </div>

        {/* List of Topics grouped by Subject */}
        <div className="flex-1 flex flex-col gap-8">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : subjectsData.length > 0 ? (
            <div className="space-y-8 pb-12">
              {subjectsData.map((subj) => (
                <div key={subj.subjectId} className="space-y-4">
                  {/* Subject Heading */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shrink-0">
                      {getSubjectIcon(subj.subjectName)}
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {subj.subjectName}
                    </h2>
                    {/* Exam Name badge */}
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-200/70 dark:bg-slate-800 text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                      {subj.examName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${getSubjectBadgeStyle(subj.subjectName)}`}>
                      {subj.topics.length} {subj.topics.length === 1 ? 'Topic' : 'Topics'}
                    </span>
                  </div>

                  {/* Topics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subj.topics.map((topic) => (
                      <Link
                        key={topic.id}
                        to={`/questions?subjectId=${encodeURIComponent(subj.subjectId)}&topicId=${encodeURIComponent(topic.id)}`}
                        className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer block text-left"
                      >
                        <div className="space-y-0.5 text-left pr-4">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">
                            {topic.name}
                          </p>
                        </div>

                        <div className="p-1 rounded-lg border border-transparent group-hover:border-emerald-500/20 text-slate-400 group-hover:text-emerald-500 transition-all shrink-0">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
              <BookOpen size={40} className="text-slate-400 opacity-60" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Topics Found
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
