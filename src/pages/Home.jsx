import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { tmdbService } from '../services/tmdb';
import Carousel from '../components/Carousel';
import { HeroSkeleton } from '../components/Skeleton';
import { Play, Plus, Check, Star, TrendingUp, Tv, Sparkles, Globe, Award, Shuffle } from 'lucide-react';

const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200';

export default function Home() {
  const { watchlist, toggleWatchlist, watchHistory, tmdbKey } = useApp();
  const navigate = useNavigate();

  const [trending, setTrending] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const [shuffling, setShuffling] = useState(false);

  const heroRef = useRef(null);

  const GENRES = [
    { id: 28, name: "Action" },
    { id: 878, name: "Sci-Fi" },
    { id: 27, name: "Horror" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 53, name: "Thriller" }
  ];
  const [activeGenreId, setActiveGenreId] = useState(28);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const trendingRes = await tmdbService.request('/trending/all/week');
        setTrending(trendingRes.results || []);

        const topMoviesRes = await tmdbService.request('/movie/top_rated');
        setTopRatedMovies(topMoviesRes.results || []);

        const popularTVRes = await tmdbService.request('/tv/popular');
        setPopularTV(popularTVRes.results || []);

        const newMoviesRes = await tmdbService.request('/movie/now_playing');
        setNewReleases(newMoviesRes.results || []);

      } catch (err) {
        console.error("Error loading home page content:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, [tmdbKey]);

  useEffect(() => {
    const loadGenreData = async () => {
      try {
        const genreRes = await tmdbService.request('/discover/movie', {
          with_genres: activeGenreId
        });
        setGenreMovies(genreRes.results || []);
      } catch (err) {
        console.error("Error loading genre filtered movies:", err);
      }
    };
    loadGenreData();
  }, [activeGenreId, tmdbKey]);

  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [trending]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const offset = rect.top * 0.35;
        setParallaxY(Math.max(offset, -100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSurpriseMe = () => {
    setShuffling(true);
    setTimeout(() => setShuffling(false), 500);
    const allItems = [...trending, ...topRatedMovies, ...popularTV];
    if (allItems.length === 0) return;
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    const isMovie = randomItem.title !== undefined;
    navigate(isMovie ? `/movie/${randomItem.id}` : `/tv/${randomItem.id}`);
  };

  if (isLoading) {
    return <HeroSkeleton />;
  }

  const spotlightItems = trending.slice(0, 5);
  const currentSpotlight = spotlightItems[spotlightIndex] || trending[0];

  if (!currentSpotlight) return null;

  const isMovie = currentSpotlight.title !== undefined;
  const spotlightTitle = currentSpotlight.title || currentSpotlight.name;
  const backdropUrl = currentSpotlight.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${currentSpotlight.backdrop_path}` 
    : FALLBACK_BACKDROP;
  
  const rating = currentSpotlight.vote_average ? parseFloat(currentSpotlight.vote_average.toFixed(1)) : 'N/A';
  const isInList = watchlist.some(w => w.id === currentSpotlight.id);

  const awardWinners = trending.filter(item => item.vote_average >= 8.2);
  const internationalCinema = trending.filter(item => item.original_language !== 'en');

  const continueWatching = watchHistory.slice(0, 10);

  return (
    <div className="bg-[#0A0A0F] pb-10 overflow-hidden relative">
      
      <div ref={heroRef} className="relative w-full h-[85vh] md:h-screen flex items-end select-none">
        
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0A0A0F_100%)] z-10" />
          <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent z-15" />

          <AnimatePresence mode="crossfade">
            <motion.img
              key={spotlightIndex}
              src={backdropUrl}
              alt={spotlightTitle}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1.03 }}
              exit={{ opacity: 0, scale: 1.0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transformOrigin: 'center center', transform: `translateY(${parallaxY}px) scale(1.03)` }}
            />
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
        <motion.div
          key={`content-${spotlightIndex}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
          className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-16 md:pb-24 relative z-20 flex flex-col items-start gap-4"
        >
          
          {currentSpotlight.tag && (
            <span className="bg-[#E50914] text-white text-[10px] uppercase font-mono tracking-widest font-bold px-3 py-1.5 rounded-md shadow-md animate-pulse">
              {currentSpotlight.tag}
            </span>
          )}

          <h1 className="text-white text-5xl md:text-8xl font-display font-extrabold uppercase leading-none tracking-wide max-w-4xl drop-shadow-2xl">
            {spotlightTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-mono text-gray-300">
            {rating !== 'N/A' && (
              <span className="text-[#F5C518] bg-yellow-950/30 border border-[#F5C518]/30 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#F5C518]" /> {rating}
              </span>
            )}
            <span>{(isMovie ? currentSpotlight.release_date : currentSpotlight.first_air_date)?.split('-')[0]}</span>
            <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px]">
              {isMovie ? 'MOVIE' : 'TV SHOW'}
            </span>
            {currentSpotlight.original_language !== 'en' && (
              <span className="uppercase text-[#E50914] font-bold">{currentSpotlight.original_language}</span>
            )}
          </div>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl drop-shadow-md line-clamp-3">
            {currentSpotlight.overview}
          </p>

          <div className="flex flex-wrap gap-4 mt-3">
            
            <button 
              onClick={() => navigate(isMovie ? `/movie/${currentSpotlight.id}` : `/tv/${currentSpotlight.id}`)}
              className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-7 py-3.5 rounded-xl flex items-center gap-2 glow-red transition-all duration-300 cursor-pointer shadow-lg transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-white" />
              <span className="font-display tracking-widest text-lg">WATCH NOW</span>
            </button>

            <button 
              onClick={() => toggleWatchlist(currentSpotlight)}
              className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all duration-300 cursor-pointer backdrop-blur-md hover:border-white/30 transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0"
            >
              {isInList ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
              <span className="font-display tracking-widest text-lg">{isInList ? 'IN LIST' : 'MY LIST'}</span>
            </button>

            <button
              onClick={handleSurpriseMe}
              className="bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all duration-300 cursor-pointer backdrop-blur-md hover:border-white/25 transform hover:-translate-y-0.5 hover:scale-105"
              title="Surprise Me — pick a random title"
            >
              <Shuffle className={`w-5 h-5 ${shuffling ? 'shuffle-animate' : ''}`} />
              <span className="font-display tracking-widest text-base">SURPRISE ME</span>
            </button>

          </div>

          <div className="flex gap-2.5 mt-8">
            {spotlightItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setSpotlightIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  i === spotlightIndex ? 'w-8 bg-[#E50914] glow-red' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Spotlight ${i + 1}`}
              />
            ))}
          </div>

        </motion.div>
        </AnimatePresence>

      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <Carousel 
          title="CONTINUE WATCHING" 
          items={continueWatching.map(h => ({
            id: h.id,
            title: h.title,
            name: h.title,
            poster_path: h.posterPath,
            vote_average: 0,
            release_date: '',
            first_air_date: '',
            media_type: h.type,
            tag: h.type === 'tv' ? `S${h.season}E${h.episode}` : null
          }))} 
        />
      )}

      <Carousel title="TRENDING NOW" items={trending} />
      <Carousel title="TOP RATED MOVIES" items={topRatedMovies} />
      <Carousel title="POPULAR TV SHOWS" items={popularTV} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
          <h3 className="text-white font-display text-2xl tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
            FILTER BY GENRE
          </h3>
          
          <div className="flex flex-wrap gap-2.5">
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGenreId(g.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                  activeGenreId === g.id 
                    ? 'bg-[#E50914] text-white glow-red border border-transparent' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                }`}
              >
                {g.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Carousel items={genreMovies} />
      <Carousel title="NEW RELEASES" items={newReleases} />

      {awardWinners.length > 0 && (
        <Carousel title="CRITICS CHOICE (8.2+)" items={awardWinners} />
      )}

      {internationalCinema.length > 0 && (
        <Carousel title="INTERNATIONAL CINEMA" items={internationalCinema} />
      )}

    </div>
  );
}
