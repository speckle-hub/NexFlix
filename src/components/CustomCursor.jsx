import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function CustomCursor() {
  const prefersReduced = useReducedMotion();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch || prefersReduced) return;

    setIsVisible(true);

    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const handleOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, select, textarea, .group');
      setIsHovering(!!target);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseover', handleOver);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [prefersReduced]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] transition-all duration-150 ease-out"
      style={{
        left: pos.x,
        top: pos.y,
        width: isHovering ? 32 : 12,
        height: isHovering ? 32 : 12,
        borderRadius: '50%',
        backgroundColor: isHovering ? 'rgba(229, 9, 20, 0.15)' : 'rgba(229, 9, 20, 0.6)',
        border: isHovering ? '1px solid rgba(229, 9, 20, 0.4)' : 'none',
        transform: 'translate(-50%, -50%)',
        backdropFilter: isHovering ? 'blur(4px)' : 'none',
        transition: 'width 0.2s, height 0.2s, background-color 0.2s',
      }}
    />
  );
}
