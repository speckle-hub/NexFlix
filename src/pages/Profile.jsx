import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Film, Check, Play, Trash2, Award, Zap, Flame, TrendingUp, Heart, Tv, Calendar, Star, Crown } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
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

  const getGenreStatistics = () => {
    const stats = {};
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
        const normalized = g.replace('Science Fiction', 'Sci-Fi').replace('Sci-Fi & Fantasy', 'Sci-Fi').replace('Action & Adventure', 'Action');
        stats[normalized] = (stats[normalized] || 0) + 1;
        totalCount++;
      });
    });

    return Object.keys(stats).map(name => ({
      name,
      percentage: Math.round((stats[name] / totalCount) * 100),
      count: stats[name]
    })).sort((a, b) => b.count - a.count);
  };

  const genreStats = getGenreStatistics();
  const isPro = watchHistory.length >= 5;
  const topGenre = genreStats[0];

  return (
    <div className="text-left select-none pb-20">
      
      {/* Bento Grid Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1.5 border-b border-white/5 pb-4 mb-8"
      >
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          <Crown className="w-6 h-6 text-[#F5C518]" /> MEMBER TELEMETRY DASHBOARD
        </h2>
        <p className="text-gray-400 text-xs font-mono">Bento-grid telemetry dashboard with personalized streaming analytics.</p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
        
        {/* ────────── AVATAR CARD (tall, spans left col) ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-1 lg:row-span-2 glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E50914]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#F5C518]/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#111117] border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.3)] flex items-center justify-center text-5xl mb-4 relative">
              <span className="animate-pulse">{activeAvatar}</span>
              {isPro && (
                <span className="absolute -bottom-1 -right-1 bg-[#F5C518] text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0A0A0F] shadow-md">
                  <Crown className="w-3 h-3 text-black" />
                </span>
              )}
            </div>

            {editing ? (
              <div className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#E50914] text-center"
                />
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
                <span className={`text-[10px] font-mono block mt-1 uppercase flex items-center justify-center gap-1 ${
                  isPro ? 'text-[#F5C518]' : 'text-gray-500'
                }`}>
                  {isPro ? (
                    <><Crown className="w-3 h-3" /> NexFlix Pro Member</>
                  ) : (
                    <>{5 - watchHistory.length} more streams to unlock Pro</>
                  )}
                </span>
                
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-4 py-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl text-xs transition-all cursor-pointer font-mono"
                >
                  EDIT PROFILE
                </button>
              </div>
            )}
          </div>

          {/* Favorite genres mini display */}
          <div className="w-full mt-5 pt-5 border-t border-white/5">
            <span className="text-[9px] text-gray-500 font-mono block uppercase tracking-wider mb-2">Favorite Genres</span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(profile.favoriteGenres || []).length === 0 ? (
                <span className="text-[10px] text-gray-600 italic">None selected</span>
              ) : (
                (profile.favoriteGenres || []).map((g, i) => (
                  <span key={i} className="text-[10px] font-mono text-red-400 bg-red-950/20 px-2 py-0.5 rounded-lg border border-red-500/10">
                    {g}
                  </span>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* ────────── TITLES WATCHED ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 glass-card p-5 rounded-3xl border border-white/5 flex items-center gap-4 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-950/20 rounded-full blur-2xl" />
          <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-2xl text-[#E50914] shadow-md relative">
            <Film className="w-6 h-6" />
          </div>
          <div className="relative">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Titles Watched</span>
            <span className="text-white text-3xl font-display font-extrabold tracking-wider">
              <AnimatedCounter value={watchHistory.length} />
            </span>
          </div>
        </motion.div>

        {/* ────────── HOURS STREAMED ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1 glass-card p-5 rounded-3xl border border-white/5 flex items-center gap-4 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-950/20 rounded-full blur-2xl" />
          <div className="p-3.5 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl text-[#F5C518] shadow-md relative">
            <Clock className="w-6 h-6" />
          </div>
          <div className="relative">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Hours Streamed</span>
            <span className="text-white text-3xl font-display font-extrabold tracking-wider">
              <AnimatedCounter value={profile.hoursStreamed} suffix=" h" />
            </span>
          </div>
        </motion.div>

        {/* ────────── PRO MEMBERSHIP STATUS ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 glass-card p-5 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#F5C518]/5 rounded-full blur-3xl" />
          <div className="relative">
            <span className="text-[10px] text-gray-500 font-mono block uppercase mb-1">Membership</span>
            <div className={`flex items-center gap-2 ${isPro ? 'text-[#F5C518]' : 'text-gray-400'}`}>
              <Award className={`w-5 h-5 ${isPro ? 'fill-[#F5C518]' : ''}`} />
              <span className="font-bold text-sm font-mono tracking-wider">{isPro ? 'PRO' : 'STANDARD'}</span>
            </div>
            <div className="mt-3 w-full bg-[#0A0A0F] h-1.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-[#E50914] to-[#F5C518] h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((watchHistory.length / 5) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-600 font-mono mt-1.5 block">
              {isPro ? 'Unlimited access unlocked' : `${watchHistory.length} / 5 titles streamed`}
            </span>
          </div>
        </motion.div>

        {/* ────────── TOP GENRE + TRENDING STAT ────────── */}
        {topGenre && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1 glass-card p-5 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden flex items-center gap-3"
          >
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-purple-950/20 rounded-full blur-2xl" />
            <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-purple-400 shadow-md relative">
              <Flame className="w-5 h-5" />
            </div>
            <div className="relative">
              <span className="text-[10px] text-gray-500 font-mono block uppercase">Top Genre</span>
              <span className="text-white text-base font-display font-bold tracking-wider">{topGenre.name}</span>
              <span className="text-[10px] text-purple-400 font-mono block mt-0.5">{topGenre.count} titles</span>
            </div>
          </motion.div>
        )}

        {/* ────────── GENRE DISTRIBUTION (wide, 2 cols) ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#E50914]/3 rounded-full blur-3xl" />
          
          <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold mb-5 flex items-center gap-1.5 relative">
            <Zap className="w-4 h-4 text-[#E50914]" /> DYNAMIC TASTE TELEMETRY
            <span className="ml-auto text-[9px] text-gray-600 font-normal">Top genres by watch count</span>
          </h4>

          {watchHistory.length === 0 ? (
            <p className="text-gray-500 text-xs font-mono py-6 text-center relative">Stream movies/series to populate taste graphs.</p>
          ) : (
            <div className="flex flex-col gap-3 relative">
              {genreStats.slice(0, 5).map((stat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-mono font-semibold text-gray-300 mb-1.5">
                    <span>{stat.name.toUpperCase()}</span>
                    <span className="text-[#E50914]">{stat.percentage}% ({stat.count}x)</span>
                  </div>
                  <div className="w-full bg-[#0A0A0F] h-2.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ duration: 1, delay: 0.4 + idx * 0.1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-[#E50914] to-red-500 h-full rounded-full shadow-[0_0_10px_rgba(229,9,20,0.5)] transition-all duration-1000"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ────────── GENRE PREFERENCES PILLS ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-1 glass-card p-6 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-950/20 rounded-full blur-2xl" />
          <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5 relative">
            <Heart className="w-4 h-4 text-[#E50914]" fill="#E50914" /> PREFERRED GENRES
          </h4>
          <div className="flex flex-wrap gap-2 relative">
            {AVAILABLE_GENRES.map((g, idx) => {
              const active = (profile.favoriteGenres || []).includes(g);
              return (
                <button
                  key={idx}
                  onClick={() => handleGenreToggle(g)}
                  className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    active 
                      ? 'bg-[#E50914]/15 border-[#E50914]/40 text-[#E50914] shadow-[0_0_10px_rgba(229,9,20,0.15)]' 
                      : 'bg-[#0A0A0F] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-[#E50914]" />}
                  {g.toUpperCase()}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-gray-600 font-mono mt-4 relative">
            Select genres to personalize your recommendations
          </p>
        </motion.div>

        {/* ────────── QUICK STAT / RATING ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 glass-card p-5 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-950/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <Star className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-mono block uppercase">Avg. Rating</span>
              <span className="text-white text-lg font-display font-bold tracking-wider">
                {watchHistory.length > 0 ? '8.4' : '—'}
              </span>
            </div>
          </div>
          <div className="relative mt-3 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Consistent with top picks</span>
          </div>
        </motion.div>

        {/* ────────── WATCH HISTORY (full width) ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-4 glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-4 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3 relative">
            <h4 className="text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#E50914]" /> STREAM HISTORY
              <span className="text-gray-600 font-normal text-[9px] ml-1">({watchHistory.length} entries)</span>
            </h4>
            {watchHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-gray-500 hover:text-red-500 font-mono text-[10px] font-bold py-1 px-2.5 rounded hover:bg-red-950/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> WIPE LOGS
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto scrollbar-hide relative">
            {watchHistory.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-mono text-xs">
                <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No streaming logs found. Start watching to populate your history.
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
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-4 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-[#111117] rounded-xl overflow-hidden border border-white/5 shrink-0">
                        <img src={item.posterPath ? `https://image.tmdb.org/t/p/w92${item.posterPath}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=92'} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs md:text-sm block truncate max-w-xs group-hover:text-red-400 transition-colors">{item.title}</span>
                        <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                          {item.type === 'tv' 
                            ? `S${item.season}E${item.episode} — "${item.episodeName || 'Episode'}"` 
                            : `Feature Film`
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
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
