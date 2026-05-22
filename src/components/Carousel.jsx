import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { CardSkeleton } from './Skeleton';

export default function Carousel({ title, items = [], isLoading = false }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll container limits to toggle arrow buttons visibility
  const updateArrowVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      // Give a tiny 2px buffer for rounding errors
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateArrowVisibility);
      // Trigger initial checks on render or item changes
      setTimeout(updateArrowVisibility, 100);
    }
    return () => {
      if (el) el.removeEventListener('scroll', updateArrowVisibility);
    };
  }, [items]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      // Scroll by 80% of current viewport width
      const scrollOffset = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel my-8 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Category Heading */}
      {title && (
        <h3 className="text-white font-display text-2xl tracking-wider mb-4 md:mb-6 uppercase flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
          {title}
        </h3>
      )}

      {/* Slider Wrapper */}
      <div className="relative">
        
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 bg-black/60 hover:bg-[#E50914] border border-white/10 hover:border-transparent text-white p-2.5 rounded-full z-30 transition-all duration-300 shadow-2xl opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md cursor-pointer hover:scale-110"
            title="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 bg-black/60 hover:bg-[#E50914] border border-white/10 hover:border-transparent text-white p-2.5 rounded-full z-30 transition-all duration-300 shadow-2xl opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md cursor-pointer hover:scale-110"
            title="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Container */}
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
              <div key={item.id} className="snap-start">
                <MovieCard item={item} />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
