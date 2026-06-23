// src/pages/SearchResultsPage/SearchResultsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import QuestionCard from '../../components/QuestionCard/QuestionCard.jsx';
import { searchQuestions } from '../../services/questionService.js';
import { Loader2, ArrowLeft } from 'lucide-react';

/**
 * SearchResultsPage - View matching queries.
 * Extracts `q` query from Route SearchParams, queries the service,
 * and renders results inside interactive cards.
 *
 * @component
 */
export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading]  = useState(false); // start false — don't flash spinner on empty query
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setQuestions([]);
      setIsLoading(false);
      return;
    }
    // Debounce: wait 300ms after the user stops typing before hitting Supabase
    setIsLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchQuestions(query);
        setQuestions(results);
      } catch (err) {
        console.error('Search error:', err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex flex-col">
      {/* Navigation Header */}
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 text-left">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">&gt;</span>
          <span className="text-slate-655 dark:text-slate-400 font-bold">Search Results</span>
        </div>

        {/* Results title summary */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Search Results
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Found {questions.length} {questions.length === 1 ? 'result' : 'results'} for <strong className="font-semibold text-emerald-500">"{query}"</strong>
          </p>
        </div>

        {/* Dynamic List content */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : questions.length > 0 ? (
            <div className="flex flex-col gap-6 pb-12 w-full">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Results Found
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">
                We couldn't find any questions matching your query <strong className="font-semibold text-emerald-500">"{query}"</strong>.
              </p>
              <Link
                to="/questions"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer inline-block"
              >
                Browse All Questions
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
