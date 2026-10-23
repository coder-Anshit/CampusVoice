# Phase 10.12 — Mobile Profile & Account Experience

Implemented a dedicated mobile profile surface without changing the desktop dashboard.

## Included
- Identity and role context
- Activity summary for issues, polls and discussions
- Notification preferences persisted locally
- Theme selection using the existing CampusVoice theme registry
- Appearance controls using the existing appearance engine
- Role/access information
- Sign-out action
- Mobile-safe, touch-friendly controls

## Architecture
`MobileAppShell → Profile → Activity / Preferences / Appearance / Account`

## Data contract
No new backend endpoint was added. Existing app data is used for activity summaries. Notification preference and appearance settings are local client preferences until dedicated backend preference APIs exist.
