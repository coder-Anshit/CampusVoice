# API Route Inventory

Source-derived route list. This is not a full OpenAPI contract; authentication, roles, payloads, responses and error semantics require handler-level verification.

| Domain | Route prefix | Examples found in source |
|---|---|---|
| Health/auth | `/api/health`, `/api/auth` | `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/change-password` |
| Issues | `/api/issues` | list/create, my issues, upvote, comment/reply, view/report, assign/status, verify/close |
| Polls | `/api/polls` | list/create, vote, delete |
| Discussions | `/api/discussions` | list/create, comment, vote, delete |
| Announcements | `/api/announcements` | list/create, delete |
| Feedback | `/api/feedback` | forms, publish/close, responses, statistics, categories, student forms, results |
| Tasks | `/api/tasks` | list, my tasks, details, accept, start, resolve |
| Users | `/api/users` | list, pilot/provision, update, hierarchy |
| Audit/dashboard | `/api/audit`, `/api/dashboard` | list/read endpoints |
| Departments/positions | `/api/departments`, `/api/positions` | list/create/update/disable |
| Escalations/SLA | `/api/escalations`, `/api/sla` | escalation listing, rules, checks, scheduler test |
| Notifications | `/api/notifications` | user notifications, mark read |
| Workflow/approvals | `/api/workflow_templates`, `/api/approvals` | list/create templates, pending approvals, approve |

## Wiring caveats
- The source archive contains a work-items route module, but initial inspection did not find its blueprint registration in the main application entry point.
- A leave-request module exists, but no route decorators were found during initial inspection.
- Verify route registration and permission checks before relying on any endpoint.
