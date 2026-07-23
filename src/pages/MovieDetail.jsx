import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { tmdbService, getImageUrl } from '../services/tmdb';
import Carousel from '../components/Carousel';
import { DetailSkeleton } from '../components/Skeleton';
import { showToast } from '../components/Toast';
import { Star, Play, Plus, Check, Clock, Calendar, Share2, User as UserIcon, X, Maximize, Minimize } from 'lucide-react';

const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const getLangFlag = (lang) => {
  const flags = {
    en: '🇺🇸', ja: '🇯🇵', ko: '🇰🇷', es: '🇪🇸',
    fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', zh: '🇨🇳', hi: '🇮🇳'
  };
  return flags[lang] || '🌐';
};

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { watchlist, toggleWatchlist, addToHistory, tmdbKey } = useApp();

  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [similar, setSimilar] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [streamSource, setStreamSource] = useState('vidking');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerRef = useRef(null);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await playerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const sourceMeta = {
    vidking: { btn: 'VIDKING.NET (Primary)', label: 'VidKing.net Embed', short: 'VidKing', movie: (id) => `https://www.vidking.net/embed/movie/${id}`, tv: null },
    vidsrc: { btn: 'VIDSRC.ME (Backup 1)', label: 'VidSrc.me Embed', short: 'VidSrc', movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`, tv: null },
    embedsu: { btn: 'EMBED.SU (Backup 2)', label: 'Embed.su Backup', short: 'EmbedSU', movie: (id) => `https://embed.su/embed/movie/${id}`, tv: null },
    vidlink: { btn: 'VIDLINK.PRO (Backup 3)', label: 'VidLink.pro Embed', short: 'VidLink', movie: (id) => `https://vidlink.pro/movie/${id}`, tv: null },
    '2embed': { btn: '2EMBED.CC (Backup 4)', label: '2Embed.cc Embed', short: '2Embed', movie: (id) => `https://2embed.cc/embed/movie/${id}`, tv: null },
    vidsrccc: { btn: 'VIDSRC.CC (Backup 5)', label: 'VidSrc.cc Embed', short: 'VidSrc.cc', movie: (id) => `https://vidsrc.cc/embed/movie?tmdb=${id}`, tv: null },
    ezvidapi: { btn: 'EZVIDAPI.COM', label: 'EzVidApi.com Embed', short: 'EzVidApi', movie: (id) => `https://ezvidapi.com/embed/movie?tmdb=${id}`, tv: null },
    autoembed: { btn: 'AUTOEMBED.CO', label: 'AutoEmbed.co Embed', short: 'AutoEmbed', movie: (id) => `https://autoembed.co/embed/movie?tmdb=${id}`, tv: null },
    moviesapi: { btn: 'MOVIESAPI.TO', label: 'MoviesApi.to Embed', short: 'MoviesApi', movie: (id) => `https://moviesapi.to/embed/movie/${id}`, tv: null },
    vidfast: { btn: 'VIDFAST.PRO', label: 'VidFast.pro Embed', short: 'VidFast', movie: (id) => `https://vidfast.pro/embed/movie/${id}`, tv: null },
    embedfilmu: { btn: 'EMBED.FILMU.IN', label: 'FilmU.in Embed', short: 'FilmU', movie: (id) => `https://embed.filmu.in/embed/movie/${id}`, tv: null },
    cinesrc: { btn: 'CINESRC.ST', label: 'CineSrc.st Embed', short: 'CineSrc', movie: (id) => `https://cinesrc.st/embed/movie/${id}`, tv: null },
    vidpop: { btn: 'VIDPOP.XYZ', label: 'VidPop.xyz Embed', short: 'VidPop', movie: (id) => `https://vidpop.xyz/embed/movie/${id}`, tv: null },
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        setIsPlaying(true);
        setIframeLoaded(false);

        const movieRes = await tmdbService.request(`/movie/${id}`);
        setMovie(movieRes);

        const creditsRes = await tmdbService.request(`/movie/${id}/credits`);
        setCredits(creditsRes);

        const similarRes = await tmdbService.request(`/movie/${id}/similar`);
        setSimilar(similarRes.results || []);

        const videosRes = await tmdbService.request(`/movie/${id}/videos`);
        setVideos(videosRes.results || []);

        const reviewsRes = await tmdbService.request(`/movie/${id}/reviews`);
        setReviews(reviewsRes.results || []);

      } catch (err) {
        console.error("Error loading movie detail data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, tmdbKey]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!movie) {
    return (
      <div className="pt-32 text-center text-gray-500 font-mono min-h-screen">
        Movie not found. <button onClick={() => navigate('/')} className="text-[#E50914] underline">Back to home</button>
      </div>
    );
  }

  const isFav = watchlist.some(w => w.id === movie.id);
  const rating = movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : 'N/A';
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const director = credits.crew.find(c => c.job === 'Director')?.name || 'N/A';
  const writer = credits.crew.find(c => c.job === 'Writer' || c.job === 'Screenplay')?.name || 'N/A';
  const composer = credits.crew.find(c => c.job === 'Original Music Composer' || c.job === 'Composer')?.name || 'N/A';

  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];

  const handlePlayClick = () => {
    setIsPlaying(true);
    addToHistory(movie, { runtime: movie.runtime });
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  };

  return (
    <div className="bg-[#0A0A0F] pb-20 relative select-none">
      
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0F]/65 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#0A0A0F_100%)] z-10" />
        <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent z-15" />
        <img 
          src={backdropUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover blur-[1px] transform scale-102"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 pt-24 md:pt-36">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          <div className="flex justify-center md:sticky md:top-28">
            <div className="w-full max-w-[320px] aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 shimmer-card img-blur">
              <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6 text-left">
            
            {movie.tag && (
              <span className="bg-[#E50914] text-white text-[10px] uppercase font-mono tracking-widest font-bold px-3 py-1 rounded-md max-w-max self-start shadow-md">
                {movie.tag}
              </span>
            )}

            <div>
              <h1 className="text-white text-4xl md:text-6xl font-display font-extrabold uppercase leading-tight drop-shadow-lg">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-[#F5C518] text-sm md:text-base font-serif italic mt-1.5 opacity-90">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-mono text-gray-300 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md max-w-max">
              <span className="text-[#F5C518] font-bold flex items-center gap-0.5 glow-gold">
                <Star className="w-4 h-4 fill-[#F5C518] mr-0.5" /> {rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" /> {formatRuntime(movie.runtime)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" /> {movie.release_date?.split('-')[0]}
              </span>
              <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px]">
                {movie.adult ? 'R' : 'PG-13'}
              </span>
              <span className="flex items-center gap-1">
                {getLangFlag(movie.original_language)} <span className="uppercase text-gray-400">{movie.original_language}</span>
              </span>
            </div>

            <div>
              <h4 className="text-white font-mono text-xs uppercase tracking-wider text-red-500 font-bold mb-2">SYNOPSIS</h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {movie.overview}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              
              <button 
                onClick={handlePlayClick}
                className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 glow-red transition-all duration-300 cursor-pointer shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                <span className="font-display tracking-widest text-lg">PLAY MOVIE</span>
              </button>

              <button 
                onClick={() => toggleWatchlist(movie)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer backdrop-blur-md hover:border-white/30 transform hover:-translate-y-0.5"
                title="Save to Watchlist"
              >
                {isFav ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                <span className="font-display tracking-wider text-sm">{isFav ? 'SAVED' : 'MY LIST'}</span>
              </button>

              {trailer && (
                <button 
                  onClick={() => setIsTrailerOpen(true)}
                  className="bg-[#2a2a35]/40 hover:bg-[#2a2a35]/70 border border-white/5 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer backdrop-blur-md hover:border-white/20 transform hover:-translate-y-0.5"
                  title="Play Trailer"
                >
                  <Play className="w-5 h-5" />
                  <span className="font-display tracking-wider text-sm">TRAILER</span>
                </button>
              )}

              <button 
                onClick={handleShare}
                className="bg-[#2a2a35]/40 hover:bg-[#2a2a35]/70 border border-white/5 text-gray-300 p-4 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>

            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-b border-white/5 py-4 my-2">
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Director</span>
                <span className="text-white font-semibold text-xs md:text-sm">{director}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Screenplay</span>
                <span className="text-white font-semibold text-xs md:text-sm">{writer}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Composer</span>
                <span className="text-white font-semibold text-xs md:text-sm">{composer}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g, idx) => (
                <span 
                  key={idx}
                  className="glass-pill text-[10px] font-mono font-bold text-red-400 border-[#E50914]/20 px-3 py-1.5 rounded-full"
                >
                  {g.toUpperCase ? g.toUpperCase() : g.name?.toUpperCase()}
                </span>
              ))}
            </div>

          </div>

        </div>

        {isPlaying && (
          <div ref={playerRef} className="mt-16 flex flex-col gap-4 animate-scaleIn">
            
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-300 font-mono text-xs uppercase tracking-wider">Select Player Source:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(sourceMeta).map(([key, src]) => (
                  <button 
                    key={key}
                    onClick={() => { setStreamSource(key); setIframeLoaded(false); }}
                    className={`font-mono text-xs px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                      streamSource === key 
                        ? 'bg-[#E50914] text-white glow-red font-bold shadow-lg' 
                        : 'text-gray-400 hover:text-white bg-[#111117]/50 border border-white/5 hover:bg-[#111117]'
                    }`}
                  >
                    {src.btn}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-black relative">
              <div className="absolute top-4 left-6 z-30 pointer-events-none flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity duration-300 select-none">
                <span className="text-[#E50914] font-extrabold text-2xl font-display tracking-tighter">N</span>
                <span className="text-white font-bold text-sm font-display tracking-widest">exFlix PLAYER</span>
              </div>

              <div className="aspect-video w-full relative">
                {!iframeLoaded && (
                  <div className="absolute inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center z-20 gap-4">
                    <div className="w-16 h-16 border-4 border-t-[#E50914] border-white/10 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs font-mono tracking-widest animate-pulse uppercase">
                      Initializing {sourceMeta[streamSource]?.short || 'Stream'} Engine...
                    </p>
                  </div>
                )}
                
                <iframe
                  src={sourceMeta[streamSource]?.movie(movie.id)}
                  title={`NexFlix Player: ${movie.title}`}
                  className="w-full h-full border-0 absolute inset-0 z-10"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  width="100%"
                  style={{ aspectRatio: "16/9", border: "none" }}
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
              
              <div className="p-4 bg-[#111117] border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>Streaming source: {sourceMeta[streamSource]?.label || 'Unknown'}</span>
                <div className="flex items-center gap-3">
                  <button onClick={toggleFullscreen} className="hover:text-white transition-colors cursor-pointer" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                  <span className="text-[#F5C518] flex items-center gap-1 animate-pulse">
                    ● STREAM READY
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {credits.cast && credits.cast.length > 0 && (
          <div className="mt-20 text-left">
            <h3 className="text-white font-display text-2xl tracking-wider mb-6 uppercase flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
              STAR CAST
            </h3>
            
            <div className="flex gap-6 overflow-x-auto scrollbar-hide py-2">
              {credits.cast.slice(0, 10).map((actor, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 min-w-[90px] md:min-w-[120px] text-center group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#111117] border border-white/10 overflow-hidden group-hover:border-[#E50914] transition-all duration-300 shadow-md">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                        alt={actor.name}
                        className="w-full h-full object-cover scale-102 group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <UserIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <span className="text-white text-xs font-bold font-sans truncate w-full">{actor.name}</span>
                  <span className="text-gray-400 text-[10px] font-mono truncate w-full">{actor.character}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews && reviews.length > 0 && (
          <div className="mt-20 text-left">
            <h3 className="text-white font-display text-2xl tracking-wider mb-6 uppercase flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
              USER CRITICS ({reviews.length})
            </h3>

            <div className="flex flex-col gap-4">
              {reviews.slice(0, 3).map((rev, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl border border-white/5 relative">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3.5">
                    <span className="font-bold text-xs text-white uppercase font-mono tracking-wider">Reviewer: {rev.author}</span>
                    {rev.rating && (
                      <span className="text-xs text-[#F5C518] font-bold bg-yellow-950/20 border border-[#F5C518]/20 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-[#F5C518] inline mr-0.5" /> {rev.rating}/10
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-h-36 overflow-y-auto scrollbar-hide">
                    "{rev.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {similar && similar.length > 0 && (
        <div className="mt-16">
          <Carousel title="SIMILAR RECOMMENDATIONS" items={similar} />
        </div>
      )}

      {isTrailerOpen && trailer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-4xl bg-black rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button 
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full hover:bg-red-500 z-30 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title={`${movie.title} Official Trailer`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-[#111117] text-white text-sm font-semibold truncate">
              {movie.title} — Official YouTube Cinematic Trailer
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
