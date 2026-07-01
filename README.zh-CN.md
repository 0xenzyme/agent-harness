# Agent Harness

[English](README.md)

Agent Harness 是一个面向开发项目的可复用 Codex workflow package。它为项目建立一个小型、文件化的控制层，让任务协调、执行准备、验证和状态同步能更多交给自动化处理。

## 问题

当一个人同时维护多个软件项目时，真正消耗精力的往往不是写某一行代码，而是开发过程中的协调工作：追踪任务、判断下一步是否安全、准备 goal prompt、检查 evidence、记住每个项目的边界。Agent Harness 的目标是把这些工作推到稳定的 harness 层，让 coding agent 能自动化处理更多开发循环，减少人的调度负担并提升推进效率。

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
- Orient 时要把 durable artifacts 和 active control thread 中更新的
  conversation-confirmed state 对齐；发现 stale artifacts 时先报告并同步，再推荐
  execution。
- Packaging 保持 disciplined：docs、skills、templates、marketplace
  metadata、validation commands 和 version metadata 应描述同一套真实暴露的
  行为。
- Plugin docs 和 templates 保持 project-neutral。本地产品规则、凭证、端
  口、provider policies 和生产流程属于 project adapters 与 artifacts。
- Route explanations 保持 lightweight：Codex 应简短说明为什么正在
  orient、shape、execute、ask、使用 worktree 或留在 local checkout。

## Influences

Agent Harness 部分受 b3ehive 的 controller-led agent work 思路启发：更小的
workflow entry points、显式 route selection、把 proposal competition 作为可
选 Shape work、accepted state 前保留 inspectable evidence，以及保持
packaging discipline。Agent Harness 会把这些思想翻译成自己的 fixed/adapter
contracts，而不是引入 b3ehive 的项目结构或本地项目策略。

## Artifact Map

adapter contract 项目通过 `.harness/config.json` 和 project adapter 解析 artifact paths。plugin core 不需要写入具体项目的产品名、数据库边界、生产规则、端口、凭证或发布策略。

常见 adapter artifacts 包括：

- `Task Index`：当前任务和 backlog 的 source of truth。
- `Roadmap`：更长期的产品或工程方向。
- `Milestones`：阶段级 task DAG、gates 和 deferred registers。
- `Specs`：已确认的范围、非目标、关键决策和验证方式。
- `Goals`：可执行的 handoff prompts。
- `Runs / Logs`：一次执行尝试、状态、prompt、execution DAG、subagent
  guidance、worker node prompts 和 evidence。
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

当前仓库里的 `harness/` 和 `.harness/` 是 Agent Harness 自身开发用的
project adapter state，不是安装到 plugin 里的内容。可安装 plugin 内容来自
`plugins/agent-harness/`；下游项目只有在 `harness:init` 或 CLI init/import
时，才会得到自己的 adapter artifacts。

## Plugin Skills

Codex 会把这个 plugin 暴露为 `harness`。主要 workflow-controller entry path
是四个 workflow skills：

- `harness:orient`：只读理解项目状态、当前 todo、blockers，并推荐下一步
  route。
- `harness:init`：初始化新项目、迁移旧项目、运行 doctor/import，并预览
  activation instructions。
- `harness:intake`：捕获和 triage 新想法、新需求、bug 或 Idea Inbox
  Thread notes；只有明确确认后才 record。
- `harness:execute`：执行已确认的 task、spec、goal 或 run packet，然后验
  证并同步 task/status/run evidence。

旧的 artifact-oriented wrapper skills 不再发布。按 route 选择 workflow
skill：setup/adoption 用 `init`，只读状态用 `orient`，新想法用 `intake`，
已确认执行用 `execute`。

当前 package 没有依赖已确认的 localized plugin description schema。面向用
户的 plugin / skill descriptions 使用现有 description 字段里的 zh-CN/en
bilingual fallback；运行时回复仍按用户语言输出。

### Which Skill Should I Use?

| 场景 | Skill |
| --- | --- |
| 给项目接入 Agent Harness、迁移已有 task index、运行 doctor/import，或预览 activation。 | `harness:init` |
| 只读查看项目状态、todo、blockers 或下一步 route，不编辑文件。 | `harness:orient` |
| 捕获或 triage 新想法、新需求、bug 或 capture-thread note。 | `harness:intake` |
| 完成已确认的 task、spec、goal 或 run packet，然后验证并同步状态。 | `harness:execute` |

## Use With A Coding Agent

大多数用户不需要先手动运行 CLI。安装 `harness` 后，主路径是让 Codex，或
其他能访问该 plugin 的 coding agent，在目标项目里调用 Harness workflow
skills。agent 应先读取项目 instructions，检查 Harness adapter，选择 route，
并在修改状态前说明它使用了哪些 evidence。

