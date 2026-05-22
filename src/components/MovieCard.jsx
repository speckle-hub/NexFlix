import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Play, Calendar } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';

export default function MovieCard({ item }) {
  const isMovie = item.title !== undefined;
  const title = item.title || item.name;
  const releaseYear = (isMovie ? item.release_date : item.first_air_date)?.split('-')[0] || 'N/A';
  const rating = item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 'N/A';
  const linkPath = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

  // Determine custom border/glow color based on rating/badges
  const getGlowStyle = () => {
    if (rating >= 8.2) return 'hover:shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:border-[#F5C518]/30';
    if (item.live || item.newRelease) return 'hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:border-[#E50914]/30';
    return 'hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:border-white/20';
  };

  return (
    <Link to={linkPath} className="block group">
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative aspect-[2/3] w-full min-w-[150px] sm:min-w-[190px] md:min-w-[220px] rounded-2xl overflow-hidden bg-[#111117] border border-white/5 shadow-lg shimmer-card transition-all duration-300 ${getGlowStyle()}`}
      >
        
        {/* Card Poster Image */}
        <img 
          src={getImageUrl(item.poster_path, 'w500')} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Hot/New Badge */}
        {item.tag && (
          <span className="absolute top-3 left-3 bg-[#E50914] text-white font-display text-[10px] tracking-wider font-semibold px-2 py-1 rounded-md z-20 shadow-md">
            {item.tag.toUpperCase()}
          </span>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
          
          {/* Action Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#E50914] p-3.5 rounded-full text-white shadow-xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-[#b0070f] z-20 glow-red">
            <Play className="w-5 h-5 fill-white" />
          </div>

          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {/* Meta row */}
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
            </div>

            {/* Title */}
            <h4 className="text-white font-bold font-sans text-sm md:text-base leading-tight line-clamp-2">
              {title}
            </h4>

            {/* Type/Genre */}
            <span className="text-[10px] uppercase font-mono tracking-wider text-red-500 font-bold mt-1.5 block">
              {isMovie ? '🎞️ MOVIE' : '📺 TV SERIES'}
            </span>
          </div>

        </div>

      </motion.div>
    </Link>
  );
}
