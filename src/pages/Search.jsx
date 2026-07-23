import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/Skeleton';
import { Search as SearchIcon, SlidersHorizontal, Film, Tv, Star, Calendar, X, Sparkles, TrendingUp, Clock, Zap, Sword, Clapperboard, Rocket, Laugh, Eye, Compass, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  { label: 'Trending Now', icon: TrendingUp, query: 'trending' },
  { label: 'Sci-Fi', icon: Zap, query: 'sci-fi' },
  { label: 'New Releases', icon: Clock, query: '2024' },
  { label: 'Top Rated', icon: Star, query: 'the' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const [mediaType, setMediaType] = useState('all');
  const [activeGenre, setActiveGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    setSearchQuery(queryParam);
    if (!queryParam.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await tmdbService.request('/search/multi', {
          query: queryParam
        });
        const filtered = (data.results || []).filter(item => item.media_type !== 'person' && item.type !== 'person');
        setResults(filtered);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [queryParam]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchParams({});
    setResults([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
    setSearchParams({ q: query });
  };

  const GENRE_LIST = ["Action", "Drama", "Science Fiction", "Comedy", "Thriller", "Adventure", "Animation"];
  const GENRE_ICONS = {
    Action: Zap,
    Drama: Film,
    'Science Fiction': Rocket,
    Comedy: Star,
    Thriller: Eye,
    Adventure: Compass,
    Animation: Palette,
  };

  const getProcessedResults = () => {
    let list = [...results];
    if (mediaType !== 'all') {
      list = list.filter(item => {
        const type = item.type || (item.title ? 'movie' : 'tv');
        return type === mediaType;
      });
    }
    if (activeGenre) {
      list = list.filter(item => {
        const itemGenres = item.genres || [];
        return itemGenres.includes(activeGenre);
      });
    }
    list.sort((a, b) => {
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      if (sortBy === 'rating') return (b.vote_average || 0) - (a.vote_average || 0);
      if (sortBy === 'date') {
        const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01');
        const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01');
        return dateB - dateA;
      }
      return 0;
    });
    return list;
  };

  const processedResults = getProcessedResults();

  return (
    <div className="text-left">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 mb-6"
      >
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          <SearchIcon className="w-6 h-6" /> SPOTLIGHT SEARCH
        </h2>
        <p className="text-gray-400 text-xs font-mono">Apple-style animated search with real-time TMDB debounced lookups and glow effects.</p>
      </motion.div>

      {/* Glowing Search Bar */}
      <div className="relative w-full max-w-3xl mb-8">
        {/* Outer glow layers */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-[#E50914] via-[#F5C518] to-[#E50914] rounded-2xl blur-xl transition-all duration-500 ${isFocused || searchQuery ? 'opacity-70' : 'opacity-0'}`} />
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#E50914]/50 via-[#F5C518]/50 to-[#E50914]/50 rounded-2xl blur-md transition-all duration-500 ${isFocused || searchQuery ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative flex items-center bg-[#111117]/90 border transition-all duration-300 rounded-2xl shadow-xl backdrop-blur-md ${
          isFocused || searchQuery ? 'border-[#E50914]/30' : 'border-white/5'
        }`}>
          <SearchIcon className={`w-5 h-5 ml-5 transition-colors duration-300 ${isFocused || searchQuery ? 'text-[#E50914]' : 'text-gray-500'}`} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, TV shows, genres..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent text-white text-base px-4 py-5 rounded-2xl outline-none font-sans placeholder-gray-600"
          />
          {searchQuery && (
            <button 
              onClick={handleClear}
              className="text-gray-500 hover:text-white p-2.5 mr-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Keyboard shortcut badge */}
          <div className="hidden sm:flex items-center gap-1 text-gray-600 text-[10px] font-mono border border-white/10 px-2 py-1 rounded-lg mr-4 shrink-0">
            <span className="text-[9px]">⌘</span>K
          </div>
        </div>

        {/* Animated suggestion pills */}
        <AnimatePresence>
          {!searchQuery && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 flex flex-wrap gap-2 z-10"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSuggestionClick(s.query)}
                  className="glass-pill px-4 py-2 rounded-xl text-xs font-mono font-semibold text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <s.icon className="w-3.5 h-3.5 text-[#E50914]" />
                  {s.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          {/* Filters */}
          <div className="flex flex-col gap-4 bg-[#111117]/40 border border-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex gap-2">
                {[
                  { label: 'ALL', value: 'all', icon: null },
                  { label: 'MOVIES', value: 'movie', icon: Film },
                  { label: 'TV', value: 'tv', icon: Tv },
                ].map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setMediaType(value)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      mediaType === value 
                        ? 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/30 shadow-[0_0_10px_rgba(229,9,20,0.1)]' 
                        : 'text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-400 font-mono">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0A0A0F] border border-white/10 text-white text-xs font-mono font-bold px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-[#E50914]"
                >
                  <option value="popularity">POPULARITY</option>
                  <option value="rating">AUDIENCE SCORE</option>
                  <option value="date">RELEASE DATE</option>
                </select>
              </div>
            </div>

            {/* Genre pills */}
            <div className="border-t border-white/5 pt-3.5">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveGenre('')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    !activeGenre 
                      ? 'bg-[#E50914] text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                >
                  ALL GENRES
                </button>
                {GENRE_LIST.map((g, idx) => {
                  const Icon = GENRE_ICONS[g];
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveGenre(g === activeGenre ? '' : g)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activeGenre === g 
                          ? 'bg-[#E50914] text-white' 
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {g.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="min-h-[40vh] mt-4">
            {isLoading ? (
              <GridSkeleton />
            ) : processedResults.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4 bg-[#111117]/10 rounded-3xl border border-white/5">
                <Sparkles className="w-10 h-10 text-gray-600 animate-pulse" />
                <div>
                  <h4 className="text-white font-bold text-base uppercase">No matches found</h4>
                  <p className="text-gray-400 text-xs mt-1 font-mono">Try different keywords or adjust filters.</p>
                </div>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                <AnimatePresence>
                  {processedResults.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                    >
                      <MovieCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!searchQuery && !isFocused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 flex flex-col items-center gap-4 bg-[#111117]/10 border border-white/5 rounded-3xl p-6"
        >
          <div className="p-4 bg-gradient-to-br from-[#E50914]/10 to-[#F5C518]/10 border border-[#E50914]/20 rounded-full text-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.1)]">
            <SearchIcon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg font-display uppercase tracking-widest">Find your next obsession</h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed max-w-sm font-mono mx-auto">
              Tap the search bar above and start typing — results appear instantly with animated glow effects.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestionClick(s.query)}
                className="glass-pill px-3 py-1.5 rounded-lg text-[10px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <s.icon className="w-3 h-3 text-[#E50914]" />
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}
