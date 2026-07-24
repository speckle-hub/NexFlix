import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, Film, Tv, Star, Bot, User, Zap, TrendingUp, Clock, Heart, ArrowRight } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'I want a sci-fi thriller from the 90s',
  'Something funny and lighthearted',
  'A dark crime drama',
  'Show me an epic adventure',
  'Animated movie with great visuals',
  'Something that will make me think',
];

const MOOD_KEYWORDS = {
  action: { genres: ['Action'], tone: 'action-packed' },
  'sci-fi': { genres: ['Science Fiction', 'Sci-Fi & Fantasy'], tone: 'futuristic' },
  scifi: { genres: ['Science Fiction', 'Sci-Fi & Fantasy'], tone: 'futuristic' },
  futuristic: { genres: ['Science Fiction'], tone: 'futuristic' },
  comedy: { genres: ['Comedy'], tone: 'funny' },
  funny: { genres: ['Comedy'], tone: 'funny' },
  hilarious: { genres: ['Comedy'], tone: 'funny' },
  drama: { genres: ['Drama'], tone: 'emotional' },
  emotional: { genres: ['Drama'], tone: 'emotional' },
  sad: { genres: ['Drama'], tone: 'emotional' },
  dark: { genres: ['Drama', 'Crime', 'Thriller'], tone: 'dark' },
  thriller: { genres: ['Thriller'], tone: 'suspenseful' },
  suspense: { genres: ['Thriller', 'Crime'], tone: 'suspenseful' },
  scary: { genres: ['Horror'], tone: 'terrifying' },
  horror: { genres: ['Horror'], tone: 'terrifying' },
  adventure: { genres: ['Adventure'], tone: 'epic' },
  epic: { genres: ['Adventure', 'Action'], tone: 'epic' },
  animated: { genres: ['Animation'], tone: 'colorful' },
  cartoon: { genres: ['Animation'], tone: 'colorful' },
  anime: { genres: ['Animation'], tone: 'stylish' },
  crime: { genres: ['Crime', 'Drama'], tone: 'gritty' },
  gangster: { genres: ['Crime', 'Drama'], tone: 'gritty' },
  war: { genres: ['War', 'Action', 'Drama'], tone: 'intense' },
  music: { genres: ['Music', 'Drama'], tone: 'rhythmic' },
  fantasy: { genres: ['Fantasy', 'Adventure'], tone: 'magical' },
  magical: { genres: ['Fantasy'], tone: 'magical' },
  family: { genres: ['Family', 'Animation'], tone: 'heartwarming' },
  kids: { genres: ['Family', 'Animation'], tone: 'fun' },
  romantic: { genres: ['Romance', 'Comedy', 'Drama'], tone: 'romantic' },
  love: { genres: ['Romance', 'Drama'], tone: 'romantic' },
  thriller: { genres: ['Thriller'], tone: 'suspenseful' },
  mystery: { genres: ['Mystery', 'Thriller', 'Drama'], tone: 'mysterious' },
};

const DECADE_KEYWORDS = {
  '90': { label: '1990s', range: [1990, 1999] },
  '1990': { label: '1990s', range: [1990, 1999] },
  '80': { label: '1980s', range: [1980, 1989] },
  '1980': { label: '1980s', range: [1980, 1989] },
  '2000': { label: '2000s', range: [2000, 2009] },
  '2010': { label: '2010s', range: [2010, 2019] },
  '2020': { label: '2020s', range: [2020, 2029] },
  '70': { label: '1970s', range: [1970, 1979] },
  '1970': { label: '1970s', range: [1970, 1979] },
};

function analyzeMessage(text) {
  const lower = text.toLowerCase();
  const matchedGenres = new Set();
  let tone = '';
  let decade = null;
  let keywords = [];

  for (const [word, mapping] of Object.entries(MOOD_KEYWORDS)) {
    if (lower.includes(word)) {
      mapping.genres.forEach(g => matchedGenres.add(g));
      tone = mapping.tone;
      keywords.push(word);
    }
  }

  for (const [word, mapping] of Object.entries(DECADE_KEYWORDS)) {
    if (lower.includes(word)) {
      decade = mapping;
      break;
    }
  }

  return { genres: [...matchedGenres], tone, decade, keywords };
}

