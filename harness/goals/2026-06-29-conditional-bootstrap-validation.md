# Goal: Conditional Bootstrap Validation

Spec: `harness/specs/2026-06-29-conditional-bootstrap-validation-design.md`
Status: Completed.

## Current Goal

Validate whether Agent Harness can safely add a conditional `SessionStart`
bootstrap now, and record the implementation decision without changing plugin
activation behavior prematurely.

## Source Task

`harness/tasks.md` item: `P2 Validate conditional Agent Harness bootstrap`.

## Read First

- `AGENTS.md`
- `.harness/config.json`
- `harness/tasks.md`
- `harness/status.md`
- `harness/mental-models/01-user-scenario.md`
- `harness/specs/2026-06-29-agent-harness-activation-and-next-action-design.md`
- `harness/specs/2026-06-29-conditional-bootstrap-validation-design.md`
- `plugins/agent-harness/.codex-plugin/plugin.json`
- `tests/smoke.mjs`
- local external hook-manifest evidence captured during validation

## Work Mode Recommendation

Use `local`. This is a validation and documentation task in the current
checkout. Do not create a worktree unless the user asks.

## Scope

- Inspect external hook-manifest shape as local evidence without adding a repo
  dependency.
- Test whether an Agent Harness manifest with `hooks` passes plugin validation.
- Update specs, mental models, public docs, and smoke tests with the decision.
- Update harness task/status records after verification.

## Non-Goals

- Do not add `hooks` to the current Agent Harness plugin manifest.
- Do not silently modify `AGENTS.md`.
- Do not inject harness behavior into non-harness projects.
- Do not push, deploy, publish, open a PR, start a daemon, or launch additional
  sessions unless explicitly requested.
- Do not use credentials, paid APIs, production data, or destructive operations.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-29-conditional-bootstrap-validation.md --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN
```

## Completion Conditions

- The conditional bootstrap decision is documented.
- Agent Harness plugin manifest remains hook-free.
- Smoke tests guard against accidental hook declaration.
- Task/status records are synced.
- Validation passes.

## Pause Conditions

- The validation result conflicts with the spec, adapter, repo instructions, or
  newer user instructions.
- The decision would require choosing product direction without user approval.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
- The current plugin validation contract changes and accepts hooks.
- Runtime verification in Codex App or Codex CLI becomes available and changes
  the decision.
- Enabling a hook would affect projects without `.harness/config.json`.
