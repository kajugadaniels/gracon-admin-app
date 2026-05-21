# Testing Rules

Purpose: protect admin authentication, protected routing, and high-risk workflows from regressions.

## Commands

```bash
npm run build
npm run lint
```

Use the smallest command that proves the change. For docs-only changes, no build is required.

## Priority Areas

1. Admin auth: login, invite password setup, refresh failure, logout.
2. Protected routes: unauthenticated redirect and no pre-validation sensitive render.
3. Foreign identity registry: list filters, pagination, reveal flow, and safe masking.
4. Certificate controls: approval, revocation, ban, and lift-ban affordance states.
5. Audit/security pages: pagination, filters, and safe error states.
6. Responsive shell: sidebar/header behavior at mobile, tablet, laptop, and desktop sizes.

## Manual Verification

- Verify role-restricted UI with a non-SUPER_ADMIN account and a SUPER_ADMIN account when possible.
- Check sensitive reveal flows do not persist full identifiers after navigation or refresh.
- Confirm backend errors do not expose stack traces or internal identifiers.
