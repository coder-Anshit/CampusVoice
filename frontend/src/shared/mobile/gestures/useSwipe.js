import { useRef } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 56, maxDuration = 700 } = {}) {
  const startRef = useRef(null);

  const onTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const onTouchEnd = (event) => {
    const start = startRef.current;
    const touch = event.changedTouches?.[0];
    startRef.current = null;
    if (!start || !touch) return;
    const duration = Date.now() - start.time;
    if (duration > maxDuration) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < 0) onSwipeLeft?.(event);
      else onSwipeRight?.(event);
    } else if (dy < 0) {
      onSwipeUp?.(event);
    } else {
      onSwipeDown?.(event);
    }
  };

  return { onTouchStart, onTouchEnd };
}
