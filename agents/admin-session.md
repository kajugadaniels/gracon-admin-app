# Admin Session Rules

Purpose: keep admin login, invite setup, refresh, and logout behavior isolated from user apps.

## Login And Invite Setup

- Admin login belongs to `app/(auth)/login`.
- Invite password setup belongs to `app/(auth)/set-password`.
- Invite tokens must be treated as sensitive and should not be copied into logs.
- Failed login or invite setup should show safe error messages.

## Protected Routes

- All control-plane pages belong under `app/(protected)/`.
- Protected routes must redirect cleanly to admin login when session recovery fails.
- Do not render sensitive dashboard content before admin session validation completes.

## Refresh And Logout

- Use the existing admin auth store and HTTP client refresh path.
- Do not add another token persistence path.
- Logout must clear admin-only session state, not regular user state from `app/app`.

## Environment Rules

- Keep `.env.example` current for every `NEXT_PUBLIC_*_API_URL`.
- Restart the dev server after changing `NEXT_PUBLIC_*` variables because they are bundled into browser code.
