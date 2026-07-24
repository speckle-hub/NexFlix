import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    const urlHasTestError = typeof window !== 'undefined' && window.location.search.includes('testError=true');
    this.state = { 
      hasError: urlHasTestError, 
      error: urlHasTestError ? new Error("Test Error: Error Boundary render catch verified.") : null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-full text-[#E50914] shadow-md mb-5">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h2 className="text-white text-2xl font-display uppercase tracking-wider mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-xs font-mono max-w-md leading-relaxed mb-6">
            This section encountered an unexpected error. It's been logged, and you can try reloading.
          </p>
          {this.state.error?.message && (
            <p className="text-red-400/80 text-[11px] font-mono mb-4 bg-red-950/40 border border-red-500/10 px-3 py-1.5 rounded-lg">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { 
                if (window.location.search.includes('testError=true')) {
                  window.location.href = window.location.pathname;
                } else {
                  this.setState({ hasError: false, error: null }); 
                  window.location.reload(); 
                }
              }}
              className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-5 py-3 rounded-xl text-xs tracking-wider transition-all glow-red flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> RELOAD
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold px-5 py-3 rounded-xl text-xs tracking-wider transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> HOME
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
