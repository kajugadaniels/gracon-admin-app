# Documentation Rules

Purpose: keep admin-frontend behavior clear for future contributors.

## Update Documentation When

- Admin auth/session behavior changes.
- Environment variables or backend API URLs change.
- Foreign identity registry workflows change.
- Sensitive reveal flows change.
- Certificate approval, sanction, or PKI visibility behavior changes.
- Shell navigation, dashboard architecture, or protected route behavior changes.

## Required Places

- `app/admin/README.md` for app-local architecture and commands.
- `app/admin/.env.example` for new configuration.
- Root `AGENTS.md` only when the cross-project platform picture changes.
- Backend README files when frontend changes require backend contract changes.

## Documentation Quality

- Explain the operator workflow and the security reason.
- Keep docs specific to this frontend.
- Mention role requirements and backend ownership when documenting privileged actions.
