import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { CardSkeleton } from './Skeleton';

export default function Carousel({ title, items = [], isLoading = false }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  const updateArrowVisibility = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);

      const cardWidth = 220 + 20;
      const start = Math.floor(scrollLeft / cardWidth);
      const end = Math.min(Math.ceil((scrollLeft + clientWidth) / cardWidth), items.length);
      setVisibleRange({ start: start + 1, end });
    }
  }, [items.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateArrowVisibility);
      setTimeout(updateArrowVisibility, 100);
    }
    return () => {
      if (el) el.removeEventListener('scroll', updateArrowVisibility);
    };
  }, [items, updateArrowVisibility]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollOffset = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  const focusFirstCard = () => {
    const cards = scrollContainerRef.current?.querySelectorAll('[data-carousel-card]');
    if (cards?.length > 0) cards[0].focus();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'j' || e.key === 'J') {
        const el = scrollContainerRef.current;
        if (el && showRightArrow) {
          el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
        }
      }
      if (e.key === 'k' || e.key === 'K') {
        const el = scrollContainerRef.current;
        if (el && showLeftArrow) {
          el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLeftArrow, showRightArrow]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative group/carousel my-8 px-6 md:px-12 max-w-7xl mx-auto"
    >
      {title && (
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-white font-display text-2xl tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
            {title}
          </h3>
          {items.length > 0 && (
            <span className="carousel-count">
              {visibleRange.start}–{visibleRange.end} / {items.length}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 bg-black/60 hover:bg-[#E50914] border border-white/10 hover:border-transparent text-white p-2.5 rounded-full z-30 transition-all duration-300 shadow-2xl opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md cursor-pointer hover:scale-110"
            title="Scroll Left (k)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 bg-black/60 hover:bg-[#E50914] border border-white/10 hover:border-transparent text-white p-2.5 rounded-full z-30 transition-all duration-300 shadow-2xl opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md cursor-pointer hover:scale-110"
            title="Scroll Right (j)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide py-3 px-1 scroll-smooth snap-x snap-mandatory"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 font-mono">No titles available in this category.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="snap-start" data-carousel-card tabIndex={-1}>
                <MovieCard item={item} />
              </div>
            ))
          )}
        </div>

      </div>
    </motion.div>
  );
}
