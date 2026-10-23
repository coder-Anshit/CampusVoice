# CampusVoice Frontend

The frontend now uses the canonical root-level component structure and the centralized `src/design-system/` tokens.

Key design-system files:
- `design-system/tokens.css`
- `design-system/themes.css`
- `design-system/typography.css`
- `design-system/index.js`
- `design-system/inline.js`

Canonical UI components live directly under `src/`, including the student, employee, admin and feedback surfaces.

The obsolete duplicate `src/components/` tree was removed during Phase 8 after verifying there were no runtime imports remaining.
