# CampusVoice — Project Structure & Security Audit v1.0
**Date:** 11 October 2026  
**Input:** `CampusVoice_4.0.zip` (1.72 MB)  
**Scope:** Archive structure, configuration-file presence, ignore rules, duplicate-tree comparison and heuristic secret-pattern scan. No source files were changed.

## Executive result

**Recommendation: do not publish this ZIP directly to a public GitHub repository yet.**

The archive contains two project trees, 94 Python cache entries (including cache directories and `.pyc` files), and two nested ZIP archives. The primary tree includes a frontend `.env` file, but the inspected value is only a localhost API URL. The backend example environment file uses placeholders. A pattern-based scan found matches that appear consistent with example configuration or password-related UI/code; it did not establish that a real credential is present. This is a heuristic scan, not a guarantee that the project is secret-free.

The most important unresolved issue is identifying the canonical project tree. The two trees share 208 relative file paths; 165 are byte-identical and 43 differ. The differences include dashboard, mobile UI, feedback builder, issue/poll/discussion services, user routes, workflow services and the application entry point. Therefore, we must not simply delete the secondary tree.

## 1. Archive inventory

| Finding | Result | Meaning |
|---|---:|---|
| Total archive entries | 614 | Includes directories and files |
| Main tree: `CampusVoice_4.0/` | 359 entries | Appears to be the primary project folder |
| Secondary tree: `CampusVoice_Design_System_Phase8.2/` | 255 entries | Contains an overlapping but non-identical project copy |
| Shared relative file paths | 208 | The trees overlap substantially |
| Identical shared files | 165 | These match byte-for-byte |
| Different shared files | 43 | Must compare before choosing what to retain |
| Python cache entries | 94 | Includes cache directories and `.pyc` files |
| Nested ZIP archives | 2 | `backend.zip` and `frontend/src.zip` |
| Git metadata directory in archive | Not found | The ZIP does not contain a `.git` directory |

## 2. Canonical-source decision — unresolved

The secondary tree is not just an empty duplicate. The following important shared paths differ between the two trees:

- `frontend/src/app/App.jsx`
- `frontend/src/features/admin/pages/AdminPanel.jsx`
- `frontend/src/features/employee/pages/EmployeeDashboard.jsx`
- `frontend/src/features/student/pages/StudentDashboard.jsx`
- `frontend/src/features/feedback/components/FeedbackFormBuilder.jsx`
- `frontend/src/features/issues/components/PostIssueModal.jsx`
- `frontend/src/shared/mobile/MobileAdminExperience.jsx`
- `frontend/src/shared/mobile/MobileCreateHub.jsx`
- `frontend/src/shared/mobile/MobileFeedback.jsx`
- `frontend/src/shared/mobile/MobileStudentHome.jsx`
- `frontend/src/shared/services/issues.service.js`
- `frontend/src/shared/services/polls.service.js`
- `backend/app.py`
- `backend/routes/issues.py`
- `backend/routes/users.py`
- `backend/services/dashboard_service.py`
- `backend/services/workflow_service.py`

This list is representative, not exhaustive.

**Safe decision:** retain the uploaded archive as an untouched backup. Before deleting or merging anything, compare the differing files and determine which tree matches the currently running app and the latest intended changes. The user's currently running local project cannot be confirmed from the ZIP alone.

## 3. Environment files and configuration

### Frontend
- `frontend/.env` exists in the archive.
- Its inspected setting is `REACT_APP_API_URL=http://127.0.0.1:5000/api`.
- `frontend/.env.example` contains the same local-development API base.
- The inspected `.env` value is a local URL, not a credential. Nevertheless, real environment files should not be committed; use the example file as the template.

### Backend
- `backend/.env.example` contains placeholders for MongoDB host/user/password, JWT secret, CORS origins and connection timeouts.
- The example includes a placeholder MongoDB URI. Do not replace placeholders with real values in public documentation.
- The archive did not include a backend `.env` file under the primary project tree.

