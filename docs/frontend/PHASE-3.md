# CampusVoice Design System — Phase 3

Phase 3 migrates the main student content cards to semantic CampusVoice design tokens while preserving application logic and semantic category/status meanings.

Migrated:
- IssueCard.jsx
- IssueFeed.jsx
- PollCard.jsx
- DiscussionCard.jsx
- AnnouncementCard.jsx

Also extended:
- design-system/tokens.css with stable category accent tokens
- tailwind.config.js with category token utilities

The component logic, service calls, props and data contracts are intentionally preserved. The visual system now responds to the active CampusVoice theme.
