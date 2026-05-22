import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/Skeleton';
import { Search as SearchIcon, SlidersHorizontal, Film, Tv, Star, Calendar, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [mediaType, setMediaType] = useState('all'); // 'all', 'movie', 'tv'
  const [activeGenre, setActiveGenre] = useState(''); // Genre name filtering
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'rating', 'date'

  // Debouncing TMDB searches
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
        
        // Filter out people types, only keep movies/shows
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
  };

  // Genre lists for pills
  const GENRE_LIST = ["Action", "Drama", "Science Fiction", "Comedy", "Thriller", "Adventure", "Animation"];

  // Filter & Sort Logic
  const getProcessedResults = () => {
    let list = [...results];

    // 1. MediaType filter
    if (mediaType !== 'all') {
      list = list.filter(item => {
        const type = item.type || (item.title ? 'movie' : 'tv');
        return type === mediaType;
      });
    }

    // 2. Genre filter
    if (activeGenre) {
      list = list.filter(item => {
        const itemGenres = item.genres || [];
        return itemGenres.includes(activeGenre);
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      if (sortBy === 'rating') {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }
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
      
      {/* 1. Page Header Title */}
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          🔍 SEARCH CLIENT
        </h2>
        <p className="text-gray-400 text-xs font-mono">Real-time search debouncing across film titles and television records.</p>
      </div>

      {/* 2. Premium Search bar */}
      <div className="relative w-full max-w-2xl group mb-8">
        <div className="absolute inset-0 bg-[#E50914]/10 rounded-2xl blur-[12px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative flex items-center bg-[#111117]/60 border border-white/5 group-focus-within:border-[#E50914]/40 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300">
          <SearchIcon className="w-5 h-5 text-gray-500 group-focus-within:text-[#E50914] ml-4 transition-colors" />
          <input
            type="text"
            placeholder="Type titles, directors, or descriptions... (e.g. Inception)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-transparent text-white text-sm px-4 py-4.5 rounded-2xl outline-none font-sans"
          />
          {searchQuery && (
            <button 
              onClick={handleClear}
              className="text-gray-500 hover:text-white p-2.5 mr-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          {/* 3. Sorting & Filtering Options Header */}
          <div className="flex flex-col gap-4 bg-[#111117]/40 border border-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md">
            
            {/* Category selection row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex gap-2">
                <button
                  onClick={() => setMediaType('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                    mediaType === 'all' ? 'bg-white/10 text-white border border-white/15' : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  ALL RESULTS
                </button>
                <button
                  onClick={() => setMediaType('movie')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    mediaType === 'movie' ? 'bg-white/10 text-white border border-white/15' : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" /> MOVIES
                </button>
                <button
                  onClick={() => setMediaType('tv')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    mediaType === 'tv' ? 'bg-white/10 text-white border border-white/15' : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" /> TV SHOWS
                </button>
              </div>

              {/* Sorting Selection */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-400 font-mono">SORT BY:</span>
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

            {/* Genre Filter Pills row */}
            <div className="border-t border-white/5 pt-3.5">
              <span className="text-[10px] text-gray-500 font-mono block uppercase mb-2">Filter by Category Genre</span>
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
                {GENRE_LIST.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGenre(g === activeGenre ? '' : g)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      activeGenre === g 
                        ? 'bg-[#E50914] text-white' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    {g.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 4. Search Results display */}
          <div className="min-h-[40vh] mt-4">
            {isLoading ? (
              <GridSkeleton />
            ) : processedResults.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4 bg-[#111117]/10 rounded-3xl border border-white/5">
                <Sparkles className="w-10 h-10 text-gray-600 animate-pulse" />
                <div>
                  <h4 className="text-white font-bold text-base uppercase">No matches found</h4>
                  <p className="text-gray-400 text-xs mt-1 font-mono">We couldn't find matching titles for your query. Try tweaking filters.</p>
                </div>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                <AnimatePresence>
                  {processedResults.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
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

      {/* 5. Default/Initial state */}
      {!searchQuery && (
        <div className="text-center py-24 flex flex-col items-center gap-4 bg-[#111117]/10 border border-white/5 rounded-3xl p-6">
          <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-full text-red-500 shadow-md">
            <SearchIcon className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg font-display uppercase tracking-widest">Find your next obsession</h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed max-w-sm font-mono mx-auto">
              Search real-time TMDB catalogs for blockbuster movies, niche TV shows, and legendary directors.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