### Important limitation
This audit checks the supplied ZIP only. It does not inspect the user's live Git repository, deployment provider, shell history, MongoDB Atlas account, or any files outside the archive.

## 4. Ignore-rule review

The root `.gitignore` already excludes `.env` and `.env.*`, while allowing `.env.example`. That is useful, but the archive still contains `frontend/.env`, which means the ZIP is not a clean representation of what should be published.

The root `.gitignore` does **not** currently include explicit rules for:
- `__pycache__/`
- `*.py[cod]`
- nested backup archives such as `*.zip` (if those archives are not intentional release artifacts)
- local test output and temporary artifacts specific to this project

The frontend `.gitignore` ignores some local environment variants, but it does not explicitly list the plain `.env` file. The root ignore file covers it when Git is operating from the repository root, but a frontend-local rule can make the intent clearer.

Suggested additions to the root `.gitignore` after confirming project conventions:

```gitignore
# Python-generated files
__pycache__/
*.py[cod]
*$py.class

# Local environment files
.env
.env.*
!.env.example

# Local archives/backups (remove this rule if ZIPs are intentional release assets)
*.zip

# Local logs and test outputs
*.log
.pytest_cache/
.coverage
htmlcov/
```

Do not blindly add `*.zip` if the project intentionally tracks a release archive. In the current source repository, nested backup ZIPs should usually be removed from version control and stored separately.

## 5. Python cache and nested archives

### Python cache
The ZIP contains 94 cache-related entries, including compiled bytecode for multiple Python versions. These files are generated artifacts, not source-of-truth code. Exclude them from Git and regenerate them locally as needed.

### Nested ZIPs
- `backend.zip`
- `frontend/src.zip`

These are likely backups or transfer artifacts, but their purpose is not proven. Compare them with the extracted source before deciding whether they should be removed from the canonical repository. Keep a separate untouched backup if needed.

## 6. Heuristic secret scan

A simple pattern scan looked for private-key headers, common GitHub/AWS token formats, MongoDB credential-bearing URIs and long secret-like assignments.

- No private-key header, common AWS access-key pattern or common GitHub-token pattern was detected in the scanned text files.
- MongoDB URI pattern matches were found in `.env.example` files and are consistent with the documented placeholder examples.
- Other generic secret-like matches occurred in example configuration and password-related source/UI code; these are not proof of leaked secrets.
- No secret value is reproduced in this report.

**Interpretation:** no confirmed live credential was identified by this limited scan, but the repository is not certified secret-free. Before public publication, manually review all environment files, seed/reset scripts, docs, screenshots, logs and the full Git history (if a Git repository is supplied). If a real credential has ever been committed, removing it from the current file alone is insufficient; rotate it and review repository history.

## 7. Publication-readiness checklist

| Check | Status | Next action |
|---|---|---|
| Identify canonical source tree | Blocked | Compare 43 differing files against the live/current project |
| Exclude Python cache files | Required | Remove generated cache files from the publication copy |
| Decide nested ZIP treatment | Required | Compare archive contents; keep backups outside the source tree |
| Environment file handling | Needs cleanup | Keep `.env.example`; exclude local `.env` |
| Secret scan | Partial | Run a full repository/history scan after canonical tree is selected |
| Root README | Inadequate | Replace minimal title with proper setup and project overview |
| License choice | Pending | Choose intentionally; do not imply a license |
| Build/test verification | Not performed | Run frontend/backend checks after safe setup |
| Screenshots and user data | Pending | Review for personal information and tokens |
| GitHub-ready source package | Not ready | Complete the above before publication |

## 8. Recommended next action

**Phase 2 result: structural/security risks identified; no source changes made.**

The next step should be a **canonical-source comparison**. We should compare the 43 differing files and verify which tree corresponds to the latest working CampusVoice build. After that, create a clean publication copy, add safe ignore rules, and perform the deeper credential and runtime audit.

Do not run seed/reset scripts or connect this audit to a live database as part of documentation work.
