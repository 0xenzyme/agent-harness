# User / Scenario Model

This model answers how someone who has never used Agent Harness should start
using it.

The primary user is a maintainer or Codex operator who wants a repository to
have durable Goal state, explicit project rules, resumable handoffs, and
verification evidence. The model has two main entry points:

1. Use Agent Harness in a new project.
2. Bring an existing project into the Agent Harness system.

Both paths require the same adoption sequence:

```text
initialize or import adapter
-> activate harness through an explicit entry point
-> verify with doctor
-> use Goals, Tasks, Specs, Runs, and state sync in normal work
```

## New Project

Use this path when the project does not already have a durable Goal index,
adapter document, status file, goal directory, run log structure, or gate
records.

The first action is adapter initialization:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

Initialization should create the control plane, not start work automatically.
For the default adapter contract, the important artifacts are:

- `.harness/config.json`: machine-readable contract and paths
- `harness/README.md`: project adapter and human-readable rules
- `harness/tasks.md`: Goal index storage
  - Compatibility note: the filename remains `tasks.md` for the current
    storage contract, but top-level entries are treated as Goals.
- `harness/status.md`: current project status
- `harness/specs/`: specs for ambiguous or high-risk work
- `harness/goals/`: executable goal handoffs
- `.harness/runs/`: run packets and execution evidence
- `harness/mental-models/`: durable project reasoning models

After initialization, the normal first-use loop is:

1. Record the first Goal in the Goal index.
2. Add a spec if the Goal is ambiguous, risky, or multi-step.
3. Create or write a Goal handoff for one executable slice.
4. Execute the slice in the foreground.
5. Verify with project-appropriate commands or review.
6. Update Goal state, status, and any Run evidence.

For a new project, Agent Harness is valuable because it prevents the project
from starting with only chat context. The repository immediately gets a place
for Goal state, rules, handoffs, and verification.

## Existing Project

Use this path when the project already has its own task list, specs, status
documents, milestones, gates, or operating rules.

The goal is to adapt to existing project state, not replace it. Migration means
mapping current artifacts into the harness contract and filling only the missing
support files.

The first action is inspection:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

Then identify the existing source of truth:

- Goal or work index, such as `todolist.md`, `tasks.md`, an issue list export,
  or an existing planning document
- project rules, such as `AGENTS.md`, `README.md`, or local operating docs
- existing specs, milestones, status notes, run logs, or gate records
- boundaries for production, credentials, paid calls, release, push, PR,
  destructive operations, daemons, and automation

For adapter-style migration, create or confirm the project adapter and import
the mapping:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

`config import` should preserve the existing Goal/work index. It should not
create a parallel `harness/tasks.md` when `todolist.md` or another configured
work source already exists.

The migration loop is:

1. Preserve the existing Goal/work source.
2. Declare artifact paths and hard boundaries in the adapter.
3. Import machine-readable config.
4. Create missing support artifacts, such as status, runs, goals, milestones,
   and mental models.
5. Run `doctor` and fix path or contract issues.
6. Move future work through Harness Goals, verification, and state sync.

For an existing project, Agent Harness is valuable because it makes current
project state legible to Codex without forcing the project to abandon its own
planning structure.

## Activation Step

Adapter files are the project control plane. They do not automatically inject
instructions into Codex.

Activation answers one question: after the adapter exists, how does Codex know
to use it?

There are three possible activation mechanisms:

1. Project-scope activation through `AGENTS.md`.
2. Plugin-scope bootstrap through a session-start hook.
3. Conditional plugin bootstrap that activates only when harness config exists.

### Project-Scope Activation

Codex reliably sees Agent Harness when project instructions activate it. The
normal activation point is `AGENTS.md`, because Codex already treats that file
as project-scope instruction.

Activation should tell Codex:

- if `.harness/config.json` exists, read it before substantial work
- if `contract: "adapter"`, read the configured project adapter
- read the configured Goal index, status file, and relevant Specs or Goals
- use harness CLI commands such as `doctor`, `config inspect`, `goal create`,
  and `run prepare` when they fit the task
- preserve existing project rules and pause when harness rules conflict with
  user instructions, `AGENTS.md`, production safety, credentials, paid calls,
  destructive actions, push, PR, deploy, release, daemons, or automation

For a new project, activation can be added after initialization.

For an existing project, activation must be merged into the current
`AGENTS.md` without weakening existing instructions. Existing project rules keep
their normal precedence; the harness adapter supplies project control state,
not a replacement constitution.

If `AGENTS.md` is not updated, Agent Harness still works when the user
explicitly asks to use it or when a harness skill / CLI command is invoked.
That mode is explicit use, not project-level activation.

