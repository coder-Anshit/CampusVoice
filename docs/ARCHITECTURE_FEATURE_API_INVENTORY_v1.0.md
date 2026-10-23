# CampusVoice — Architecture, Feature & API Inventory v1.0
**Date:** 11 October 2026  
**Source reviewed:** `CampusVoice_4.0.zip` → primary tree `CampusVoice_4.0/`  
**Method:** Static source inspection. No app runtime, build, tests or live database was used.

> **Important:** This is a source-derived inventory, not a guarantee that every endpoint or feature works. Any point not verified by running the application is labelled accordingly.

## 1. Canonical-source decision

For this documentation pass, `CampusVoice_4.0/` is the **provisional primary tree** because it is the archive's named project root and contains more files than `CampusVoice_Design_System_Phase8.2/`. This is not proof that it matches the user's currently running local version.

Comparison of the two trees found:
- 208 shared relative paths
- 165 byte-identical files
- 43 differing files

The differing files include core app composition, student/admin/employee dashboards, feedback builder, mobile experiences, issue/poll/discussion API clients and backend route/service files. The secondary tree should therefore be retained as a comparison reference until the user confirms which one matches the latest working build.

## 2. Architecture from the source

```text
React browser application
  ├─ app/App.jsx                 Application composition
  ├─ features/
  │   ├─ auth/                   Authentication UI
  │   ├─ student/                Student dashboard and profile
  │   ├─ admin/                  Administration and issue queue
  │   ├─ employee/               Assigned-work experience
  │   ├─ issues/                 Issue feed, cards and creation
  │   ├─ community/              Polls, discussions, announcements
  │   ├─ feedback/               Feedback form builder and response UI
  │   └─ workflow/               Workflow-related UI
  └─ shared/
      ├─ services/               HTTP/API clients
      ├─ components/             Shared UI
      ├─ mobile/                 Mobile shell and mobile experiences
      ├─ design-system/          Shared visual system
      └─ lib/performance/        Shared utilities/performance code
              |
              | HTTP API (frontend env: REACT_APP_API_URL)
              v
Flask backend
  ├─ app.py                      Application and some inline routes
  ├─ routes/                     Domain blueprints
  ├─ services/                   Business logic and workflow services
  ├─ middleware/                 Authentication/role middleware
  ├─ database/mongo.py           MongoDB connection and collections
  └─ utils/                      Serialization and helper functions
              |
              v
MongoDB database (default DB name: campusvoice)
```

### Technology evidenced in package/config files
- Frontend: React, React Scripts, Tailwind CSS, Axios, Framer Motion, Lucide React, Radix UI Dialog/Dropdown Menu and Sonner.
- Backend: Flask, Flask-CORS, Flask-Bcrypt, PyJWT, PyMongo, python-dotenv and BSON/ObjectId utilities are referenced in source/configuration.
- Database: MongoDB, with database name defaulting to `campusvoice`.
- Frontend local API setting: `http://127.0.0.1:5000/api`.

The package file has `start`, `build` and `test` scripts. They have **not** been run as part of this audit.

## 3. MongoDB collection names referenced by the connection module

`backend/database/mongo.py` defines these collections:

- `issues`
- `polls`
- `announcements`
- `discussions`
- `users`
- `tasks`
- `audit_logs`
- `departments`
- `escalation_rules`
- `escalation_logs`
- `positions`
- `sla_rules`
- `sla_violations`
- `escalations`
- `notifications`
- `notification_templates`
- `work_items`
- `workflow_templates`
- `workflow_instances`
- `approvals`

These are collection handles defined by source code. This does **not** prove that every collection currently exists in the live MongoDB database. A collection may be created lazily when data is first inserted.

## 4. Backend API inventory

The paths below are composed from the blueprint prefixes and route decorators in the primary tree. Auth requirements, role permissions, validation and actual response schemas still require endpoint-by-endpoint verification.

### Authentication — inline in `backend/app.py`
| Method | Path |
|---|---|
| POST | `/api/auth/login` |
| POST | `/api/auth/change-password` |

