import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { tmdbService } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/Skeleton';
import { SlidersHorizontal, Sparkles, RefreshCw, Calendar, Star, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Browse() {
  const { tmdbKey } = useApp();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaging, setIsPaging] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState('all'); // 'all', 'modern', '2010s', '2000s', '90s', 'classics'
  const [selectedRating, setSelectedRating] = useState('all'); // 'all', '7', '8'

  const GENRES = [
    { id: 28, name: "Action" },
    { id: 878, name: "Science Fiction" },
    { id: 27, name: "Horror" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 53, name: "Thriller" },
    { id: 16, name: "Animation" }
  ];

  // Fetch initial filtered browse items
  useEffect(() => {
    const fetchBrowseItems = async () => {
      setIsLoading(true);
      setPage(1);
      setHasMore(true);
      
      try {
        const params = {
          page: 1
        };
        if (selectedGenre) {
          params.with_genres = selectedGenre;
        }

        const res = await tmdbService.request('/discover/movie', params);
        let list = res.results || [];
        
        // Apply manual local filters for mock demo or to enforce strict rating/year filters
        list = filterListLocally(list);
        setItems(list);
        
        // If in demo mode, limit hasMore simulation
        if (!tmdbKey) {
          setHasMore(list.length > 8);
          setItems(list.slice(0, 8)); // Simulate initial page
        }
      } catch (err) {
        console.error("Error loading browse content:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrowseItems();
  }, [selectedGenre, selectedYearRange, selectedRating, tmdbKey]);

  // Load More / Pagination handler
  const handleLoadMore = async () => {
    if (isPaging || !hasMore) return;
    setIsPaging(true);
    const nextPage = page + 1;
    setPage(nextPage);

    try {
      if (tmdbKey) {
        // Real API Mode
        const params = {
          page: nextPage
        };
        if (selectedGenre) {
          params.with_genres = selectedGenre;
        }
        const res = await tmdbService.request('/discover/movie', params);
        let list = res.results || [];
        list = filterListLocally(list);

        if (list.length === 0) {
          setHasMore(false);
        } else {
          setItems(prev => [...prev, ...list]);
        }
      } else {
        // Demo Mode simulated pagination
        const params = {};
        if (selectedGenre) params.with_genres = selectedGenre;
        
        const res = await tmdbService.request('/discover/movie', params);
        let fullList = res.results || [];
        fullList = filterListLocally(fullList);

        const endSlice = 8 + nextPage * 6;
        const sliced = fullList.slice(0, endSlice);
        
        setItems(sliced);
        setHasMore(fullList.length > sliced.length);
      }
    } catch (err) {
      console.error("Error paginating browse elements:", err);
    } finally {
      setIsPaging(false);
    }
  };

  // Local helper to filter list items strictly on years and score criteria
  const filterListLocally = (list) => {
    let result = [...list];

    // 1. Year filters
    if (selectedYearRange !== 'all') {
      result = result.filter(item => {
        const dateStr = item.release_date || item.first_air_date || '';
        const year = parseInt(dateStr.split('-')[0]);
        if (isNaN(year)) return false;

        if (selectedYearRange === 'modern') return year >= 2024;
        if (selectedYearRange === '2010s') return year >= 2010 && year <= 2023;
        if (selectedYearRange === '2000s') return year >= 2000 && year <= 2009;
        if (selectedYearRange === '90s') return year >= 1990 && year <= 1999;
        if (selectedYearRange === 'classics') return year < 1990;
        return true;
      });
    }

    // 2. Rating score filters
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      result = result.filter(item => item.vote_average >= minRating);
    }

    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
      
      {/* 1. Browse Header titles */}
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          🗂️ CATALOGUE BROWSER
        </h2>
        <p className="text-gray-400 text-xs font-mono">Navigate detailed categories, year ranges, and reviews with infinite scroll paging.</p>
      </div>

      {/* 2. Main Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Sidebar Filter Section */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 lg:sticky lg:top-28 flex flex-col gap-6 backdrop-blur-md">
          
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <SlidersHorizontal className="w-4.5 h-4.5 text-[#E50914]" />
            <h4 className="text-white font-mono text-xs uppercase font-bold tracking-wider">REFINE SEARCH</h4>
          </div>

          {/* Genre Filters Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">GENRE SELECT</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#0A0A0F] border border-white/10 text-white text-xs font-mono font-bold px-3 py-3 rounded-xl outline-none focus:border-[#E50914] cursor-pointer"
            >
              <option value="">ALL GENRES</option>
              {GENRES.map(g => (
                <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Year Range Tabs Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> YEAR SPAN
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'all', name: 'ALL' },
                { id: 'modern', name: 'NEW (24+)' },
                { id: '2010s', name: '2010s' },
                { id: '2000s', name: '2000s' },
                { id: '90s', name: '90s' },
                { id: 'classics', name: 'CLASSIC' }
              ].map(y => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYearRange(y.id)}
                  className={`text-[9px] font-mono font-bold py-2 rounded-lg border transition-all cursor-pointer ${
                    selectedYearRange === y.id 
                      ? 'bg-[#E50914]/10 text-[#E50914] border-[#E50914]/30' 
                      : 'bg-[#0A0A0F] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {y.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rating filters */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518]" /> RATING MINIMUM
            </label>
            <div className="flex gap-2">
              {[
                { id: 'all', name: 'ALL' },
                { id: '7', name: '⭐ 7.0+' },
                { id: '8', name: '⭐ 8.0+' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRating(r.id)}
                  className={`flex-1 text-[10px] font-mono font-bold py-2 rounded-lg border transition-all cursor-pointer ${
                    selectedRating === r.id 
                      ? 'bg-[#E50914]/10 text-[#E50914] border-[#E50914]/30' 
                      : 'bg-[#0A0A0F] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              setSelectedGenre('');
              setSelectedYearRange('all');
              setSelectedRating('all');
            }}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors text-xs cursor-pointer font-mono"
          >
            RESET ALL FILTERS
          </button>

        </div>

        {/* Right Area results grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <GridSkeleton />
          ) : items.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center gap-4 bg-[#111117]/10 border border-white/5 rounded-3xl p-6">
              <Film className="w-10 h-10 text-gray-600" />
              <div>
                <h3 className="text-white font-bold text-base uppercase font-display">No catalogue matches</h3>
                <p className="text-gray-400 text-xs mt-1 font-mono">No files satisfied your current parameters. Reset criteria to search again.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              
              {/* Cards layout */}
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {items.map((item) => (
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

              {/* Load More Pagination Trigger */}
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isPaging}
                    className="bg-[#111117] hover:bg-[#E50914] border border-white/10 hover:border-transparent text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group/load"
                  >
                    {isPaging ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 group-hover/load:rotate-180 transition-transform duration-500" />
                    )}
                    <span className="font-display tracking-widest text-base">LOAD MORE TITLES</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
