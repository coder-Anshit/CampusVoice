# Project Status

**Status date:** 11 October 2026  
**Evidence:** static inspection of the supplied archive; no runtime tests performed.

## Current state

- The archive contains React frontend and Flask backend source.
- MongoDB connection/configuration code and multiple domain collections are referenced.
- UI and API code exists for issues, polls, discussions, announcements, feedback and workflow-related modules.
- Mobile-specific experiences and prior implementation notes are present.
- Two overlapping project trees were found in the supplied archive, with 43 differing shared-path files. The canonical tree must be confirmed before publishing.

## Unverified / open items

- Frontend production build and test suite.
- Backend startup and health endpoint.
- Auth and role-based permission enforcement.
- Issue lifecycle and vote persistence.
- Poll creation, ordering and vote persistence.
- Feedback draft → publish → student response → results.
- Employee start-investigation action previously reported as erroring.
- Route registration for work-items and the intended status of leave-request routes.
- Responsive Create flow and bottom-navigation overlap.
- Secret scan of all files and Git history.

## Release gates

- [ ] Canonical source tree confirmed.
- [ ] No secrets or real user data in tracked files.
- [ ] Generated files and backups excluded.
- [ ] Frontend build result recorded.
- [ ] Backend smoke-test result recorded.
- [ ] Core role and workflow tests recorded.
- [ ] Documentation reconciled with actual behaviour.
- [ ] License decision made.
