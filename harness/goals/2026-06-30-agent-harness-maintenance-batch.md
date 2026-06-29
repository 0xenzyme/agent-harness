# Goal: Agent Harness Maintenance Batch

Spec: harness/specs/2026-06-30-agent-harness-maintenance-batch.md
Status: Completed.

## Source Task

- `harness/tasks.md`: `P2 Design Agent Harness evaluation fixture suite.`
- `harness/tasks.md`: `P2 Define Idea Inbox Thread workflow support.`
- `harness/tasks.md`: `P3 Explore optional competition skill for high-ambiguity harness shaping.`
- `harness/tasks.md`: `P3 Add JSON schema validation for .harness/config.json.`
- `harness/tasks.md`: `P3 Add examples for representative downstream project shapes.`

The conditional bootstrap / hooks follow-up is excluded by user instruction.

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-06-30-agent-harness-maintenance-batch.md`
7. `harness/mental-models/README.md`
8. `harness/mental-models/01-user-scenario.md`
9. `plugins/agent-harness/references/adapter-harness.md`
10. `plugins/agent-harness/references/task-routing.md`
11. `plugins/agent-harness/references/controller-communication.md`
12. `plugins/agent-harness/references/work-mode-policy.md`

## Work Mode Recommendation

Use `local` in the current checkout. Do not create a branch or worktree for
this batch unless newer instructions require isolation.

## Route Explanation

- Why this is the right next mode: the user explicitly authorized current
  thread control-lane execution for a confirmed combined development batch.
- Confirmation boundary: implement only the in-scope batch and leave
  conditional bootstrap / hooks work untouched.

## Scope

- Implement
  `harness/specs/2026-06-30-agent-harness-maintenance-batch.md`.
- Add evaluation fixtures and representative downstream project shape
  examples.
- Document Idea Inbox Thread workflow support and optional competition routing
  as Agent Harness contracts.
- Add dependency-free schema validation for `.harness/config.json`.
- Update smoke tests, public docs, references, templates, workflow skills, and
  current harness state as needed.

## Non-Goals

- Do not implement conditional bootstrap, hooks, or activation behavior.
- Do not create a new installed `harness:compete` skill.
- Do not push, deploy, publish, open a PR, start a daemon, or launch additional
  sessions unless explicitly requested.
- Do not use credentials, paid APIs, production data, or destructive operations
  without explicit approval.
- Do not add downstream-specific facts to plugin core docs, templates, or
  examples.

## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation
  rules, preflight requirements, and state-sync requirements.
- Preflight: Read `AGENTS.md` before editing repository files.
- Preflight: Validate plugin changes with `npm run validate:plugin`.
- State sync: Update `harness/tasks.md` after meaningful task state changes.
- State sync: Update `harness/status.md` after execution or verification.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-agent-harness-maintenance-batch.md --json
rg -n "b3ehive|~/project|/Users/" README.md README.zh-CN.md docs plugins/agent-harness evals
```

The final grep should return no matches in public docs, plugin files, or
evaluation docs.

## Evidence And State Sync

- Candidate evidence: existing mental model notes, current task index, smoke
  fixture behavior, and CLI validation output.
- Accepted evidence: implemented files, passing verification commands, updated
  task index, updated status, and completed spec/goal records.
- State records to update: this goal, the linked spec, `harness/tasks.md`, and
  `harness/status.md`.

## Completion Conditions

- All linked in-scope tasks are implemented or explicitly recorded as included
  in this batch.
- Schema validation is exposed through CLI behavior and tests.
- Evaluation fixtures, examples, Idea Inbox workflow, and competition routing
  are documented in stable project-neutral surfaces.
- Verification passes or any failure is recorded with a blocker and next step.
- The conditional bootstrap / hooks item remains unchanged and out of scope.

## Pause Conditions

- The goal conflicts with the spec, adapter, repo instructions, production
  constraints, or newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, release, hooks, daemons, or background automation are
  required.
