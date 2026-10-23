import "./appearance.css";

export {
  CV_THEME_REGISTRY,
  CV_THEMES,
  DEFAULT_THEME,
  setTheme,
  getTheme,
  initializeTheme,
  getThemeDefinition,
} from "./themeRegistry.js";

export {
  CV_APPEARANCE_REGISTRY,
  CV_APPEARANCE_PRESETS,
  DEFAULT_APPEARANCE,
  getAppearance,
  setAppearance,
  setAppearancePreset,
  initializeAppearance,
} from "./appearanceRegistry.js";
