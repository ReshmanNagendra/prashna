import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * React Error Boundary — catches render-time exceptions in the entire subtree.
 * Shows a friendly recovery screen instead of a blank page.
 * Use as a wrapper around the router or individual page trees.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#f4faf6] dark:bg-[#0a0f0d] text-slate-900 dark:text-emerald-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-red-500/10">
              <AlertTriangle size={36} className="text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              This page ran into an error. You can go back or try reloading.
            </p>
            {this.state.error?.message && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-mono bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 text-left break-words">
                {this.state.error.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { this.handleReset(); window.history.back(); }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              ← Go Back
            </button>
            <button
              onClick={() => { this.handleReset(); window.location.reload(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0d] text-sm font-bold transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              Reload Page
            </button>
          </div>

          <a
            href="/"
            onClick={this.handleReset}
            className="block text-xs text-slate-400 hover:text-emerald-500 transition-colors"
          >
            Return to home
          </a>
        </div>
      </div>
    );
  }
}
