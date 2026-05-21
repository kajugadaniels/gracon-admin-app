# Git Rules

Purpose: keep admin-frontend commits reviewable and copy-paste safe.

Codex must never run git commands automatically. Present commands only.

## Required Format

Paths are relative to `app/admin/`, where this app `package.json` lives.

```bash
git add "components/shell/AdminHeader.tsx"
git commit -m "feat(admin): add protected account menu"
```

## Rules

- One file per `git add`.
- Always quote paths.
- Never use `git add .` or `git add -A`.
- Never include `cd app/admin`.
- Never run `git push`.
- Use Conventional Commits.

## Common Scopes

- `admin` - admin app shell, admin pages, admin management.
- `auth` - admin login, invite setup, refresh, logout.
- `registry` - foreign identity registry UI.
- `verification` - verification review UI.
- `audit` - audit and security-event UI.
- `signature` - signature/certificate visibility.
- `stamp` - stamp visibility.
- `institution` - institution visibility.
- `shared` - shell/shared layout.
- `ui` - primitives.
- `docs` - README and agent docs.
