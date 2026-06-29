# Agent Harness Project Adapter

Harness contract: adapter

This adapter records project-specific rules for the Agent Harness repository.
Generic protocol lives in the plugin references under
`plugins/agent-harness/references/`.

## Artifact Paths

- Task index: `harness/tasks.md`
- Status file: `harness/status.md`
- Specs: `harness/specs/`
- Goals: `harness/goals/`
- Milestones: `harness/milestones/`
- Runs / logs: `.harness/runs/`
- Gate records: `.harness/runs/`
- Deferred register: `harness/milestones/`
- Mental models: `harness/mental-models/`
- Mental model index: `harness/mental-models/README.md`

## Source Of Truth

- Public package shape and first-use workflow: `README.md`
- Project contracts: `docs/project-contract.md`
- Mental model and loop boundaries: `harness/mental-models/README.md`
- Task state: `harness/tasks.md`
- Current execution status: `harness/status.md`

## Hard Boundaries

- Do not add network services, persistent daemons, watchers, automatic Codex
  session launching, push, PR, deploy, publish, or release behavior without a
  separate approved design.
- Do not copy downstream project product names, provider rules, production
  rules, DB shape, ports, slots, route lists, or credential policies into
  plugin core.
- Keep plugin contracts stable and explicit.

## Preflight Requirements

- Read `AGENTS.md` before editing.
- Inspect `.harness/config.json` and this adapter before goal or run work.
- Use the current checkout unless the user explicitly asks for an isolated
  worktree.

## State Sync Requirements

- Update `harness/tasks.md` after meaningful task state changes.
- Update `harness/status.md` after execution or verification.
- Keep docs, skills, templates, CLI help, and tests aligned when changing the
  public command surface.

## Commit / PR / Ship Policy

- Do not commit, push, open PRs, publish, or release unless explicitly asked.

## Validation Commands

```bash
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

## Enabled Gates

- spec
- execution
- integration

## Task Kinds

- `development`: scoped implementation, review, repair, or documentation work.
- `observe`: harness-defined ongoing observation. This repository currently
  has no project-specific observe sources configured.

## Adapter-Owned Overrides

- Public terminology uses `fixed` and `adapter` contracts.
- New examples should use `--contract adapter`, not a versioned or historical
  command form.
