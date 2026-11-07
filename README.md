# Agent Harness

[简体中文](README.zh-CN.md)

[![Version](https://img.shields.io/badge/version-0.14.0-0f766e)](CHANGELOG.md)
[![Codex Plugin](https://img.shields.io/badge/Codex-plugin-111827)](plugins/agent-harness/.codex-plugin/plugin.json)
[![Protocol](https://img.shields.io/badge/protocol-checks-0369a1)](docs/HARNESSES.md)
[![Smoke](https://img.shields.io/badge/smoke-checks-1d4ed8)](docs/HARNESSES.md)
[![License](https://img.shields.io/badge/license-MIT-7c3aed)](LICENSE)

Agent Harness is an adapter-driven control plane for coding-agent work. It
turns accepted direction into verified delivery without making the human route
every task.

```text
Roadmap -> Milestone -> Goal -> Task -> Verified delivery
```

[Quick Start](#use-with-a-coding-agent) · [How It Works](#how-it-works) ·
[Capability Matrix](docs/HARNESSES.md) · [Changelog](CHANGELOG.md) ·
[v0.14.0 Notes](docs/releases/v0.14.0.md) ·
[Social Preview](docs/assets/github/social-preview.svg)

## Use With A Coding Agent

### 1. Ask the current host to use Harness

```text
Use harness to check the next step in this project.
Use harness to record this idea, but do not implement it yet: Add an import flow.
Use harness to execute harness/goals/YYYY-MM-DD-task-title.md, verify it, and sync state.
```

### 2. Adopt a project with the CLI

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd <project> --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd <project>
```

Skills install into `.agents/skills/`. `skills uninstall` removes installed
skills and byte-identical references without deleting project data. Codex and
Grok marketplace installation is optional; see [Install](docs/install.md) and
[Plugins Directory](https://github.com/0xenzyme/agent-harness).

### 3. Choose an explicit entry when needed

| Situation | Public skill |
| --- | --- |
| Adopt, import, doctor or preview activation | `harness:init` |
| Inspect accepted outcomes and next actions | `harness:orient` |
| Capture an unaccepted idea | `harness:intake` |
| Deliver accepted Goals/Milestones or sync existing state | `harness:execute` |

Ordinary clear changes use the host directly. `host-direct-postflight` updates
only existing state after direct work. Accepted Goal/Milestone control uses
`durable-harness`, but does not create a Run.

## How It Works

The host owns runtime outcomes, transient plans, sessions, resume, workers,
terminals and full verification output. Harness owns the accepted target,
dependencies, constraints, concise verification and bounded delivery state.

A plan lives beside its target as `<target-filename>.plan.json`. It declares
Goal/Task dependencies, ownership, acceptance mappings and verification
commands. The controller calls `execute next`, implements and verifies in the
host, records actual outcomes in acceptance items, then closes with:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal complete --cwd <project> --goal <goal> --verification "unit: 85 passed; integration: passed"
node plugins/agent-harness/scripts/agent-harness.mjs milestone complete --cwd <project> --milestone <milestone> --verification "integration: passed; hard constraints checked"
```

The CLI validates recorded acceptance; it does not run tests or infer success.
It writes only the Goal/Milestone, task index and bounded status. There are no
Run directories, DAGs, receipts, checkpoints, source hashes, copied logs or
evidence seals. Later source edits never reopen completed targets; new changes
are verified independently.

## Why Agent Harness

- Keeps a Milestone selected until all required Goals and stage checks finish.
- Distinguishes local acceptance from whole-target delivery and constraints.
- Treats worker output as candidate until the outcome owner verifies it.
- Uses project adapters for paths, gates and project-specific boundaries.
- Pauses only for genuine scope, authority, verification or product decisions.
- Bounds current status and compacts old task entries without recording
  execution history.

Legacy Run/checkpoint configuration is ignored during migration. Old files may
remain as historical material, but they do not drive routing, completion,
pruning or revalidation.

## Safety And Acceptance

All writes and acceptance references stay inside configured roots. Resolve
local/worktree/ask before delegation. Do not commit, push, deploy or release
without the required authority. Status is a bounded current projection, not a
process log.

See [Project Contract](docs/project-contract.md),
[Capability Matrix](docs/HARNESSES.md), and
[Delivery Plan](plugins/agent-harness/references/planned-execution.md).

## Repository And Validation

- `plugins/agent-harness/skills/`: four workflow skills.
- `plugins/agent-harness/references/`: protocol references.
- `plugins/agent-harness/schemas/` and `templates/`: delivery contracts.
- `plugins/agent-harness/scripts/`: deterministic delivery-control CLI.
- `evals/`: project-neutral behavior fixtures.

```bash
git diff --check
npm run test:all
npm run validate:plugin
```

The external official plugin validator may be unavailable locally; use
`npm run validate:plugin:local` as the separate portable integrity check.

## Documentation

- [Usage](docs/usage.md)
- [Install](docs/install.md)
- [CLI Reference](docs/cli.md)
- [Capability Matrix](docs/HARNESSES.md)
- [Project Contract](docs/project-contract.md)
- [Control Feedback](docs/cybernetic-stability.md)
- [GitHub Presentation](docs/github-presentation.md)
- [v0.14.0 Release Notes](docs/releases/v0.14.0.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
