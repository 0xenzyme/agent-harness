# Goal: Agent Harness Activation And Next-Action

Spec: `harness/specs/2026-06-29-agent-harness-activation-and-next-action-design.md`
Status: Completed.

## Current Goal

Implement the first Agent Harness activation and next-action workflow from the
spec, keeping all behavior deterministic, explicit, and non-destructive by
default.

## Must Read

- `AGENTS.md`
- `.harness/config.json`
- `harness/README.md`
- `harness/tasks.md`
- `harness/status.md`
- `harness/mental-models/01-user-scenario.md`
- `harness/specs/2026-06-29-agent-harness-activation-and-next-action-design.md`
- `plugins/agent-harness/scripts/agent-harness.mjs`
- `plugins/agent-harness/skills/harness-init/SKILL.md`
- `plugins/agent-harness/skills/harness-goal/SKILL.md`
- `tests/smoke.mjs`

## Work Mode Recommendation

Use `ask` before implementation begins because the goal touches plugin command
surface and possible session-start bootstrap behavior. Use `local` for
foreground documentation/spec cleanup.

## Allowed Scope

- Add or update CLI support for activation snippet / activation preview.
- Add or update CLI support for read-only orientation / next-action summaries.
- Defer conditional plugin bootstrap to a concrete follow-up task unless it can
  be scoped to projects with `.harness/config.json` and tested safely inside
  this goal.
- Update skills, references, templates, public docs, and smoke tests to match
  implemented behavior.
- Update harness task/status records after verification.

## Forbidden Scope

- Do not silently modify `AGENTS.md`.
- Do not weaken existing project instructions.
- Do not inject harness behavior into projects that do not have harness config.
- Do not push, deploy, publish, open a PR, start a daemon, or launch additional
  sessions unless explicitly requested.
- Do not use credentials, paid APIs, production data, or destructive operations
  without explicit approval.

## Verification

```bash
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN
```

Add temporary-project checks for activation and orientation behavior when the
implementation introduces new commands or generated text.

## Completion Conditions

- The spec is accepted and matches implementation decisions.
- Activation snippet / preview behavior is implemented through
  `agent-harness activation snippet`.
- Orientation / next-action behavior is implemented through
  `agent-harness orient next`.
- Conditional bootstrap is deferred to `P2 Validate conditional Agent Harness
  bootstrap` with rationale.
- Tests and validation pass.
- `harness/tasks.md` and `harness/status.md` are updated.

## Pause Conditions

- The goal conflicts with the spec, adapter, repo instructions, production
  constraints, or newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
- Hook behavior cannot be made conditional on harness project state.
- `AGENTS.md` changes require merging existing instructions without explicit
  user approval.
