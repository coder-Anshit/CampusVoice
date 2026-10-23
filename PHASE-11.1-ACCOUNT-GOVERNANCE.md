# CampusVoice Phase 11.1 — Account Governance

## Authentication model

Public self-registration has been removed.

Accounts are created by an administrator or by the controlled seed script. Every newly created account receives a temporary password and starts with `mustChangePassword=true`.

## Password ownership

- Admin can create an account and receive its one-time temporary password.
- Admin cannot view a user's stored password.
- Admin cannot reset or change a student's/employee's password after creation.
- The user must change the temporary password on first login.
- Passwords are stored as bcrypt hashes.
- Usernames are locked/immutable for these controlled accounts.

## Pilot account groups

- 2 administrators: `admin01`, `admin02`
- 10 students: `student01` ... `student10`
- 5 employees: `employee01` ... `employee05`
- Total: 17 accounts

## Admin User Management

The Admin Dashboard Users section provides:

- Generate 10 Students
- Generate 5 Employees
- Generate 2 Admins
- Generate All 17
- Create User
- Refresh account list

The Employee role is available from the controlled account creation flow.

## Seed credentials

The seed script creates deterministic temporary credentials for local/pilot testing. They must be changed on first login.

| Role | Username pattern | Temporary password pattern |
|---|---|---|
| Admin | `admin01` / `admin02` | `CVAdmin01!` / `CVAdmin02!` |
| Student | `student01` ... `student10` | `CVStudent01!` ... `CVStudent10!` |
| Employee | `employee01` ... `employee05` | `CVEmployee01!` ... `CVEmployee05!` |

## Seeding

Set `MONGO_URI` before running the seed script. The seed script no longer contains a database credential in source code.

```bash
# Windows PowerShell
$env:MONGO_URI="your-mongodb-uri"
python seed.py
```

The seed script clears the existing demo collections before inserting the sample data, as in the previous seed workflow.
