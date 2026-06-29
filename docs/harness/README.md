# Agent Harness Project Adapter

Harness contract: adapter

This adapter records project-specific rules for the Agent Harness repository.
Generic protocol lives in the plugin references under
`plugins/agent-harness/references/`.

## Artifact Paths

- Task index: `tasks.md`
- Status file: `.agent-harness/status.md`
- Specs: `docs/specs/`
- Goals: `.agent-harness/goals/`
- Milestones: `docs/milestones/`
- Runs / logs: `.agent-harness/runs/`
- Gate records: `.agent-harness/runs/`
- Deferred register: `docs/milestones/`
- Mental model / invariants: `docs/architecture.md`

## Source Of Truth

- Public package shape and first-use workflow: `README.md`
- Project contracts: `docs/project-contract.md`
- Architecture and loop boundaries: `docs/architecture.md`
- Task state: `tasks.md`
- Current execution status: `.agent-harness/status.md`

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
- Inspect `.agent-harness/config.json` and this adapter before goal or run work.
- Use the current checkout unless the user explicitly asks for an isolated
  worktree.

## State Sync Requirements

- Update `tasks.md` after meaningful task state changes.
- Update `.agent-harness/status.md` after execution or verification.
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

## Adapter-Owned Overrides

- Public terminology uses `fixed` and `adapter` contracts.
- New examples should use `--contract adapter`, not a versioned or historical
  command form.
