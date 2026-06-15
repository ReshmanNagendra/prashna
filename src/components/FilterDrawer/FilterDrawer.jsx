// src/components/FilterDrawer/FilterDrawer.jsx
import React from 'react';

/**
 * Presentational component for selecting filters.
 * Propagates selected filter choices up to parent component.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.selectedFilters - Currently selected filter state
 * @param {string} [props.selectedFilters.subject] - Selected subject
 * @param {string} [props.selectedFilters.topic] - Selected topic
 * @param {string} [props.selectedFilters.exam] - Selected exam
 * @param {string|number} [props.selectedFilters.year] - Selected year
 * @param {function} props.onChangeFilters - Callback triggered when a filter selection changes
 * @param {Object} props.metaData - Lists of unique filter choices extracted from data
 * @param {Array<string>} props.metaData.subjects - List of unique subjects
 * @param {Array<string>} props.metaData.topics - List of unique topics
 * @param {Array<string>} props.metaData.exams - List of unique exams
 * @param {Array<number|string>} props.metaData.years - List of unique years
 * @param {function} props.onClearAll - Callback triggered to reset all filters to default
 */
export default function FilterDrawer({
  selectedFilters,
  onChangeFilters,
  metaData = { subjects: [], topics: [], exams: [], years: [] },
  onClearAll
}) {
  const { subject, topic, exam, year } = selectedFilters;
  const { subjects = [], topics = [], exams = [], years = [] } = metaData;

  const handleFilterChange = (key, value) => {
    onChangeFilters({
      ...selectedFilters,
      [key]: value
    });
  };

  const hasActiveFilters = subject || topic || exam || year;

  return (
    <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Filter Questions
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Subject Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Subject
          </label>
          <select
            value={subject || ''}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Topic
          </label>
          <select
            value={topic || ''}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Topics</option>
            {topics.map((top) => (
              <option key={top} value={top}>{top}</option>
            ))}
          </select>
        </div>

        {/* Exam Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Exam
          </label>
          <select
            value={exam || ''}
            onChange={(e) => handleFilterChange('exam', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Exams</option>
            {exams.map((ex) => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Year
          </label>
          <select
            value={year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
