# CampusVoice — Issue Workflow Fix

## Canonical lifecycle

Student raises issue
→ Pending / visible in Issue Feed
→ Admin assigns employee
→ Assigned
→ Employee accepts
→ Accepted
→ Employee starts investigation
→ Investigating
→ Employee resolves with resolution note
→ Resolved
→ Student confirms
→ Verified
→ Admin closes
→ Closed

If the student is not satisfied:

Resolved
→ Student escalates
→ Escalated
→ Same employee task is reopened
→ Employee starts investigation again
→ Investigating
→ Resolved
→ Student verifies / escalates again

## Changes

- Removed the employee/admin workflow bypass from the generic admin status endpoint.
- Added strict issue transition rules for the canonical lifecycle.
- Kept `approved` only as legacy compatibility for existing records.
- Employee task transitions now synchronize the student-facing issue status.
- Escalation reopens the existing task instead of creating a duplicate task.
- Student verification/escalation is restricted to the student who owns the grievance.
- New grievances remain visible in the issue feed while pending.
- Added student-facing resolution confirmation / escalation actions.
- Added employee UI support for reopened escalation tasks.
- Replaced the admin status-pill strip with a responsive workflow rail:
  Overview → New → Assigned → Accepted → Investigating → Resolved → Verified → Closed
  with dedicated Attention and Escalated indicators.
- Admin assignment action is available for new/legacy-approved grievances only; employee lifecycle actions remain actor-specific.

## Verification performed

- Python syntax compilation passed for both project copies of:
  - backend/routes/issues.py
  - backend/routes/tasks.py
  - backend/services/workflow_service.py
- Frontend production build was not completed because dependency installation (`npm ci`) timed out in the execution environment. No claim of a successful frontend build is made.
