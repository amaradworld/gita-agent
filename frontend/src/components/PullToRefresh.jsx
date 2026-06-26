import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const THRESHOLD = 80;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh?.();
      } catch {}
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex justify-center overflow-hidden transition-none"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        <div className="flex items-center gap-2 py-3">
          <motion.div
            animate={{
              rotate: isRefreshing ? 360 : progress * 360,
              scale: isRefreshing ? 1 : 0.5 + progress * 0.5,
            }}
            transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
            className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
          />
          <span className="text-gray-500 text-xs">
            {isRefreshing
              ? 'Refreshing...'
              : progress >= 1
                ? 'Release to refresh'
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