The harness should not silently modify `AGENTS.md`. The current first-class
activation command prints a project-scope snippet for review:

```bash
agent-harness activation snippet --cwd .
```

The command is a preview. It does not write files; the human must explicitly
approve any `AGENTS.md` edit.

### Plugin-Scope Bootstrap

A hook-capable reference plugin can use a stronger mechanism: its plugin
manifest declares a `SessionStart` hook, the hook injects bootstrap text as
additional session context, and that bootstrap tells the agent to follow a
global workflow before acting.

That shape is:

```text
plugin install
-> session-start hook
-> bootstrap context injection
-> mandatory skill-check behavior
-> relevant skills activate during the session
```

This can be appropriate for a global development methodology. It is
intentionally more invasive than project instructions.

Agent Harness should be more conservative by default. It is a project control
plane, not a universal coding methodology. A global bootstrap that forces
harness behavior in every installed session would be too broad unless it is
conditional and carefully scoped.

### Conditional Bootstrap

A future Agent Harness plugin could use a lightweight session-start bootstrap
that says:

```text
If `.harness/config.json` exists in the current project, inspect the harness
contract before substantial project work.
```

That would make harness discovery automatic for opted-in projects without
forcing harness behavior on projects that have no harness config.

Validation on 2026-06-29 found that this should remain deferred. A local
hook-capable reference plugin outside this repository uses a hook manifest plus
a `SessionStart` script to inject `additionalContext`, but the current Agent
Harness plugin validation gate rejects `hooks` in `.codex-plugin/plugin.json`.
A temporary Agent Harness manifest with a hook path fails validation, and the
same validator rejects the external reference manifest for the same field.

Therefore the current Agent Harness plugin must stay hook-free. This is the
current non-harness-project guarantee: installing the plugin does not inject
harness instructions into sessions unless the project activates harness through
`AGENTS.md`, an explicit user request, a harness skill, or a CLI command.

Conditional bootstrap can be reconsidered only after plugin validation accepts
hook manifests and Codex App / Codex CLI runtime tests prove that the hook emits
no additional context when `.harness/config.json` is absent.

## Human / Agent Division

Agent Harness is built around a clear division of responsibility:

```text
Human owns intent, judgment, approval, and acceptance.
Agent owns orientation, execution, verification, and state sync within approved boundaries.
Harness owns durable coordination state.
```

### Human Owns

The human owner is responsible for:

- product direction
- priority
- risk tolerance
- approving Specs, Goals, or next actions when ambiguity matters
- credentials, paid calls, production decisions, and destructive operations
- push, PR, deploy, release, daemon, watcher, or automation authorization
- final acceptance when the Goal requires human judgment

### Agent Owns

The agent is responsible for:

- reading project instructions, harness config, adapter, Goal index, status,
  and relevant Specs or Goals
- summarizing current state and recommending next actions
- identifying missing Specs, Goals, validation, blockers, or pause conditions
- executing authorized bounded work
- running verification or collecting review evidence
- updating Goal state, status, Run evidence, blockers, and deferred work

### Harness Owns

The harness is responsible for durable coordination state:

- Goal state
- adapter rules
- Specs, Goals, Runs, gates, and Milestones
- mental models and project invariants
- verification evidence and continuity for future sessions

This division prevents two failure modes: the human manually maintaining every
harness file, and the agent making product or risk decisions without approval.

## Post-Activation Usage

After activation, users should not need to manually maintain every harness
artifact. Normal use follows the human / agent / harness division:

```text
User sets intent and approvals.
Harness stores project control state.
Codex executes the loop and updates evidence.
```

### User Responsibilities

The user should:

- state the Goal or ask for orientation
- choose product direction and priority when needed
- confirm Specs, Goals, or next-action recommendations when ambiguity matters
- approve high-risk actions such as production changes, credentials, paid
  calls, destructive operations, push, PR, deploy, release, daemons, watchers,
  or background automation
- review final results when the Goal requires human acceptance

The user should not have to manually keep all harness files synchronized after
normal Codex work. State sync is part of the harness loop.

### Codex Responsibilities

When harness is active and the user asks for substantial project work, Codex
should:

- read `AGENTS.md`
- inspect `.harness/config.json`
- read the configured project adapter
- read the configured Goal index, status file, and relevant Specs or Goals
- run `doctor` or `config inspect` when project state is unclear
- choose or recommend a work mode: `local`, `worktree`, or `ask`
- execute only the authorized scope
- verify with project-appropriate commands or review
- update Goal state, status, Run evidence, blockers, or deferred work

