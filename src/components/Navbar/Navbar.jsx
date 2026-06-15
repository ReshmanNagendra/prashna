// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import SearchBar from '../SearchBar/SearchBar.jsx';

/**
 * Shared header navigation bar.
 * Appears at the top of pages, containing links, active theme control,
 * and an inline query input mapping to SearchResultsPage.
 *
 * @component
 */
export default function Navbar() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Keep navigation bar state in sync with html document state
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, [location]);

  // Synchronizes header input search text to current search URL param if applicable
  useEffect(() => {
    if (location.pathname === '/search') {
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get('q') || '';
      setNavSearch(query);
    } else {
      setNavSearch('');
    }
  }, [location.search, location.pathname]);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearchChange = (value) => {
    setNavSearch(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    } else {
      navigate('/questions');
    }
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#0a0f0d]/80 border-b border-slate-200 dark:border-slate-850 px-6 py-3 transition-colors duration-300">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl font-bold font-serif tracking-tight text-slate-900 dark:text-emerald-50 hover:opacity-85 transition-opacity shrink-0"
        >
          Prashna
        </Link>

        {/* Global Search Input (only renders on sub-pages) */}
        {location.pathname !== '/' && (
          <div className="max-w-md w-full md:mx-4 flex-1">
            <SearchBar
              value={navSearch}
              onChange={handleSearchChange}
              placeholder="Search all PYQs..."
            />
          </div>
        )}

        {/* Nav links and Theme toggler */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/subjects"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
          >
            Subjects
          </Link>
          <Link
            to="/topics"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
          >
            Topics
          </Link>
          <Link
            to="/exams"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
          >
            Exams
          </Link>
          <Link
            to="/questions?saved=true"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
          >
            Saved
          </Link>

          {/* Mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
