# CampusVoice Phase 10.8 — Mobile Discussions Experience

Implemented the mobile discussion experience on top of the existing discussion API.

## Included
- Mobile discussion discovery/list
- Search discussions
- Newest / Popular sorting
- Mobile discussion cards
- Upvoting via existing `voteDiscussion`
- Reply composer via existing `commentOnDiscussion`
- Expand/collapse replies
- Start Discussion mobile composer via existing `createDiscussion`
- Loading and empty states
- Mobile-friendly report affordance with explicit API limitation
- Create Hub → Start a Discussion integration
- Desktop `DiscussionCard` remains unchanged

## API reuse
- `fetchDiscussions()`
- `createDiscussion()`
- `commentOnDiscussion()`
- `voteDiscussion()`

No new backend endpoint was introduced.