Codex should not automatically perform high-risk or external actions just
because harness is active.

### User Triggers

Users can trigger harness use with natural language:

```text
按 harness 看一下当前状态
看看 Goal backlog，建议下一步
用 harness 处理这个任务
为这个 Goal 创建执行交接
执行这个 Goal
准备 run packet
同步 harness 状态
检查 harness 是否健康
```

Users can also trigger harness use with CLI commands:

```bash
agent-harness doctor --cwd .
agent-harness config inspect --cwd .
agent-harness activation snippet --cwd .
agent-harness orient next --cwd .
agent-harness worktree recommend --cwd .
agent-harness goal create --cwd . --task "Task title"
agent-harness run prepare --cwd . --goal harness/goals/<goal-file>
```

Intent normalization:

- "用 harness 处理这个任务" means the current `Goal` unless the user names a
  concrete Task item.
- "这个任务有哪些子任务 / checklist" asks for the Goal's `Tasks`.
- "完成 M2" or "推进 M5" means complete a `Milestone`.
- "再跑一次" or "上次失败那次" refers to a `Run`.
- `P0` / `P1` / `P2` / `P3` are priorities only.

When project-scope activation is present, the user does not need to say
"use harness" every time. For substantial project work, Codex should enter the
harness loop automatically.

## Development Progression

After adapter activation, development progresses through modes, not one rigid
command.

This model defines the development progression contract. The current CLI
supports activation snippets, read-only next-action orientation, goal creation,
run-packet preparation, and worktree recommendation. Further automation remains
separate implementation work.

The progression modes are:

- Orient: read current harness state and recommend next action
- Select: choose the Goal, issue, or work item to pursue
- Shape: clarify mental model, spec, boundaries, acceptance, or risk
- Goal: create an executable handoff for one bounded Goal
- Execute: implement authorized changes
- Verify: run checks or collect review evidence
- Sync: update Goal state, status, Run evidence, blockers, and deferred work
- Review: user accepts, redirects, asks for repair, or chooses the next action

Not every request starts at `Goal`, and not every harness interaction should
change code. A user asking about current state is in `Orient`. A user discussing
how harness should work is in `Shape`. Implementation should begin only when
scope, boundaries, and verification are clear enough for `Execute`.

Current mental-model discussion is valid harness work because it is `Shape`
mode. It should precede implementation when product behavior, activation,
responsibility boundaries, or workflow semantics are still being decided.

## Confirmation Check

Before moving from one mode to the next, Codex should separate what it can do
without confirmation from what requires user judgment.

Codex can usually continue without confirmation when the next action is:

- reading files or harness artifacts
- running read-only inspection commands
- drafting mental model or spec text
- making low-risk documentation edits
- running local validation commands
- summarizing Goals, Tasks, status, blockers, or recommendations

Codex should ask for confirmation before:

- choosing a product direction
- moving from `Shape` into implementation when scope is still ambiguous
- modifying `AGENTS.md` or project activation behavior
- adopting plugin bootstrap or conditional bootstrap behavior
- creating branches, worktrees, PRs, deploys, releases, or background automation
- using credentials, paid APIs, production access, or destructive operations
- combining multiple work streams into one Goal, Spec, or Run

This check should appear at review boundaries and before entering `Goal` or
`Execute` for high-impact work.

## Orientation / Next-Action Scenario

One common post-activation scenario is read-only orientation. The user may ask:

```text
当前 Goal backlog 是什么？
现在项目状态怎么样？
下一步建议做什么？
哪些 Goals ready，哪些 blocked？
```

In this scenario, Codex should read harness state and recommend. It should not
start implementation by default.

The response should summarize:

- current focus from the status file
- Goal index highlights
- ready, blocked, in-progress, and recently done work
- recommended next action
- reason for the recommendation
- what command or prompt would start execution if the user agrees

## Idea / Requirement Intake Scenario

Another common post-activation scenario is new idea intake. The user may arrive
with a fresh product idea, engineering improvement, bug report, workflow change,
or vague requirement.

The user may ask:

```text
我有一个新想法
新增一个需求
这个项目能不能支持 X？
先把这个需求放进 harness
这个想法应该怎么进入 Goal backlog？
```

In this scenario, Codex should not jump directly to implementation. It should
first turn the raw idea into harness-shaped project state.

The current command entry is:

```bash
agent-harness intake idea --cwd . --idea "new idea text"
agent-harness intake idea --cwd . --idea "new idea text" --record
```

The first form is preview-only. The second form appends a candidate Goal only
for supported markdown indexes. The current CLI still uses `task` / `taskIndex`
storage language for compatibility.

