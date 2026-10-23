# CampusVoice Design System — Phase 8.2

## Theme Registry + Preset Architecture

Phase 8.2 makes the theme system registry-driven. The source of truth is:

`frontend/src/design-system/themeRegistry.js`

### What changed
- Added `CV_THEME_REGISTRY` with metadata + semantic CSS variables per theme.
- `setTheme()` now applies theme variables directly and persists `cv-theme`.
- Added `getThemeDefinition()` for future settings/admin/tenant integrations.
- Theme changes dispatch `cv-theme-change` for cross-surface synchronization.
- ThemePicker reads directly from the registry; no hard-coded theme list/icons.
- Added four new presets: Forest, Graphite, Sunset, Arctic.
- Existing Lavender, Sage, Ocean, Rose and Midnight remain available.
- Midnight sets `color-scheme: dark`; all other presets use light color scheme.

## Adding a future theme
Only edit `themeRegistry.js`. Add one object under `CV_THEME_REGISTRY` with:
- `label`
- `description`
- `icon`
- `preview`
- `variables`
- optional `colorScheme: "dark"`

No component changes are required.

## Persistence
The selected theme is stored in `localStorage` under `cv-theme`, so login/logout should not reset it.

## Package usage
This package is cumulative from Phase 8.1. Replace the Phase 8.1 `frontend` with this `frontend` and keep your existing backend `.env`. Existing `node_modules` can be reused; no dependency changes were introduced.
