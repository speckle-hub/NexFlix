import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function CustomCursor() {
  const prefersReduced = useReducedMotion();
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch || prefersReduced) return;

    setIsVisible(true);

    let rafId;
    let latestX = -100;
    let latestY = -100;

    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0) translate(-50%, -50%)`;
      }
      rafId = null;
    };

    const handleMove = (e) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    const handleOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, select, textarea, .group');
      setIsHovering(!!target);
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseover', handleOver, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseover', handleOver);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReduced]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform"
      style={{
        width: isHovering ? 32 : 12,
        height: isHovering ? 32 : 12,
        borderRadius: '50%',
        backgroundColor: isHovering ? 'rgba(229, 9, 20, 0.15)' : 'rgba(229, 9, 20, 0.6)',
        border: isHovering ? '1px solid rgba(229, 9, 20, 0.4)' : 'none',
        backdropFilter: isHovering ? 'blur(4px)' : 'none',
        transition: 'width 0.2s ease-out, height 0.2s ease-out, background-color 0.2s ease-out, border 0.2s ease-out',
        transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)'
      }}
    />
  );
}
