import React from "react";

export default function MobilePerformanceFallback() {
  return (
    <div
      className="cv-mobile-page cv-mobile-performance-fallback"
      role="status"
      aria-live="polite"
      aria-label="Loading mobile content"
    >
      <div className="cv-mobile-performance-fallback__bar" aria-hidden="true" />
      <div className="cv-mobile-performance-fallback__card" aria-hidden="true">
        <div className="cv-mobile-performance-fallback__line" />
        <div className="cv-mobile-performance-fallback__line cv-mobile-performance-fallback__line--short" />
      </div>
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
