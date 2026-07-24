import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Home, Film, Tv, Heart, User, Bot, Command, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

const ACTIONS = [
  { id: 'home', label: 'Home', path: '/', icon: Home, keywords: 'home index' },
  { id: 'browse', label: 'Browse', path: '/browse', icon: Film, keywords: 'browse explore catalog' },
  { id: 'search', label: 'Search', path: '/search', icon: Search, keywords: 'search find look' },
  { id: 'my-list', label: 'My List', path: '/my-list', icon: Heart, keywords: 'watchlist list saved' },
  { id: 'mood', label: 'Mood Matcher', path: '/mood-matcher', icon: Bot, keywords: 'mood ai chat recommend' },
  { id: 'profile', label: 'Dashboard', path: '/profile', icon: User, keywords: 'profile dashboard stats' },
  { id: 'test-error', label: 'Trigger Error Boundary (Dev Test)', path: '/?testError=true', icon: AlertTriangle, keywords: 'error test boundary crash dev' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.toLowerCase().includes(query.toLowerCase()) ||
        a.path.toLowerCase().includes(query.toLowerCase())
      )
    : ACTIONS;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIdx(0);
    }
  }, [isOpen]);

  const handleSelect = useCallback((action) => {
    onClose();
    navigate(action.path);
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); return; }
    if (e.key === 'Enter' && filtered[activeIdx]) { handleSelect(filtered[activeIdx]); return; }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass-modal rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <Command className="w-5 h-5 text-[#E50914] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Go to page or type a command..."
                className="flex-1 bg-transparent text-white text-base outline-none placeholder-gray-500 font-sans"
              />
              <span className="text-[10px] text-gray-600 font-mono border border-white/10 px-2 py-1 rounded-lg">ESC</span>
            </div>

            <div className="max-h-64 overflow-y-auto scrollbar-hide py-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm font-mono">No results for "{query}"</div>
              ) : (
                filtered.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors cursor-pointer ${
                        idx === activeIdx ? 'bg-white/5 text-white' : 'text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#E50914] shrink-0" />
                      <span className="flex-1 text-sm font-medium">{action.label}</span>
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/5 px-5 py-2.5 flex items-center gap-4 text-[10px] text-gray-600 font-mono">
              <span><kbd className="bg-white/8 border border-white/10 px-1.5 py-0.5 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="bg-white/8 border border-white/10 px-1.5 py-0.5 rounded">⏎</kbd> open</span>
              <span><kbd className="bg-white/8 border border-white/10 px-1.5 py-0.5 rounded">ESC</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
