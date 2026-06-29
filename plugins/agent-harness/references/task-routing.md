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
