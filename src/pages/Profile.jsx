import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Film, Check, Play, Trash2, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AVATAR_PRESETS = ['🍿', '🎬', '🚀', '🎭', '🥷', '👾', '🧙', '👑', '👽', '🦄'];
const AVAILABLE_GENRES = ['Action', 'Sci-Fi', 'Horror', 'Comedy', 'Drama', 'Thriller', 'Adventure', 'Animation'];

export default function Profile() {
  const { profile, updateProfile, watchHistory, clearHistory } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile.username);
  const [activeAvatar, setActiveAvatar] = useState(profile.avatar);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    updateProfile({
      username,
      avatar: activeAvatar
    });
    setEditing(false);
  };

  const handleGenreToggle = (g) => {
    const current = profile.favoriteGenres || [];
    const updated = current.includes(g) 
      ? current.filter(item => item !== g) 
      : [...current, g];
    
    updateProfile({ favoriteGenres: updated });
  };

  // 1. Calculate dynamic genre metrics from watch history
  const getGenreStatistics = () => {
    const stats = {};
    // Map of titles to their mock genres to resolve stats
    const titleGenresMap = {
      "Interstellar": ["Science Fiction", "Drama", "Adventure"],
      "Inception": ["Action", "Science Fiction", "Adventure"],
      "Stranger Things": ["Drama", "Sci-Fi & Fantasy", "Mystery"],
      "Dune: Part Two": ["Science Fiction", "Adventure"],
      "Oppenheimer": ["Drama", "History"],
      "The Dark Knight": ["Action", "Drama", "Crime"],
      "The Last of Us": ["Drama", "Action & Adventure", "Sci-Fi & Fantasy"],
      "Breaking Bad": ["Drama", "Crime"],
      "Spider-Man: Across the Spider-Verse": ["Animation", "Action", "Adventure", "Science Fiction"],
      "Arcane": ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
      "The Matrix": ["Action", "Science Fiction"],
      "The Mandalorian": ["Action & Adventure", "Sci-Fi & Fantasy"],
      "Spirited Away": ["Animation", "Family", "Fantasy"],
      "Pulp Fiction": ["Thriller", "Crime"],
      "Whiplash": ["Drama", "Music"],
      "The Boys": ["Sci-Fi & Fantasy", "Action & Adventure", "Drama"],
      "Gladiator": ["Action", "Drama", "Adventure"],
      "Cyberpunk: Edgerunners": ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
      "Parasite": ["Comedy", "Thriller", "Drama"],
      "Civil War": ["Action", "Drama", "War"]
    };

    let totalCount = 0;
    watchHistory.forEach(item => {
      const genres = titleGenresMap[item.title] || ['Drama'];
      genres.forEach(g => {
        // Normalize names
        const normalized = g.replace('Science Fiction', 'Sci-Fi').replace('Sci-Fi & Fantasy', 'Sci-Fi').replace('Action & Adventure', 'Action');
        stats[normalized] = (stats[normalized] || 0) + 1;
        totalCount++;
      });
    });

    // Convert to percentages
    return Object.keys(stats).map(name => ({
      name,
      percentage: Math.round((stats[name] / totalCount) * 100),
      count: stats[name]
    })).sort((a, b) => b.count - a.count);
  };

  const genreStats = getGenreStatistics();

  return (
    <div className="text-left select-none pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4 mb-8">
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          👤 MEMBER TELEMETRY DASHBOARD
        </h2>
        <p className="text-gray-400 text-xs font-mono">Telemetry statistics, customize presets, and track history logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Avatar & Preference Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Avatar / Username edit Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center backdrop-blur-md">
            
            <div className="w-24 h-24 rounded-full bg-[#111117] border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.3)] flex items-center justify-center text-5xl relative mb-4">
              <span className="animate-pulse">{activeAvatar}</span>
            </div>

            {editing ? (
              <div className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#E50914] text-center"
                />
                
                {/* Avatar presets grid */}
                <div className="flex flex-wrap gap-2 justify-center my-2">
                  {AVATAR_PRESETS.map((a, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveAvatar(a)}
                      className={`text-xl p-1.5 rounded-lg border transition-all cursor-pointer ${
                        activeAvatar === a ? 'bg-[#E50914]/20 border-[#E50914]' : 'bg-[#0A0A0F] border-transparent hover:bg-white/5'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-[#E50914] hover:bg-[#b0070f] text-white font-bold py-2 rounded-xl text-xs tracking-wider cursor-pointer font-mono"
                >
                  SAVE CHANGES
                </button>
              </div>
            ) : (
              <div className="w-full">
                <h3 className="text-white text-xl font-bold uppercase font-display tracking-widest">{profile.username}</h3>
                <span className={`text-[10px] font-mono block mt-1 uppercase ${watchHistory.length >= 5 ? 'text-[#F5C518]' : 'text-gray-500'}`}>
                  {watchHistory.length >= 5 ? 'NexFlix Pro Member' : `${5 - watchHistory.length} more streams to unlock Pro`}
                </span>
                
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-4 py-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl text-xs transition-all cursor-pointer font-mono"
                >
                  EDIT USER PROFILE
                </button>
              </div>
            )}

          </div>

          {/* Preferences Favorite Genres Checklist */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 backdrop-blur-md">
            <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#F5C518] fill-[#F5C518] inline" /> PREFERRED GENRES
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map((g, idx) => {
                const active = (profile.favoriteGenres || []).includes(g);
                return (
                  <button
                    key={idx}
                    onClick={() => handleGenreToggle(g)}
                    className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                      active 
                        ? 'bg-[#E50914]/15 border-[#E50914]/40 text-[#E50914]' 
                        : 'bg-[#0A0A0F] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-[#E50914]" />}
                    {g.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Columns: Telemetry, Charts & History Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Telemetry Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Total Movies/Shows Watched */}
            <div className="glass-card p-5 rounded-3xl border border-white/5 flex items-center gap-4 backdrop-blur-md">
              <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-2xl text-[#E50914] shadow-md">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Titles Watched</span>
                <span className="text-white text-3xl font-display font-extrabold tracking-wider">{watchHistory.length}</span>
              </div>
            </div>

            {/* Total Hours Streamed */}
            <div className="glass-card p-5 rounded-3xl border border-white/5 flex items-center gap-4 backdrop-blur-md">
              <div className="p-3.5 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl text-[#F5C518] shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Hours Streamed</span>
                <span className="text-white text-3xl font-display font-extrabold tracking-wider">{profile.hoursStreamed} h</span>
              </div>
            </div>

          </div>

          {/* Dynamic Genre distribution Progress Meters */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 backdrop-blur-md">
            <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#E50914]" /> DYNAMIC TASTE TELEMETRY
            </h4>

            {watchHistory.length === 0 ? (
              <p className="text-gray-500 text-xs font-mono py-4 text-center">Stream movies/series to populate taste graphs.</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {genreStats.slice(0, 4).map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-mono font-semibold text-gray-300 mb-1.5">
                      <span>{stat.name.toUpperCase()}</span>
                      <span className="text-[#E50914]">{stat.percentage}% ({stat.count}x)</span>
                    </div>
                    {/* Meter track */}
                    <div className="w-full bg-[#0A0A0F] h-2 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-[#E50914] to-red-500 h-full rounded-full shadow-[0_0_10px_rgba(229,9,20,0.5)] transition-all duration-1000"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Watch History feed list */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-4 backdrop-blur-md">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold">STREAM HISTORY</h4>
              {watchHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-gray-500 hover:text-red-500 font-mono text-[10px] font-bold py-1 px-2.5 rounded hover:bg-red-950/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> WIPE LOGS
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto scrollbar-hide">
              {watchHistory.length === 0 ? (
                
                <div className="text-center py-8 text-gray-500 font-mono text-xs">
                  No streaming logs found in LocalStorage.
                </div>

              ) : (
                watchHistory.map((item, idx) => {
                  const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <div 
                      key={idx}
                      className="p-3 bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#111117] rounded-xl overflow-hidden border border-white/5 shrink-0">
                          <img src={item.posterPath ? `https://image.tmdb.org/t/p/w92${item.posterPath}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=92'} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs md:text-sm block truncate max-w-xs">{item.title}</span>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                            {item.type === 'tv' 
                              ? `S${item.season}E${item.episode} — "${item.episodeName || 'Episode'}"` 
                              : `Feature Film (synced)`
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 shrink-0">
                        <span className="text-[9px] font-mono text-gray-500">{dateStr}</span>
                        <button
                          onClick={() => navigate(item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`)}
                          className="bg-[#E50914] hover:bg-[#b0070f] text-white p-2 rounded-xl transition-all cursor-pointer shadow-md glow-red"
                          title="Resume streaming"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
