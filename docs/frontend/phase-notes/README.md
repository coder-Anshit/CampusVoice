# CampusVoice Frontend — Design System

CampusVoice uses a centralized semantic design system for application surfaces, typography, semantic states, category accents, radii, shadows and theme switching.

## Design-system files

- `src/design-system/tokens.css`
- `src/design-system/themes.css`
- `src/design-system/typography.css`
- `src/design-system/index.js`
- `src/design-system/inline.js`
- `src/tailwind.config.js`

## Themes

- Lavender
- Sage
- Ocean
- Rose
- Midnight

Theme selection is stored in `localStorage` under `cv-theme`.

```js
import { setTheme } from "./design-system";

setTheme("sage");
```

## Semantic Tailwind examples

```jsx
<div className="bg-cv-surface border-cv-border text-cv-text">
```

```jsx
<button className="bg-cv-primary hover:bg-cv-primary-hover">
```

```jsx
<div className="rounded-cv-lg shadow-cv-card">
```

## Phase 8 architecture

- `src/*.jsx` is the canonical component layer.
- Duplicate legacy component copies were removed after import-graph verification.
- `App.jsx` is the single application component entry.
- Theme initialization happens before React mounts.
- Active source contains no hard-coded hex colors.
- Active source uses semantic `cv-*` tokens for application chrome and states.

See `PHASE-8.md` for the full audit record.
