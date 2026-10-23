// CampusVoice Appearance Registry
// Visual style preferences are independent from color themes.

const APPEARANCE_KEY = "cv-appearance";

export const CV_APPEARANCE_REGISTRY = {
  shape: {
    sharp: { label: "Sharp", description: "Crisp and structured", radiusCard: "6px", radiusPanel: "8px", radiusControl: "6px", radiusPill: "999px" },
    compact: { label: "Compact", description: "Tight and efficient", radiusCard: "10px", radiusPanel: "10px", radiusControl: "8px", radiusPill: "999px" },
    soft: { label: "Soft", description: "Balanced and calm", radiusCard: "14px", radiusPanel: "14px", radiusControl: "10px", radiusPill: "999px" },
    rounded: { label: "Rounded", description: "Modern SaaS feel", radiusCard: "18px", radiusPanel: "16px", radiusControl: "12px", radiusPill: "999px" },
    friendly: { label: "Friendly", description: "Soft and expressive", radiusCard: "24px", radiusPanel: "20px", radiusControl: "14px", radiusPill: "999px" },
  },
  depth: {
    flat: { label: "Flat", description: "Clean, no elevation", card: "none", panel: "none", popover: "none" },
    subtle: { label: "Subtle", description: "Quiet separation", card: "0 2px 8px rgb(0 0 0 / 0.05)", panel: "0 1px 5px rgb(0 0 0 / 0.04)", popover: "0 12px 30px rgb(0 0 0 / 0.12)" },
    elevated: { label: "Elevated", description: "Clear hierarchy", card: "0 6px 18px rgb(0 0 0 / 0.08)", panel: "0 3px 12px rgb(0 0 0 / 0.06)", popover: "0 16px 38px rgb(0 0 0 / 0.16)" },
    floating: { label: "Floating", description: "Pronounced depth", card: "0 10px 28px rgb(0 0 0 / 0.11)", panel: "0 6px 18px rgb(0 0 0 / 0.08)", popover: "0 20px 48px rgb(0 0 0 / 0.20)" },
  },
  density: {
    compact: { label: "Compact", description: "More information per screen", scale: "0.88" },
    comfortable: { label: "Comfortable", description: "Balanced spacing", scale: "1" },
    spacious: { label: "Spacious", description: "More breathing room", scale: "1.12" },
  },
  border: {
    none: { label: "None", description: "Minimal visual boundaries", width: "0px", opacity: "0" },
    subtle: { label: "Subtle", description: "Light separation", width: "1px", opacity: "0.65" },
    standard: { label: "Standard", description: "Clear boundaries", width: "1px", opacity: "1" },
    strong: { label: "Strong", description: "Defined structure", width: "1.5px", opacity: "1" },
  },
};

export const DEFAULT_APPEARANCE = {
  shape: "soft",
  depth: "subtle",
  density: "comfortable",
  border: "standard",
};

export const CV_APPEARANCE_PRESETS = {
  classic: { label: "CampusVoice Classic", description: "Calm, balanced and familiar", ...DEFAULT_APPEARANCE },
  executive: { label: "Executive", description: "Compact, sharp and restrained", shape: "compact", depth: "flat", density: "compact", border: "subtle" },
  modern: { label: "Modern", description: "Rounded with clear elevation", shape: "rounded", depth: "elevated", density: "comfortable", border: "subtle" },
  calm: { label: "Calm", description: "Soft, spacious and quiet", shape: "friendly", depth: "subtle", density: "spacious", border: "subtle" },
  professionalDark: { label: "Dark Professional", description: "Compact and focused", shape: "soft", depth: "flat", density: "compact", border: "standard" },
};

function normalizeAppearance(value) {
  const next = { ...DEFAULT_APPEARANCE, ...(value || {}) };
  Object.keys(DEFAULT_APPEARANCE).forEach((key) => {
    if (!CV_APPEARANCE_REGISTRY[key]?.[next[key]]) next[key] = DEFAULT_APPEARANCE[key];
  });
  return next;
}

function applyAppearanceVariables(appearance) {
  const root = document.documentElement;
  const shape = CV_APPEARANCE_REGISTRY.shape[appearance.shape];
  const depth = CV_APPEARANCE_REGISTRY.depth[appearance.depth];
  const density = CV_APPEARANCE_REGISTRY.density[appearance.density];
  const border = CV_APPEARANCE_REGISTRY.border[appearance.border];

  root.style.setProperty("--cv-radius-card", shape.radiusCard);
  root.style.setProperty("--cv-radius-panel", shape.radiusPanel);
  root.style.setProperty("--cv-radius-control", shape.radiusControl);
  root.style.setProperty("--cv-radius-pill", shape.radiusPill);
  root.style.setProperty("--cv-shadow-card", depth.card);
  root.style.setProperty("--cv-shadow-panel", depth.panel);
  root.style.setProperty("--cv-shadow-popover", depth.popover);
  root.style.setProperty("--cv-density-scale", density.scale);
  root.style.setProperty("--cv-border-width", border.width);
  root.style.setProperty("--cv-border-opacity", border.opacity);

  root.dataset.cvShape = appearance.shape;
  root.dataset.cvDepth = appearance.depth;
  root.dataset.cvDensity = appearance.density;
  root.dataset.cvBorder = appearance.border;
}

export function getAppearance() {
  try {
    const stored = JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "null");
    return normalizeAppearance(stored);
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function setAppearance(partial) {
  const next = normalizeAppearance({ ...getAppearance(), ...partial });
  applyAppearanceVariables(next);
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("cv-appearance-change", { detail: next }));
  return next;
}

export function setAppearancePreset(presetId) {
  const preset = CV_APPEARANCE_PRESETS[presetId];
  if (!preset) return getAppearance();
  return setAppearance(preset);
}

export function initializeAppearance() {
  applyAppearanceVariables(getAppearance());
}
