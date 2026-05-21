# App Admin

Admin frontend for the Gracon platform.

This is the operator-facing Next.js application used to manage administrators, review verification activity, inspect audit/security logs, monitor core platform metrics, and inspect the platform cryptographic infrastructure. It talks to `api/admin` for dashboard intelligence, `api/foreign-identity` for registry operations, and the signature, institution, and stamp services for PKI and stamping visibility.

## Overview

- Runtime: Next.js 15 + React + TypeScript
- Default port: `4001`
- Styling: Tailwind CSS
- State: Zustand for auth/session state
- Charts/UI: Recharts, React Hook Form, Zod

## What This App Owns

- Admin login and invite password setup
- Protected admin dashboard
- Dashboard with foreign identity registry analysis
- Admin user management screens
- Foreign identity registry management screens
- Signature, certificate, institution, and stamp management screens
- Certificate-request review screens that gate issuance until SUPER_ADMIN approval
- Certificate sanction controls for SUPER_ADMIN users, including revocation, access bans, and ban lifting
- Timed, reason-gated reveal flows for passport numbers, NIDs, and PIDs
- Verification review pages
- Audit log and security-event pages
- Platform stats and operational summaries

## Core Skills Needed

- Next.js App Router
- Secure frontend token handling
- Dashboard composition and table/filter UX
- Form validation with React Hook Form + Zod
- Admin-oriented state management
- High-trust registry workflows for FIN-backed identities

## Techniques Used

- Independent admin session boundary from end-user apps
- Zustand + sessionStorage token persistence
- Axios client with silent refresh
- Foreign identity list request deduplication plus short-lived session cache to soften local reload rate limits
- Protected `(auth)` and `(protected)` route segmentation
- Dynamic loading patterns for heavy dashboard visuals

## Main Areas

```text
app/
  (auth)/         login and set-password pages
  (protected)/    dashboard, users, verifications, admins, audit, security-events
api/              typed client modules for api/admin
components/
  pages/          feature-specific screens
  shell/          sidebar/header/layout
  ui/             shared UI primitives
lib/
  hooks/
  store/          admin auth state
constants/        app-level configuration
```

## Folder Structure

```text
app/admin/
  agents/        project-local AI agent rules
  app/
  api/
  components/
  constants/
  lib/
  public/
  package.json
```

## AI Agent Rules

Project-local AI guidance lives in `agents/README.md`.

Read that guide before changing admin auth/session behavior, protected shell navigation, foreign identity registry screens, certificate review controls, audit/security-event pages, or sensitive reveal workflows. The guide is intentionally specific to this frontend so contributors preserve the admin trust boundary and do not mix admin flows with user-facing apps.

## Local Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment Notes

Key variables:

```env
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_FOREIGN_IDENTITY_API_URL=http://localhost:3006/api/v1
NEXT_PUBLIC_SIGNATURE_API_URL=http://localhost:3002/api/v1
NEXT_PUBLIC_STAMP_API_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_INSTITUTION_API_URL=http://localhost:3004/api/v1
```

If `NEXT_PUBLIC_FOREIGN_IDENTITY_API_URL` is omitted, the admin app falls back to `http://localhost:3006/api/v1`. When you change any `NEXT_PUBLIC_*` value during local development, restart `npm run dev` so the browser bundle picks up the new value.

## Integration Boundaries

- Calls `api/admin` for control-plane data, `api/foreign-identity` for FIN registry management, and the signature, institution, and stamp services for cryptographic-infrastructure views
- Must never mix admin tokens with regular user tokens
- Should not talk directly to `api/auth`, `api/documents`, or other business services

## Important Rules

- Keep admin auth isolated from the user-facing apps
- Protect all sensitive routes and handle silent refresh failures by redirecting cleanly to login
- Paginate and filter large operational datasets instead of loading everything eagerly

## Contribution Checklist

- Add typed API modules before wiring UI
- Verify auth gating for every new protected page
- Test dashboard layouts at narrow and wide breakpoints
