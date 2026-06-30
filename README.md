# Agent Harness

[中文](README.zh-CN.md)

Agent Harness is a reusable Codex workflow package for development projects.
It standardizes the small control plane that every project needs before goal
automation and loop engineering can work reliably.

## Problem

When one person operates many software projects, each project tends to invent
its own backlog file, status notes, branch habits, and goal prompts. That makes
automation brittle. Codex cannot safely decide what to do next if it has to
rediscover each project's task system from scratch.

## Adapter Model

Agent Harness is an adapter-driven workflow. The plugin provides the stable
protocol, each project keeps a thin adapter, and project artifacts record the
actual task, spec, goal, run, and gate facts.

The adapter contract is a project execution model, not a single file. It
connects task intake, roadmap direction, milestone planning, specs, goals,
runs, gates, and evidence.

The core principle is:

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

![Agent Harness Adapter Model](docs/assets/readme/adapter-model.png)

## Design Principles

Agent Harness keeps the control plane small and inspectable:

- Proposal competition is optional and belongs to Shape work. It can compare
  routes and risks, but it does not execute the selected route.
- Accepted state should leave an evidence trail through task entries, specs,
  goals, runs, gate records, command summaries, or review notes.
- Packaging stays disciplined: docs, skills, templates, marketplace metadata,
  validation commands, and version metadata should describe the same exposed
  behavior.
- Plugin docs and templates stay project-neutral. Local product rules,
  credentials, ports, provider policies, and production procedures belong in
  project adapters and artifacts.
- Route explanations stay lightweight: Codex should briefly say why it is
  orienting, shaping, executing, asking, using a worktree, or staying local.

## Artifact Map

Adapter projects use `.harness/config.json` plus a project adapter to
resolve artifact paths. The plugin does not need to know project-specific
product names, database boundaries, production rules, ports, credentials, or
release policy.

Typical adapter artifacts include:

- `Task Index`: the active task/backlog source of truth.
- `Roadmap`: longer-range product or engineering direction.
- `Milestones`: phase-level task DAGs, gates, and deferred registers.
- `Specs`: accepted scope, non-goals, decisions, and validation.
- `Goals`: executable handoff prompts.
- `Runs / Logs`: one execution attempt, status, prompt, subagent guidance, and
  evidence.
- `Gate Records`: review, integration, acceptance, and state-sync decisions.

![Adapter Artifact Map](docs/assets/readme/adapter-artifact-map.png)

## Package Shape

This repo is both a source project and a Codex local marketplace:

- `.agents/plugins/marketplace.json` exposes the local plugin.
- `plugins/agent-harness/` contains the installable Codex plugin.
- `plugins/agent-harness/skills/` contains reusable Codex skills.
- `plugins/agent-harness/references/` contains canonical harness protocols.
- `plugins/agent-harness/schemas/` contains machine-readable contract schemas.
- `plugins/agent-harness/templates/` contains starter templates.
- `plugins/agent-harness/scripts/agent-harness.mjs` provides a small CLI.
- `evals/` contains project-neutral evaluation fixture blueprints.

## Plugin Skills

Codex exposes the plugin as `harness`. It intentionally ships four workflow
skills:

- `harness:orient`: read-only project state, current todo, blockers, and next
  route recommendation.
- `harness:intake`: capture and triage a new idea, requirement, bug, or Idea
  Inbox Thread note; record only after explicit approval.
- `harness:execute`: implement a confirmed task, spec, goal, or run packet,
  then verify and sync task/status/run evidence.
- `harness:init`: initialize a new project, migrate an existing project, run
  doctor/import, and preview activation instructions.

Older artifact-oriented wrapper skills are no longer shipped. Use the workflow
skill that matches the route: `orient` for read-only state, `intake` for new
ideas, `init` for setup/adoption, and `execute` for confirmed work.

### Which Skill Should I Use?

| Situation | Skill |
| --- | --- |
| Check project status, todo, blockers, or next route without editing files. | `harness:orient` |
| Capture or triage a new idea, requirement, bug, or capture-thread note. | `harness:intake` |
| Adopt Agent Harness in a project, migrate an existing task index, run doctor/import, or preview activation. | `harness:init` |
| Complete a confirmed task, spec, goal, or run packet and then verify and sync state. | `harness:execute` |

## First Commands

Validate the plugin:

```bash
npm run validate:plugin
npm run test:smoke
```

Initialize an adapter-contract downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

Import an existing adapter project that already has an adapter and task
index, without creating a second task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

If a project already has `todolist.md`, `init --contract adapter` preserves it
instead of creating a parallel `harness/tasks.md`. A real `config import` writes the
machine config and creates missing support artifacts such as the configured
status file and runs directory.

Check a downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

Print a project-scope activation snippet for `AGENTS.md` without writing files:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs activation snippet --cwd /path/to/project
```

Plugin-level `SessionStart` bootstrap is intentionally not enabled yet. Local
validation shows the current plugin validator rejects `hooks` in
`.codex-plugin/plugin.json`; keeping the manifest hook-free is the current
boundary that prevents Agent Harness from affecting non-harness projects.

Inspect resolved config and adapter paths:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

Summarize current status and recommend the next action without starting work:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project --json
```

