# Registry And Review Workflow Rules

Purpose: keep high-trust registry and certificate workflows clear, auditable, and operator-safe.

## Foreign Identity Registry

- Foreign identity registry management calls `api/foreign-identity`.
- List views should use pagination, filters, and request deduplication.
- Identifier reveal must use the approved timed and reason-gated flow.
- Do not render full sensitive identifiers in tables by default.

## Verification Review

- Review pages should separate evidence, decision, and audit context.
- Avoid crowded review cards; prioritize the next operator action.
- Keep failed or inconclusive verification states distinct.

## Certificate And PKI Visibility

- Certificate request approval is a controlled admin action.
- SUPER_ADMIN-only actions such as revocation, access bans, and ban lifting must be visually distinct and backend-enforced.
- Do not expose private keys or raw cryptographic material in the frontend.

## Institutions, Signatures, And Stamps

- Institution, signature, and stamp screens are visibility/control surfaces only.
- Any action that changes trust state must show clear consequences before submission.
- Audit/security views should link to related entities without leaking unrelated private data.
