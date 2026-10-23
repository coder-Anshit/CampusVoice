import { useEffect, useState } from "react";

export default function MobileConnectivityBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine !== false
  );
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setRestored(true);
      const timer = window.setTimeout(() => setRestored(false), 2400);
      return () => window.clearTimeout(timer);
    };
    const handleOffline = () => {
      setOnline(false);
      setRestored(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !restored) return null;

  return (
    <div
      className={`cv-mobile-connectivity-banner ${online ? "is-online" : "is-offline"}`}
      role="status"
      aria-live="polite"
    >
      {online ? "Back online" : "You’re offline. Changes may be delayed until connection returns."}
    </div>
  );
}
