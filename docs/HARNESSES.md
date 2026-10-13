# Agent Harness Capability Matrix

Agent Harness supplies durable project control that a coding-agent host does
not: configured artifact roots, repository Goals/Runs/DAGs, authoritative
completion state, candidate-versus-accepted evidence, controller gates, and
state sync.

## Host Integration

Runtime Goal, Plan, subagent, and steering support are optional host
capabilities. The compatibility baseline uses the current thread, a short
checklist, and CLI validation, so older models do not need a separate skill.
See [Runtime Capability Compatibility](../plugins/agent-harness/references/runtime-capabilities.md).

| Execution path | Runtime behavior | Harness behavior |
| --- | --- | --- |
| `host-direct` | Host outcome/plan/session as needed | No Harness execution or lifecycle creation. |
| `host-direct-postflight` | Host completes and verifies simple work | Update only existing state in one bounded closeout. |
| `durable-harness` | Runtime outcome owns result; transient plan owns current steps; host owns delegation when exposed | Repository Goal/Run owns recovery, dependencies, evidence, gates, and state sync. |

Legacy aliases `codex-direct` and `codex-direct-postflight` remain readable.
Codex tool names live in `plugins/agent-harness/hosts/codex/execution.md`.
Cursor and Grok capability maps live in `plugins/agent-harness/hosts/cursor/`
and `plugins/agent-harness/hosts/grok/`.

Controller means outcome owner and accepted-state owner. Only explicit
`gate-only` or review-only direction forbids foreground implementation.
Configured completion gates are durable Goal/Run gates; they do not promote
ordinary direct or postflight-only work into a Run.

For an accepted one-entry Goal or Milestone, the controller repeatedly uses
target-scoped `execute next` through whole-target completion. The adjacent
`<target-filename>.plan.json`, referenced by `Execution Plan:`, declares Goal
and Task dependencies. Planned Runs use manifest v2 and enforced checkpoints;
manifest v1 remains a legacy unplanned path. Member Goals reference the
Milestone-adjacent plan, while a standalone Goal uses its own adjacent plan.
Accepted human evidence routes to `verify-node` for receipt capture;
`need-user` asks only for a missing concrete decision. Candidate receipts require
controller review of validation logs and fresh input hashes; pending project
sync resumes before execution. A completed node cannot close its parent.
Concrete Milestone Goal List Doc rows require exact plan coverage; their
declarative fields are hash bound while Status remains mutable. An explicitly
blocked Goal is routed to `reconcile` until recovered. Node logs stay inside
their own Run; stage logs stay inside the anchor Run and postdate the latest
required Goal completion.
Non-user blockers return `reconcile` with `needUser: null`; `blocked` remains
a node/Goal phase and a review decision, not a next action. Milestone closeout
uses the anchor Run's expected revision and advances its checkpoint.
The exact version 1 plan fields and candidate receipt are in the
[planned execution reference](../plugins/agent-harness/references/planned-execution.md).
Native runtime Goals and delegation each require host capability plus current
authorization; foreground execution handles absence. No scheduler or new
visible chat is part of the loop, and one-shot setup runs only when authorized.

| Domain invariant | Contract |
| --- | --- |
| `harness-rule:path-containment` | All writes and artifact references remain inside configured roots after lexical and realpath checks. |
| `harness-rule:run-dag-ownership` | Runs record dependencies, ready state, ownership, verification, and candidate evidence. |
| `harness-rule:pre-delegation-work-mode` | Resolve `local`, `worktree`, or `ask` before host delegation; unresolved `ask` or conflicting authority pauses for the user. |
| `harness-rule:candidate-accepted-evidence` | Worker output stays candidate evidence until the accepted-state owner validates it. |
| `harness-rule:authoritative-completion-state` | Task/Goal is authoritative with active, completed, or blocked phase; blocked is resumable and non-complete, Run stores evidence, and status is a projection. |
| `harness-rule:state-sync-evidence` | Durable completion includes verified State Sync Notes. |
| `harness-rule:bounded-status-snapshot` | Status is current and bounded; Runs and Goals retain history. |
| `harness-rule:project-neutral-core` | Adapters own downstream facts and paths. |
| `harness-rule:durable-tier-boundary` | Ordinary clear change/build uses the current host directly. |
| `harness-rule:checkpoint-recovery` | Explicitly enforced managed Runs use an independent revision-safe checkpoint; contract drift and uncertain external state fail closed without changing disabled or legacy paths. |

The host owns worker selection, delegation, concurrency, cancellation, and
model/effort when those capabilities are exposed. Harness never starts workers,
pins those settings, or expands generic explorer/implementer workers by default.

Suite routing: `npm run test:presentation`, `npm run test:protocol`,
`npm run test:hosts-codex`, `npm run test:hosts-grok`, `npm run test:smoke`,
`npm run test:regressions`, `npm run test:routing-classification`, and
`npm run test:all`.
`npm run validate:plugin` is the Codex pack validator, not the core protocol gate.
