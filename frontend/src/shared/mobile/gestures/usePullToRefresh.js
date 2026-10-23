import { useRef, useState } from "react";

export function usePullToRefresh(onRefresh, { threshold = 72, maxPull = 120, disabled = false } = {}) {
  const startY = useRef(null);
  const tracking = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = (event) => {
    if (disabled || refreshing || window.scrollY > 2) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    startY.current = touch.clientY;
    tracking.current = true;
  };

  const onTouchMove = (event) => {
    if (!tracking.current || startY.current == null) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const distance = Math.max(0, Math.min(maxPull, touch.clientY - startY.current));
    setPullDistance(distance);
  };

  const onTouchEnd = async () => {
    if (!tracking.current) return;
    const shouldRefresh = pullDistance >= threshold;
    tracking.current = false;
    startY.current = null;
    setPullDistance(0);
    if (!shouldRefresh || !onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  return { pullDistance, refreshing, ready: pullDistance >= threshold, onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd };
}
