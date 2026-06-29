# Agent Harness Adapter Contract Design

Status: accepted
Created: 2026-06-29
Updated: 2026-06-29

## Background

Agent Harness started with a fixed-path control plane:

- `tasks.md`
- `.agent-harness/config.json`
- `.agent-harness/status.md`
- `.agent-harness/goals/`
- `.agent-harness/runs/`

That shape remains useful for small projects, but it is too narrow for projects
that already have their own task index, specs, goals, milestones, gate records,
or status documents. The harness now needs a stable adapter contract that lets
each project declare where those artifacts live.

## Core Principle

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

## Contracts

Agent Harness supports two public project contracts:

- `fixed`: fixed-path task control for simple projects.
- `adapter`: configurable project adapter with task, spec, goal, run, gate, and
  state-sync paths.

The command surface and docs should use `fixed` and `adapter`. Historical names
and numbered versions should not be part of the public contract.

## Adapter Model

The adapter contract standardizes this formula:

```text
adapter contract = task with status + spec + DAG + goal + gate
```

The formula is generic. A project adapter decides where the task index, specs,
goals, milestones, gates, status, deferred register, and logs live.

## Plugin Layer

The plugin owns reusable protocol and deterministic helpers:

- task routing;
- spec, goal, milestone, and run lifecycle;
- gate result format;
- controller and execution packet formats;
- model / effort routing labels;
- work mode guidance;
- optional walkthrough and retrospective gate templates;
- base spec, goal, milestone, adapter, and config templates.

Plugin core must not contain downstream product names, database choices,
production deployment rules, ports, credentials, paid-call policy, provider
rules, Admin CLI rules, or route lists.

## Project Adapter Layer

Each adapter-contract project owns a thin adapter, typically
`docs/harness/README.md`. The adapter declares:

- artifact paths and source-of-truth files;
- task index format;
- hard boundaries for DB, production, Admin CLI, credentials, paid calls, and
  destructive operations;
- commit, PR, release, and ship policy;
- validation commands;
- enabled gates and project-specific gate details;
- UI harness, mental model, or invariant document locations when relevant.

The adapter may narrow or add constraints. It should not redefine the generic
harness lifecycle in a way that conflicts with plugin core.

## Artifact Layer

Artifacts record facts and execution evidence:

- task indexes;
- specs;
- goals;
- milestones;
- run logs;
- gate records;
- deferred / follow-up registers;
- project status;
- mental model / invariants.

## Config Shape

Minimum adapter config:

```json
{
  "contract": "adapter",
  "projectName": "",
  "adapter": {
    "docs": "docs/harness/README.md",
    "machineReadable": ".agent-harness/config.json",
    "preflight": [],
    "stateSync": []
  },
  "paths": {
    "taskIndex": "tasks.md",
    "status": ".agent-harness/status.md",
    "specs": "docs/specs",
    "goals": "docs/goals",
    "milestones": "docs/milestones",
    "runs": ".agent-harness/runs",
    "gateRecords": ".agent-harness/runs",
    "deferredRegister": "docs/milestones",
    "mentalModel": "docs/mental-model.md"
  },
  "workMode": {
    "defaultPolicy": "ask"
  },
  "lifecycle": {
    "taskStates": [
      "todo",
      "spec-draft",
      "spec-ready",
      "goal-ready",
      "doing",
      "review",
      "blocked",
      "done",
      "cancelled"
    ]
  },
  "gates": {
    "enabled": [
      "spec",
      "execution",
      "integration"
    ],
    "optional": [
      "walkthrough",
      "retrospective"
    ]
  }
}
```

Path rules:

- Paths are repo-relative unless explicitly documented otherwise.
- CLI commands resolve paths through one config resolver.
- Missing optional paths produce warnings, not hard failures.
- Missing required paths are evaluated by contract.

## CLI Scope

The CLI should:

- resolve `contract: "fixed"` and `contract: "adapter"`;
- make `doctor` contract-aware;
- initialize adapter projects with `init --contract adapter`;
- inspect resolved config and adapter paths;
- import existing adapter projects without creating a second task index;
- make generated goal and run packet text use configured artifact paths;
- keep `worktree recommend` read-only;
- preserve no-daemon, no-push, no-PR, no-deploy behavior.

## Skill Scope

Skills should instruct Codex to read:

1. repo instructions;
2. `.agent-harness/config.json`;
3. the project adapter when the contract is `adapter`;
4. the plugin reference relevant to the task;
5. referenced specs, goals, milestones, task index, and status files.

## What Not To Do

- Do not migrate downstream repos automatically.
- Do not make `docs/specs/` or `docs/goals/` mandatory for fixed-contract
  projects.
- Do not add daemons, watchers, network services, automatic thread spawning,
  deploys, pushes, PRs, or releases.
- Do not override project `AGENTS.md` rules from plugin core.
- Do not copy downstream-specific product, DB, provider, production, or release
  rules into plugin core.

## Validation

```bash
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs print-contract
node plugins/agent-harness/scripts/agent-harness.mjs print-contract --contract adapter
```

Temporary project checks should cover:

- fixed init / doctor / goal create / run prepare;
- adapter init / doctor / config inspect / adapter inspect;
- custom artifact paths;
- malformed config;
- missing optional adapter paths;
- existing adapter discovery and import.

## Completion Conditions

- Public docs and skills use `fixed` and `adapter` contract terminology.
- The current repository uses the adapter contract.
- Fixed-contract projects keep working with the fixed-path layout.
- Adapter-contract projects can configure artifact paths without plugin code
  changes.
- Generated goal and run packets refer to configured artifact paths.
- Canonical references and templates stay generic.
- Validation passes.

## Pause Conditions

Pause and ask the user when:

- this spec conflicts with current user instructions, repo `AGENTS.md`, code
  reality, or production constraints;
- a contract change would require migrating downstream projects without
  approval;
- requirements are unclear in a way that affects cost, risk, product direction,
  or downstream compatibility;
- implementation needs credentials, paid APIs, production access, destructive
  operations, push, PR, deploy, publish, or release;
- a downstream project requires rules that belong in its adapter rather than
  plugin core.
