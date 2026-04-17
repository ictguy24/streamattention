# Architecture Audit & Redesign (April 17, 2026)

## True architecture (from backend contracts)

The platform is designed around **verified attention accounting**:

1. A valid user session is created via `manage-session` and persisted in `sessions`.
2. Frontend reports interactions to `validate-interaction` using the active `session_id`.
3. Backend validates ownership, session state, risk, and mints verified AC through SQL RPC.
4. Frontend reads balance/trust/UPS from `get-balance`.

## What was wrong before this redesign

- Frontend generated random `sessionId` locally instead of creating backend sessions.
- UPS/balance were mutated in browser-only global state (`UPSCore`) and treated as verified.
- Interaction calls in key user flows were disconnected from backend validation contract.
- UI messaging implied instant UPS gains, but backend truth is asynchronous and verified.

## Redesign decisions implemented

- `AttentionContext` now orchestrates:
  - `useSession` for real backend sessions,
  - `useInteraction` for validated interaction reporting,
  - `useVerifiedBalance` for authoritative balance/trust/UPS.
- Introduced a dedicated event mapper (`core/attention/eventMapper.ts`) to map UI events to backend interaction types.
- Updated booster/gift flows to route through context (verified pipeline) instead of local UPS mutation.
- Fixed UPS percentage rendering in wallet UI for mixed scale values (`0..1` vs `0..100`).

## Remaining next steps (recommended)

- Remove legacy `core/ups` module once all imports are fully migrated.
- Add contract tests for event mapping (`watch`, `like`, `comment`, `gift`, `boost`).
- Add optimistic UI queue with reconciliation for offline-safe event buffering.
- Introduce domain-level types shared between web app and edge functions.