function matchMovies(message, allItems) {
  const analysis = analyzeMessage(message);
  let scored = allItems.map(item => {
    let score = 0;
    const title = (item.title || item.name || '').toLowerCase();
    const overview = (item.overview || '').toLowerCase();
    const itemGenres = item.genres || [];

    analysis.genres.forEach(genre => {
      if (itemGenres.some(g => g.toLowerCase().includes(genre.toLowerCase()))) {
        score += 30;
      }
    });

    if (analysis.decade) {
      const year = parseInt((item.release_date || item.first_air_date || '').split('-')[0]);
      if (year >= analysis.decade.range[0] && year <= analysis.decade.range[1]) {
        score += 25;
      }
    }

    analysis.keywords.forEach(kw => {
      if (overview.includes(kw)) score += 10;
    });

    score += Math.min(item.popularity || 0, 50) * 0.3;
    score += (item.vote_average || 0) * 2;

    return { item, score, analysis };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}

function generateResponse(analysis, matches) {
  const tone = analysis.tone || 'great';
  const decade = analysis.decade;
  const genres = analysis.genres;

  let intro = '';

  if (matches.length === 0) {
    return {
      text: "Hmm, I couldn't find a perfect match based on that description. Try being more specific — mention a genre, decade, or mood!",
      matches: []
    };
  }

  if (genres.length > 0 && decade) {
    intro = `Found some ${tone} ${genres.slice(0, 2).join('/')} titles from the ${decade.label} that match your vibe:`;
  } else if (genres.length > 0) {
    intro = `Here are some ${tone} ${genres.slice(0, 2).join('/')} picks I think you'll love:`;
  } else if (decade) {
    intro = `Check out these highlights from the ${decade.label}:`;
  } else {
    intro = `Here are some ${tone} recommendations based on what you described:`;
  }

  return { text: intro, matches };
}

export default function MoodMatcher() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hey! Tell me what you're in the mood to watch. Try something like *'I want a sci-fi thriller from the 90s'* or *'Show me something funny'*.",
      matches: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, topRated, popularTv] = await Promise.all([
          tmdbService.request('/trending/all/week'),
          tmdbService.request('/movie/top_rated'),
          tmdbService.request('/tv/popular'),
        ]);

        const combined = [
          ...(trending.results || []),
          ...(topRated.results || []),
          ...(popularTv.results || []),
        ];

        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setAllItems(unique);
      } catch (e) {
        console.error('Failed to load catalog:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendMessage = async (text) => {
    if (!text || isThinking || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, matches: [] }]);
    setIsThinking(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const matches = matchMovies(text, allItems);
    const { text: responseText, matches: responseMatches } = generateResponse(
      matches.length > 0 ? matches[0].analysis : { genres: [], tone: '', decade: null, keywords: [] },
      matches
    );

    setMessages(prev => [...prev, {
      role: 'ai',
      text: responseText,
      matches: responseMatches
    }]);
    setIsThinking(false);
  };

  const handleSend = () => {
    sendMessage(input.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.trim());
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    setTimeout(() => sendMessage(prompt), 100);
  };

  return (
    <div className="text-left flex flex-col h-[calc(100vh-12rem)]">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1.5 border-b border-white/5 pb-4 mb-6 shrink-0"
      >
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          <Bot className="w-6 h-6 text-[#E50914]" /> AI MOOD MATCHER
        </h2>
        <p className="text-gray-400 text-xs font-mono">Describe your mood and let AI recommend the perfect movie or show from our catalog.</p>
      </motion.div>

      {/* Chat Messages Area (scrollable) */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-5 pb-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E50914] to-red-600 flex items-center justify-center shrink-0 shadow-lg mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                {msg.role === 'ai' ? (
                  <div className="glass-modal rounded-2xl rounded-tl-sm border border-white/5 p-4 backdrop-blur-md">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.matches.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {msg.matches.map((match, mi) => {
                          const item = match.item;
                          const isMovie = item.title !== undefined;
                          const title = item.title || item.name;
                          const year = (isMovie ? item.release_date : item.first_air_date)?.split('-')[0];
                          return (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: mi * 0.1 }}
                              onClick={() => navigate(isMovie ? `/movie/${item.id}` : `/tv/${item.id}`)}
                              className="group text-left"
                            >
                              <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-[#111117] relative mb-2">
                                <img
                                  src={getImageUrl(item.poster_path, 'w342')}
                                  alt={title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                  <span className="text-white text-[10px] font-mono font-bold flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" /> VIEW
                                  </span>
                                </div>
                              </div>
                              <h4 className="text-white text-xs font-semibold truncate group-hover:text-[#E50914] transition-colors">{title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-gray-500 font-mono">{year}</span>
                                <span className="flex items-center gap-0.5 text-[9px] text-[#F5C518] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-[#F5C518]" />
                                  {item.vote_average?.toFixed(1)}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#E50914]/10 border border-[#E50914]/20 rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-white text-sm">{msg.text}</p>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#111117] border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E50914] to-red-600 flex items-center justify-center shrink-0 shadow-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass-modal rounded-2xl rounded-tl-sm border border-white/5 px-5 py-4 backdrop-blur-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts + Input bar */}
      <div className="shrink-0 pt-3 border-t border-white/5">
        {messages.length <= 1 && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[10px] text-gray-500 font-mono self-center mr-1">TRY:</span>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handlePromptClick(prompt)}
                className="glass-pill px-3.5 py-2 rounded-xl text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#E50914]" />
                {prompt}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? 'Loading catalog...' : 'Describe your mood... (e.g. "a dark crime drama from the 90s")'}
              disabled={isThinking || isLoading}
              className="w-full bg-[#111117]/80 border border-white/10 focus:border-[#E50914]/40 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all duration-300 placeholder-gray-600 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking || isLoading}
            className="bg-[#E50914] hover:bg-[#b0070f] text-white p-4 rounded-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed glow-red shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
