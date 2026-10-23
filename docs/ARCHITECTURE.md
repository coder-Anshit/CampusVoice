# CampusVoice Architecture

## Product structure

CampusVoice is organized as a modular product rather than a collection of page files.
The frontend is feature-oriented: each business capability owns its pages and components,
while shared UI, design tokens, mobile primitives and API clients live under `shared/`.

```text
CampusVoice/
├── backend/
│   ├── database/          # Mongo connection and collections
│   ├── middleware/        # Authentication / authorization
│   ├── routes/            # HTTP API by domain
│   ├── services/          # Business logic and workflow engines
│   └── utils/             # Serialization and common helpers
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/            # Application composition / entry screen
│   │   ├── features/
│   │   │   ├── admin/      # Admin command center
│   │   │   ├── auth/       # Authentication screens
│   │   │   ├── community/  # Polls, discussions, announcements
│   │   │   ├── employee/   # Employee work queue
│   │   │   ├── feedback/   # Student + admin feedback workflows
│   │   │   ├── issues/     # Grievance feed and issue UI
│   │   │   ├── student/    # Student workspace
│   │   │   └── workflow/   # Cross-role workflow UI
│   │   ├── shared/
│   │   │   ├── assets/
│   │   │   ├── components/ # Product-wide UI
│   │   │   ├── design-system/
│   │   │   ├── mobile/     # Mobile shell, primitives and gestures
│   │   │   ├── services/   # API clients
│   │   │   ├── performance/
│   │   │   └── lib/
│   │   ├── index.js        # CRA bootstrap only
│   │   └── index.css       # Global styles only
│   └── tailwind.config.js
│
└── docs/
    └── ...                 # Phase and architecture documentation
```

## Grievance workflow

```text
Student submits
      ↓
Pending / New
      ↓
Admin review or direct assignment
      ↓
Assigned
      ↓
Employee accepts
      ↓
Investigating
      ↓
Resolved + resolution note
      ↓
Student satisfaction gate
   ↙                    ↘
Close                 Escalate
```

The workflow state machine is defined in `backend/services/workflow_service.py`.
The task lifecycle is owned by `backend/routes/tasks.py` and `backend/services/task_service.py`.
The frontend should render actions available to the current role and current state rather
than exposing every possible transition.

## Rules for future development

1. Keep API calls in `shared/services` or a feature service module.
2. Keep reusable UI in `shared/components`.
3. Keep business-specific UI inside its feature directory.
4. Keep workflow rules in backend services, not in React components.
5. Do not call student-only `/api/issues/my` from admin or employee experiences.
6. Do not use page reloads after mutations; refresh the relevant data source instead.
7. Do not place secrets in the repository. Use `.env.example` for documentation.
