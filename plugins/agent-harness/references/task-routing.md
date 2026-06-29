# Task Routing Reference

Task routing chooses the lightest harness flow that is still safe.

## Decision Inputs

- Priority: `P0`, `P1`, `P2`, `P3`.
- Scope: single-file, single-area, cross-area, cross-module, milestone.
- Product or domain risk.
- Source-of-truth risk.
- Engineering abstraction or reuse risk.
- External risk: credentials, paid APIs, production data, destructive changes.
- Existing coverage by a spec, adapter, helper, or gate.
- User intent: question, discussion, review, or implementation.

## Task Kinds

`kind` describes the work pattern. It is separate from `state`.

- `development`: scoped implementation, review, repair, or documentation work
  with a concrete completion condition.
- `observe`: ongoing monitoring that records signals before deciding whether
  follow-up action is needed.
- `research`: bounded investigation that produces findings, recommendations,
  or a spec.
- `ops`: operational work such as maintenance, release coordination, or manual
  checks.
- `docs`: documentation-only work.

Adapter projects may add project-specific labels, but they should preserve the
generic meaning of `development` and `observe`.

## Observe Tasks

Observe tasks are first-class harness tasks. They model:

```text
observe -> signal -> triage -> action
```

Use `observe` when the task is not complete after one implementation pass and
instead monitors a source over time. Examples include SEO indexing, traffic
changes, error rates, provider status, or recurring content quality checks.

Observe task states:

- `watching`: observation is active.
- `signal`: a notable signal has been recorded.
- `triage`: the signal is being evaluated.
- `action-needed`: follow-up work should be created or linked.
- `paused`: observation is intentionally paused.
- `closed`: observation is no longer active.

Harness core defines the observe protocol. Project adapters declare the
project's observe sources, signal records, triage gates, and whether follow-up
tasks may be created automatically.

## Levels

### Level 0: Fast Path

Use for typos, small local fixes, and clear bugs that do not change product or
project semantics. No spec is required by default.

### Level 1: Light Adapter

Use for bounded changes covered by existing docs or adapter rules. Record a
short route decision when useful.

### Level 2: Standard Adapter

Use for important tasks, cross-area changes, new abstractions, source-of-truth
changes, or user-visible semantics. Require a spec or explicit existing spec
coverage.

### Level 3: Full Roadmap / Milestone

Use for milestone work, multi-task DAGs, high-risk operations, or parallel
execution. Require milestone gates and explicit state sync.

## Optional Competition

Use proposal competition only as an optional Shape protocol for ambiguous
route selection, broad audits, repeated repair failure, or high-risk design
choices. Competition should return candidate routes, tradeoffs, coverage union,
risks, and a recommendation. It must not directly execute the selected route;
execution starts only after the control lane accepts a route.

Competition must not create branches/worktrees, write task/status state, start
daemons, prepare runs, push, open PRs, deploy, or mark tasks done. This package
documents the protocol; it does not install `harness:compete` as a workflow
skill.

## Idea Inbox Routing

Use `intake` when the source is a rough idea, capture-thread note, requirement,
bug report, or question that has not been accepted as executable scope.

Idea Inbox routing should return:

- the raw idea or summary
- duplicate or related tasks/artifacts
- suggested priority and section
- whether a spec is likely needed
- the confirmation needed before recording or execution

Do not route directly from Idea Inbox to `execute` unless the control lane has
accepted scope, non-goals, verification, completion conditions, and pause
conditions.

## Route Decision Format

```text
Route Decision

Level:
Reason:
Required docs:
Required gates:
Execution mode:
Validation:
Escalation triggers:
```

Keep route decisions lightweight. The useful part is the reason and the
confirmation boundary, not a heavy ledger.

Escalate or pause when implementation discovers broader scope, unclear source
of truth, production risk, missing approval, conflicting instructions, or a
need for optional competition before implementation.