### Issues — `/api/issues`
| Method | Path |
|---|---|
| GET | `/api/issues/` |
| POST | `/api/issues/` |
| GET | `/api/issues/my` |
| POST | `/api/issues/<id>/upvote` |
| POST | `/api/issues/<id>/comment` |
| POST | `/api/issues/<issue_id>/reply/<comment_id>` |
| POST | `/api/issues/<id>/report` |
| POST | `/api/issues/<id>/view` |
| DELETE | `/api/issues/<id>` |
| PATCH | `/api/issues/<id>/assign` |
| PATCH | `/api/issues/<id>/status` |
| POST | `/api/issues/<id>/verify` |
| PATCH | `/api/issues/<id>/close` |

### Polls — `/api/polls`
| Method | Path |
|---|---|
| GET | `/api/polls/` |
| POST | `/api/polls/` |
| POST | `/api/polls/<id>/vote` |
| DELETE | `/api/polls/<id>` |

### Announcements — `/api/announcements` (inline blueprint in `app.py`)
| Method | Path |
|---|---|
| GET | `/api/announcements/` |
| POST | `/api/announcements/` |
| DELETE | `/api/announcements/<id>` |

### Discussions — `/api/discussions` (inline blueprint in `app.py`)
| Method | Path |
|---|---|
| GET | `/api/discussions/` |
| POST | `/api/discussions/` |
| POST | `/api/discussions/<id>/comment` |
| POST | `/api/discussions/<id>/vote` |
| DELETE | `/api/discussions/<id>` |

### Feedback — `/api/feedback`
| Method | Path |
|---|---|
| GET | `/api/feedback/forms` |
| GET | `/api/feedback/forms/<form_id>` |
| POST | `/api/feedback/forms` |
| PATCH | `/api/feedback/forms/<form_id>/publish` |
| PATCH | `/api/feedback/forms/<form_id>/close` |
| GET | `/api/feedback/forms/<form_id>/responses` |
| GET | `/api/feedback/forms/<form_id>/statistics` |
| GET | `/api/feedback/forms/<form_id>/response-count` |
| POST | `/api/feedback/forms/<form_id>/categories` |
| GET | `/api/feedback/forms/<form_id>/categories` |
| PATCH | `/api/feedback/forms/<form_id>/categories/<category_id>` |
| POST | `/api/feedback/forms/<form_id>/categories/<category_id>/responses` |
| DELETE | `/api/feedback/forms/<form_id>/categories/<category_id>/responses` |
| GET | `/api/feedback/student/forms` |
| GET | `/api/feedback/active` |
| GET | `/api/feedback/active/<form_id>` |
| POST | `/api/feedback/forms/<form_id>/responses` |
| GET | `/api/feedback/forms/<form_id>/my-response` |
| GET | `/api/feedback/forms/<form_id>/results` |

### Tasks — `/api/tasks`
| Method | Path |
|---|---|
| GET | `/api/tasks/` |
| GET | `/api/tasks/my` |
| GET | `/api/tasks/<task_id>` |
| PATCH | `/api/tasks/<task_id>/accept` |
| PATCH | `/api/tasks/<task_id>/start` |
| PATCH | `/api/tasks/<task_id>/resolve` |

### Users — `/api/users`
| Method | Path |
|---|---|
| GET | `/api/users/` |
| POST | `/api/users/pilot` |
| POST | `/api/users/provision` |
| PATCH | `/api/users/<id>` |
| GET | `/api/users/hierarchy/<id>` |

### Other blueprints
| Prefix | Methods and paths in decorators |
|---|---|
| `/api/audit` | GET `/` |
| `/api/dashboard` | GET `/` |
| `/api/departments` | GET `/`, POST `/` |
| `/api/escalations` | GET `/` |
| `/api/notifications` | GET `/<user_id>`, PATCH `/<id>/read` |
| `/api/positions` | GET `/`, POST `/`, PATCH `/<id>`, PATCH `/<id>/disable` |
| `/api/sla` | GET `/rules`, POST `/rules`, POST `/check`, POST `/scheduler-test` |
| `/api/workflow_templates` | GET `/`, POST `/` |
| `/api/approvals` | GET `/pending/<user_id>`, POST `/<approval_id>/approve` |
| `/api/leave-requests` | No route decorators found in the inspected module |
| `/api/workitems` | Route file contains POST `/`, but the inspected `app.py` does not appear to import/register its blueprint |

