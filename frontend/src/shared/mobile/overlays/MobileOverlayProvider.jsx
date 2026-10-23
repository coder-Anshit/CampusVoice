import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const OverlayContext = createContext(null);

function OverlayFrame({ entry, onClose }) {
  const ref = useRef(null);
  const titleId = `cv-overlay-title-${entry.id}`;

  useEffect(() => {
    const previous = document.activeElement;
    const focusable = ref.current?.querySelector(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && entry.dismissible !== false) onClose();
      if (e.key === "Tab" && ref.current) {
        const nodes = [...ref.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )];
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  const isDrawer = entry.type === "drawer";
  const isFull = entry.type === "fullscreen";

  return createPortal(
    <div className={`cv-mobile-overlay-root ${isDrawer ? "is-drawer" : ""} ${isFull ? "is-fullscreen" : ""}`} aria-hidden={false}>
      {!isFull && (
        <button className="cv-mobile-overlay-backdrop" aria-label="Close overlay" onClick={onClose} />
      )}
      <section
        ref={ref}
        role={isFull ? "main" : "dialog"}
        aria-modal={!isFull}
        aria-labelledby={entry.title ? titleId : undefined}
        className={`cv-mobile-overlay ${isDrawer ? "cv-mobile-drawer" : ""} ${isFull ? "cv-mobile-fullscreen" : ""} cv-overlay-${entry.size || "auto"}`}
      >
        {!isFull && (
          <div className="cv-mobile-overlay-header">
            <div className="cv-mobile-overlay-grab" aria-hidden="true" />
            <div className="cv-mobile-overlay-heading">
              <div>
                {entry.eyebrow && <p className="cv-text-muted cv-overlay-eyebrow">{entry.eyebrow}</p>}
                {entry.title && <h2 id={titleId} className="cv-text cv-overlay-title">{entry.title}</h2>}
              </div>
              <button type="button" className="cv-touch-target cv-overlay-close" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>
          </div>
        )}
        <div className="cv-mobile-overlay-body">{entry.render({ close: onClose })}</div>
        {entry.footer && <div className="cv-mobile-overlay-footer">{entry.footer({ close: onClose })}</div>}
      </section>
    </div>,
    document.body
  );
}

export function MobileOverlayProvider({ children }) {
  const [stack, setStack] = useState([]);

  const close = useCallback((id) => {
    setStack((current) => {
      if (id == null) return current.slice(0, -1);
      const index = current.findIndex((item) => item.id === id);
      return index === -1 ? current : current.slice(0, index);
    });
  }, []);

  const open = useCallback((config) => {
    const id = config.id || `overlay-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setStack((current) => [...current, { type: "sheet", ...config, id }]);
    return id;
  }, []);

  const api = useMemo(() => ({
    openSheet: (config) => open({ ...config, type: "sheet" }),
    openActionSheet: (config) => open({ ...config, type: "action" }),
    openFilterSheet: (config) => open({ ...config, type: "filter" }),
    openSortSheet: (config) => open({ ...config, type: "sort" }),
    openPickerSheet: (config) => open({ ...config, type: "picker" }),
    openConfirmSheet: (config) => open({ ...config, type: "confirm" }),
    openFormSheet: (config) => open({ ...config, type: "form" }),
    openInfoSheet: (config) => open({ ...config, type: "info" }),
    openDrawer: (config) => open({ ...config, type: "drawer" }),
    openFullscreen: (config) => open({ ...config, type: "fullscreen" }),
    close,
    closeAll: () => setStack([]),
  }), [open, close]);

  useEffect(() => {
    if (!stack.length) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [stack.length]);

  return (
    <OverlayContext.Provider value={api}>
      {children}
      {stack.map((entry) => (
        <OverlayFrame key={entry.id} entry={entry} onClose={() => close(entry.id)} />
      ))}
    </OverlayContext.Provider>
  );
}

export function useMobileOverlays() {
  const value = useContext(OverlayContext);
  if (!value) throw new Error("useMobileOverlays must be used inside MobileOverlayProvider");
  return value;
}
