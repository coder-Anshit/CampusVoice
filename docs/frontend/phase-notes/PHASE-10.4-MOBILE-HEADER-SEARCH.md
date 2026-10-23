# CampusVoice — Phase 10.4 Mobile Header + Search

## Goal
Create a compact, context-aware mobile header and a real mobile search surface while preserving the existing CampusVoice search state and business logic.

## Delivered
- Context-aware header subtitle based on the current mobile tab.
- 44px touch-target controls through the existing responsive tokens.
- Search mode with keyboard focus and Escape-to-close behavior.
- Search submission through the existing `searchQuery` state.
- Search scopes: All, Issues, Discussions, Polls, Announcements.
- Recent searches persisted locally (maximum five).
- One-tap suggested searches.
- Clear search and clear recent-search actions.
- Search result handoff callback: `onSearchSubmit({ query, scope })`.
- Scope handoff callback: `onSearchScopeChange(scope)`.
- Notification badge remains visible and accessible.
- Existing appearance engine tokens continue to control surfaces, radii, borders and typography.
- Added the missing mobile loading spinner styles from Phase 10.2.

## Architecture

MobileAppShell
→ MobileHeader
→ Search surface
→ Search query + scope
→ existing App search state/business logic

The header does not create a second search system or duplicate backend services.

## Notes
The filter icon is intentionally a UI entry point for the next search/filter integration; no new backend filtering behavior is invented in this phase.
