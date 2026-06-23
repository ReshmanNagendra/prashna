// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import { Analytics } from '@vercel/analytics/react';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import QuestionsPage from './pages/QuestionsPage/QuestionsPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage/QuestionDetailPage.jsx';
import PapersPage from './pages/PapersPage/PapersPage.jsx';
import SubjectsPage from './pages/SubjectsPage/SubjectsPage.jsx';
import TopicsPage from './pages/TopicsPage/TopicsPage.jsx';
import ExamsPage from './pages/ExamsPage/ExamsPage.jsx';
import AuthPage from './pages/AuthPage/AuthPage.jsx';

/**
 * App component setting up global React Router paths.
 * Wrapped in AuthProvider so all pages can access the auth session.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
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
          </Routes>
          <Analytics />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}