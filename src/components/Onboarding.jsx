import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shuffle, Bot, Command, Play, ArrowRight, X, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: Shuffle,
    title: 'Surprise Me',
    description: 'Hit the Shuffle button on the hero to instantly jump into a random trending title. Perfect when you can\'t decide what to watch.',
    color: 'text-[#E50914]',
    bg: 'bg-red-950/20 border-red-500/20',
  },
  {
    icon: Bot,
    title: 'AI Mood Matcher',
    description: 'Tell the AI what you\'re in the mood for — "a dark sci-fi from the 90s" — and it will find matching titles from the catalog.',
    color: 'text-purple-400',
    bg: 'bg-purple-950/20 border-purple-500/20',
  },
  {
    icon: Command,
    title: 'Keyboard Shortcuts',
    description: 'Press ⌘K (or Ctrl+K) to open the command palette. Use j/k to scroll carousels, and ESC to close modals.',
    color: 'text-[#F5C518]',
    bg: 'bg-yellow-950/20 border-yellow-500/20',
  },
  {
    icon: Play,
    title: 'Quick View & Trailers',
    description: 'Click any poster to open the Quick View modal — watch trailers, rate with thumbs, add to your list, and play instantly.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/20 border-emerald-500/20',
  },
];

export default function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem('nexflix_onboarded');
    if (!done) {
      setTimeout(() => setIsOpen(true), 600);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('nexflix_onboarded', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleDismiss();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={handleDismiss} />

          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md glass-modal rounded-3xl border border-white/10 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`p-4 ${current.bg} rounded-2xl w-fit mb-6`}>
              <Icon className={`w-8 h-8 ${current.color}`} />
            </div>

            <h2 className="text-white text-2xl font-display uppercase tracking-wider mb-3">{current.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed font-sans mb-8">{current.description}</p>

            {/* Step indicators */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? 'w-8 bg-[#E50914]' : 'w-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-5 py-2.5 rounded-xl text-xs tracking-wider transition-all glow-red flex items-center gap-2 cursor-pointer"
                  >
                    NEXT <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleDismiss}
                    className="bg-[#E50914] hover:bg-[#b0070f] text-white font-bold px-5 py-2.5 rounded-xl text-xs tracking-wider transition-all glow-red flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> GET STARTED
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
