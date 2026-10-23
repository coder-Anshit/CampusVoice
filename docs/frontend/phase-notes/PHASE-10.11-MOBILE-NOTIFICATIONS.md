# Phase 10.11 — Mobile Notification Center

Implemented a dedicated mobile notification center for CampusVoice.

## Included
- Real notification fetch using the existing `fetchNotifications(username)` service.
- Unread/read states with unread badge synchronization.
- All / Unread / Issues / Polls / Discussions / Announcements / Tasks filters.
- Date grouping into Today, Yesterday and older dates.
- Relative timestamps.
- Priority presentation for important/urgent notifications.
- Mark single notification as read before deep navigation.
- Mark all notifications as read using the existing per-notification endpoint.
- Refresh and retry states.
- Deep-link navigation to existing mobile tabs based on notification entity/category.
- Mobile-specific empty, loading and error states.

## Backend boundary
The current notification service exposes fetching by username and a per-notification `PATCH /notifications/:id/read` action. No bulk-read or notification preference endpoint was invented. Mark-all therefore calls the existing per-notification operation for known unread notifications.
