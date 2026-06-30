# Agent Harness

[English](README.md)

Agent Harness 是一个面向开发项目的可复用 Codex workflow package。它为项目建立一个小型、文件化的控制平面，让 goal handoff、loop engineering 和后续自动化有稳定入口。

## 问题

当一个人同时维护多个软件项目时，每个项目往往会各自发明 backlog 文件、状态记录、分支习惯和 goal prompt。这样会让自动化变得脆弱：Codex 如果每次都要重新理解项目任务系统，就很难安全判断下一步该做什么。

## Adapter Model

Agent Harness 是一个 adapter-driven workflow。plugin 提供稳定协议，每个项目维护一个薄 adapter，项目 artifacts 记录真实的 task、spec、goal、run 和 gate 事实。

`adapter contract` 不是单个文件，而是一套项目执行模型：它把 task intake、roadmap 方向、milestone 规划、spec、goal、run、gate 和 evidence 串起来。

核心原则：

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

也就是说：plugin 定义通用协议，adapter 定义项目覆盖，artifacts 记录项目事实。

![Agent Harness Adapter Model](docs/assets/readme/adapter-model.png)

## Design Principles

Agent Harness 保持控制平面小而可检查：

- Proposal competition 是可选的 Shape protocol。它可以比较路线和风险，但
  不直接执行被选中的路线。
- 已接受的状态应留下 evidence trail，例如 task entries、specs、goals、
  runs、gate records、command summaries 或 review notes。
- Packaging 保持 disciplined：docs、skills、templates、marketplace
  metadata、validation commands 和 version metadata 应描述同一套真实暴露的
  行为。
- Plugin docs 和 templates 保持 project-neutral。本地产品规则、凭证、端
  口、provider policies 和生产流程属于 project adapters 与 artifacts。
- Route explanations 保持 lightweight：Codex 应简短说明为什么正在
  orient、shape、execute、ask、使用 worktree 或留在 local checkout。

## Artifact Map

adapter contract 项目通过 `.harness/config.json` 和 project adapter 解析 artifact paths。plugin core 不需要写入具体项目的产品名、数据库边界、生产规则、端口、凭证或发布策略。

常见 adapter artifacts 包括：

- `Task Index`：当前任务和 backlog 的 source of truth。
- `Roadmap`：更长期的产品或工程方向。
- `Milestones`：阶段级 task DAG、gates 和 deferred registers。
- `Specs`：已确认的范围、非目标、关键决策和验证方式。
- `Goals`：可执行的 handoff prompts。
- `Runs / Logs`：一次执行尝试、状态、prompt、subagent guidance 和 evidence。
- `Gate Records`：review、integration、acceptance 和 state-sync 决策。

![Adapter Artifact Map](docs/assets/readme/adapter-artifact-map.png)

## Package Shape

这个仓库同时是 source project 和 Codex local marketplace：

- `.agents/plugins/marketplace.json` 暴露本地 plugin。
- `plugins/agent-harness/` 是可安装的 Codex plugin。
- `plugins/agent-harness/skills/` 包含 Codex skills。
- `plugins/agent-harness/references/` 包含 canonical harness protocols。
- `plugins/agent-harness/schemas/` 包含 machine-readable contract schemas。
- `plugins/agent-harness/templates/` 包含 starter templates。
- `plugins/agent-harness/scripts/agent-harness.mjs` 提供一个小型 CLI。
- `evals/` 包含 project-neutral evaluation fixture blueprints。

## Plugin Skills

Codex 会把这个 plugin 暴露为 `harness`。它刻意只发布四个 workflow skills：

- `harness:orient`：只读理解项目状态、当前 todo、blockers，并推荐下一步
  route。
- `harness:intake`：捕获和 triage 新想法、新需求、bug 或 Idea Inbox
  Thread notes；只有明确确认后才 record。
- `harness:execute`：执行已确认的 task、spec、goal 或 run packet，然后验
  证并同步 task/status/run evidence。
- `harness:init`：初始化新项目、迁移旧项目、运行 doctor/import，并预览
  activation instructions。

旧的 artifact-oriented wrapper skills 不再发布。按 route 选择 workflow
skill：只读状态用 `orient`，新想法用 `intake`，setup/adoption 用 `init`，
已确认执行用 `execute`。

### Which Skill Should I Use?

| 场景 | Skill |
| --- | --- |
| 只读查看项目状态、todo、blockers 或下一步 route，不编辑文件。 | `harness:orient` |
| 捕获或 triage 新想法、新需求、bug 或 capture-thread note。 | `harness:intake` |
| 给项目接入 Agent Harness、迁移已有 task index、运行 doctor/import，或预览 activation。 | `harness:init` |
| 完成已确认的 task、spec、goal 或 run packet，然后验证并同步状态。 | `harness:execute` |

## First Commands

验证 plugin：

```bash
npm run validate:plugin
npm run test:smoke
```

初始化 adapter contract 下游项目：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

导入已经有 adapter 和 task index 的 adapter 项目，不创建第二个任务索引：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

如果项目已经有 `todolist.md`，`init --contract adapter` 会沿用它，不会再创建并行的 `harness/tasks.md`。真实执行 `config import` 会写入 machine config，并创建缺失的支持产物，例如配置的 status 文件和 runs 目录。

检查下游项目：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

打印用于 `AGENTS.md` 的 project-scope activation snippet，不写文件：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs activation snippet --cwd /path/to/project
```

当前没有启用 plugin-level `SessionStart` bootstrap。本地验证显示，当前
plugin validator 会拒绝 `.codex-plugin/plugin.json` 里的 `hooks` 字段；保
持 manifest hook-free 是当前边界，用来避免 Agent Harness 影响没有接入
harness 的项目。

查看解析后的 config 和 adapter 路径：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

只读汇总当前状态并推荐下一步，不开始执行：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project --json
```

