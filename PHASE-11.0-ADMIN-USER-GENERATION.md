# Phase 11.0 — Admin User Generation

Adds controlled pilot account generation to the Admin Panel.

## Pilot usernames
- student01–student10
- admin01–admin02
- employee01–employee05

Each generated account receives a one-time temporary password and `mustChangePassword=true`. Usernames are marked locked and are not editable through the existing admin PATCH route.

## Backend
- `POST /api/users/pilot` — admin-only account creation
- No admin password-reset endpoint exists.
- `POST /api/auth/change-password` — authenticated password change
- Login now returns `mustChangePassword`.

Passwords are bcrypt-hashed; temporary passwords are returned only at creation/reset time.


## Password ownership security rule

Admin accounts can generate only the initial one-time password for a newly created account. There is no admin password-reset endpoint or UI. After first login, the student changes the temporary password through `/api/auth/change-password`; password changes require the authenticated user's current password and are therefore self-service. Admin user PATCH operations do not accept password fields.
