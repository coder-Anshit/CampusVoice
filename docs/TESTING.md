# Testing Checklist

Record actual results only after running each test.

## Build and startup
- [ ] Backend installs and starts in a clean environment.
- [ ] `/api/health` returns expected response.
- [ ] MongoDB connection succeeds without leaking credentials.
- [ ] Frontend dependencies install.
- [ ] `npm run build` succeeds.
- [ ] `npm test` results recorded.

## Authentication and permissions
- [ ] Student, admin and employee test accounts can log in as intended.
- [ ] Invalid credentials and missing/expired tokens are rejected.
- [ ] Wrong-role API calls are rejected by the backend.
- [ ] User provisioning and role changes are restricted and audited.

## Core product flows
- [ ] Create issue → feed → upvote/comment → assignment → resolution/verification.
- [ ] Create poll → vote → reload and verify persistence/order.
- [ ] Create discussion → comment/vote.
- [ ] Authorized announcement create/read/delete.
- [ ] Feedback draft → publish → student response → results.
- [ ] Employee task accept → start investigation → resolve.
- [ ] Workflow transitions and audit records remain consistent.

## Responsive UI
- [ ] Test desktop, tablet and mobile widths.
- [ ] Create chooser opens exactly one selected form.
- [ ] Dialogs fit viewport and scroll internally.
- [ ] Bottom navigation does not cover card actions.
- [ ] Keyboard focus, close and back controls work.

## Record template
| Date | Version | Test | Expected | Actual | Pass/Fail/Blocked | Evidence |
|---|---|---|---|---|---|---|
| | | | | | | |
