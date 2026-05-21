# Folder Structure Rules

Purpose: define where admin frontend files belong so control-plane UI stays maintainable.

## Current Layout

```text
app/admin/
  agents/                  AI-agent project rules
  app/
    (auth)/                login and invite password setup routes
    (protected)/           dashboard, admin, users, verifications, audit, security events
    fonts/                 app-local font assets
    globals.css            global tokens/base styles only
  api/
    auth/                  admin auth client calls
    admins/                admin management client calls
    audit/                 audit log client calls
    foreign-identity/      FIN registry client calls
    certificates/          certificate review client calls
    institutions/          institution visibility client calls
    signatures/            signature visibility client calls
    stamps/                stamp visibility client calls
    stats/                 dashboard metrics client calls
    users/                 user management client calls
    verifications/         verification review client calls
  components/
    pages/                 route-level page components
    shell/                 protected layout, sidebar, header
    ui/                    shared primitives
  constants/               navigation and app constants
  lib/
    hooks/                 shared hooks
    store/                 admin session state
```

## Placement Rules

- Put route files under `app/`.
- Put route-level UI under `components/pages/<surface>/`.
- Put protected shell layout, sidebar, and header in `components/shell/`.
- Put backend client wrappers in `api/<domain>/`.
- Put shared primitives in `components/ui/`.
- Put navigation entries in `constants/`.
- Put admin session state under `lib/store/`.

## New Surface Rules

- Add typed API client functions before wiring UI.
- Keep route components thin; place real UI composition in `components/pages`.
- Do not place feature-specific table, chart, or form logic in shell components.
- Keep heavy dashboard visuals dynamically loaded only when it improves performance.
