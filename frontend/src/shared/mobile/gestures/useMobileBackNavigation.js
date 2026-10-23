import { useCallback, useEffect } from "react";

export function useMobileBackNavigation({ enabled = true, onBack, canGoBack = true } = {}) {
  const handlePopState = useCallback(() => {
    if (!enabled || !canGoBack) return;
    onBack?.();
  }, [enabled, canGoBack, onBack]);

  useEffect(() => {
    if (!enabled || !canGoBack) return undefined;
    window.history.pushState({ cvMobile: true }, "");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled, canGoBack, handlePopState]);
}
