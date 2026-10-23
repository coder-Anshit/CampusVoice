# CampusVoice Design System — Phase 8.1

## Theme UX Consistency & Persistence Patch

Phase 8.1 addresses three user-facing theme issues found during live verification:

1. Added the shared Appearance picker to the Admin Dashboard.
2. Added the shared Appearance picker to the Employee Dashboard.
3. Fixed student logout so the selected `cv-theme` is preserved across logout/login sessions.

### Architecture

- New shared component: `src/ThemePicker.jsx`
- Theme source of truth remains `src/design-system/index.js`
- All themes continue to use the centralized CSS token system.
- Authentication logout clears only authentication keys (`token`, `username`, `role`).
- `cv-theme` remains in localStorage and is initialized before React renders.

### Verification notes

The source patch was statically inspected. A dependency install/build could not be completed in the audit environment because `npm install` timed out; therefore the package should be live-tested with `npm start` in the user's local project.
