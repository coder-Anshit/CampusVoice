import { useEffect, useState } from "react";

/**
 * Lightweight mobile accessibility helpers.
 * Keeps announcements in an aria-live region and provides a keyboard/screen-reader
 * skip link to the primary mobile content landmark.
 */
export default function MobileAccessibility({ announcement = "", contentId = "cv-mobile-content" }) {
  const [message, setMessage] = useState(announcement);

  useEffect(() => {
    setMessage(announcement || "");
  }, [announcement]);

  return (
    <>
      <a href={`#${contentId}`} className="cv-mobile-skip-link">
        Skip to main content
      </a>
      <div className="cv-mobile-live-region" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </>
  );
}
