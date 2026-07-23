import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { tmdbService } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/Skeleton';
import { SlidersHorizontal, RefreshCw, Calendar, Star, Film, Zap, Rocket, Ghost, Smile, Eye, Compass, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Browse() {
  const { tmdbKey } = useApp();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaging, setIsPaging] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  const sentinelRef = useRef(null);

  const GENRES = [
    { id: 28, name: "Action", icon: Zap },
    { id: 878, name: "Science Fiction", icon: Rocket },
    { id: 27, name: "Horror", icon: Eye },
    { id: 35, name: "Comedy", icon: Smile },
    { id: 18, name: "Drama", icon: Film },
    { id: 53, name: "Thriller", icon: Eye },
    { id: 16, name: "Animation", icon: Palette }
  ];

  const filterListLocally = (list) => {
    let result = [...list];
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
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      result = result.filter(item => item.vote_average >= minRating);
    }
    return result;
  };

  const fetchItems = async (pageNum, append = false) => {
    try {
      if (!append) setIsLoading(true);
      const params = { page: pageNum };
      if (selectedGenre) params.with_genres = selectedGenre;

      const res = await tmdbService.request('/discover/movie', params);
      let list = res.results || [];
      list = filterListLocally(list);

      if (!tmdbKey) {
        const limit = 8 + (pageNum - 1) * 6;
        list = list.slice(0, limit);
        setHasMore(list.length === limit);
      } else {
        setHasMore(list.length > 0);
      }

      if (append) {
        setItems(prev => [...prev, ...list]);
      } else {
        setItems(list);
      }
    } catch (err) {
      console.error("Error loading browse content:", err);
    } finally {
      setIsLoading(false);
      setIsPaging(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchItems(1);
  }, [selectedGenre, selectedYearRange, selectedRating, tmdbKey]);

  const handleLoadMore = useCallback(async () => {
    if (isPaging || !hasMore) return;
    setIsPaging(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchItems(nextPage, true);
  }, [isPaging, hasMore, page, selectedGenre, selectedYearRange, selectedRating, tmdbKey]);

  useEffect(() => {
    if (!sentinelRef.current || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPaging) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isLoading, hasMore, isPaging, handleLoadMore]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
      
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          CATALOGUE BROWSER
        </h2>
        <p className="text-gray-400 text-xs font-mono">Navigate detailed categories, year ranges, and reviews with infinite scroll paging.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        <div className="glass-card p-5 rounded-2xl border border-white/5 lg:sticky lg:top-28 flex flex-col gap-6 backdrop-blur-md">
          
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <SlidersHorizontal className="w-4.5 h-4.5 text-[#E50914]" />
            <h4 className="text-white font-mono text-xs uppercase font-bold tracking-wider">REFINE SEARCH</h4>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">GENRE</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedGenre('')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  !selectedGenre
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#0A0A0F] text-gray-400 border border-white/5 hover:text-white'
                }`}
              >
                ALL
              </button>
              {GENRES.map(g => {
                const Icon = g.icon;
                const isActive = selectedGenre === String(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(isActive ? '' : String(g.id))}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#E50914] text-white'
                        : 'bg-[#0A0A0F] text-gray-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {g.name.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518]" /> RATING MINIMUM
            </label>
            <div className="flex gap-2">
              {[
                { id: 'all', name: 'ALL' },
                { id: '7', name: '7.0+' },
                { id: '8', name: '8.0+' }
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

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-8">
                  {isPaging ? (
                    <RefreshCw className="w-6 h-6 text-[#E50914] animate-spin" />
                  ) : (
                    <span className="text-gray-500 text-xs font-mono animate-pulse">Scroll for more titles...</span>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
