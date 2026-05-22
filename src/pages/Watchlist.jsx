import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import { Heart, Trash2, Play, SlidersHorizontal, Sparkles, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useApp();
  const navigate = useNavigate();

  // Sorting
  const [sortBy, setSortBy] = useState('date'); // 'date', 'rating', 'title'

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getSortedWatchlist = () => {
    const list = [...watchlist];
    if (sortBy === 'title') {
      return list.sort((a, b) => {
        const titleA = a.title || a.name || '';
        const titleB = b.title || b.name || '';
        return titleA.localeCompare(titleB);
      });
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }
    // Default 'date' is pre-sorted on add (most recent added first)
    return list;
  };

  const sortedWatchlist = getSortedWatchlist();

  return (
    <div className="text-left select-none">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-8">
        
        <div className="flex flex-col gap-1.5">
          <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
            💖 MY STREAMING WATCHLIST ({watchlist.length})
          </h2>
          <p className="text-gray-400 text-xs font-mono">Your personalized list of films and television series saved for later.</p>
        </div>

        {watchlist.length > 0 && (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-400 font-mono">SORT BY:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-[#111117] border border-white/10 text-white text-xs font-mono font-bold px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-[#E50914]"
            >
              <option value="date">DATE ADDED</option>
              <option value="rating">AUDIENCE SCORE</option>
              <option value="title">TITLE (A-Z)</option>
            </select>
          </div>
        )}

      </div>

      {/* 2. List rendering */}
      {watchlist.length === 0 ? (
        
        /* Empty Watchlist State */
        <div className="text-center py-24 flex flex-col items-center gap-5 bg-[#111117]/10 border border-white/5 rounded-3xl p-6">
          <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-full text-[#E50914] shadow-md animate-pulse">
            <Heart className="w-10 h-10 fill-[#E50914]" />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <h3 className="text-white font-bold text-lg font-display uppercase tracking-widest">Your Watchlist is empty</h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm font-mono mx-auto">
              Heart movies or television series anywhere in the app to bookmark them instantly in this collection.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 glow-red transition-all duration-300 cursor-pointer shadow-lg transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="font-display tracking-widest text-base">DISCOVER CINEMA</span>
          </button>
        </div>

      ) : (

        /* Watchlist Grid with deletion utilities */
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          <AnimatePresence>
            {sortedWatchlist.map((item) => {
              const isMovie = item.title !== undefined;
              const linkPath = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  
                  {/* Standard Movie card */}
                  <MovieCard item={item} />
                  
                  {/* Absolute deletion trigger overlaying top right on desktop hover */}
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md hover:bg-red-600 border border-white/10 hover:border-transparent text-gray-400 hover:text-white rounded-xl shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-30 cursor-pointer hover:scale-105"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      )}

    </div>
  );
}
