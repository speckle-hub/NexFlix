import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Film, Tv, Command } from 'lucide-react';
import { tmdbService, getImageUrl } from '../services/tmdb';

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await tmdbService.request('/search/multi', { query });
        const filtered = (data.results || []).filter(
          (item) => item.media_type !== 'person' && item.type !== 'person'
        );
        setResults(filtered.slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (item) => {
    const isMovie = item.title !== undefined;
    navigate(isMovie ? `/movie/${item.id}` : `/tv/${item.id}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-2xl glass-modal rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <Search className="w-5 h-5 text-[#E50914] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search movies, TV shows, directors..."
                className="flex-1 bg-transparent text-white text-base outline-none placeholder-gray-500 font-sans"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 text-gray-600 text-[10px] font-mono border border-white/10 px-2 py-1 rounded-lg shrink-0">
                <Command className="w-3 h-3" /> K
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors ml-1 sm:ml-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto scrollbar-hide">
              {isLoading && (
                <div className="py-10 flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-t-[#E50914] border-white/10 rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm font-mono tracking-widest">SEARCHING...</span>
                </div>
              )}

              {!isLoading && query && results.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500 text-sm font-mono">No results for <span className="text-white">"{query}"</span></p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    {results.length} Result{results.length !== 1 ? 's' : ''}
                  </div>
                  {results.map((item, idx) => {
                    const isMovie = item.title !== undefined;
                    const title = item.title || item.name;
                    const year = (isMovie ? item.release_date : item.first_air_date)?.split('-')[0];
                    const posterUrl = getImageUrl(item.poster_path, 'w92');
                    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors group text-left"
                      >
                        {/* Poster thumbnail */}
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-[#111117] border border-white/10 shrink-0 group-hover:border-[#E50914]/40 transition-colors">
                          <img
                            src={posterUrl}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display='none'; }}
                          />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate group-hover:text-[#E50914] transition-colors">
                            {title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                              {isMovie
                                ? <><Film className="w-3 h-3 text-red-500" /> MOVIE</>
                                : <><Tv className="w-3 h-3 text-blue-400" /> TV</>
                              }
                            </span>
                            {year && <span className="text-[10px] text-gray-600 font-mono">{year}</span>}
                            {rating && (
                              <span className="text-[10px] text-[#F5C518] font-bold font-mono">⭐ {rating}</span>
                            )}
                          </div>
                        </div>

                        {/* Arrow hint */}
                        <span className="text-gray-600 group-hover:text-[#E50914] transition-colors text-lg shrink-0">→</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Empty state / hint when no query */}
              {!query && !isLoading && (
                <div className="py-10 px-6 flex flex-col items-center gap-3 text-center">
                  <div className="text-4xl">🎬</div>
                  <p className="text-gray-400 text-sm font-sans">
                    Start typing to search <span className="text-white font-semibold">millions of movies & TV shows</span>
                  </p>
                  <p className="text-gray-600 text-[11px] font-mono mt-1">
                    TIP: Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">ESC</kbd> to close ·{' '}
                    <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">Enter</kbd> to open top result
                  </p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-white/5 px-5 py-2.5 flex items-center justify-between text-[10px] text-gray-600 font-mono">
              <span>NEXFLIX SEARCH ENGINE</span>
              <span className="flex items-center gap-2">
                <kbd className="bg-white/8 border border-white/10 px-1.5 py-0.5 rounded text-gray-500">↑↓</kbd> navigate
                <kbd className="bg-white/8 border border-white/10 px-1.5 py-0.5 rounded text-gray-500">⏎</kbd> open
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
