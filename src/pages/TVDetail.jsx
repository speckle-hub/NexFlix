import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { tmdbService, getImageUrl } from '../services/tmdb';
import Carousel from '../components/Carousel';
import { DetailSkeleton } from '../components/Skeleton';
import { Star, Play, Plus, Check, Clock, Calendar, Heart, Share2, User as UserIcon, MessageSquare, ChevronDown, CheckCircle } from 'lucide-react';

const getLangFlag = (lang) => {
  const flags = {
    en: '🇺🇸',
    ja: '🇯🇵',
    ko: '🇰🇷',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    it: '🇮🇹',
    zh: '🇨🇳'
  };
  return flags[lang] || '🌐';
};

export default function TVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { watchlist, toggleWatchlist, addToHistory, watchHistory, tmdbKey } = useApp();

  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [similar, setSimilar] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Episode Selector States
  const [seasons, setSeasons] = useState([]);
  const [activeSeasonNum, setActiveSeasonNum] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  
  // Active playing episode states
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeEpNum, setActiveEpNum] = useState(1);
  const [activeEpTitle, setActiveEpTitle] = useState('');
  
  // Controls
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [streamSource, setStreamSource] = useState('vidking');

  const playerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close season dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch TV Show Info
  useEffect(() => {
    const fetchShowData = async () => {
      try {
        setIsLoading(true);
        setIsPlaying(true);
        setIframeLoaded(false);

        const showRes = await tmdbService.request(`/tv/${id}`);
        setShow(showRes);
        setSeasons(showRes.seasons || []);
        
        // Check if there is a previously watched episode for this show in history
        const savedHistory = watchHistory.find(h => h.id === parseInt(id) && h.type === 'tv');
        if (savedHistory) {
          setActiveSeasonNum(savedHistory.season || 1);
          setActiveEpNum(savedHistory.episode || 1);
          setActiveEpTitle(savedHistory.episodeName || '');
        } else {
          setActiveSeasonNum(1);
          setActiveEpNum(1);
          setActiveEpTitle('');
        }

        const creditsRes = await tmdbService.request(`/tv/${id}/credits`);
        setCredits(creditsRes);

        const similarRes = await tmdbService.request(`/tv/${id}/similar`);
        setSimilar(similarRes.results || []);

        const videosRes = await tmdbService.request(`/tv/${id}/videos`);
        setVideos(videosRes.results || []);

        const reviewsRes = await tmdbService.request(`/tv/${id}/reviews`);
        setReviews(reviewsRes.results || []);

      } catch (err) {
        console.error("Error loading TV series detail data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShowData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, tmdbKey]);

  // Fetch episodes dynamically when active season changes
  useEffect(() => {
    if (!show) return;
    const fetchEpisodes = async () => {
      try {
        const seasonRes = await tmdbService.request(`/tv/${id}/season/${activeSeasonNum}`);
        setEpisodes(seasonRes.episodes || []);
      } catch (err) {
        console.error("Error fetching season episodes:", err);
      }
    };
    fetchEpisodes();
  }, [activeSeasonNum, show, tmdbKey]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!show) {
    return (
      <div className="pt-32 text-center text-gray-500 font-mono min-h-screen">
        TV Series not found. <button onClick={() => navigate('/')} className="text-[#E50914] underline">Back to home</button>
      </div>
    );
  }

  const isFav = watchlist.some(w => w.id === show.id);
  const rating = show.vote_average ? parseFloat(show.vote_average.toFixed(1)) : 'N/A';
  const backdropUrl = getImageUrl(show.backdrop_path, 'original');
  const posterUrl = getImageUrl(show.poster_path, 'w500');

  // Crew Highlights
  const creator = show.created_by?.[0]?.name || credits.crew.find(c => c.job === 'Executive Producer')?.name || 'N/A';
  const writer = credits.crew.find(c => c.job === 'Writer' || c.job === 'Story Editor')?.name || 'N/A';
  const composer = credits.crew.find(c => c.job === 'Composer' || c.job === 'Original Music Composer')?.name || 'N/A';

  // Last watched details
  const lastWatchedItem = watchHistory.find(h => h.id === show.id && h.type === 'tv');

  const handleEpisodePlay = (ep) => {
    setActiveEpNum(ep.episode_number);
    setActiveEpTitle(ep.name);
    setIsPlaying(true);
    setIframeLoaded(false);

    // Save streaming details to global watch history
    addToHistory(show, {
      season: activeSeasonNum,
      episode: ep.episode_number,
      episodeName: ep.name,
      runtime: ep.runtime || 45
    });

    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("🍿 Link copied to clipboard!");
  };

  return (
    <div className="bg-[#0A0A0F] pb-20 relative select-none">
      
      {/* 1. Cinematic backdrop bleed */}
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0F]/65 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#0A0A0F_100%)] z-10" />
        <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent z-15" />
        <img src={backdropUrl} alt={show.name} className="w-full h-full object-cover blur-[1px] transform scale-102" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 pt-24 md:pt-36">
        
        {/* 2. Info grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          {/* Poster column */}
          <div className="flex justify-center md:sticky md:top-28">
            <div className="w-full max-w-[320px] aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 shimmer-card">
              <img src={posterUrl} alt={show.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info Details block */}
          <div className="md:col-span-2 flex flex-col gap-6 text-left">
            
            {show.tag && (
              <span className="bg-[#E50914] text-white text-[10px] uppercase font-mono tracking-widest font-bold px-3 py-1 rounded-md max-w-max self-start shadow-md animate-pulse">
                {show.tag}
              </span>
            )}

            {/* Title / Resume badge */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-white text-4xl md:text-6xl font-display font-extrabold uppercase leading-tight drop-shadow-lg">
                  {show.name}
                </h1>
                {lastWatchedItem && (
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow-md">
                    <CheckCircle className="w-3.5 h-3.5" /> CURRENTLY WATCHING: S{lastWatchedItem.season}E{lastWatchedItem.episode}
                  </span>
                )}
              </div>
              {show.tagline && (
                <p className="text-[#F5C518] text-sm md:text-base font-serif italic mt-1.5 opacity-90">
                  "{show.tagline}"
                </p>
              )}
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-mono text-gray-300 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md max-w-max">
              <span className="text-[#F5C518] font-bold flex items-center gap-0.5 glow-gold">
                ⭐ {rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" /> {show.seasons?.length} Seasons
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" /> {show.first_air_date?.split('-')[0]}
              </span>
              <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px]">
                {show.adult ? '🔞 18+' : '🍿 PG'}
              </span>
              <span className="flex items-center gap-1">
                {getLangFlag(show.original_language)} <span className="uppercase text-gray-400">{show.original_language}</span>
              </span>
            </div>

            {/* Synopsis */}
            <div>
              <h4 className="text-white font-mono text-xs uppercase tracking-wider text-red-500 font-bold mb-2">SYNOPSIS</h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {show.overview}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-2">
              
              {/* Play / Resume trigger */}
              <button 
                onClick={() => {
                  const saved = watchHistory.find(h => h.id === show.id && h.type === 'tv');
                  const s = saved?.season || 1;
                  const e = saved?.episode || 1;
                  setActiveSeasonNum(s);
                  setActiveEpNum(e);
                  setIsPlaying(true);
                  setIframeLoaded(false);
                  addToHistory(show, { season: s, episode: e, runtime: 45 });
                  setTimeout(() => {
                    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 150);
                }}
                className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 glow-red transition-all duration-300 cursor-pointer shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                <span className="font-display tracking-widest text-lg">
                  {lastWatchedItem ? `RESUME S${lastWatchedItem.season}E${lastWatchedItem.episode}` : 'PLAY PILOT'}
                </span>
              </button>

              {/* Toggle list */}
              <button 
                onClick={() => toggleWatchlist(show)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer backdrop-blur-md hover:border-white/30 transform hover:-translate-y-0.5"
              >
                {isFav ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                <span className="font-display tracking-wider text-sm">{isFav ? 'SAVED' : 'MY LIST'}</span>
              </button>

              {/* Share */}
              <button 
                onClick={handleShare}
                className="bg-[#2a2a35]/40 hover:bg-[#2a2a35]/70 border border-white/5 text-gray-300 p-4 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>

            </div>

            {/* Creator details */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-white/5 py-4 my-2">
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Creator</span>
                <span className="text-white font-semibold text-xs md:text-sm">{creator}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Story Editor</span>
                <span className="text-white font-semibold text-xs md:text-sm">{writer}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Composer</span>
                <span className="text-white font-semibold text-xs md:text-sm">{composer}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {show.genres?.map((g, idx) => (
                <span key={idx} className="glass-pill text-[10px] font-mono font-bold text-red-400 border-[#E50914]/20 px-3 py-1.5 rounded-full">
                  {g.toUpperCase ? g.toUpperCase() : g.name?.toUpperCase()}
                </span>
              ))}
            </div>

          </div>

        </div>

        {/* 3. TV Show Stream Player Embed wrapper */}
        {isPlaying && (
          <div ref={playerRef} className="mt-16 flex flex-col gap-4 animate-scaleIn">
            
            {/* Source Toggle Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-300 font-mono text-xs uppercase tracking-wider">Select Player Source:</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setStreamSource('vidking'); setIframeLoaded(false); }}
                  className={`font-mono text-xs px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    streamSource === 'vidking' 
                      ? 'bg-[#E50914] text-white glow-red font-bold shadow-lg' 
                      : 'text-gray-400 hover:text-white bg-[#111117]/50 border border-white/5 hover:bg-[#111117]'
                  }`}
                >
                  VIDKING.NET (Primary)
                </button>
                <button 
                  onClick={() => { setStreamSource('vidsrc'); setIframeLoaded(false); }}
                  className={`font-mono text-xs px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    streamSource === 'vidsrc' 
                      ? 'bg-[#E50914] text-white glow-red font-bold shadow-lg' 
                      : 'text-gray-400 hover:text-white bg-[#111117]/50 border border-white/5 hover:bg-[#111117]'
                  }`}
                >
                  VIDSRC.ME (Backup 1)
                </button>
                <button 
                  onClick={() => { setStreamSource('embedsu'); setIframeLoaded(false); }}
                  className={`font-mono text-xs px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    streamSource === 'embedsu' 
                      ? 'bg-[#E50914] text-white glow-red font-bold shadow-lg' 
                      : 'text-gray-400 hover:text-white bg-[#111117]/50 border border-white/5 hover:bg-[#111117]'
                  }`}
                >
                  EMBED.SU (Backup 2)
                </button>
              </div>
            </div>

            {/* Main Player Frame */}
            <div className="border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-black relative">
              
              <div className="absolute top-4 left-6 z-30 pointer-events-none flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity duration-300 select-none">
                <span className="text-[#E50914] font-extrabold text-2xl font-display tracking-tighter">N</span>
                <span className="text-white font-bold text-sm font-display tracking-widest">
                  exFlix PLAYER — S{activeSeasonNum}E{activeEpNum}
                </span>
              </div>

              <div className="aspect-video w-full relative">
                {!iframeLoaded && (
                  <div className="absolute inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center z-20 gap-4">
                    <div className="w-16 h-16 border-4 border-t-[#E50914] border-white/10 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs font-mono tracking-widest animate-pulse uppercase">
                      BUFFING S{activeSeasonNum}E{activeEpNum} ON {streamSource === 'vidking' ? 'VidKing' : streamSource === 'vidsrc' ? 'VidSrc' : 'EmbedSU'}...
                    </p>
                  </div>
                )}
                
                <iframe
                  src={
                    streamSource === 'vidking'
                      ? `https://www.vidking.net/embed/tv/${show.id}/${activeSeasonNum}/${activeEpNum}`
                      : streamSource === 'vidsrc'
                      ? `https://vidsrc.me/embed/tv?tmdb=${show.id}&season=${activeSeasonNum}&episode=${activeEpNum}`
                      : `https://embed.su/embed/tv/${show.id}/${activeSeasonNum}/${activeEpNum}`
                  }
                  title={`NexFlix TV Player: ${show.name} S${activeSeasonNum}E${activeEpNum}`}
                  className="w-full h-full border-0 absolute inset-0 z-10"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  width="100%"
                  style={{ aspectRatio: "16/9", border: "none" }}
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
              
              <div className="p-4 bg-[#111117] border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span className="text-white truncate">Playing: **{activeEpTitle || `Episode ${activeEpNum}`}** (**{streamSource === 'vidking' ? 'VidKing.net Embed' : streamSource === 'vidsrc' ? 'VidSrc.me Embed' : 'Embed.su Backup'}**)</span>
                <span className="text-[#F5C518] flex items-center gap-1 animate-pulse shrink-0">
                  ● SYNCED S{activeSeasonNum}E{activeEpNum}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Season & Episode Selector Suite */}
        <div className="mt-20 text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
            <h3 className="text-white font-display text-2xl tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
              📺 EPISODE NAVIGATOR
            </h3>

            {/* Season Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#111117] border border-white/10 text-white font-mono text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg hover:border-white/20 transition-all select-none"
              >
                <span>SELECT SEASON:</span>
                <span className="text-[#E50914]">Season {activeSeasonNum}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-modal border border-white/10 rounded-xl shadow-2xl p-2 z-35 animate-fadeIn">
                  {seasons.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSeasonNum(s.season_number);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left font-mono text-xs p-2.5 rounded-lg transition-colors cursor-pointer ${
                        activeSeasonNum === s.season_number 
                          ? 'bg-[#E50914]/10 text-[#E50914] font-bold' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Season {s.season_number} ({s.name || `S${s.season_number}`})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Episode Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.length === 0 ? (
              <p className="text-gray-500 text-sm font-mono col-span-full text-center py-10">Loading episodes array...</p>
            ) : (
              episodes.map((ep) => {
                const isEpWatched = lastWatchedItem && lastWatchedItem.season === activeSeasonNum && lastWatchedItem.episode === ep.episode_number;
                return (
                  <div 
                    key={ep.episode_number}
                    onClick={() => handleEpisodePlay(ep)}
                    className={`glass-card rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${
                      isEpWatched 
                        ? 'border-[#E50914]/40 bg-[#E50914]/5 hover:shadow-[0_0_15px_rgba(229,9,20,0.15)]' 
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      {/* Image/Badge Still Container */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#111117] border border-white/5 relative mb-3">
                        <img 
                          src={getImageUrl(ep.still_path || show.backdrop_path, 'w500')} 
                          alt={ep.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        />
                        <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 shadow-md">
                          EPISODE {ep.episode_number}
                        </span>
                      </div>
                      
                      {/* Episode Info */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <h4 className="text-white font-bold text-sm leading-tight line-clamp-1">{ep.name}</h4>
                        {ep.runtime && (
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">{ep.runtime} min</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs leading-normal line-clamp-3 mb-4">{ep.overview || "No synopsis available for this episode."}</p>
                    </div>

                    <button className={`w-full font-mono text-[10px] font-bold py-2 rounded-lg tracking-wider transition-colors ${
                      isEpWatched 
                        ? 'bg-[#E50914] text-white hover:bg-[#b0070f]' 
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}>
                      {isEpWatched ? '🎬 WATCH AGAIN' : '▶ WATCH NOW'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* 5. Cast Avatars */}
        {credits.cast && credits.cast.length > 0 && (
          <div className="mt-20 text-left">
            <h3 className="text-white font-display text-2xl tracking-wider mb-6 uppercase flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
              🎭 STAR CAST
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

      </div>

      {/* 6. Similar TV Shows Carousel */}
      {similar && similar.length > 0 && (
        <div className="mt-16">
          <Carousel title="📺 SIMILAR RECOMMENDATIONS" items={similar} />
        </div>
      )}

    </div>
  );
}