The last two items are audit findings, not necessarily runtime bugs: routes could be defined elsewhere or the files may be placeholders. They should be checked before documenting these areas as available API endpoints. The health endpoint `/api/health` is defined inline in `app.py`.

## 5. Feature inventory and confidence

| Feature area | Source evidence | Current documentation status |
|---|---|---|
| Authentication | Login/change-password routes, auth UI and middleware | Implemented in source; needs runtime and permission tests |
| Issues/grievances | Issue UI, routes and workflow services | Implemented in source; needs end-to-end tests |
| Polls | Poll UI, API routes and Mongo collection | Implemented in source; needs create/vote tests |
| Discussions | Discussion UI, inline routes and collection | Implemented in source; needs create/comment/vote tests |
| Announcements | UI, inline routes and collection | Implemented in source; needs create/read/delete and role checks |
| Feedback forms | Builder, student-facing UI, routes and service | Implemented in source; needs create/publish/respond/results tests |
| Employee tasks | Employee UI and task endpoints | Implemented in source; investigate/start/resolve transitions need tests |
| Notifications | UI/service references and routes | Implemented in source; needs role/recipient and read-state tests |
| Audit/SLA/escalation | Routes and services | Implemented in source; needs policy and integration tests |
| Workflow templates/approvals | Routes, services and UI references | Implemented in source; needs lifecycle tests |
| Mobile experiences | Mobile components and phase notes | Implemented in source; responsive interactions need device-size tests |
| Analytics/dashboard | Dashboard and analytics components/routes | Implemented in source; needs data correctness tests |

No row is labelled “Verified working” because no runtime test was performed.

## 6. Documentation and implementation gaps to resolve

1. **Blueprint registration check:** inspect whether `/api/workitems` is intentionally unregistered and whether leave-request routes are intentionally empty.
2. **Route contracts:** document request payloads, response JSON, status codes and permission requirements from each handler.
3. **Authentication and RBAC:** verify every sensitive endpoint, especially issue assignment/status, user provisioning, feedback management, polls and announcements.
4. **Workflow transitions:** confirm the allowed state machine and test the employee “start investigation” action that was previously reported as erroring.
5. **Feedback workflow:** test create form, save draft, publish, student submission and results.
6. **Error handling:** confirm consistent error responses and avoid exposing internal exceptions.
7. **Database schemas:** document fields and indexes from actual inserts/queries, not only collection names.
8. **UI status:** test the latest desktop/mobile Create flows and make sure screenshots reflect the current build.

## 7. Recommended test matrix before the magazine

| Test | Actor | Evidence to record |
|---|---|---|
| Login and logout | Student/admin/employee | Result, response status, screenshot with no personal data |
| Create issue | Student | Created record and visible feed item |
| Assign issue | Admin | Assignment and audit/workflow state |
| Accept/start investigation | Employee | State before/after and response body |
| Resolve and verify | Employee/student | State transition and verification result |
| Create and vote on poll | Admin/student | Poll appears in expected sort order and vote persists |
| Create discussion and comment | Student | Discussion and comment persist |
| Create announcement | Authorized staff/admin | Visibility and permission enforcement |
| Create/publish feedback form | Admin | Draft/published states |
| Submit feedback | Student | Response count and result behavior |
| RBAC negative tests | Wrong-role users | Request denied as expected |
| Mobile Create flow | Student/admin/employee | Correct chooser → correct single form; no nested chooser |
| Frontend production build | Developer | Exit code and build output |
| Backend import/health smoke test | Developer | Health response and safe configuration |

## 8. Conclusion

The primary source tree has a modular frontend, Flask route/service backend and a MongoDB connection boundary. The code contains broad institutional-community and workflow capabilities. However, the audit also found route-registration questions and unresolved differences between the two project trees.

**Next step:** produce a code-derived API contract and database schema reference, then run the controlled test matrix. Keep the original ZIP untouched and do not publish until the canonical tree, secrets and runtime status have been checked.
