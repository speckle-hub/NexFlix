import React from 'react';
import { Link } from 'react-router-dom';
import useWatchlistStore from '../stores/watchlistStore';
import MovieCard from '../components/MovieCard';
import { motion } from 'framer-motion';
import { Heart, Film, ArrowRight, Sparkles } from 'lucide-react';

export default function MyList() {
  const items = useWatchlistStore(s => s.items);

  return (
    <div className="text-left pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1.5 border-b border-white/5 pb-4 mb-8"
      >
        <h2 className="text-white text-3xl font-display uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          <Heart className="w-6 h-6 text-[#E50914] fill-[#E50914]" /> MY LIST
        </h2>
        <p className="text-gray-400 text-xs font-mono">
          {items.length > 0
            ? `${items.length} title${items.length !== 1 ? 's' : ''} saved for later.`
            : 'Your watchlist is empty — start adding titles you want to watch.'}
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center bg-[#111117]/10 border border-white/5 rounded-3xl"
        >
          <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-full text-[#E50914] shadow-md mb-5">
            <Heart className="w-12 h-12" />
          </div>
          <h3 className="text-white font-bold text-lg font-display uppercase tracking-widest mb-2">
            Your list is empty
          </h3>
          <p className="text-gray-400 text-xs font-mono max-w-xs leading-relaxed mb-6">
            Browse trending movies and shows, then tap the <span className="text-white">+</span> icon to save them here.
          </p>
          <div className="flex gap-3">
            <Link
              to="/browse"
              className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider transition-all glow-red flex items-center gap-2"
            >
              <Film className="w-4 h-4" /> BROWSE CATALOG
            </Link>
            <Link
              to="/mood-matcher"
              className="border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> MOOD MATCHER
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <MovieCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
