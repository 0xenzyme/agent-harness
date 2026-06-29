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

Escalate or pause when implementation discovers broader scope, unclear source
of truth, production risk, missing approval, or conflicting instructions.