典型 prompt 可以这样写：

```text
Use harness:init in /path/to/project to adopt Agent Harness. Preview activation and do not edit AGENTS.md without my approval.
Use harness:orient in the current repo and tell me the next safe route.
Use harness:intake to triage this idea without implementing it: Add a new import flow.
Use harness:execute for the confirmed goal in harness/goals/YYYY-MM-DD-task-title.md. Verify and sync task/status evidence.
```

常规用户级流程是：

```text
harness:init -> harness:orient or harness:intake -> confirmed spec/goal -> harness:execute -> verification -> state sync
```

如果你希望当前 thread 作为 main control、gate、reviewer、judge 或 acceptance
lane，请直接说明；Harness 默认把这种请求视为 `gate-only`。在 `gate-only`
中，control thread 只审查 candidate worker output 和 verification evidence，
然后 accept、block 或要求 corrections，不直接修改 implementation files。run
packet 中的 worker node 默认使用 `codex-cli-subagent`（当该 surface 可用时）。
只有当你希望同一个 thread 也改文件时，才使用 `implementer` 或 `mixed`。

CLI 仍然保留，作为 agents、operators 和 maintainers 的确定性工具，但不是
多数用户的 primary first-use path。中文接入说明见
[`docs/install.zh-CN.md`](docs/install.zh-CN.md)，详细命令示例见
[CLI reference](docs/cli.zh-CN.md)。

## Acceptance And Validation

worker output、automation output、inbox notes 和 proposal competition results
都只是 candidate evidence，直到 control lane 完成验证。accepted completion 需
要具体 evidence，例如 changed files、command summaries、run records、gate
records 或 human review notes。带有 `Spec Acceptance Checklist` 的 goal 必须让
每个 checklist item satisfied；adapter-required completion gates 必须在
`Required Gate Evidence` 中记录具体 evidence 和 `Status: satisfied`。

本仓库的 documentation 或 plugin-surface 变更应使用：

```bash
git diff --check
npm run test:smoke
npm run validate:plugin
```

还要对当前 active goal 运行 goal validation；具体 CLI 形式见
[`docs/install.zh-CN.md`](docs/install.zh-CN.md)。

只有 eval docs 或 eval fixtures 变化时才运行 `npm run test:eval`。

## Workflow

人负责 steering：目标、产品方向和约束。Harness 在 adapter 边界内作为执行引擎自动推进；当需要验收、授权、凭证、生产访问或解除阻塞时，再升级到 Human Gate。

![Adapter Execution Model](docs/assets/readme/adapter-execution-model.png)

推荐的用户级 adapter workflow：

```text
harness:init/import -> harness:orient or harness:intake -> confirmed spec/goal -> harness:execute -> verify -> state sync
```

在底层，Harness 通过确定性的本地工具记录 route decisions、run packets、
acceptance evidence、delivery state 和 status snapshots。工具边界保持受控：
不会启动 Codex、创建 daemon、deploy，或自行执行 delivery step。Delivery 由
当前 goal 的 Delivery State policy 控制。

Conditional plugin bootstrap 仍然 defer。当前通过校验的 plugin manifest 不
声明 session hook，因此安装 Agent Harness skills 不会向无 harness 项目注入
harness instructions。

Idea Inbox Thread 是 capture lane，不是 execution lane。使用
`harness:intake` 或 `intake idea` 先 preview 并在确认后 record 原始 notes；
只有 control thread 接受 route 后，才把它们提升为 spec、goal 或 execution。

Proposal competition 仍是 documented Shape protocol。它可以为模糊任务比较
routes、risks 和 coverage，但不执行被选中的路线；当前 package 也不会安装
新的 `harness:compete` skill。

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

中文安装与使用说明见 [`docs/install.zh-CN.md`](docs/install.zh-CN.md)。

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
- 在凭证、付费 API、生产访问、破坏性操作、超出当前 goal policy 的 delivery、
  deploy 或 release 前显式暴露 escalation point。

目标是加强开发自动化，同时把控制点、evidence 和需要升级给人的边界保持清楚。

## Roadmap

未来 Agent Harness 应该让控制合同可以被其他 coding agents 使用，而不只服务
Codex。方向是建立 agent-neutral adapter layer，覆盖 task/spec/goal/run
packets、capability declarations、verification results 和 state-sync
evidence。支持其他 coding agents 前，应先为每个 agent surface 定义明确的
safety boundaries、result-packet expectations 和 validation fixtures。

delegation 应保持 capability-driven：先判断某个 coding-agent surface 是否能
创建隔离工作、返回 execution result packet、报告 changed files 和
verification，并遵守 no-daemon / no-push 边界。如果能力不存在，Agent
Harness 应 fallback 到 foreground manual execution，而不是假装已经具备并行
或隔离实现能力。
