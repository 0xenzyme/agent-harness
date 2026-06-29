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
- `plugins/agent-harness/templates/` 包含 starter templates。
- `plugins/agent-harness/scripts/agent-harness.mjs` 提供一个小型 CLI。

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

查看解析后的 config 和 adapter 路径：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
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

从 goal 准备 run packet：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

查看已准备的 run：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
```

## Workflow

人负责 steering：目标、产品方向和约束。Harness 在 adapter 边界内作为执行引擎自动推进；当需要验收、授权、凭证、生产访问或解除阻塞时，再升级到 Human Gate。

![Adapter Execution Model](docs/assets/readme/adapter-execution-model.png)

推荐的 adapter workflow：

```text
init/import -> task index -> goal create -> worktree recommend -> run prepare -> execute -> verify -> update state records
```

`goal create` 会把 durable handoff 写到配置的 goals 目录。`run prepare` 会把 `run.md`、`prompt.md`、`subagents.md`、`status.json` 和 `logs/` 写到配置的 runs 目录。它不会启动 Codex、创建 daemon、push、deploy 或 open PR。

## Command Language

面向人的 CLI 输出支持 `en` 和 `zh-CN`，覆盖 `init`、`doctor`、`worktree recommend` 和 help/usage。语言解析顺序：

1. `--lang <code>`
2. `AGENT_HARNESS_LANG`
3. `.harness/config.json` 里的 `language.default`
4. 系统 locale：`LC_ALL`、`LC_MESSAGES` 或 `LANG`
5. fallback `en`

使用 `auto` 会继续检查下一个来源。未知语言会 fallback 到 `en`。机器输出、`print-contract` 的 JSON、路径、命令名、package names、skill names 和 Git 输出保持英文不翻译。

## Install In Codex

本地开发时，把这个仓库加入 marketplace root：

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

仓库发布到 GitHub 后，可以在另一台机器上这样安装：

```bash
codex plugin marketplace add <owner>/<repo>
```

Codex 会读取 `.agents/plugins/marketplace.json` 并暴露 `agent-harness` plugin。

## Current Design Bias

当前设计刻意保持边界清晰：

- 创建稳定的文件和目录。
- 给 Codex 一个一致的方式来定位 task、spec、goal 和 run artifacts。
- 推荐 worktree 行为，但不强制创建 branch。
- 从 report-only loops 开始，而不是直接进入无人值守修复循环。
- 在凭证、付费 API、生产访问、破坏性操作、push、PR、deploy 或 release 前显式暴露 escalation point。

目标是先让 Codex 更可预测，再逐步提高自治程度。