Preview a new idea or requirement before modifying the task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow"
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --json
```

Append the candidate to a supported markdown task index only after explicit
confirmation:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --record --priority P2 --section Next
```

Preview deterministic task/status maintenance from current git state and recent
run records:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --json
```

Record a conservative maintenance snapshot in the configured status file, and
only apply exact completed-run task updates when they can be written safely:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

Recommend whether to use the current checkout, a worktree, or ask first:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project --json
```

Use Chinese command output:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
```

Create a goal handoff from the configured task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
```

The adapter contract requires an accepted spec:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

List, inspect, and validate goals before preparing a run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal list --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs goal inspect --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
```

Prepare a run packet from a goal:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

Inspect a prepared run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
```

Record a run outcome without modifying source files, pushing, or opening PRs:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Implemented and verified" --verification "npm test passed"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase blocked --summary "Blocked by missing credential"
```

## Workflow

Human steering sets direction. Harness owns the execution engine inside the
adapter boundaries, and it escalates back to a human gate when review,
approval, credentials, production access, or unblocking decisions are needed.

![Adapter Execution Model](docs/assets/readme/adapter-execution-model.png)

The intended adapter workflow is:

```text
init/import -> activation snippet -> orient/intake -> goal create -> goal validate -> worktree recommend -> run prepare -> execute -> verify -> run record -> maintain tasks -> update state records
```

`activation snippet` prints an `AGENTS.md` section; it does not modify project
instructions. `orient next` is read-only; it summarizes status and task state.
`intake idea` is also read-only by default; it classifies a new idea and only
appends to a supported markdown task index when `--record` is passed. Both
commands report what confirmation is needed before execution.
`maintain tasks` is read-only by default; with `--record` it writes a
conservative status snapshot and only applies exact task-index updates.
`config validate` checks the active `.harness/config.json` or legacy
`.agent-harness/config.json` against the plugin schema and reports actionable
schema errors.

Conditional plugin bootstrap remains deferred. The validated plugin manifest
does not declare a session hook, so installed Agent Harness skills do not
inject harness instructions into unrelated projects.

Idea Inbox Threads are capture lanes, not execution lanes. Use
`harness:intake` or `intake idea` to preview and optionally record raw notes;
promote them to specs, goals, or execution only after the control thread
accepts the route.

Proposal competition remains a documented Shape protocol. It may compare
routes, risks, and coverage for ambiguous work, but it does not execute the
selected route and is not an installed `harness:compete` skill in this
package.

`goal create` writes a durable handoff under the configured goals directory.
`goal validate` checks that a goal references a confirmed repo-local spec and
contains the required execution sections. `run prepare` runs that validation
gate before writing `run.md`, `prompt.md`, `subagents.md`, `status.json`, and
`logs/` under the configured runs directory. `run record` updates only the run
directory with a final or blocked outcome. These commands do not start Codex,
create a daemon, push, deploy, or open a PR.

## Command Language

Human-facing CLI output supports `en` and `zh-CN` for `init`, `doctor`,
`worktree recommend`, and help/usage. Activation, orientation, intake, and
maintenance output is currently stable English text. The language is resolved in this
order:

1. `--lang <code>`
2. `AGENT_HARNESS_LANG`
3. `.harness/config.json` `language.default`
4. system locale from `LC_ALL`, `LC_MESSAGES`, or `LANG`
5. fallback `en`

Use `auto` to continue to the next source. Unknown language codes fall back to
`en`. Machine output, JSON from `print-contract`, paths, command names, package
names, skill names, and Git output remain unchanged.

## Evaluation And Examples

Project-neutral adoption examples live in
[`docs/examples/downstream-project-shapes.md`](docs/examples/downstream-project-shapes.md).
They cover new adapter projects, existing adapter imports, fixed compatibility
projects, non-harness projects, and messy realistic projects.

The evaluation blueprint lives under [`evals/`](evals/). It defines fixture
shapes, scenario prompts, expected outcomes, and a semi-automatic scoring plan
for agent behavior across project shapes. These fixtures evaluate route
choice, evidence quality, boundary preservation, and state discipline; they do
not require live downstream repositories.

## Install In Codex

During local development, add this repo as a marketplace root:

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

After publishing this repo to GitHub, install it on another machine with:

```bash
codex plugin marketplace add <owner>/<repo>
```

Codex will read `.agents/plugins/marketplace.json` and expose the `harness`
plugin.

## Current Design Bias

The current version is intentionally bounded:

- It creates stable files and directories.
- It gives Codex a consistent way to find project task, spec, goal, and run
  artifacts.
- It recommends worktree behavior, but does not force branch creation.
- It starts with report-only loops before unattended fix loops.
- It makes escalation points explicit before credentials, paid APIs,
  production access, destructive operations, push, PR, deploy, or release.

The goal is to make Codex more predictable before making it more autonomous.
