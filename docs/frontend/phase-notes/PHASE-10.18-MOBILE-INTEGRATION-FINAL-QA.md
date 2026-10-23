# Phase 10.18 — Mobile Integration & Final QA

## Purpose
Bring the Phase 10 mobile system together and verify cross-feature behavior instead of adding another isolated screen.

## Integrated flows
- Authentication → mobile shell → role-aware navigation
- Home → Issues → Issue detail → back
- Home → Polls → vote → result state
- Home → Discussions → reply/create flow
- Home → Announcements → detail/acknowledgement state
- Home → Feedback → form → submission
- Alerts → deep link → target feature
- Profile → appearance/preferences → persistence
- Admin → queue → issue workflow action
- Create hub → issue/discussion/feedback entry points
- Pull-to-refresh → centralized mobile data refresh
- Offline/online transitions → visible connectivity status
- Overlay → focus → close → focus restoration

## Phase 10.18 implementation
### 1. Centralized mobile refresh
`MobileAppShell` now accepts `onRefresh`. Pull-to-refresh invokes the application-level refresh orchestration rather than relying only on a DOM event.

`App.jsx` provides `refreshMobileData()`, which refreshes issues, polls, announcements, discussions and the signed-in user's issues using `Promise.allSettled()` so one failed request does not block the others.

### 2. Connectivity feedback
Added `MobileConnectivityBanner`:
- detects browser online/offline events
- displays an offline warning
- briefly confirms recovery when connection returns
- uses `role="status"` and `aria-live="polite"`
- respects reduced-motion settings

### 3. Existing safeguards retained
- lazy-loaded feature screens
- mobile feature error boundary
- Suspense fallback
- overlay focus handling
- safe-area support
- accessibility skip link/live region
- responsive CSS tokens
- reduced-motion support

## QA matrix
| Area | 320 | 360 | 390 | 414 | 768 | 1024 |
|---|---|---|---|---|---|---|
| Header/search | □ | □ | □ | □ | □ | □ |
| Bottom navigation | □ | □ | □ | □ | □ | □ |
| Home | □ | □ | □ | □ | □ | □ |
| Issues/detail | □ | □ | □ | □ | □ | □ |
| Polls | □ | □ | □ | □ | □ | □ |
| Discussions | □ | □ | □ | □ | □ | □ |
| Announcements | □ | □ | □ | □ | □ | □ |
| Feedback | □ | □ | □ | □ | □ | □ |
| Notifications | □ | □ | □ | □ | □ | □ |
| Profile | □ | □ | □ | □ | □ | □ |
| Admin | □ | □ | □ | □ | □ | □ |
| Overlays | □ | □ | □ | □ | □ | □ |

## Cross-feature acceptance checklist
- [ ] No horizontal page overflow
- [ ] Back navigation returns to the correct parent screen
- [ ] Create Hub closes after action selection
- [ ] Notification deep links select the expected tab
- [ ] Unread badge updates after notification state changes
- [ ] Pull-to-refresh refreshes all core mobile data
- [ ] One failed API request does not prevent other refreshes
- [ ] Offline banner appears when network is unavailable
- [ ] Recovery banner disappears after reconnection
- [ ] Overlay focus returns to the trigger
- [ ] Escape closes dismissible overlays
- [ ] Reduced motion is respected
- [ ] Keyboard focus is visible
- [ ] Touch targets remain at least 44px
- [ ] Text remains usable at increased font size
- [ ] Empty/loading/error states remain actionable

## Production verification still required
This document is a QA plan, not a claim that real-device/browser testing has passed. Final verification should be run with the project installed in a browser/device test environment at the listed viewport sizes and with representative API success/failure responses.
