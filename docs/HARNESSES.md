# Agent Harness Capability Matrix

Agent Harness supplies durable project control that the Codex runtime does not:
configured artifact roots, repository Goals/Runs/DAGs, run-scoped delivery
evidence, candidate-versus-accepted evidence, controller gates, and state sync.

| Domain invariant | Contract |
| --- | --- |
| `harness-rule:path-containment` | All writes and artifact references remain inside configured roots after lexical and realpath checks. |
| `harness-rule:run-dag-ownership` | Runs record dependencies, ready state, ownership, verification, and candidate evidence. |
| `harness-rule:candidate-accepted-evidence` | Worker output stays candidate evidence until the accepted-state owner validates it. |
| `harness-rule:local-delivery-ceiling` | Local work does not imply commit, push, review, integration, release, or deploy. |
| `harness-rule:run-scoped-delivery` | Delivery claims compare this Run's start snapshot, delta, and explicit evidence. |
| `harness-rule:state-sync-evidence` | Durable completion includes verified State Sync Notes. |
| `harness-rule:bounded-status-snapshot` | Status is current and bounded; Runs and Goals retain history. |
| `harness-rule:project-neutral-core` | Adapters own downstream facts and paths. |
| `harness-rule:durable-tier-boundary` | Ordinary clear change/build uses Codex directly. |

Codex runtime owns worker selection, delegation, concurrency, cancellation, and
model/effort. Harness never starts workers or pins those settings by default.

Suite routing: `npm run test:presentation`, `npm run test:protocol`,
`npm run test:smoke`, `npm run test:routing-classification`, and
`npm run test:all`.
