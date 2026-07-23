import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Calendar, Film, Tv, Eye, Plus, Check, ThumbsUp } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import useWatchlistStore from '../stores/watchlistStore';
import useRatingsStore from '../stores/ratingsStore';

export default function MovieCard({ item }) {
  const { openQuickView } = useApp();
  const toggleWatchlist = useWatchlistStore(s => s.toggle);
  const isInList = useWatchlistStore(s => s.items.some(i => i.id === item.id));
  const isMovie = item.title !== undefined;
  const aggregates = useRatingsStore(s => s.aggregates);

  const mediaType = isMovie ? 'movie' : 'tv';
  const ratingKey = `${item.id}-${mediaType}`;
  const rawAgg = aggregates[ratingKey];
  const aggBadge = rawAgg && rawAgg.total >= 3
    ? Math.round((rawAgg.up_count / rawAgg.total) * 100)
    : null;
  const title = item.title || item.name;
  const releaseYear = (isMovie ? item.release_date : item.first_air_date)?.split('-')[0] || 'N/A';
  const rating = item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 'N/A';
  const popularity = item.popularity || 0;
  const socialBadge = item.tag || (
    popularity > 150 ? '#3 Trending' :
    popularity > 100 ? 'Trending' :
    rating !== 'N/A' && rating >= 8.5 ? 'Top Rated' : null
  );

  const cardRef = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSpotlight({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setSpotlight({ x: 50, y: 50 });
  };

  const getGlowStyle = () => {
    if (rating >= 8.2) return 'hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:border-[#F5C518]/30';
    if (item.live || item.newRelease) return 'hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:border-[#E50914]/30';
    return 'hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:border-white/20';
  };

  const handleClick = () => {
    openQuickView(item);
  };

  return (
    <button onClick={handleClick} className="block group text-left w-full cursor-pointer">
      <motion.div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative aspect-[2/3] w-full min-w-[150px] sm:min-w-[190px] md:min-w-[220px] rounded-2xl overflow-hidden border border-white/5 shadow-lg shimmer-card transition-all duration-300 ${getGlowStyle()}`}
      >
        {/* Spotlight overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(229,9,20,0.25) 0%, transparent 70%)`
          }}
        />
        
        <div className="absolute inset-0 img-blur z-0" />
        <img 
          src={getImageUrl(item.poster_path, 'w500')} 
          alt={`${title} poster`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 relative z-10"
        />

        {socialBadge && (
          <span className="absolute top-3 left-3 bg-[#E50914] text-white font-display text-[10px] tracking-wider font-semibold px-2 py-1 rounded-md z-20 shadow-md flex items-center gap-1">
            {socialBadge === '#3 Trending' || socialBadge === 'Trending' ? (
              <span className="text-[9px]">🔥</span>
            ) : socialBadge === 'Top Rated' ? (
              <span className="text-[9px]">⭐</span>
            ) : null}
            {socialBadge.toUpperCase()}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#E50914] p-3.5 rounded-full text-white shadow-xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-[#b0070f] z-30 glow-red">
            <Play className="w-5 h-5 fill-white" />
          </div>

          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-300 mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> {releaseYear}
              </span>
              
              {rating !== 'N/A' && (
                <span className="flex items-center gap-0.5 bg-yellow-950/40 text-[#F5C518] px-1.5 py-0.5 rounded border border-[#F5C518]/25 font-bold">
                  <Star className="w-3 h-3 fill-[#F5C518] inline mr-0.5" />
                  {rating}
                </span>
              )}
              {aggBadge && (
                <span className="flex items-center gap-0.5 bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/25 font-bold">
                  <ThumbsUp className="w-2.5 h-2.5 fill-emerald-400" />
                  {aggBadge}%
                </span>
              )}
            </div>

            <h4 className="text-white font-bold font-sans text-sm md:text-base leading-tight line-clamp-2">
              {title}
            </h4>

            <span className="text-[10px] uppercase font-mono tracking-wider text-red-500 font-bold mt-1.5 block flex items-center gap-1">
              {isMovie ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
              {isMovie ? 'MOVIE' : 'TV SERIES'}
            </span>
          </div>

        </div>

        {/* Watchlist toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWatchlist(item); }}
          className={`absolute top-3 right-3 z-30 p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
            isInList
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 opacity-100'
              : 'bg-black/40 text-white border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/10'
          }`}
          title={isInList ? 'Remove from My List' : 'Add to My List'}
        >
          {isInList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Quick View label on hover */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[8px] font-mono font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1 border border-white/10">
          <Eye className="w-3 h-3" /> QUICK VIEW
        </div>

      </motion.div>
    </button>
  );
}
