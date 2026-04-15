# App Admin

Admin frontend for the Gracon platform.

This is the operator-facing Next.js application used to manage administrators, review verification activity, inspect audit/security logs, and monitor core platform metrics. It talks only to `api/admin`.

## Overview

- Runtime: Next.js 15 + React + TypeScript
- Default port: `4001`
- Styling: Tailwind CSS
- State: Zustand for auth/session state
- Charts/UI: Recharts, React Hook Form, Zod

## What This App Owns

- Admin login and invite password setup
- Protected admin dashboard
- Admin user management screens
- Verification review pages
- Audit log and security-event pages
- Platform stats and operational summaries

## Core Skills Needed

- Next.js App Router
- Secure frontend token handling
- Dashboard composition and table/filter UX
- Form validation with React Hook Form + Zod
- Admin-oriented state management

## Techniques Used

- Independent admin session boundary from end-user apps
- Zustand + sessionStorage token persistence
- Axios client with silent refresh
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
```

## Integration Boundaries

- Calls `api/admin` only
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

