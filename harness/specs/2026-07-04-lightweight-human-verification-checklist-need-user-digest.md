# Spec: Lightweight Human Verification Checklist And Need User Digest

Created: 2026-07-04
Status: accepted

## Background

Recent Harness closeouts can make routine work feel like it still needs the
user to confirm something. The source intake asked for a simplified manual
verification checklist and a way to reduce repeated questions about whether
there are human confirmation points.

Harness should make the difference explicit:

- routine closeouts state that no human action is needed;
- true pause triggers list concrete user decisions, manual verification, or
  missing authorization;
- `Remaining` records non-user follow-up or blockers separately from user
  action.

## Goal

Define and implement the user-facing closeout shape for manual verification,
`Need user`, and `Remaining` so Harness agents do not repeatedly ask broad
confirmation questions at the end of routine work.

## Scope

- Update the default user-facing closeout contract to include `Need user`.
- Define the manual verification checklist categories that belong in
  `Need user`.
- Define when `Need user: None` and `Remaining: None` must be used.
- Update Controller / worker packet references so candidate result packets can
  report concrete user needs without forcing final closeouts to ask vague
  confirmation questions.
- Update generated run packets and execution prompts to remind agents to use
  the new closeout shape.
- Add deterministic checks for the closeout contract and generated packet text.
- Sync Harness task, status, goal, and run evidence.

## Non-Goals

- Do not implement the separate Level 0 Fast Path policy.
- Do not implement EnvContext focus or intent-routing model changes.
- Do not research or implement control-theory feedback loop changes.
- Do not redesign the whole Delivery State model.
- Do not add network services, daemons, watchers, credentials, paid APIs,
  production access, destructive operations, commits, pushes, reviews,
  integrations, releases, deploys, or publication.

## Key Decisions

- `Need user` names only concrete human action: a decision, authorization,
  required manual verification, product-direction choice, credential or paid API
  handoff, production access, destructive-operation approval, or external
  evidence that the agent cannot supply.
- `Need user` must be `None` when no true pause trigger exists. Agents should
  not ask "anything to confirm?" as a routine closeout habit.
- `Remaining` names non-user work that is still incomplete: missing
  verification, a failing command, delivery pending, follow-up work, or
  blockers. It must be `None` when no follow-up remains.
- Manual verification belongs in `Need user` only when the user must actually
  inspect or decide something. Agent-performed visual/manual inspection belongs
  in `Verification`, not `Need user`.
- Closeouts stay short: changed work, verification, delivery state, `Need user`,
  and `Remaining`.

## Task Routing

- Level: standard adapter implementation.
- Reason: user-facing protocol, skill references, templates, generated run
  text, and deterministic checks change together.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, this spec, closeout/controller
  references, templates, CLI generator, `scripts/test-suites.mjs`, and
  `tests/smoke.mjs`.
- Required gates: goal validation, run preparation/status evidence,
  deterministic tests, plugin validation, git whitespace check, and Harness
  state sync.
- Execution role: `mixed`; the delegated Controller thread may edit this
  bounded local protocol/docs/templates/tests slice and then accept it after
  verification.
- Work mode: `local` in the current checkout and branch.
- Optional competition needed: no; the behavior request and non-goals are
  concrete.

## Spec Acceptance Checklist

- Item: `Closeout shape`
  - Acceptance: The default closeout shape includes `Need user` between
    `Delivery state` and `Remaining`.
  - Evidence: `plugins/agent-harness/skills/execute/references/user-facing-closeout.md` and `docs/project-contract.md` define the default shape with `Need user` between `Delivery state` and `Remaining`; `plugins/agent-harness/skills/execute/SKILL.md` requires final answers to include both fields.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Need user semantics`
  - Acceptance: References define that `Need user` lists only concrete human
    decisions, manual verification, authorization, credentials/paid API,
    production, destructive-operation, product-direction, or external-evidence
    needs, and uses `None` when no true pause trigger exists.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`, `plugins/agent-harness/references/controller-communication.md`, and `plugins/agent-harness/templates/worker-prompt.md` define `Need user: None` and true pause-trigger semantics.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Remaining semantics`
  - Acceptance: References define that `Remaining` is separate from
    `Need user` and uses `None` when no non-user follow-up remains.
  - Evidence: `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`, `docs/project-contract.md`, `plugins/agent-harness/references/controller-communication.md`, and `plugins/agent-harness/templates/goal.md` separate `Remaining` from `Need user` and require `Remaining: None` when no follow-up remains.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Generated run guidance`
  - Acceptance: Prepared run packets and execution prompts tell agents to close
    with explicit `Need user` and `Remaining` values instead of broad
    confirmation questions.
  - Evidence: `plugins/agent-harness/scripts/agent-harness.mjs` emits the guidance; `.harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/run.md` and `prompt.md` contain `Need user: None` / `Remaining: None` closeout instructions.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Protocol and smoke checks protect the closeout contract and
    generated run guidance.
  - Evidence: `scripts/test-suites.mjs` protects `harness-rule:need-user-digest`; `tests/smoke.mjs` asserts the closeout reference, controller packets, worker prompt, generated `run.md`, generated `prompt.md`, and generated worker prompts. Validation passed with node syntax checks, `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`, `git diff --check`, goal validation, and run status.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Current mixed Controller reviewed the scoped diff, verified that the generated run packet contains the Need-user digest guidance, recorded completed DAG nodes in .harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/, and passed node syntax checks, npm run test:protocol, npm run test:smoke, npm run validate:plugin, git diff --check, goal validate, and run status --json.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Evidence Plan

- Candidate evidence sources: implementation diff, prepared run packet,
  generated prompt text, and deterministic command output.
- Accepted evidence: Controller review against every checklist item, passing
  verification, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, the goal
  file, and `.harness/runs/`.

## Acceptance Criteria

- Routine final answers can say `Need user: None` and `Remaining: None`.
- True pause triggers are listed as specific `Need user` items, not broad
  "please confirm anything" questions.
- `Remaining` does not hide user decisions; `Need user` does not list ordinary
  non-user follow-up.
- Generated run guidance and tests protect the behavior.
- Harness state records contain concrete verification and delivery evidence.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-lightweight-human-verification-checklist-and-need-user-digest.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

## Pause Conditions

- This spec conflicts with repository instructions, adapter rules, code
  constraints, or newer user instructions.
- Closeout changes expand into the separate Level 0 Fast Path, EnvContext, or
  control-theory goals.
- Product semantics become unclear in a way that changes compatibility,
  routing behavior, or acceptance policy beyond the closeout digest.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
