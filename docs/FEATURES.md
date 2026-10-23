# Feature Inventory

This list is based on source/UI inspection, not runtime testing.

| Feature | Source evidence | Status |
|---|---|---|
| Issues/grievances | Frontend UI and backend routes/services | Present in source; needs end-to-end testing |
| Polls | UI and `/api/polls` routes | Present in source; needs create/vote testing |
| Discussions | UI and `/api/discussions` routes | Present in source; needs create/comment/vote testing |
| Announcements | UI and `/api/announcements` routes | Present in source; role permissions need testing |
| Feedback forms | Builder UI and `/api/feedback` routes | Present in source; draft/publish/respond/results need testing |
| Student workspace | Student dashboard and mobile components | Present in source; responsive testing needed |
| Administrator workspace | Admin dashboard and user/workflow UI | Present in source; permissions and actions need testing |
| Employee workspace | Employee dashboard and task actions | Present in source; investigate/start/resolve need testing |
| Tasks and workflow | Task, approval, SLA, escalation and workflow services | Present in source; lifecycle tests needed |
| Audit and notifications | Backend modules and routes | Present in source; recipient scoping and integrity need testing |

Do not label a feature “verified working” until the test, environment, date and result are recorded.
