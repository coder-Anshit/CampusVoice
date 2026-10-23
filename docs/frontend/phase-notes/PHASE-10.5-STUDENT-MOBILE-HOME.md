# Phase 10.5 — Student Mobile Home

Implemented the student-first mobile home experience on top of the existing CampusVoice data/services.

## Home structure

1. Identity / welcome context
2. Quick actions — Report Issue, View Polls
3. Important announcement
4. My active issues
5. Campus polls horizontal rail
6. Discussions
7. Campus updates
8. Explore CampusVoice CTA

## Integration

- Reuses existing issues, polls, announcements and discussions state from `App.jsx`.
- Reuses existing `addIssue` flow through the current `PostIssueModal`.
- Uses Phase 10.2 mobile primitives and appearance tokens.
- No new backend endpoints were introduced.
- Desktop `StudentDashboard` remains unchanged.

## Responsive intent

The component is rendered only inside the existing mobile shell. Desktop continues using the existing dashboard implementation.
