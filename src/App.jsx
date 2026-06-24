// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import { Analytics } from '@vercel/analytics/react';
import { Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage.jsx'));
const QuestionsPage = lazy(() => import('./pages/QuestionsPage/QuestionsPage.jsx'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage/SearchResultsPage.jsx'));
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage/QuestionDetailPage.jsx'));
const PapersPage = lazy(() => import('./pages/PapersPage/PapersPage.jsx'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage/SubjectsPage.jsx'));
const TopicsPage = lazy(() => import('./pages/TopicsPage/TopicsPage.jsx'));
const ExamsPage = lazy(() => import('./pages/ExamsPage/ExamsPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage/AuthPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage/AdminPage.jsx'));

/**
 * Full-screen page loader fallback during lazy component loading.
 */
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );
}

/**
 * App component setting up global React Router paths with lazy loading.
 * Wrapped in AuthProvider so all pages can access the auth session.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* / → Landing page */}
              <Route path="/" element={<LandingPage />} />

              {/* /auth → Login / Sign Up */}
              <Route path="/auth" element={<AuthPage />} />

              {/* /questions → Browse and filter all PYQs */}
              <Route path="/questions" element={<QuestionsPage />} />

              {/* /papers → Browse exam papers by year */}
              <Route path="/papers" element={<PapersPage />} />

              {/* /subjects → Dedicated page listing all subjects */}
              <Route path="/subjects" element={<SubjectsPage />} />

              {/* /topics → Topics grouped by subject */}
              <Route path="/topics" element={<TopicsPage />} />

              {/* /exams → Examinations catalog */}
              <Route path="/exams" element={<ExamsPage />} />

              {/* /search → Display query results */}
              <Route path="/search" element={<SearchResultsPage />} />

              {/* /question/:id → Detailed view of a single PYQ */}
              <Route path="/question/:id" element={<QuestionDetailPage />} />

              {/* /admin → Admin / Moderator Dashboard */}
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
          <Analytics />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}