Codex should:

- read the current Goal index, status, adapter, and relevant mental models
- compare the idea with existing Goals, Tasks, Specs, Runs, and deferred work
- identify whether the idea is new, duplicate, related, blocked, or already
  covered
- classify the next state:
  - note only
  - Goal candidate
  - spec needed
  - Goal ready
  - defer / reject / ask for product decision
- propose priority, acceptance criteria, risks, dependencies, and validation
  questions when possible
- ask before modifying the Goal index if product direction, priority, or scope
  is not obvious
- update the configured Goal index only when the user explicitly asks to record
  or accept the item

The output should usually be a candidate harness entry, not code:

```text
Suggested classification:
Suggested Goal title:
Why it matters:
Acceptance:
Needs spec:
Dependencies / risks:
Recommended next action:
Confirmation needed:
```

This scenario is different from `Orient`: orientation starts from existing
state, while intake starts from a new external idea. It is different from
`Execute`: intake decides how the idea should enter the harness before anyone
implements it.

## Idea Inbox Thread Scenario

A user may want to keep a separate Codex thread open only for capturing ideas
while another thread acts as the main control thread.

This model treats that thread as an Idea Inbox Thread, also called a Capture
Thread. It is not an execution thread.

The thread split is:

- Master / Control Thread: drives the current spec, goal, implementation,
  verification, and state sync.
- Idea Inbox Thread: captures new ideas, requirements, doubts, and improvement
  notes without interrupting the control thread.
- Intake Step: turns captured ideas into harness-shaped candidates through
  `intake idea`.
- Promotion: moves only accepted candidates into the configured Goal index,
  Specs, or Goals.

The Idea Inbox Thread should preserve raw context and avoid turning every note
into a Goal immediately. A raw idea becomes harness work only after intake
classifies it as duplicate, related, spec-needed, Goal-ready, Goal-candidate,
or ask.

Codex should not implement from the Idea Inbox Thread by default. It should
capture, clarify when needed, and later promote through intake when the user
asks to organize or accept the idea.

## Evaluation Project Scenario

Another adoption question is whether Agent Harness itself is suitable for a
given class of projects. That should be evaluated with fixture projects rather
than by relying only on this repository's own dogfooding.

The recommended first evaluation shape is an `evals/` fixture suite, not one
large application. Initial fixtures should cover:

- New Project Fixture: empty or small repo used to test adapter initialization,
  activation snippet, `doctor`, and `orient next`.
- Legacy Project Fixture: repo with an existing `todolist.md`, `AGENTS.md`,
  README, specs, and status notes, used to test non-invasive migration.
- Non-Harness Project Fixture: normal repo without `.harness/config.json`, used
  to verify Agent Harness does not affect unrelated projects.
- Messy Realistic Project Fixture: repo with dirty git state, mixed language
  docs, table Goal indexes, ready / blocked / done Goals, and custom paths.

The evaluation should measure agent behavior, not only CLI exit codes. Key
scenarios include:

- asking for current state should trigger read-only orientation, not execution
- a new idea should go through intake before entering the Goal index
- legacy migration should preserve the existing Goal source of truth
- non-harness projects should not receive harness behavior
- Goals, Tasks, Runs, and status should remain consistent across multiple turns

The first version can be semi-automatic: fixture repos, scenario prompts, and
expected outcomes. Fully automated agent-runner scoring can come later.

## Who Uses It

The main human user is the repository maintainer. They own product direction,
risk tolerance, release decisions, credentials, paid calls, and final
acceptance.

The main agent user is the current Codex session. It uses the harness to find
the Goal source, read the adapter, identify constraints, choose a work mode,
execute one bounded slice, verify it, and update state before stopping.

The next user is often a future Codex session. It should be able to resume from
repository files without relying on prior chat context.

Subagents and workers are secondary users. They should receive bounded goals,
run packets, specs, Task slices, or verification requests without inheriting
authority over project direction, production actions, release actions, or
adapter policy.

## Non-Scenarios

Agent Harness is probably unnecessary for:

- one-off edits that can be completed and verified immediately
- throwaway prototypes with no durable state requirement
- projects where chat history is intentionally the only record
- fully automated release systems that already own Goal state, gates, and logs
- situations where the user wants free-form exploration without state sync

## Stability Promise

Agent Harness should stabilize five things:

- orientation: where the Goal, adapter, status, and constraints live
- intent: what the current work is supposed to accomplish
- boundaries: what Codex may not do without explicit permission
- evidence: what was verified and where proof lives
- continuity: how the next human or Codex session resumes safely

If a harness artifact does not improve one of these, it should be questioned.
