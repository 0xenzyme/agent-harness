# Agent Harness

[English](README.md)

[![Version](https://img.shields.io/badge/version-0.6.0-0f766e)](CHANGELOG.md)
[![Codex Plugin](https://img.shields.io/badge/Codex-plugin-111827)](plugins/agent-harness/.codex-plugin/plugin.json)
[![License](https://img.shields.io/badge/license-MIT-7c3aed)](LICENSE)

Agent Harness 是面向 Codex 和 coding agent 的 adapter-driven control plane。
它把已经确认的方向转成边界明确的执行、可验证的 evidence 和同步后的项目状态，
减少人持续充当 task router 的负担。

```text
Roadmap -> Milestone -> Goal -> Task -> Run -> Evidence -> State Sync
```

[快速开始](#在项目中怎么用) · [工作方式](#工作方式) ·
[架构](#架构) · [安全与验收](#安全与验收) · [文档](#文档)

## 在项目中怎么用

### 1. 安装 plugin

从本地 checkout 安装：

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

从 GitHub 安装：

```bash
codex plugin marketplace add <owner>/<repo>
```

Codex 会读取 `.agents/plugins/marketplace.json`，并把 plugin 暴露为
`harness`。更新、activation 和项目接入细节见
[Codex 安装说明](docs/install.zh-CN.md)。

### 2. 直接让 Codex 使用 Harness

大多数用户不需要指定 skill，也不需要直接运行 CLI：

```text
用 harness 看当前项目下一步。
用 harness 记录这个想法，先不要实现：增加一个 import flow。
用 harness 执行 harness/goals/YYYY-MM-DD-task-title.md，验证并同步状态。
使用当前 thread 作为 controller，把已接受的 spec 推进到完成。
```

### 3. 需要时选择明确入口

| 场景 | 公开 skill |
| --- | --- |
| 接入 Harness、导入已有 task index、运行 doctor，或预览 activation。 | `harness:init` |
| 只读检查状态、blocker、stale artifact 或下一条 route。 | `harness:orient` |
| 收集或 triage 想法、需求、bug 或 inbox note。 | `harness:intake` |
| 从已接受 scope 准备 Goal，执行已确认工作，验证并同步状态。 | `harness:execute` |

`shape`、`goal`、`competition` 和 `ask` 是内部 route state，不是额外安装的
skill。Harness 会把它们映射回公开 skill 或明确的用户决策。

## 为什么需要 Agent Harness

Agent Harness 面向“人已经定完方向之后”的阶段。人仍然负责产品判断、授权和真正
需要暂停的条件；Harness 在 project adapter 边界内负责可重复的执行机制：

- 读取 roadmap、milestone、spec、Goal、Task 和 Run 状态；
- 把 `完成 M5` 这样的请求展开成明确的 completion items；
- 准备 Goal 和 execution DAG，而不是写完下一个小 spec 就停下；
- 调度 worker，同时区分 candidate output 与 accepted state；
- 在推进 delivery state 前验证 concrete evidence；
- 把 `State Sync Notes` 作为 Task completion 的组成部分；
- 对齐 task index、bounded status snapshot、Goal、Run 和 gate；
- 只在方向不清、凭证、付费 API、生产访问、破坏性操作或超出 delivery
  policy 时暂停并交还给人。

核心承诺不只是“agent 会改文件”，而是 coding agent 不会在 roadmap、spec、
implementation、verification、delivery 和 handoff 之间丢失主线。

## 工作方式

![Agent Harness execution model](docs/assets/readme/adapter-execution-model.svg)

用户可见的层级是：

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

- **Roadmap** 保存长期方向。
- **Milestone** 是阶段性 outcome，通常包含多个 Goal。
- **Goal** 是带 scope 和 acceptance 的主要 Harness work unit。
- **Task** 是 Goal 内部的 checklist 或 execution item。
- **Run** 是一次 execution attempt 和 evidence record，不等于 thread。
- **Spec** 在执行前约束 Goal，不是 Run 之后才出现的 artifact。

父级 Milestone 必须等 mapped items 满足后才能关闭。接受 `M5-S0` 这样的
source-spec item，不能在 implementation 尚未完成时静默关闭父级 `M5`。

`harness-rule:cybernetic-stability` 让控制闭环保持明确：intent 选择 target，
fresh observations 形成 measurement snapshot，controller 针对 remaining gap
行动，verification 决定继续、暂停、询问还是关闭。详见
[Cybernetic Stability](docs/cybernetic-stability.md)。

## 架构

![Agent Harness adapter model](docs/assets/readme/adapter-model.svg)

Agent Harness 把稳定协议与项目事实分开：

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

- **Plugin** 提供 workflow skills、protocol references、schemas、templates
  和 deterministic CLI gates。
- **Project adapter** 声明 artifact paths、边界、verification、state sync、
  work mode 和 delivery policy。
- **Project artifacts** 记录 roadmap、Milestone、Spec、Goal、Task、Run、
  gate result 和 evidence。

![Agent Harness artifact map](docs/assets/readme/adapter-artifact-map.svg)

Adapter project 通过 `.harness/config.json` 解析这些路径；plugin core 不会
内置下游项目的产品名、端口、凭证、数据库规则或生产 policy。

### Adapter 语言策略

Project adapter 通过 machine-readable config 声明语言偏好：

```json
{
  "language": {
    "default": "zh-CN"
  }
}
```

支持值为 `auto`、`en` 和 `zh-CN`。CLI 按以下优先级选择语言：`--lang`、
`AGENT_HARNESS_LANG`、`language.default`、`LC_ALL`、`LC_MESSAGES`、`LANG`；
无法解析的 `auto` 最终 fallback 到英文。

当前边界：该设置只会本地化已经支持的 human-facing CLI messages。
`init`、`goal create` 和 `run prepare` 创建的 deterministic artifacts 仍使用
英文 base templates 与 renderers。Agent 回复应跟随用户语言，同时保持 code、
command、path、API name、skill name、model name 和 Git commit message 的
原始形式。详见[安装文档](docs/install.zh-CN.md#语言策略)与
[Project Contract](docs/project-contract.md#adapter-language-policy)。

## 安全与验收

Harness 把 worker、automation、inbox 和 proposal output 视为 candidate
evidence，直到 control lane 完成验证。Completion 需要可检查的 evidence，
例如 changed files、command summary、Run record、gate record 或人工 review。

关键边界：

- `gate-only` controller 负责 review 和 acceptance，不直接修改 candidate
  implementation。
- Parallel writer 需要独立锁定的 worktree/cwd，或记录 non-overlap evidence；
  默认顺序执行。
- Local verification 不等于 commit、push、review、integration、release 或
  deployment。
- `harness-rule:bounded-direct-execution` 允许已确认、有限、单线程的工作
  无需新建 Goal/Run/DAG；docs-only contract clarification 同样适用，
  delivery authorization 本身不会把它升级成 durable orchestration。
- Status file 是 bounded current-state snapshot，不是 append-only history。
- 执行前要把更新的 conversation-confirmed direction 与 stale artifact 对齐。
- Conditional plugin bootstrap 尚未启用，因此安装 Harness 不会向无关项目
  注入 instructions。

完整 runtime surface、protocol anchors 和 verification suites 见
[Capability Matrix](docs/HARNESSES.md)。

## 仓库与验证

这个仓库同时是 Agent Harness source project 和 Codex local marketplace：

- `.agents/plugins/marketplace.json` 暴露本地 plugin。
- `plugins/agent-harness/` 包含可安装 plugin。
- `plugins/agent-harness/skills/` 包含四个公开 workflow skills。
- `plugins/agent-harness/references/` 包含 canonical protocols。
- `plugins/agent-harness/schemas/` 和 `templates/` 定义项目 contract。
- `plugins/agent-harness/scripts/agent-harness.mjs` 为 agent 和 maintainer
  提供 deterministic CLI operations。
- `evals/` 包含 project-neutral evaluation fixtures。

仓库自身的 `harness/` 和 `.harness/` 是当前项目的开发状态，不会作为 plugin
内容安装。下游项目只会在 adoption 或 import 时得到自己的 adapter artifacts。

README、文档或 plugin surface 发生变化时，运行：

```bash
git diff --check
npm run test:presentation
npm run test:protocol
npm run test:smoke
npm run validate:plugin
```

CLI 是 deterministic tooling，不是大多数用户的首要入口。完整 command
surface 见 [CLI reference](docs/cli.zh-CN.md)。

## 评估

[`evals/`](evals/) 下的 deterministic suite 验证 fixtures 和 trace
contracts；它不会运行模型，也不能证明 GPT-5.6 activation。单独授权的
`npm run test:eval:live` lane 使用 ephemeral read-only Codex execution，
并要求 runtime-reported model evidence。

Project-neutral adoption examples 覆盖新项目、已有 adapter import、
fixed-contract compatibility、非 Harness 项目和 messy realistic state：
[Downstream Project Shapes](docs/examples/downstream-project-shapes.md)。

## 文档

- [使用说明](docs/usage.zh-CN.md)
- [Codex 安装说明](docs/install.zh-CN.md)
- [CLI Reference](docs/cli.zh-CN.md)
- [Capability Matrix](docs/HARNESSES.md)
- [Project Contract](docs/project-contract.md)
- [Cybernetic Stability](docs/cybernetic-stability.md)
- [GitHub Presentation](docs/github-presentation.md)
- [v0.6.0 Release Notes](docs/releases/v0.6.0.md)
- [Changelog](CHANGELOG.md)

Agent Harness 部分受 b3ehive controller-led approach 启发，同时保持自己的
fixed/adapter contracts 和 project-neutral core。

## Roadmap

下一步方向是让其他 coding agent 也能实现同一套 agent-neutral adapter
contract，而不削弱 Harness 边界。只有当新的 execution surface 能声明
isolation、返回 inspectable result packet、报告 verification 和 state-sync
evidence，并遵守 delivery policy 时，才应该加入。能力不足时，Harness 应
fallback 到 bounded foreground execution，而不是假装具备并行或隔离能力。
