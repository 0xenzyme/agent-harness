# Goal: {Goal Name}

Spec:
Spec Policy:
Checkpoint Policy: disabled
Checkpoint Stages: []
Status: active.

## Source Task

-

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. Project adapter
4. Referenced Spec

## Work Mode Recommendation

Use `ask` until cwd and ownership are confirmed.

## Execution Role

Use `implementer`.

- `gate-only` reviews candidate evidence; `implementer` edits accepted scope.
- Controller owns the outcome and accepted state. Use `gate-only` only when
  review-only behavior is explicitly required.

## Codex-Native Execution

- Use native Goal, Plan, subagents, or steering only when the current host
  exposes them.
- Fallback: continue in this thread with a short checklist; never invent
  runtime identifiers or emulate runtime features with repository files.
- Repository Goal/Run owns durable recovery, evidence, gates, and state sync.

## Conversation Route

Use `current-thread`.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `TBD`
- Execution branch: `TBD`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Durable Control Invariants

- `harness-rule:path-containment`
- `harness-rule:run-dag-ownership`
- `harness-rule:candidate-accepted-evidence`
- `harness-rule:authoritative-completion-state`
- `harness-rule:state-sync-evidence`
- `harness-rule:bounded-status-snapshot`
- `harness-rule:project-neutral-core`
- `harness-rule:durable-tier-boundary`

The Codex runtime owns scheduling, delegation, concurrency, cancellation, and
model selection. Harness records ready nodes, dependencies, ownership,
verification, candidate evidence, gates, and state sync.

## Spec Acceptance Checklist

- Item: `<checklist item>`
  - Acceptance: `<what must be true>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Required Gate Evidence

These gates apply to durable completion for this Goal/Run. They do not govern
ordinary direct or postflight-only work outside this durable lifecycle.

- Gate: `<gate name>`
  - Required: `yes`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Scope

-

## Non-Goals

- Do not exceed accepted scope or recorded authority.

## Verification

-

## Completion Conditions

- Accepted scope, verification, required gates, and state sync are satisfied.

## Pause Conditions

- Accepted scope conflicts with current repository facts or newer instructions.
- Credentials, production, destructive work, or another external side effect is needed.
- Evidence cannot validate the accepted objective.
