// src/pages/PapersPage/PapersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import { ArrowRight, Loader2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * PapersPage - List all exam papers grouped by Year and Exam.
 * Queries the `papers` table directly (not all questions) and joins
 * subject data through the questions table using an aggregate count.
 *
 * @component
 */
export default function PapersPage() {
  const [searchParams] = useSearchParams();
  const examParam = searchParams.get('exam') || '';

  const [papers, setPapers]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [expandedPapers, setExpandedPapers] = useState({});

  useEffect(() => {
    async function loadPapers() {
      setIsLoading(true);

      // Fetch papers directly — much cheaper than fetching all questions.
      // We join to exams to get the exam name, and pull question counts via
      // a nested select rather than loading full question payloads.
      let query = supabase
        .from('papers')
        .select(`
          id,
          year,
          session,
          shift,
          date,
          total_marks,
          exams ( id, name, code ),
          questions ( id, subjects ( name ) )
        `)
        .order('year', { ascending: false })
        .order('session', { ascending: true, nullsFirst: true });

      if (examParam) {
        // Filter by exam code or name
        const { data: matchedExams } = await supabase
          .from('exams')
          .select('id')
          .or(`name.ilike.%${examParam}%,code.ilike.%${examParam}%`);
        const examIds = (matchedExams ?? []).map((e) => e.id);
        if (examIds.length > 0) {
          query = query.in('exam_id', examIds);
        } else {
          setPapers([]);
          setIsLoading(false);
          return;
        }
      }

      const { data: rawPapers, error } = await query;
      if (error) {
        console.error('PapersPage fetch error:', error);
        setIsLoading(false);
        return;
      }

      // Group by exam + year, accumulate shifts
      const groups = {};
      (rawPapers ?? []).forEach((paper) => {
        const examName = paper.exams?.name ?? 'Unknown';
        const key      = `${examName}-${paper.year}`;

        if (!groups[key]) {
          groups[key] = {
            id:             key,
            exam:           examName,
            examCode:       paper.exams?.code ?? '',
            year:           paper.year,
            totalQuestions: 0,
            subjects:       new Set(),
            shiftsMap:      {},
          };
        }

        // Accumulate question counts and unique subjects from joined data
        const questionRows = paper.questions ?? [];
        groups[key].totalQuestions += questionRows.length;
        questionRows.forEach((q) => {
          const subName = q.subjects?.name;
          if (subName) groups[key].subjects.add(subName);
        });

        const shiftName = paper.shift || 'Shift 1';
        groups[key].shiftsMap[shiftName] = (groups[key].shiftsMap[shiftName] ?? 0) + questionRows.length;
      });

      const paperList = Object.values(groups)
        .map((g) => {
          const shifts = Object.entries(g.shiftsMap)
            .map(([name, count]) => ({ name, totalQuestions: count }))
            .sort((a, b) => a.name.localeCompare(b.name));
          return { ...g, subjects: Array.from(g.subjects), shifts };
        })
        .sort((a, b) => b.year - a.year);

      setPapers(paperList);
      setIsLoading(false);
    }

    loadPapers();
  }, [examParam]);

  const toggleExpand = (id) => {
    setExpandedPapers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderBreadcrumbs = () => {
    if (examParam) {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <Link to="/exams" className="hover:text-emerald-500 transition-colors">Exams</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <span className="text-slate-650 dark:text-slate-400 font-bold">{examParam} Papers</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
        <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
        <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
        <span className="text-slate-655 dark:text-slate-400 font-bold">Past Papers</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6 text-left">
        {/* Navigation Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {examParam ? `${examParam} Past Papers` : 'Past Examination Papers'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Browse PYQs grouped by year and examination shifts
          </p>
        </div>

        {/* List of Papers */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : papers.length > 0 ? (
            <div className="space-y-4 pb-12">
              {papers.map((paper) => {
                const isExpanded = !!expandedPapers[paper.id];
                return (
                  <div
                    key={paper.id}
                    className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Header Row (click to expand/collapse) */}
                    <div
                      onClick={() => toggleExpand(paper.id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group select-none"
                    >
                      {/* Left content: Paper details */}
                      <div className="space-y-1 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                            {paper.exam} — {paper.year}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Official Paper
                          </span>
                        </div>

                        {/* Dynamic Subject tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {paper.subjects.map((sub) => (
                            <span
                              key={sub}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                                sub.toLowerCase() === 'physics'     ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                sub.toLowerCase() === 'chemistry'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                sub.toLowerCase() === 'mathematics' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-455'
                              }`}
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right content: Actions & Metadata */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Shifts
                          </p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {paper.shifts.length} {paper.shifts.length === 1 ? 'Shift' : 'Shifts'}
                          </p>
                        </div>

                        {/* Chevron Expand Indicator */}
                        <div className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Sub-list of shift papers inside the year card */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block text-left mb-1">
                          Select Shift Paper:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {paper.shifts.map((shiftObj) => (
                            <Link
                              key={shiftObj.name}
                              to={`/questions?year=${paper.year}&exam=${encodeURIComponent(paper.exam)}&shift=${encodeURIComponent(shiftObj.name)}`}
                              className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-850 hover:border-emerald-500/40 transition-all flex items-center justify-between text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 group"
                            >
                              <span className="text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">
                                {shiftObj.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                  {shiftObj.totalQuestions} {shiftObj.totalQuestions === 1 ? 'Question' : 'Questions'}
                                </span>
                                <ArrowRight size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
              <BookOpen size={40} className="text-slate-400 opacity-60" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Papers Found
              </p>
              <p className="text-sm text-slate-555 dark:text-slate-500 max-w-xs">
                No papers found matching the target examination.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
