import { useRef } from "react";

export function useLongPress(onLongPress, { delay = 500, moveTolerance = 12 } = {}) {
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const clear = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    startRef.current = null;
  };

  const start = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    startRef.current = { x: touch.clientX, y: touch.clientY };
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onLongPress?.(event);
    }, delay);
  };

  const move = (event) => {
    const touch = event.touches?.[0];
    const startPoint = startRef.current;
    if (!touch || !startPoint) return;
    if (Math.hypot(touch.clientX - startPoint.x, touch.clientY - startPoint.y) > moveTolerance) clear();
  };

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}
