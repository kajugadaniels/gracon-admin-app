# File Structure Rules

Purpose: keep admin frontend files typed, reviewable, and safe for sensitive workflows.

## Required File Shape

- Every file must start with a short top-level comment explaining its purpose.
- Every exported function, component, hook, and public helper must have JSDoc explaining what it does, parameters, and return value.
- Use `const` by default. Use `let` only when reassignment is necessary.
- Do not use `any`; create interfaces, DTO types, or narrow generics.
- Delete dead code instead of commenting it out.
- Keep one React component per file unless a tiny private child is only useful in that file.

## Naming

- React components: `PascalCase.tsx`
- Helpers/API modules: `kebab-case.ts`
- Hooks: `useSomething.ts`
- CSS modules, if introduced: `component-name.module.css`
- Constants: descriptive files under `constants/`

## Styling Rules

- Prefer scoped component styles or local utility composition for complex feature surfaces.
- Keep `app/globals.css` limited to tokens, base elements, animations, and truly global shell behavior.
- Do not hardcode sensitive status colors inline when a shared token exists.
- Keep admin tables dense but readable.

## Component Rules

- Keep loading, empty, error, and permission-denied states explicit.
- Do not hide a failed privileged action behind generic UI silence.
- Keep destructive actions behind clear confirmation and role checks from the backend response.
