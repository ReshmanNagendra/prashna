// src/components/SearchBar/SearchBar.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable controlled SearchBar component.
 * Handles input UI, focus styling, and user input propagation.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - The controlled search string value
 * @param {function} props.onChange - Triggered with the string input value when query changes or is cleared
 * @param {string} [props.placeholder='Search questions...'] - Input placeholder text
 * @param {string} [props.className=''] - Optional CSS classes for container sizing and layout
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search questions...',
  className = ''
}) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search 
          size={18} 
          className="text-slate-400 dark:text-slate-500" 
          aria-hidden="true" 
        />
      </div>

      {/* Controlled text input */}
      <input
        type="search"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
      />

      {/* Clear Button (renders when text is present) */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search query"
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
