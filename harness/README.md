# Agent Harness Project Adapter

Harness contract: adapter

## Artifact Paths

- Goal index: `harness/tasks.md`
- Status: `harness/status.md`
- Specs: `harness/specs/`
- Goals: `harness/goals/`
- Milestones / deferred register: `harness/milestones/`
- Mental models: `harness/mental-models/`

## Source Of Truth

- Public workflow: `README.md`
- Project contract: `docs/project-contract.md`
- Goal state: `harness/tasks.md`
- Current bounded status: `harness/status.md`

## Terminology

```text
Roadmap -> Milestone -> Goal -> Task -> Verified delivery
```

Goal owns accepted scope and completion. Task is a concrete component of a
Goal. Milestone owns whole-stage acceptance. Priority is only a priority.
Execution sessions, resume, workers, terminals and full logs belong to the
host, not a Harness Run.

## Hard Boundaries

- No network services, daemons, automatic workers, commit, push, deploy or
  release without separate explicit authority.
- Keep downstream product rules out of plugin core.
- Do not create source hashes, copied logs, receipts, checkpoints or evidence
  seals for delivery. Later code edits do not reopen completed Goals.

## State Sync

- Update `harness/tasks.md` after meaningful Goal state changes.
- Replace bounded current sections in `harness/status.md`.
- Keep README, skills, templates, CLI and tests aligned with delivery behavior.

## Commit / PR / Ship Policy

- Do not commit, push, open PRs, publish or release unless explicitly asked.

## Validation

```bash
npm run validate:plugin
npm run test:all
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

## Enabled Gates

- spec
- execution
- integration
