import { usePullToRefresh } from "./usePullToRefresh.js";

export default function MobilePullToRefresh({ onRefresh, disabled = false, children, className = "" }) {
  const refresh = usePullToRefresh(onRefresh, { disabled });
  const label = refresh.refreshing ? "Refreshing…" : refresh.ready ? "Release to refresh" : refresh.pullDistance > 0 ? "Pull to refresh" : "";

  return (
    <div
      className={`cv-mobile-ptr ${className}`}
      onTouchStart={refresh.onTouchStart}
      onTouchMove={refresh.onTouchMove}
      onTouchEnd={refresh.onTouchEnd}
      onTouchCancel={refresh.onTouchCancel}
    >
      <div className="cv-mobile-ptr-indicator" style={{ height: refresh.pullDistance ? Math.min(48, refresh.pullDistance * 0.5) : 0, opacity: refresh.pullDistance ? 1 : 0 }} aria-live="polite">
        {label}
      </div>
      {children}
    </div>
  );
}
