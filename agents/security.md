# Security Rules

Purpose: preserve the admin frontend trust boundary and prevent accidental data exposure.

## Admin Token Isolation

- Admin tokens are separate from regular user tokens.
- Never reuse `app/app` or user-session stores for admin flows.
- Never call `api/auth` directly for admin login or admin business logic.
- Silent refresh failures must clear admin session state and redirect to admin login.

## Sensitive Data Display

- Passport numbers, NIDs, PIDs, certificate material, and registry evidence must be shown only through approved reveal flows.
- Timed reveal states must include reason capture where required by the backend.
- Do not log sensitive values to the browser console.
- Do not store revealed identifiers in persistent browser storage.

## Privileged Actions

- Certificate approval, revocation, access ban, ban lifting, admin invite, and registry changes must depend on backend authorization.
- UI role checks are for affordance only; never treat them as security enforcement.
- Every privileged screen should show safe errors and clear failure recovery.

## Data Fetching

- Paginate large operational datasets.
- Avoid loading full audit/security-event history at once.
- Do not expose raw backend stack traces or internal security-event details in UI messages.
