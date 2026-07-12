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
| `harness-rule:level-0-fast-path` | Level 0 direct execution is allowed only for small local, reversible, low-risk fixes by an `implementer` or explicitly accepted `mixed` thread. It cannot bypass accepted Harness artifacts, adapter gates, source-of-truth/public protocol changes, Controller/gate roles, or concrete verification and closeout evidence. |
| `harness-rule:bounded-direct-execution` | Accepted, finite, single-thread work may execute without a new Goal/Run/DAG when it needs no durable handoff, worker/DAG, multi-stage or broad implementation, important runtime/schema behavior change, acceptance/Milestone map, or adapter-required gate. Docs-only clarification may use this tier; delivery authorization alone does not select durable orchestration. |
| `harness-rule:context-focus-routing` | Normalize user intent to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` before selecting the smallest useful context focus. Public guidance uses `context focus` and `focus preset`; internal EnvContext design language must not become a user-facing API, parameter, config field, or storage contract. |
| `harness-rule:cybernetic-stability` | Harness should control toward an explicit target using fresh observations, measurement snapshots, remaining-gap comparison, feedback-quality checks, and stability/saturation pause triggers. The dedicated model lives in [`docs/cybernetic-stability.md`](cybernetic-stability.md). |
| `harness-rule:intent-setpoint-selection` | Intent recognition selects the target / setpoint before routing. If the target is wrong, later execution can be locally stable while completing the wrong work. |
| `harness-rule:sensor-freshness` | Prefer newer explicit user instructions and fresh local observations over stale artifacts; report conflicts instead of silently choosing older state. |
| `harness-rule:measurement-snapshot` | Before execution and closeout, summarize target, observed state, evidence, conflicts or stale artifacts, delivery state, user-decision state, and remaining gap. |
| `harness-rule:remaining-gap` | Non-trivial loops must state what gap was closed and what remains. If no gap shrank, re-orient or pause instead of continuing by momentum. |
| `harness-rule:feedback-quality` | Completion evidence must be strong enough for the target; distinguish fresh tests, CI, user confirmation, command output, agent narrative, delayed feedback, and stale status. |
| `harness-rule:stability-saturation` | Pause or re-route when the loop oscillates, repeats ineffective actions, or reaches context, authority, credential, cost, risk, external-feedback, or delivery-policy limits. |
| `harness-rule:terminology-boundary` | User-facing hierarchy is `Roadmap -> Milestone -> Goal -> Task -> Run`. `P0` / `P1` / `P2` / `P3` are priorities only, `M*` identifies roadmap milestones, and Runs are execution attempts rather than threads or sessions. |
| `harness-rule:local-delivery-ceiling` | `implemented-local` and `validated-local` prove only local working-tree or local verification state. They are not commit, push, review, integration, release, or ship evidence. |
| `harness-rule:worker-surface-default` | Prepared run packets default worker nodes to `codex-cli-subagent` when available. Codex App threads are explicit long-lived handoff lanes, and fork is not a default worker surface. |
| `harness-rule:child-controller-boundary` | A visible long-lived thread must declare whether it is a child controller or execution worker. A child controller owns accepted state only inside its authorized scope; the parent controller receives snapshots, decisions, and final result packets instead of repeating same-scope acceptance. |
| `harness-rule:degraded-execution-provenance` | Worker/controller fallback must be visible. When execution uses `manual-foreground`, skips the default worker surface, or otherwise degrades from the planned delegation method, the run, gate, or closeout evidence names the actual execution method, unavailable surface, fallback reason, and candidate-evidence boundary. |
| `harness-rule:controller-cancellation-boundary` | Controller cancellation and supersession are cooperative control-plane signals, not runtime kill guarantees. The controller may stop new dependent launches, quarantine late worker output, and block acceptance until active worker state is resolved; it must not present cancellation as proof that a subagent runtime stopped. |
| `harness-rule:bounded-status-snapshot` | The configured status file is a bounded current-state snapshot, not an append-only history log. Replace current status sections when syncing state; keep historical details in tasks, goals, runs, and gate records. |
| `harness-rule:need-user-digest` | Routine closeouts state `Need user: None` and `Remaining: None` when no true pause trigger or follow-up exists. Only concrete human decisions, manual verification, authorization, credentials, paid/production access, destructive-operation approval, product direction, or external evidence belong in `Need user`. |
| `harness-rule:project-neutral-core` | Plugin core docs, templates, examples, validation, and skills stay project-neutral. Downstream product facts, credentials, provider policy, ports, and production procedures belong in adapters and artifacts. |
| `harness-rule:state-sync-evidence` | Completion of work already tracked by Harness includes state-sync evidence or state-sync notes from the executing lane. Accepted-state writes remain limited to the authorized owner. Untracked bounded direct work uses verified closeout evidence and must not create a lifecycle solely for bookkeeping. Candidate summaries are not accepted state. |

## Runtime And Control Surfaces

| Surface | Default / Applicability | Boundary | Verification expectation |
| --- | --- | --- | --- |
| `harness:init` skill | Default setup/adoption route for a new or migrated project. | Preview activation and adapter changes before mutating project instructions; do not make project-specific policy part of plugin core. | `config validate`, `doctor`, and artifact-path inspection when setup changes are written. |
| `harness:orient` skill | Read-only route for current status, blockers, stale artifacts, and next safe action. | Must not edit files, create goals, launch runs, or mark state done. | Cite task/status/config/spec/run evidence used for the recommendation. |
| `harness:intake` skill | Captures ideas, bugs, requirements, and capture-thread notes before accepted scope exists. | Preview by default; record only after confirmation and only into supported task indexes. | Report duplicate/related work, proposed priority, route, and whether a spec or accepted-scope confirmation is needed. |
| `Level 0 Fast Path` | Direct current-thread execution for typos, small local fixes, and clear reversible low-risk bugs. | May skip durable spec/goal/run and worker delegation only when no accepted Harness artifact, adapter gate, Controller/gate role, product/project semantic change, public protocol/source-of-truth change, schema, external system, credential, paid/prod, destructive, or larger Goal/Milestone obligation applies. | Closeout still reports a short route reason, scoped diff summary, concrete verification, Delivery State, `Need user`, and `Remaining`. |
| `Bounded Direct Execution` | Accepted finite work that one `implementer` thread can complete and verify in the current checkout; includes docs-only clarification of an existing contract. | Does not create Goal/Run/DAG/task/status artifacts for bookkeeping. Use durable orchestration for recovery/handoff, workers/DAG, multi-stage or broad work, important runtime/schema changes, acceptance/Milestone maps, adapter gates, or an explicit Goal request. | Verify the scoped change, sync only relevant pre-existing Harness artifacts, and report Delivery State, `Need user`, and `Remaining`. |
| `harness:execute` skill | Prepares a repository Goal from accepted scope or executes confirmed scope when role, verification, completion, and pause conditions are accepted. | Honors execution role. A `gate-only` lane dispatches workers and reviews evidence instead of editing implementation files. Generated Goals are local-only unless fresh authority raises delivery. | Run goal/run verification, report Delivery State separately, and sync accepted state only from the controller lane. |
| `goal create` / `goal validate` | Converts confirmed spec or explicit spec-less accepted scope into an executable handoff. | Adapter goals require `--spec` unless `--allow-no-spec` is explicit; spec-less goals still require execution safety sections. | `goal validate` must pass before `run prepare` or completion recording. |
| `run prepare` | Creates run packet, prompts, DAG, delivery snapshot, and worker launch artifacts. | Does not start workers, daemons, delivery, review, deployment, or release by itself. | Inspect `run.md`, `dag.md`, `dag.json`, per-node prompts, and `run status --json`. |
| `codex-cli-subagent` worker | Default bounded worker surface for prepared run worker nodes when available. | Worker output is candidate evidence only and must not update accepted task/status/goal/run/gate/release state. | Return an Execution Result Packet with changed files, verification, known risks, Delivery State, State Sync Notes, and deferred items. |
| `codex-app-thread` worker / child controller | Explicit visible long-lived handoff lane when the controller asks for it. | Not the default worker surface; the launch packet must declare execution worker vs child controller, accepted-state owner, parent return channel, and allowed state writes. Do not use fork unless context inheritance is explicitly approved and re-scoped. | Execution workers return candidate evidence. Child controllers return status snapshots, decision requests, and final result packets for parent-level sync. |
| `manual-foreground` worker fallback | Use when no suitable worker surface exists or worker execution is unsafe. | Does not grant broader scope or acceptance authority. `harness-rule:degraded-execution-provenance` requires the fallback to be visible instead of silently treated as normal worker execution. | Report actual execution method, unavailable worker surface, fallback reason, candidate-evidence boundary, and local verification evidence. |
| `controller cancellation / supersession` | Use when a controller needs to stop accepting a worker lane, change same-scope direction, or handle late worker output. | Cooperative control-plane only; it does not kill or prove termination of a Codex subagent. Late output remains candidate evidence until the controller rejects, quarantines, or revalidates it. | Status snapshot names active workers, affected run/node, cancellation reason, late-output handling, and any degraded provenance for manual foreground fallback. |
| `run node record` | Records one DAG node start/result before concurrent or dependent launches. | Must respect dependency order; concurrent writers require `--isolation-evidence`; a completed node needs verification evidence. | `run status --json` should show ready/running/waiting/completed nodes and isolation evidence deterministically. |
| `run record` | Records completed or blocked run outcome after required DAG/gate evidence exists. | Does not modify source files, task indexes, review requests, integrations, releases, or deployment state. | Completed records require verification; `gate-only` completed records also require gate evidence. |
| `maintain tasks` | Previews or records conservative state sync from recent run evidence. | Refuses unsafe task-index writes such as table updates without unique title, recognized status column, and bounded transition. The status file remains a bounded current-state snapshot. | Preview first; `--record` must state which status/task artifacts were written or refused. |

## Suite Routing

| Suite | Command | Use when |
| --- | --- | --- |
| Presentation | `npm run test:presentation` | README first screen, social preview assets, changelog, release notes, or GitHub metadata guidance changes. |
| Protocol | `npm run test:protocol` | Rule anchors, capability matrix links, suite routing, or protocol docs change. |
| Smoke | `npm run test:smoke` | CLI behavior, adapter contracts, templates, generated run packets, or smoke fixtures change. |
| Deterministic eval | `npm run test:eval` | Evaluation docs or fixtures change; does not measure model activation. |
| Live activation eval | `AGENT_HARNESS_LIVE_EVAL=1 npm run test:eval:live -- --model <model>` | Explicitly authorized model routing check; requires runtime-reported model evidence. |
| Plugin validation | `npm run validate:plugin` | Plugin manifest, skill files, references, templates, package surface, or installable plugin content changes. |
| Local all-tests route | `npm run test:all` | Presentation, protocol, and smoke coverage should run before handoff. Plugin validation remains a separate packaging gate. |

## Applicability

Use this matrix to choose the lightest surface that still preserves source of
truth, role separation, worker boundaries, Delivery State, and state sync.
Lower-level CLI commands are deterministic support tooling for skills,
operators, and maintainers; they are not a substitute for accepted scope or
controller review.
