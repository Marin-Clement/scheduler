# Overview

## Goal

A Web app to manage employee leave requests (paid leaves, sick leaves, unpaid leaves, remotes days).
Approval worflows, roles, calendars,notifications, external intergrations.

## Users / Roles

Employee: create/cancel requests ; balance and history.

Manager: approve/deny, view team calendar,
mnage conflicts.

HR/Admin: manage roles, create exports

# Technical Stack

## Frontend

Next.js (App router), Typescript, Tailwind CSS.

## Backend

SupaBase : Auth, RLS, Storage, Edge Functions

## DevOps

Hosting: Vercel

# Core Features

## Authentication

- Sign in (email/password or magiclink)
- SSO (Google)
- Roles (employee, manager, hr, admin)
- Teams: managers assignement per team


## Meaves requests

- Create leave request: type, date range (half-day support), object (optionnal), medical certificate (optional).
- Validation: Overlap prevention, balance check. prevent not working day overlap, non-requestable day set by manager.
- Status lifecycle: pending, approved/denied, cancelled

## Leave Balances

- Multiple leave balances: paid leaves/unpaid leaves/sick leaves/RTT/remotedays
- History per balances
- HR can defined per user the increment of each balance
- Increment vary according to employee's contract type

## Calendar & Views

- Personal Calendar (my leaves)
- Team calendar (same team)
- All company calendar (for admin/hr) whith team select
- Balances counts

## Email & in-app notifications

- Email: Request created, request approved/denied, reminder for non-responded requests, email to the manager on Friday with team status
- In app: notification badges for (Request created, request approved/denied, reminder for non-responded requests)
- Notifications for leaves inconsistencies.

## Admin / HR Console

- Admin: Manage org settings, defined HRs
- HRs: Manage users, create/edit teams, create/edit managers, manage contract type, define balances increment for contract types
- Manager: Define non-requestable days, approve/deny leaves, export leaves recap/CSV

## Data Model (Supabase Postgres)

### Tables

- orgs: id, name, desc, lang, timezone
- teams: id, org_id, name, desc, manager_id, [profile_id]
- contract_types: id, org_id, name, desc, [leave_types]
- profiles: id, team_id, manager_id, role, contract_type_id, email, first_name, last_name, is_active, avatar
- leave_types: id, org_id, contract_type_id, code, color, is_attachement_required, is_subject_required, increment
- leave_balances: id, org_id, profile_id, leave_type_id, balance
- leave_request: id, org_id, profile_id, start_date, start_half, end_date, end_half, subject, document_path, status
- leave_history: id, org_id, manager_id, leave_request_id, datetime, new_status


### RLS

### Employees
- orgs: can read
- teams: can read team if is in [profile_id]
- contract_type: can not read
- profiles: can read their own profile, can update the avatar picture
- leave_types: can not read
- leave_balances: can no read
- leaves_requests: can read their own requests, can create and edit leave their own request,
can not edit org_id or status
- leave_history: can not read

### Manager
- orgs: can read
- teams: can add mebers to the team
- contract_type: can not read
- profiles: can read their own profile, can update the avatar picture
- leave_types: can not read
- leave_balances: can no read
- leaves_requests: can read their own requests, can create and edit leave their own request,
can not edit org_id or status
- leave_history: can not read


### HR
- orgs: can read, edit their own org
- teams: can edit, create teams, delete
- contract_type: can edit, create teams, delete
- profiles: can read their own profile, can update the avatar picture
- leave_types: can read, create, edit, delete leave_types
- leave_balances: can read, create, edit, balance
- leaves_requests: can read, create, edit, delete all request of the org
can not edit org_id or status
- leave_history: can only read


### Admin
- orgs: can read, edit, delete, create any org
- leave_history: can only read