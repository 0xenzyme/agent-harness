# Goal: Master Acceptance And Adapter Gates

Spec: harness/specs/2026-06-30-master-acceptance-and-adapter-gates.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: `P0 Add master acceptance and adapter-declared gates to Agent Harness`

## Source Task Acceptance Map

- Task: `Add master acceptance and adapter-declared gates to Agent Harness`
  - Acceptance: Agent Harness distinguishes candidate evidence from accepted
    completion by requiring spec checklist and adapter-required gate evidence
    before completed run records can be accepted.
  - Evidence: Config schema, CLI goal/run validation, templates, execute skill
    guidance, docs, and smoke fixtures now enforce checklist/gate evidence
    before completed run records.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-06-30-master-acceptance-and-adapter-gates.md`
7. `plugins/agent-harness/scripts/agent-harness.mjs`
8. `plugins/agent-harness/schemas/config.schema.json`
9. `plugins/agent-harness/templates/goal.md`
10. `plugins/agent-harness/skills/execute/SKILL.md`
11. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`.

## Execution Role

Use `mixed`.

- The current thread is the master control lane for final acceptance.
- The current thread is also authorized to edit files inside this accepted
  scope because the user explicitly asked to implement the agreed design.
- Completion still requires deterministic verification and run evidence.

## Route Explanation

- Why this is the right next mode: the design has already been discussed and
  accepted; remaining work is a bounded Agent Harness implementation slice.
- Confirmation boundary: pause before domain-specific content rules, activation
  behavior changes, push/PR/deploy/release, destructive operations, credentials,
  paid APIs, production access, or daemon/automation setup.

## Spec Acceptance Checklist

- Item: `Adapter-required gate contract`
  - Acceptance: Config schema and runtime config handling support
    `gates.requiredForCompletion` and `gates.blocking` as project-owned gate
    names.
  - Evidence: `plugins/agent-harness/schemas/config.schema.json`,
    `plugins/agent-harness/templates/config.adapter.json`, and
    `adapterRequiredCompletionGates` in
    `plugins/agent-harness/scripts/agent-harness.mjs`.
  - Status: `satisfied`
- Item: `Goal checklist and gate evidence sections`
  - Acceptance: Goal template and generated goals include
    `Spec Acceptance Checklist` and `Required Gate Evidence`.
  - Evidence: `plugins/agent-harness/templates/goal.md`,
    `plugins/agent-harness/templates/spec.md`, generated goal content in
    `buildGoalContent`, and smoke assertions for generated gate items.
  - Status: `satisfied`
- Item: `Completed run blocking behavior`
  - Acceptance: `run record --phase completed` rejects missing or unsatisfied
    required gate evidence even when technical verification is supplied.
  - Evidence: `runRecord` validates `Spec Acceptance Checklist` and
    `Required Gate Evidence`; `npm run test:smoke` covers pending gate and
    pending checklist rejection.
  - Status: `satisfied`
- Item: `Execute workflow guidance`
  - Acceptance: `harness:execute` instructs agents to derive checklist items
    from accepted specs before implementation for spec-heavy/product/content
    work.
  - Evidence: `plugins/agent-harness/skills/execute/SKILL.md`,
    `docs/project-contract.md`, `plugins/agent-harness/references/gate-results.md`,
    and `plugins/agent-harness/references/controller-communication.md`.
  - Status: `satisfied`
- Item: `Smoke coverage`
  - Acceptance: Smoke tests cover the false-completion guard and passing
    satisfied gate evidence.
  - Evidence: `tests/smoke.mjs` gated adapter fixture rejects technical-only
    completion and accepts satisfied checklist/gate evidence; `npm run
    test:smoke` passed.
  - Status: `satisfied`

## Required Gate Evidence

- Gate: `master-acceptance`
  - Required: `yes`
  - Evidence: Current control thread reviewed implementation diff and passed
    `node --check`, `git diff --check`, `npm run test:smoke`, `npm run
    validate:plugin`, and `goal validate`.
  - Status: `satisfied`

## Scope

- Implement adapter-declared completion gates.
- Implement reusable checklist/gate parsing and validation.
- Update run prepare/record metadata and completion checks.
- Update templates, execute skill instructions, docs, and tests.
- Update harness state and run evidence.

## Non-Goals

- Do not hardcode content-project quality rules into plugin core.
- Do not introduce b3ehive cron, lease, ROI, tmux worker, or blueprint
  machinery.
- Do not change activation behavior or `AGENTS.md`.
- Do not push, deploy, publish, open a PR, start a daemon, or launch additional
  sessions unless explicitly requested.
- Do not use credentials, paid APIs, production data, or destructive operations
  without explicit approval.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md
```

## Evidence And State Sync

- Candidate evidence: code diff, template/skill docs diff, schema diff, smoke
  fixture results.
- Accepted evidence: passing verification plus satisfied checklist and
  required gate evidence.
- State records to update: `harness/tasks.md`, `harness/status.md`, and run
  record under `.harness/runs/`.

## Completion Conditions

- The source task acceptance is satisfied.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete evidence.
- Every required gate item is `satisfied` with concrete evidence.
- Verification commands pass.
- `harness/tasks.md`, `harness/status.md`, and run evidence are synced.

## Pause Conditions

- The goal conflicts with the spec, adapter, repo instructions, production
  constraints, or newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- The work would require domain-specific content quality rules in plugin core.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
