# Phase 10.13 — Mobile Admin Experience

Implemented a dedicated mobile administrative command center while preserving the existing desktop AdminPanel.

## Included
- Mobile admin shell with role-aware context
- Command-center metrics: total, pending, attention, resolved+
- Needs-attention queue
- Mobile issue queue with search and status filters
- Mobile issue detail view
- Workflow actions using existing issue APIs: approve, reject, status transition, close
- Loading, empty, refresh and error feedback states
- Touch-friendly cards and controls
- Existing Appearance/Design System primitives reused

## Architecture
Desktop AdminPanel remains unchanged and is rendered only at desktop widths. Mobile admin is a separate interaction model and uses existing backend services.

## Backend constraint
No new endpoints were invented. Actions use the existing issue service methods already present in CampusVoice.
