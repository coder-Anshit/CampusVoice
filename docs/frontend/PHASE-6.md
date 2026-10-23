# Phase 6 — Admin / Faculty Surface Migration

## Scope
Migrated the supplied AdminPanel ecosystem and its directly associated creation/workflow components.

## Migrated
- AdminPanel
- TopBar / TabNav
- Search + Filter
- Queue Header / Attention Panel
- Issue Rows / Status actions
- Issue Details modal
- Admin analytics
- Poll creator
- Shared admin/feedback components
- Create Announcement
- Create Discussion
- Workflow Modal

## Architecture result

Before:
`Admin components -> Theme.js / Theme.*.js -> hard-coded palette`

After:
`Admin components -> semantic cv-* tokens -> active CampusVoice theme`

The old role names (moss, ochre, brick, steel) are no longer component-level dependencies. They now resolve to the global semantic roles:
- primary
- success
- warning
- danger
- info
- surface / text / border

## Preserved behavior

No service/API architecture was intentionally changed. Existing issue lifecycle, assignment, workflow, filtering, sorting, analytics, polls, feedback administration, announcements, discussions, delete/close actions, loading states, and modal behavior remain in place.

## Legacy theme files

The supplied `Theme.js` and four alternate theme files are intentionally excluded from the Phase 6 package because the supplied migrated components no longer depend on them.

Before deleting those files from the live project, search the entire source tree for:
- `from "./Theme"`
- `from "./Theme.`
- `from "../adminpanel/Theme"`
- `from "./adminpanel/Theme"`

Any remaining imports should be migrated first.

## Installation

Copy the Phase 6 component files into their corresponding existing locations under `src/components/` and `src/components/adminpanel/`.

Keep the Phase 5 design-system files and replace `tailwind.config.js` with the included version.

`design-system/inline.js` is new in Phase 6 and must be copied to `src/design-system/inline.js`.
