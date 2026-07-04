# Agent Harness Capability Matrix

This matrix is the project-neutral reference for Agent Harness control
surfaces, runtime defaults, boundaries, applicability, and verification
expectations. It describes what the harness itself exposes; project adapters
add local policy and artifacts.

## Critical Protocol Anchors

These stable IDs are protocol anchors. Keep them present in the matrix and the
canonical references named by `npm run test:protocol`.

| Anchor | Contract |
| --- | --- |
| `harness-rule:gate-only-controller` | A control, gate, reviewer, judge, or acceptance lane is `gate-only` by default. It reviews candidate output and evidence, but does not directly edit implementation files or promote worker output to accepted state. |
| `harness-rule:terminology-boundary` | User-facing hierarchy is `Roadmap -> Milestone -> Goal -> Task -> Run`. `P0` / `P1` / `P2` / `P3` are priorities only, `M*` identifies roadmap milestones, and Runs are execution attempts rather than threads or sessions. |
| `harness-rule:local-delivery-ceiling` | `implemented-local` and `validated-local` prove only local working-tree or local verification state. They are not commit, push, review, integration, release, or ship evidence. |
| `harness-rule:worker-surface-default` | Prepared run packets default worker nodes to `codex-cli-subagent` when available. Codex App threads are explicit long-lived handoff lanes, and fork is not a default worker surface. |
| `harness-rule:child-controller-boundary` | A visible long-lived thread must declare whether it is a child controller or execution worker. A child controller owns accepted state only inside its authorized scope; the parent controller receives snapshots, decisions, and final result packets instead of repeating same-scope acceptance. |
| `harness-rule:need-user-digest` | Routine closeouts state `Need user: None` and `Remaining: None` when no true pause trigger or follow-up exists. Only concrete human decisions, manual verification, authorization, credentials, paid/production access, destructive-operation approval, product direction, or external evidence belong in `Need user`. |
| `harness-rule:project-neutral-core` | Plugin core docs, templates, examples, validation, and skills stay project-neutral. Downstream product facts, credentials, provider policy, ports, and production procedures belong in adapters and artifacts. |
| `harness-rule:state-sync-evidence` | Accepted completion needs state-sync evidence that points to concrete task, status, goal, run, gate, command, review, or deferred-work records. Candidate summaries are not accepted state. |

## Runtime And Control Surfaces

| Surface | Default / Applicability | Boundary | Verification expectation |
| --- | --- | --- | --- |
| `harness:init` skill | Default setup/adoption route for a new or migrated project. | Preview activation and adapter changes before mutating project instructions; do not make project-specific policy part of plugin core. | `config validate`, `doctor`, and artifact-path inspection when setup changes are written. |
| `harness:orient` skill | Read-only route for current status, blockers, stale artifacts, and next safe action. | Must not edit files, create goals, launch runs, or mark state done. | Cite task/status/config/spec/run evidence used for the recommendation. |
| `harness:intake` skill | Captures ideas, bugs, requirements, and capture-thread notes before accepted scope exists. | Preview by default; record only after confirmation and only into supported task indexes. | Report duplicate/related work, proposed priority, route, and whether a spec or accepted-scope confirmation is needed. |
| `harness:execute` skill | Executes confirmed scope when role, route, verification, completion, and pause conditions are accepted. | Honors execution role. A `gate-only` lane dispatches workers and reviews evidence instead of editing implementation files. | Run goal/run verification, report Delivery State separately, and sync accepted state only from the controller lane. |
| `goal create` / `goal validate` | Converts confirmed spec or explicit spec-less accepted scope into an executable handoff. | Adapter goals require `--spec` unless `--allow-no-spec` is explicit; spec-less goals still require execution safety sections. | `goal validate` must pass before `run prepare` or completion recording. |
| `run prepare` | Creates run packet, prompts, DAG, delivery snapshot, and worker launch artifacts. | Does not start workers, daemons, delivery, review, deployment, or release by itself. | Inspect `run.md`, `dag.md`, `dag.json`, per-node prompts, and `run status --json`. |
| `codex-cli-subagent` worker | Default bounded worker surface for prepared run worker nodes when available. | Worker output is candidate evidence only and must not update accepted task/status/goal/run/gate/release state. | Return an Execution Result Packet with changed files, verification, known risks, Delivery State, and deferred items. |
| `codex-app-thread` worker / child controller | Explicit visible long-lived handoff lane when the controller asks for it. | Not the default worker surface; the launch packet must declare execution worker vs child controller, accepted-state owner, parent return channel, and allowed state writes. Do not use fork unless context inheritance is explicitly approved and re-scoped. | Execution workers return candidate evidence. Child controllers return status snapshots, decision requests, and final result packets for parent-level sync. |
| `manual-foreground` worker fallback | Use when no suitable worker surface exists or worker execution is unsafe. | Does not grant broader scope or acceptance authority. | Report why worker delegation was unavailable and provide local verification evidence. |
| `run node record` | Records one DAG node result before dependents are launched. | Must respect dependency order; a completed node needs verification evidence. | `run status --json` should show ready/waiting/completed nodes moving deterministically. |
| `run record` | Records completed or blocked run outcome after required DAG/gate evidence exists. | Does not modify source files, task indexes, review requests, integrations, releases, or deployment state. | Completed records require verification; `gate-only` completed records also require gate evidence. |
| `maintain tasks` | Previews or records conservative state sync from recent run evidence. | Refuses unsafe task-index writes such as table updates without unique title, recognized status column, and bounded transition. | Preview first; `--record` must state which status/task artifacts were written or refused. |

## Suite Routing

| Suite | Command | Use when |
| --- | --- | --- |
| Presentation | `npm run test:presentation` | README first screen, social preview assets, changelog, release notes, or GitHub metadata guidance changes. |
| Protocol | `npm run test:protocol` | Rule anchors, capability matrix links, suite routing, or protocol docs change. |
| Smoke | `npm run test:smoke` | CLI behavior, adapter contracts, templates, generated run packets, or smoke fixtures change. |
| Eval | `npm run test:eval` | Evaluation docs or evaluation fixtures change. |
| Plugin validation | `npm run validate:plugin` | Plugin manifest, skill files, references, templates, package surface, or installable plugin content changes. |
| Local all-tests route | `npm run test:all` | Presentation, protocol, and smoke coverage should run before handoff. Plugin validation remains a separate packaging gate. |

## Applicability

Use this matrix to choose the lightest surface that still preserves source of
truth, role separation, worker boundaries, Delivery State, and state sync.
Lower-level CLI commands are deterministic support tooling for skills,
operators, and maintainers; they are not a substitute for accepted scope or
controller review.
