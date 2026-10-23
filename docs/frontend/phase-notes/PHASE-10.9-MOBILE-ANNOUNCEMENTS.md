# Phase 10.9 — Mobile Announcements Experience

Implemented a dedicated mobile announcements interaction model while preserving the existing desktop AnnouncementCard.

## Included
- Announcement feed with Active, Important, Acknowledged, Archived and All filters.
- Priority-aware announcement cards for normal, important, urgent and critical notices.
- Full announcement detail view.
- Author, publication date and optional expiry metadata.
- Expired/archive presentation when expiry fields are supplied by the backend.
- Optional attachments/files/documents rendering when present in announcement data.
- Optional CTA/action rendering when `cta`, `action`, `ctaLabel` or `ctaUrl` fields are supplied.
- Acknowledgement state persisted locally for the current browser. No backend acknowledgement endpoint was invented because the current service exposes only fetch/create/delete.
- Loading and empty states.
- Mobile refresh action.
- Existing announcements service and `fetchAnnouncements()` are reused.

## Integration
`App.jsx` renders `MobileAnnouncements` for mobile and keeps the existing `AnnouncementCard` for desktop.

## Backend compatibility
The component is defensive around optional fields and does not require new backend APIs.