预览一个新想法或新需求，不修改 task index：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow"
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --json
```

用户明确确认后，才把候选项追加到支持的 markdown task index：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --record --priority P2 --section Next
```

从当前 git state 和 recent run records 预览确定性的 task/status maintenance：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --json
```

把保守的 maintenance snapshot 写入配置的 status 文件；只有当 completed run
提供精确证据且 task index 可安全写入时，才应用 task 更新：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

推荐当前任务应该继续使用当前 checkout、切到 worktree，还是先询问：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project --json
```

使用中文命令输出：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
```

从配置的 task index 创建 goal handoff：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
```

adapter contract 要求 goal 引用已确认的 spec：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

准备 run 之前，列出、查看并验证 goals：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal list --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs goal inspect --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
```

从 goal 准备 run packet：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

查看已准备的 run：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
```

记录 run 结果，不修改源码、不 push、不 open PR：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Implemented and verified" --verification "npm test passed"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase blocked --summary "Blocked by missing credential"
```

## Workflow

人负责 steering：目标、产品方向和约束。Harness 在 adapter 边界内作为执行引擎自动推进；当需要验收、授权、凭证、生产访问或解除阻塞时，再升级到 Human Gate。

![Adapter Execution Model](docs/assets/readme/adapter-execution-model.png)

推荐的 adapter workflow：

```text
init/import -> activation snippet -> orient/intake -> goal create -> goal validate -> worktree recommend -> run prepare -> execute -> verify -> run record -> maintain tasks -> update state records
```

`activation snippet` 只打印 `AGENTS.md` 片段，不修改项目 instructions。
`orient next` 是只读命令：它汇总 status 和 task state。`intake idea` 默认也是只读：它分类新想法，只有传入 `--record` 时才会追加到支持的 markdown task index。两个命令都会说明进入执行前需要哪些确认。
`maintain tasks` 默认只读；传入 `--record` 时，它会写入保守的 status snapshot，并且只应用有精确证据、可安全写入的 task-index 更新。
`config validate` 会用 plugin schema 检查当前 `.harness/config.json` 或 legacy `.agent-harness/config.json`，并报告可操作的 schema errors。

Conditional plugin bootstrap 仍然 defer。当前通过校验的 plugin manifest 不
声明 session hook，因此安装 Agent Harness skills 不会向无 harness 项目注入
harness instructions。

Idea Inbox Thread 是 capture lane，不是 execution lane。使用
`harness:intake` 或 `intake idea` 先 preview 并在确认后 record 原始 notes；
只有 control thread 接受 route 后，才把它们提升为 spec、goal 或 execution。

Proposal competition 仍是 documented Shape protocol。它可以为模糊任务比较
routes、risks 和 coverage，但不执行被选中的路线；当前 package 也不会安装
新的 `harness:compete` skill。

`goal create` 会把 durable handoff 写到配置的 goals 目录。`goal validate` 检查 goal 是否引用 repo 内已确认 spec，并包含执行所需 sections。`run prepare` 会先通过这个 validation gate，再把 `run.md`、`prompt.md`、`subagents.md`、`status.json` 和 `logs/` 写到配置的 runs 目录。`run record` 只更新 run 目录，记录 completed 或 blocked 结果。这些命令不会启动 Codex、创建 daemon、push、deploy 或 open PR。

## Command Language

面向人的 CLI 输出支持 `en` 和 `zh-CN`，覆盖 `init`、`doctor`、`worktree recommend` 和 help/usage。activation、orientation、intake 和 maintenance 输出当前是稳定英文文本。语言解析顺序：

1. `--lang <code>`
2. `AGENT_HARNESS_LANG`
3. `.harness/config.json` 里的 `language.default`
4. 系统 locale：`LC_ALL`、`LC_MESSAGES` 或 `LANG`
5. fallback `en`

使用 `auto` 会继续检查下一个来源。未知语言会 fallback 到 `en`。机器输出、`print-contract` 的 JSON、路径、命令名、package names、skill names 和 Git 输出保持英文不翻译。

## Evaluation And Examples

Project-neutral adoption examples 位于
[`docs/examples/downstream-project-shapes.md`](docs/examples/downstream-project-shapes.md)。
它覆盖 new adapter projects、existing adapter imports、fixed compatibility
projects、non-harness projects 和 messy realistic projects。

Evaluation blueprint 位于 [`evals/`](evals/)。它定义 fixture shapes、scenario
prompts、expected outcomes 和 semi-automatic scoring plan，用来评价不同项目
形态下的 agent behavior。这些 fixtures 评价 route choice、evidence quality、
boundary preservation 和 state discipline，不依赖真实下游仓库。

## Install In Codex

本地开发时，把这个仓库加入 marketplace root：

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

仓库发布到 GitHub 后，可以在另一台机器上这样安装：

```bash
codex plugin marketplace add <owner>/<repo>
```

Codex 会读取 `.agents/plugins/marketplace.json` 并暴露 `harness` plugin。

## Current Design Bias

当前设计刻意保持边界清晰：

- 创建稳定的文件和目录。
- 给 Codex 一个一致的方式来定位 task、spec、goal 和 run artifacts。
- 推荐 worktree 行为，但不强制创建 branch。
- 从 report-only loops 开始，而不是直接进入无人值守修复循环。
- 在凭证、付费 API、生产访问、破坏性操作、push、PR、deploy 或 release 前显式暴露 escalation point。

目标是先让 Codex 更可预测，再逐步提高自治程度。
