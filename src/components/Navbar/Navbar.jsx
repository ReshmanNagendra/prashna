// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, LogIn, Bookmark, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Shared header navigation bar.
 * Contains logo, inline search bar (on non-home pages), nav links,
 * dark-mode toggle, and auth controls.
 *
 * Search behaviour:
 * - The input is uncontrolled locally (useRef) so typing never causes navigation.
 * - Pressing Enter or clicking the search icon commits the query → navigates to /search.
 * - Clearing the input (✕) stays on the current page.
 * - When the user is already on /search the input pre-fills from the URL ?q= param.
 *
 * @component
 */
export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const inputRef = useRef(null);

  // Keep dark-mode toggle in sync with the global <html> class
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, [location]);

  // When the user lands on /search, pre-fill the search bar with the current query
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setInputValue(q);
    }
    // Don't wipe the input on non-search pages — let the user keep typing
  }, [location.pathname, location.search]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const commitSearch = () => {
    const q = inputValue.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitSearch();
    } else if (e.key === 'Escape') {
      setInputValue('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
    // If we're on the search page, go back to questions
    if (location.pathname === '/search') {
      navigate('/questions');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? '';
  const isHome  = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#0a0f0d]/80 border-b border-slate-200 dark:border-slate-800 px-6 py-3 transition-colors duration-300">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold font-serif tracking-tight text-slate-900 dark:text-emerald-50 hover:opacity-85 transition-opacity shrink-0"
        >
          Prashna
        </Link>

        {/* ── Search bar (hidden on the home page which has its own hero search) ── */}
        {!isHome && (
          <div className="relative max-w-md w-full flex-1 md:mx-4">
            {/* Search icon — clicking it commits the search */}
            <button
              type="button"
              onClick={commitSearch}
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search all PYQs…"
              aria-label="Search all PYQs"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />

            {/* Clear button */}
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* ── Nav links + controls ── */}
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

          {user && (
            <Link
              to="/questions?saved=true"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5"
              title="Saved questions"
            >
              <Bookmark size={14} />
              Saved
            </Link>
          )}

          {/* Dark-mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Auth controls — hidden while session loads to prevent flicker */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <div
                  title={user.email}
                  className="w-8 h-8 rounded-full bg-emerald-500 text-[#0a0f0d] font-bold text-sm flex items-center justify-center select-none cursor-default"
                >
                  {initial}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0d] font-bold text-sm transition-all"
              >
                <LogIn size={14} />
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
