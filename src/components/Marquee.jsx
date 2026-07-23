import React from 'react';
import { motion } from 'framer-motion';

export default function Marquee({ items = [] }) {
  if (items.length === 0) return null;

  const duration = Math.max(12, items.length * 1.5);

  return (
    <div className="relative overflow-hidden py-6 w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-transparent to-[#0A0A0F] z-10 pointer-events-none" />
      <motion.div
        className="flex gap-6"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="shrink-0 w-[140px] aspect-[2/3] rounded-xl overflow-hidden border border-white/5 relative group cursor-pointer"
          >
            <div className="absolute inset-0 img-blur" />
            <img
              src={`https://image.tmdb.org/t/p/w185${item.poster_path || item.posterPath}`}
              alt={item.title || item.name}
              className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
              <span className="text-[9px] font-mono text-white font-bold truncate leading-tight">
                {item.title || item.name}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
