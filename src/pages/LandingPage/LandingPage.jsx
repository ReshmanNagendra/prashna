// src/pages/LandingPage/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, FileText, Filter, Sun, Moon, LogIn, LogOut, Bookmark } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  // Keep global <html> dark class in sync with landing page toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Also sync when global dark class changes from Navbar (e.g. navigating back)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? '';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans tracking-tight antialiased
      ${darkMode ? 'bg-[#0a0f0d] text-emerald-50' : 'bg-[#f4faf6] text-slate-900'}`}
    >

      {/* ================= SCREEN 1: HERO FOCUS ================= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 py-4 overflow-hidden">
        
        {/* Subtle Ambient Glow Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-[130px] animate-float-slow" />
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[130px] animate-float-slow [animation-delay:6s]" />
        </div>

        {/* Header — now uses real Auth state */}
        <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
          <span className="text-2xl font-bold font-serif tracking-tight">
            Prashna
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/subjects')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${darkMode ? 'text-slate-300 hover:bg-emerald-950/20 hover:text-emerald-400' : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800'}`}
            >
              Subjects
            </button>
            <button
              onClick={() => navigate('/topics')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${darkMode ? 'text-slate-300 hover:bg-emerald-950/20 hover:text-emerald-400' : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800'}`}
            >
              Topics
            </button>
            <button
              onClick={() => navigate('/exams')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${darkMode ? 'text-slate-300 hover:bg-emerald-950/20 hover:text-emerald-400' : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800'}`}
            >
              Examinations
            </button>

            {/* Bookmarks — only show when logged in */}
            {user && (
              <button
                onClick={() => navigate('/questions?saved=true')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${darkMode ? 'text-slate-300 hover:bg-emerald-950/20 hover:text-emerald-400' : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800'}`}
              >
                <Bookmark size={14} />
                Bookmarks
              </button>
            )}

            <span className={`h-5 w-px mx-1.5 ${darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60'}`} />

            {/* Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Auth — real login/logout, not a toast */}
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
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:text-red-500 hover:bg-slate-50'}`}
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${darkMode ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-white' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-900'}`}
                >
                  <LogIn size={14} />
                  Login
                </Link>
              )
            )}
          </div>
        </header>

        {/* Central Search Arena */}
        <div className="max-w-3xl w-full mx-auto text-center space-y-8 my-auto">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Find Previous Year Question Papers Instantly
            </h1>
            <p className={`text-lg md:text-xl font-medium tracking-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Search all papers from last 10 years
            </p>
          </div>

          {/* Core Wireframe Pill Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search size={22} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type your query here..."
              className={`w-full pl-14 pr-6 py-4.5 rounded-full text-lg border-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-md
                ${darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-450'}`}
            />
          </div>

          {/* Below Search Action Grid */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto pt-3">
            <button
              onClick={() => navigate('/exams')}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border-2 font-bold text-base transition-all cursor-pointer shadow-md active:scale-[0.99]
                ${darkMode ? 'bg-emerald-950 border-emerald-900 hover:bg-emerald-900 hover:border-emerald-800 text-white' : 'bg-slate-900 border-slate-900 hover:bg-slate-800 hover:border-slate-800 text-white'}`}
            >
              <FileText size={18} />
              Explore Past Papers
            </button>
            <button
              onClick={() => navigate('/questions')}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border-2 font-bold text-base transition-all cursor-pointer shadow-md active:scale-[0.99]
                ${darkMode ? 'bg-[#0e1612] border-emerald-950 hover:border-emerald-850 text-emerald-100 hover:bg-emerald-950/40' : 'bg-white border-slate-300 hover:border-slate-450 text-slate-700'}`}
            >
              <Filter size={18} />
              Filter by Year / Subject
            </button>
          </div>
        </div>

        {/* Downward Nudge Marker */}
        <div className="text-center py-4">
          <span className={`text-xs uppercase tracking-widest font-bold ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            Scroll down for info
          </span>
        </div>
      </section>

      {/* ================= SCREEN 2: CONTENT FOLD ================= */}
      <section className={`border-t px-6 py-20 transition-colors duration-300 ${darkMode ? 'border-emerald-950/45 bg-[#0d1612]/30' : 'border-emerald-100/60 bg-[#ebf3ed]/30'}`}>
        <div className="max-w-3xl w-full mx-auto space-y-16">

          {/* Section A */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Find all Questions you need
            </h2>
            <div className="space-y-2.5">
              <div className={`h-3 rounded w-11/12 ${darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60'}`} />
              <div className={`h-3 rounded w-full ${darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60'}`} />
              <div className={`h-3 rounded w-4/5 ${darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60'}`} />
            </div>
          </div>

          {/* Section B */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight border-b-2 pb-2 inline-block border-indigo-500">
              About Us
            </h2>
            <div className="space-y-2.5">
              <div className={`h-3 rounded w-full ${darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60'}`} />
              <div className={`h-3 rounded w-10/12 ${darkMode ? 'bg-emerald-950/60' : 'bg-emerald-100/60'}`} />
            </div>
          </div>

          {/* Footer Navigation */}
          <footer className={`pt-12 border-t flex flex-wrap justify-center items-center gap-8 text-sm font-semibold transition-colors
            ${darkMode ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <a href="#contact" className="hover:text-indigo-500 transition-colors">Contact</a>
            <a href="#licence" className="hover:text-indigo-500 transition-colors">Licence</a>
            <a href="#privacy" className="hover:text-indigo-500 transition-colors">Privacy</a>
          </footer>

        </div>
      </section>
    </div>
  );
}
