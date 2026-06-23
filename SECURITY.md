# app/admin Security

`app/admin` is the operator control-plane frontend. It must stay isolated from
regular user sessions and user-facing apps.

## Admin Boundary

- Admin tokens are separate from user tokens and must never be reused by
  `app/app`, `app/documents`, or `app/meetings`.
- Admin login must call `api/admin`, not `api/auth`.
- Protected pages must not render sensitive dashboard or registry data before
  admin session validation completes.
- UI role checks are affordances only. Backend authorization remains the
  enforcement point for every privileged action.

## Sensitive Reveal Flows

- Passport numbers, NIDs, PIDs, certificate material, and registry evidence may
  be displayed only through approved reveal flows.
- Revealed identifiers must not be stored in persistent browser storage.
- Reveal reasons and expiry behavior must stay aligned with backend policy.
- Browser errors must not expose stack traces or internal event details.

## Redirect Safety

- Admin login may only redirect to safe internal admin paths.
- External URLs, protocol-relative URLs, `/login`, `/set-password`, and
  `/logout` must fall back to `/dashboard`.

## Required Checks

```bash
npm run check:security
npm run lint
npm run build
npm audit --audit-level=high
```

Run deployment env validation with real production env values before release:

```bash
CHECK_DEPLOY_ENV=true npm run check:security
```

## Browser Hardening

- `next.config.ts` owns the app-wide CSP and security headers.
- The app security workflow runs Gitleaks before install/build steps.
- Security checks reject user-session markers such as `g360_at`, `g360_rt`,
  `av_at`, `av_rt`, and `session_active` inside the admin app.
- Admin session state must continue to use `adm_at`, `adm_rt`, and
  `admin_session`.
