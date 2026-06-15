// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import QuestionsPage from './pages/QuestionsPage/QuestionsPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage/QuestionDetailPage.jsx';
import PapersPage from './pages/PapersPage/PapersPage.jsx';
import SubjectsPage from './pages/SubjectsPage/SubjectsPage.jsx';
import TopicsPage from './pages/TopicsPage/TopicsPage.jsx';
import ExamsPage from './pages/ExamsPage/ExamsPage.jsx';

/**
 * App component setting up global React Router paths.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* / → Existing LandingPage (UNCHANGED UI) */}
        <Route path="/" element={<LandingPage />} />

        {/* /questions → Browse and filter all PYQs */}
        <Route path="/questions" element={<QuestionsPage />} />

        {/* /papers → Browse exam papers by year in list view */}
        <Route path="/papers" element={<PapersPage />} />

        {/* /subjects → Dedicated page listing all subjects */}
        <Route path="/subjects" element={<SubjectsPage />} />

        {/* /topics → Dedicated page listing all topics grouped by subject */}
        <Route path="/topics" element={<TopicsPage />} />

        {/* /exams → Dedicated page listing examinations (JEE Main active, others locked) */}
        <Route path="/exams" element={<ExamsPage />} />

        {/* /search → Display query results */}
        <Route path="/search" element={<SearchResultsPage />} />

        {/* /question/:id → Detailed view of single PYQ */}
        <Route path="/question/:id" element={<QuestionDetailPage />} />
      </Routes>
    </Router>
  );
}