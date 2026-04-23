# App Admin

Admin frontend for the Gracon platform.

This is the operator-facing Next.js application used to manage administrators, review verification activity, inspect audit/security logs, and monitor core platform metrics. It talks only to `api/admin` for dashboard intelligence and to `api/foreign-identity` for registry operations.

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
  app/
  api/
  components/
  constants/
  lib/
  public/
  package.json
```

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
```

If `NEXT_PUBLIC_FOREIGN_IDENTITY_API_URL` is omitted, the admin app falls back to `http://localhost:3006/api/v1`. When you change any `NEXT_PUBLIC_*` value during local development, restart `npm run dev` so the browser bundle picks up the new value.

## Integration Boundaries

- Calls `api/admin` for control-plane data and `api/foreign-identity` for FIN registry management
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
