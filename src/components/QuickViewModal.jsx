import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Play, Plus, Check, Star, Clock, Film, Tv, User, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import useRatingsStore from '../stores/ratingsStore';

export default function QuickViewModal() {
  const { quickViewItem, closeQuickView, watchlist, toggleWatchlist, addToHistory } = useApp();
  const navigate = useNavigate();
  const rate = useRatingsStore(s => s.rate);
  const clearRating = useRatingsStore(s => s.clearRating);
  const userRatings = useRatingsStore(s => s.userRatings);
  const aggregates = useRatingsStore(s => s.aggregates);

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [details, setDetails] = useState(null);
  const [videos, setVideos] = useState([]);
  const [cast, setCast] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const isOpen = quickViewItem !== null;
  const isMovie = quickViewItem ? (quickViewItem.title !== undefined) : false;
  const itemId = quickViewItem?.id;
  const mediaType = isMovie ? 'movie' : 'tv';
  const inWatchlist = watchlist.some(w => w.id === itemId);
  const ratingKey = isOpen ? `${itemId}-${mediaType}` : null;
  const userRating = ratingKey ? (userRatings[ratingKey] || null) : null;
  const rawAgg = ratingKey ? aggregates[ratingKey] : null;
  const aggregate = rawAgg && rawAgg.total >= 3
    ? { ...rawAgg, likedPct: Math.round((rawAgg.up_count / rawAgg.total) * 100) }
    : null;

  // Fetch full details when modal opens
  useEffect(() => {
    if (!quickViewItem) {
      setDetails(null);
      setVideos([]);
      setCast([]);
      setShowTrailer(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const endpoint = isMovie ? `/movie/${itemId}` : `/tv/${itemId}`;
        const [detailData, creditsData, videosData] = await Promise.all([
          tmdbService.request(endpoint),
          tmdbService.request(`${endpoint}/credits`),
          tmdbService.request(`${endpoint}/videos`),
        ]);
        setDetails(detailData);
        setCast((creditsData.cast || []).slice(0, 6));
        setVideos(videosData.results || []);
      } catch (e) {
        console.error('QuickView fetch failed:', e);
        setDetails(quickViewItem);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [quickViewItem?.id]);

  // Focus trap + ESC
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setTimeout(() => modalRef.current?.focus(), 50);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closeQuickView();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [closeQuickView]);

  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];

  const title = quickViewItem?.title || quickViewItem?.name || '';
  const year = (isMovie ? quickViewItem?.release_date : quickViewItem?.first_air_date)?.split('-')[0] || '';
  const rating = details?.vote_average || quickViewItem?.vote_average;
  const runtime = details?.runtime;
  const genres = details?.genres || quickViewItem?.genres || [];
  const overview = details?.overview || quickViewItem?.overview || '';
  const posterPath = details?.poster_path || quickViewItem?.poster_path;
  const backdropPath = details?.backdrop_path || quickViewItem?.backdrop_path;

  const handlePlay = () => {
    const path = isMovie ? `/movie/${itemId}` : `/tv/${itemId}`;
    addToHistory(quickViewItem, { runtime: details?.runtime });
    closeQuickView();
    navigate(path);
  };

  const handleViewDetails = () => {
    const path = isMovie ? `/movie/${itemId}` : `/tv/${itemId}`;
    closeQuickView();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          onClick={closeQuickView}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-modal rounded-3xl border border-white/10 shadow-2xl scrollbar-hide"
          >
            {/* Close button */}
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-105 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-t-[#E50914] border-white/10 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Hero backdrop section */}
                <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
                  <img
                    src={getImageUrl(backdropPath, 'w1280')}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] via-[#0D0D1A]/60 to-transparent" />

                  {/* Trailer play button on hero */}
                  {trailer && !showTrailer && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#E50914]/90 hover:bg-[#E50914] text-white p-4 rounded-full transition-all hover:scale-105 shadow-xl glow-red cursor-pointer"
                      aria-label="Play trailer"
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </button>
                  )}

                  {/* Trailer iframe */}
                  {showTrailer && trailer && (
                    <div className="absolute inset-0">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1&rel=0`}
                        title="Trailer"
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                      <button
                        onClick={() => setShowTrailer(false)}
                        className="absolute top-3 left-3 z-10 p-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Close trailer
                      </button>
                    </div>
                  )}

                  {/* Poster overlay on hero (bottom-left) */}
                  <div className="absolute -bottom-12 left-6 z-20">
                    <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl bg-[#111117]">
                      <img
                        src={getImageUrl(posterPath, 'w185')}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content section */}
                <div className="pt-16 px-6 pb-6">
                  {/* Title + metadata row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-white text-2xl sm:text-3xl font-display uppercase tracking-wider leading-tight">
                        {title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono">
                        {year && <span className="text-gray-400">{year}</span>}
                        {rating && (
                          <span className="flex items-center gap-1 text-[#F5C518] font-bold">
                            <Star className="w-3.5 h-3.5 fill-[#F5C518]" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                        {aggregate && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <ThumbsUp className="w-3 h-3 fill-emerald-400" />
                            {aggregate.likedPct}%
                          </span>
                        )}
                        {runtime && (
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {runtime} min
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-400">
                          {isMovie ? <Film className="w-3 h-3 text-red-400" /> : <Tv className="w-3 h-3 text-blue-400" />}
                          {isMovie ? 'Movie' : 'TV Series'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Genre chips */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {genres.map((g, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300"
                        >
                          {typeof g === 'string' ? g : g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      onClick={handlePlay}
                      className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider transition-all glow-red flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" /> PLAY NOW
                    </button>
                    <button
                      onClick={() => toggleWatchlist(quickViewItem)}
                      className={`font-bold px-5 py-3 rounded-xl text-xs tracking-wider transition-all border flex items-center gap-2 cursor-pointer ${
                        inWatchlist
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {inWatchlist ? 'IN MY LIST' : 'ADD TO LIST'}
                    </button>
                    <button
                      onClick={handleViewDetails}
                      className="font-bold px-5 py-3 rounded-xl text-xs tracking-wider transition-all border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" /> FULL DETAILS
                    </button>

                    {/* Thumbs rating */}
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[10px] text-gray-500 font-mono mr-1">RATE</span>
                      <button
                        onClick={() => {
                          if (userRating === 'up') clearRating(itemId, mediaType);
                          else rate(itemId, mediaType, 'up');
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          userRating === 'up'
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                            : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                        title="Like"
                      >
                        <ThumbsUp className={`w-4 h-4 ${userRating === 'up' ? 'fill-emerald-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          if (userRating === 'down') clearRating(itemId, mediaType);
                          else rate(itemId, mediaType, 'down');
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          userRating === 'down'
                            ? 'bg-red-950/20 border-red-500/30 text-red-400'
                            : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                        title="Dislike"
                      >
                        <ThumbsDown className={`w-4 h-4 ${userRating === 'down' ? 'fill-red-400' : ''}`} />
                      </button>
                      {aggregate && (
                        <span className="text-[11px] font-mono text-gray-400 ml-1">
                          {aggregate.likedPct}% liked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Synopsis */}
                  {overview && (
                    <div className="mb-6">
                      <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold mb-2">Synopsis</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{overview}</p>
                    </div>
                  )}

                  {/* Cast */}
                  {cast.length > 0 && (
                    <div>
                      <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold mb-3">Cast</h4>
                      <div className="flex flex-wrap gap-4">
                        {cast.map((person, idx) => (
                          <div key={idx} className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#111117] border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                              {person.profile_path ? (
                                <img
                                  src={getImageUrl(person.profile_path, 'w92')}
                                  alt={person.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-white text-xs font-semibold block truncate max-w-[100px]">{person.name}</span>
                              <span className="text-[9px] text-gray-500 font-mono block truncate max-w-[100px]">{person.character}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
