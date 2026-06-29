# Goal: Agent Harness Adapter Contract

Spec: `docs/specs/2026-06-29-agent-harness-adapter-contract-design.md`
Status: Completed.

## Current Goal

Normalize Agent Harness public terminology around `fixed` and `adapter`
contracts, then make this repository use the adapter contract itself.

## Source Task

- User requested removal of versioned / historical terminology from current
  docs and asked to handle the current project according to the harness.

## Read First

1. `AGENTS.md`
2. `.agent-harness/config.json`
3. `docs/harness/README.md`
4. `docs/specs/2026-06-29-agent-harness-adapter-contract-design.md`
5. `README.md`
6. `docs/mental-model.md`
7. `docs/project-contract.md`
8. `docs/worktree-policy.md`
9. `plugins/agent-harness/scripts/agent-harness.mjs`
10. `plugins/agent-harness/skills/`
11. `plugins/agent-harness/references/`
12. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local` for this foreground documentation and contract cleanup. Do not
create a worktree unless the user explicitly asks.

## Scope

- Replace public versioned / historical terminology with `fixed` and `adapter`
  contract terminology.
- Update docs, skills, references, templates, CLI help, tests, and plugin
  metadata to use the new public terms.
- Convert this repository's `.agent-harness/config.json` to the adapter
  contract.
- Add this repository's project adapter under `docs/harness/README.md`.
- Keep no-daemon, no-push, no-PR, no-deploy behavior.
- Run deterministic validation.

## Non-Goals

- Do not add new automation loops.
- Do not start Codex sessions or daemons.
- Do not push, open PRs, deploy, publish, or release.
- Do not copy downstream project assumptions into plugin core.

## Verification

```bash
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

## Completion Conditions

- Public docs and skills consistently use `fixed` and `adapter` contracts.
- This repository resolves as `contract: "adapter"`.
- The project adapter exists and declares artifact paths, boundaries, state
  sync, and validation.
- Verification passes:
  - `npm run validate:plugin`
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`
- `tasks.md` and `.agent-harness/status.md` are updated.

## Pause Conditions

- User instructions conflict with `AGENTS.md`, the adapter, or code reality.
- A change would require migrating downstream projects without approval.
- Work requires credentials, paid APIs, production access, destructive
  commands, push, PR, deploy, publish, or release.
