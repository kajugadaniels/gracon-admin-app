# App Admin Agent Guide

Purpose: this directory gives AI agents project-local rules for working on the Gracon admin frontend without weakening the admin trust boundary, sensitive registry workflows, certificate controls, audit visibility, or operational dashboard quality.

Read this file first, then read the topic file that matches the change.

## Reading Order

1. `folder-structure.md` - where routes, API clients, shell UI, and feature components belong.
2. `file-structure.md` - naming, comments, exported APIs, and styling expectations.
3. `security.md` - admin-token isolation, sensitive reveal flows, and frontend data safety.
4. `admin-session.md` - admin login, invite password setup, refresh, logout, and route protection.
5. `registry-workflows.md` - foreign identity, certificate, institution, signature, and stamp review rules.
6. `ui-design.md` - dashboard, table, form, responsive, and loading UI rules.
7. `testing.md` - build, lint, manual verification, and regression priorities.
8. `documentation.md` - when README and environment docs must change.
9. `git.md` - copy-paste commit format for this app.

## App Boundary

`app/admin` is the operator-facing frontend. It owns admin login, invite setup, dashboards, admin management, verification review, audit/security-event views, foreign identity registry management, and PKI/stamping visibility.

It must never use regular user tokens, call `api/auth` directly for user business logic, or merge admin control-plane behavior into user-facing apps.

## Conflict Rule

If a local rule here conflicts with root `AGENTS.md`, follow the stricter security rule and update documentation after the decision is made.
