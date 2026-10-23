import { useEffect, useRef, useState } from "react";
import {
  Check,
  Palette,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  CV_THEME_REGISTRY,
  CV_APPEARANCE_REGISTRY,
  CV_APPEARANCE_PRESETS,
  getTheme,
  setTheme,
  getAppearance,
  setAppearance,
  setAppearancePreset,
  DEFAULT_APPEARANCE,
} from "../design-system/index.js";

const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "style", label: "Style" },
];

function OptionButton({ active, onClick, label, description, preview }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-cv-md px-2.5 py-2 text-left transition-colors ${
        active ? "bg-cv-primary-soft" : "hover:bg-cv-surface-soft"
      }`}
    >
      {preview}
      <span className="min-w-0 flex-1">
        <span className={`block text-[11px] font-medium ${active ? "text-cv-primary" : "text-cv-text-secondary"}`}>
          {label}
        </span>
        {description && (
          <span className="block truncate text-[9px] text-cv-text-muted">
            {description}
          </span>
        )}
      </span>
      {active && <Check className="w-3.5 h-3.5 shrink-0 text-cv-primary" />}
    </button>
  );
}

function SettingGroup({ title, registry, value, onChange }) {
  return (
    <div>
      <p className="px-2.5 mb-1.5 text-[9px] uppercase tracking-[0.12em] font-semibold text-cv-text-muted">
        {title}
      </p>
      <div className="space-y-1">
        {Object.entries(registry).map(([id, meta]) => (
          <OptionButton
            key={id}
            active={value === id}
            onClick={() => onChange(id)}
            label={meta.label}
            description={meta.description}
            preview={
              <span
                className="w-7 h-7 shrink-0 rounded-cv-md border border-cv-border bg-cv-surface-muted flex items-center justify-center text-[10px] text-cv-primary"
                aria-hidden="true"
              >
                {id === "sharp" ? "▢" : id === "compact" ? "◫" : id === "soft" ? "◻" : id === "rounded" ? "○" : id === "friendly" ? "◯" : "·"}
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function ThemePicker({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("colors");
  const [theme, setCurrentTheme] = useState(() => getTheme());
  const [appearance, setCurrentAppearance] = useState(() => getAppearance());
  const rootRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const handleThemeEvent = (event) => {
      if (event.detail) setCurrentTheme(event.detail);
    };
    const handleAppearanceEvent = (event) => {
      if (event.detail) setCurrentAppearance(event.detail);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("cv-theme-change", handleThemeEvent);
    window.addEventListener("cv-appearance-change", handleAppearanceEvent);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("cv-theme-change", handleThemeEvent);
      window.removeEventListener("cv-appearance-change", handleAppearanceEvent);
    };
  }, []);

  const changeStyle = (key, value) => {
    setCurrentAppearance(setAppearance({ [key]: value }));
  };

  const resetStyle = () => {
    setCurrentAppearance(setAppearance(DEFAULT_APPEARANCE));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="Appearance"
        aria-label="Appearance"
        aria-expanded={open}
        className={
          compact
            ? "w-9 h-9 rounded-cv-md flex items-center justify-center border border-cv-border bg-cv-surface-soft text-cv-text-muted hover:bg-cv-surface hover:text-cv-primary transition-colors"
            : "w-8 h-8 rounded-cv-md flex items-center justify-center text-cv-text-muted hover:bg-cv-surface hover:text-cv-primary transition-colors"
        }
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[330px] max-h-[min(680px,calc(100vh-90px))] overflow-y-auto rounded-cv-xl border border-cv-border bg-cv-surface p-2 shadow-cv-lg">
          <div className="px-2.5 pt-2 pb-2.5 flex items-start gap-2">
            <div className="w-8 h-8 rounded-cv-md bg-cv-primary-soft text-cv-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-cv-text">Appearance</p>
              <p className="mt-0.5 text-[9px] text-cv-text-muted">
                Customize colors, shape, depth and density.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 mb-2 rounded-cv-md bg-cv-surface-soft">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`py-1.5 rounded-cv-sm text-[10px] font-semibold transition-colors ${
                  section === item.id
                    ? "bg-cv-surface text-cv-primary shadow-cv-xs"
                    : "text-cv-text-muted hover:text-cv-text-secondary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {section === "colors" ? (
            <div className="space-y-1">
              {Object.entries(CV_THEME_REGISTRY).map(([id, meta]) => (
                <OptionButton
                  key={id}
                  active={theme === id}
                  onClick={() => setTheme(id)}
                  label={meta.label}
                  description={meta.description}
                  preview={
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cv-surface-muted text-sm">
                      {meta.icon}
                    </span>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 px-1 pb-1">
              <div>
                <p className="px-2.5 mb-1.5 text-[9px] uppercase tracking-[0.12em] font-semibold text-cv-text-muted">Presets</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(CV_APPEARANCE_PRESETS).map(([id, preset]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCurrentAppearance(setAppearancePreset(id))}
                      className="rounded-cv-md border border-cv-border bg-cv-surface-soft px-2.5 py-2 text-left hover:bg-cv-surface transition-colors"
                    >
                      <span className="block text-[10px] font-semibold text-cv-text">{preset.label}</span>
                      <span className="block mt-0.5 text-[8px] leading-3 text-cv-text-muted">{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <SettingGroup title="Corner shape" registry={CV_APPEARANCE_REGISTRY.shape} value={appearance.shape} onChange={(value) => changeStyle("shape", value)} />

              <div>
                <p className="px-2.5 mb-1.5 text-[9px] uppercase tracking-[0.12em] font-semibold text-cv-text-muted">Depth</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(CV_APPEARANCE_REGISTRY.depth).map(([id, meta]) => (
                    <button key={id} type="button" onClick={() => changeStyle("depth", id)} className={`rounded-cv-md border px-2.5 py-2 text-left transition-colors ${appearance.depth === id ? "border-cv-primary-border bg-cv-primary-soft" : "border-cv-border bg-cv-surface-soft hover:bg-cv-surface"}`}>
                      <span className={`block text-[10px] font-semibold ${appearance.depth === id ? "text-cv-primary" : "text-cv-text"}`}>{meta.label}</span>
                      <span className="block mt-0.5 text-[8px] text-cv-text-muted">{meta.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="px-2.5 mb-1.5 text-[9px] uppercase tracking-[0.12em] font-semibold text-cv-text-muted">Density</p>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(CV_APPEARANCE_REGISTRY.density).map(([id, meta]) => (
                    <button key={id} type="button" onClick={() => changeStyle("density", id)} className={`rounded-cv-md border px-2 py-2 text-center transition-colors ${appearance.density === id ? "border-cv-primary-border bg-cv-primary-soft text-cv-primary" : "border-cv-border bg-cv-surface-soft text-cv-text-secondary hover:bg-cv-surface"}`}>
                      <span className="text-[9px] font-semibold">{meta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="px-2.5 mb-1.5 text-[9px] uppercase tracking-[0.12em] font-semibold text-cv-text-muted">Borders</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(CV_APPEARANCE_REGISTRY.border).map(([id, meta]) => (
                    <button key={id} type="button" onClick={() => changeStyle("border", id)} className={`rounded-cv-md border px-2.5 py-2 text-left transition-colors ${appearance.border === id ? "border-cv-primary-border bg-cv-primary-soft" : "border-cv-border bg-cv-surface-soft hover:bg-cv-surface"}`}>
                      <span className={`block text-[10px] font-semibold ${appearance.border === id ? "text-cv-primary" : "text-cv-text"}`}>{meta.label}</span>
                      <span className="block mt-0.5 text-[8px] text-cv-text-muted">{meta.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={resetStyle} className="w-full flex items-center justify-center gap-1.5 rounded-cv-md border border-cv-border bg-cv-surface-soft px-3 py-2 text-[10px] font-semibold text-cv-text-secondary hover:bg-cv-surface hover:text-cv-primary transition-colors">
                <RotateCcw className="w-3 h-3" />
                Reset style
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
