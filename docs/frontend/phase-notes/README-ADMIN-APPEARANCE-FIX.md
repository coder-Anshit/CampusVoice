# CampusVoice Frontend — Admin Appearance Integration Fix

This package is based on the uploaded Phase8.2 `frontend` source.

Fixed:
1. AdminPanel service imports now resolve from `src/services`.
2. AdminPanel component imports now resolve from `src`.
3. FeedbackFormBuilder import now points to `src/FeedbackFormBuilder.jsx`.
4. Removed the missing legacy `./Theme` dependency from AdminPanel.
5. AdminPanel.queueheader now uses the centralized `design-system/inline` SERIF token.
6. Preserved the existing Appearance Engine integration (`cv-admin-shell`, appearance registry/CSS).
7. Verified all relative imports in `src/` resolve to files present in this package.

Important:
- `node_modules` is intentionally not included.
- Run `npm install` (or `npm ci`) inside `frontend` before `npm start`.
