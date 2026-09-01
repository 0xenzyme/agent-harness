# 有界 Goal、范围漂移、对话交接与以人为中心的摘要

状态：`draft`

日期：2026-08-29

来源：`/Users/liuyj/project/geocn/docs/harness/2026-08-29-agent-harness-production-workflow-handoff.md`

本文是根据 GeoCN handoff 和后续接受讨论形成的第一份上游小 spec。它只定义行为和控制边界，具体实现由独立 Goal 负责。

## 决策摘要

Agent Harness 应保持普通工作的轻量性，同时让范围变化、对话边界、事故中断和面向用户的决策变得明确且可恢复。

本 spec 的第一阶段不包含来源 handoff 中提出的完整 Run checkpoint、授权和外部副作用协议。这些内容保留在下方的 Deferred / Follow-up Register 中。

## 问题

长任务可能把诊断、实现、配置、生产操作、付费验收和交付验收混在一个 Goal 和一个对话中，导致：

- 发现新需求时 Goal 范围不稳定；
- 主线、worker、新对话和事故处理之间的路由不清楚；
- 跨过生产或授权边界后仍被意外继续执行；
- 用户被反复询问或重复确认；
- 控制消息过长，用户必须自行还原决策过程。

## 范围

本 spec 覆盖：

1. 有界 Goal 与 acceptance contract 边界；
2. 范围漂移分类与 replan 行为；
3. 同一对话、handoff、worker 和 incident 的路由；
4. 门禁失败处理；
5. human digest 与渐进展开；
6. 有界的用户问题批次；
7. accepted scope 内的 AI 默认自主权；
8. 对 deferred 讨论项的持久化保留。

## Non-Goals

本 spec 不实现或详细定义：

- Run checkpoint v2 schema 或 checkpoint CLI；
- authority 或 external-effect ledger；
- 生产部署、Provider replay 或 scheduler 行为；
- 自动创建 thread、worker 或 incident；
- 新增 parent-Goal 层级；
- 宿主 UI 的 Enter/Ctrl+Enter 行为；
- 版本发布或 package metadata 变更。

## 规范性规则

### 1. Goal 边界

Goal 以稳定的 accepted outcome 和 acceptance contract 为边界，而不是以某个技术模块或某个实现文件为边界。

当 accepted outcome 不变时，以下内容仍属于当前 Goal 的内部 Task：

- 本地诊断和复现；
- 实现细节；
- 增加配置字段；
- 增加 validator 或 resolver；
- 修复本地缺陷；
- 刷新验证证据。

以下变化需要记录 replan 或创建新的 Goal/Run：

- accepted outcome 或 acceptance criteria 变化；
- 执行环境变化；
- 需要新的生产、付费、破坏性或发布授权；
- 外部副作用范围扩大；
- 已准备的 Run contract 不再匹配 Goal/Spec。

新范围不能被静默追加到已接受的 Goal 中。

### 2. 对话路由

同一对话是默认执行容器。发生以下实质边界时，才需要 handoff 或新对话：

- 生产、付费、破坏性或发布动作；
- 新授权或新的执行身份；
- 生产事故；
- 独立的 owner 和验收边界；
- 上下文丢失到无法可靠恢复。

control conversation 可以保留 outcome 和路由职责，但不新增一种 durable artifact 类型。执行对话返回 candidate evidence；只有 accepted-state owner 可以记录 accepted Goal、Task、Run、gate 或 status state。

### 3. 范围漂移与事故路由

选择动作前必须先对新问题分类：

| 分类 | 默认动作 | 主线 |
| --- | --- | --- |
| 范围内本地缺陷 | 直接修复，或使用有界 worker | 继续 |
| 独立且有界的子问题 | 使用明确 ownership 的 worker | 等待 candidate evidence |
| 验收、环境或授权变化 | 记录 replan，更新 Goal/Spec 或创建新 Goal | 暂停 |
| 生产事故或外部结果未知 | 进入 incident/reconciliation 流程 | 暂停 |

`blocked` 仍然表示可恢复但未完成。范围变化或事故必须记录具体的 `pauseReason`，不能被表示为成功完成。

### 4. 门禁失败

Gate Result 继续使用 `accepted`、`request-fix` 或 `blocked`。

- `request-fix`：失败是确定的、已获授权且仍在 accepted scope 内。AI 可以在有界修复预算内修复并重新验证。
- `blocked`：失败需要产品决策、新授权、变更 acceptance contract，或需要用户/外部条件。暂停 Goal，并呈现一个决策组。
- 可能已经改变外部状态时，使用 `blocked` 加 `pauseReason: reconciliation-required`。重试前必须先检查。

本地测试、schema 检查、DAG 依赖、revision 检查和 evidence 格式检查应自动完成，不应变成用户确认步骤。Hard gate 只用于范围接受、不可逆外部动作、reconciliation 和最终交付验收。

### 5. Human digest

面向用户的输出采用渐进披露：

- **L0 快照**：当前状态、下一动作、用户决定、暂停条件；
- **L1 决策简报**：关键理由、重要变化、风险和 AI 会自动处理的内容；
- **L2 证据**：完整历史、handoff、日志和详细理由，仅在用户要求或高风险决策需要时展示。

非 heartbeat 更新只报告相对上次的变化，不重复未变化的历史。长 control packet 是 controller 的证据，不是默认用户界面。

### 6. 用户问题策略

默认策略是每轮只处理一个主题，但允许把同主题的相关决策组成有界批次：

```json
{
  "communication": {
    "questionPolicy": {
      "mode": "one-topic-batch",
      "maxQuestionsPerBatch": 3,
      "preserveUnanswered": true
    }
  }
}
```

规则：

- 只有同一个决策主题或决策链中的相关问题才可以合并；
- 每批最多 3 个 atomic questions；
- 超过 3 个时分到后续批次；
- 用户只回答一部分时，未回答项保留为 `pending`；
- 已确认的决策不再重复询问；
- 不能因为把多个独立选择写在一个句子里，就把它们算成一个 atomic question。

宿主提供 `request_user_input` 时，Harness 应优先用它承载短的结构化决策批次。tool 不可用时，必须在普通文本中保持相同语义。宿主的 Enter/Ctrl+Enter 行为不属于 Harness contract。

### 7. AI 自主权边界

在已接受的 Goal 内，AI 可以自主：

- 拆分内部 Task；
- 修改本地实现和文档；
- 运行验证；
- 修复 `request-fix` 类型的门禁失败；
- 在 ownership 和 scope 明确时使用有界 worker。

AI 必须在以下情况前暂停：

- 修改产品方向或 acceptance contract；
- 扩大环境或项目范围；
- 请求或使用新的生产、付费、破坏性或发布授权；
- 把沉默、部分回答或对话摘要当成新授权；
- 外部动作结果未知时重试。

## Deferred / Follow-up Register

以下议题已经讨论过，但有意排除在本小 spec 之外。它们保留在这里，避免丢失或被误认为已经拒绝。

| ID | Deferred 项 | 暂缓原因 | 重新打开条件 |
| --- | --- | --- | --- |
| D-001 | Run checkpoint v2 | 依赖稳定的 Goal/replan 边界 | 本 spec 接受且 fixture 通过 |
| D-002 | Authority 与 external-effect records | 需要稳定的中断和授权模型 | 选定一个生产型 recovery case |
| D-003 | Orphan Run、lease 与 reconciliation 协议 | 没有定义 evidence contract 时，Harness 不能推断 process liveness | 单独完成 recovery semantics spec |
| D-004 | Stage map 与 stage-gate CLI | Goal 边界稳定前，避免增加第二套状态机 | adapter stage 需求明确 |
| D-005 | 多 writer 与跨机器 revision 协调 | MVP 先保证 single-controller 行为 | 出现并发 writer evidence |
| D-006 | Gate overhead 测量与优化 | 需要基线和代表性 fixture | 找到可对比的长 Goal |

### Deferred 的存储

Deferred 项不会被删除。在当前 draft 阶段，本 spec 是这些 deferred 决策的 durable record。spec 接受后，每项应 promotion 或复制到项目配置中的 deferred register：

- adapter 配置路径：`paths.deferredRegister`；
- 当前 Agent Harness 默认路径：`harness/milestones/`；
- 标准结构：Milestone template 中的 `Deferred / Follow-up Register` 表格；
- 原始的未接受候选，可以暂存于配置的 `paths.ideaInbox`，或 task index 的 `Later` 区域，等待 intake promotion。

在后续 intake 明确 promotion 之前，Deferred 项不会自动变成 active Goal、Spec、Run 或 implementation work。

## 验收标准

本 spec 的实现只有在以下条件都满足时才算完成：

1. Goal validation 能区分内部 Task 变化与验收/授权范围漂移。
2. 发现范围变化时，当前 Goal 会暂停并记录 replan 原因，而不是静默扩大范围。
3. 路由行为能区分同一对话继续、有界 worker、handoff 和 incident/reconciliation 流程。
4. Gate 失败遵循 `request-fix` 与 `blocked` 规则，自动检查不会触发用户确认。
5. 面向用户的 closeout 先展示 L0/L1 digest，再提供 L2 证据。
6. 相关用户决策按主题合并，每批不超过 3 个，并保留未回答项。
7. 宿主原生 `request_user_input` 和普通文本 fallback 产生相同的决策语义。
8. Deferred / Follow-up Register 可读，且 deferred 项不会被自动 promotion。
9. 现有 fast-path direct work 不增加 durable Goal/Run ceremony。
10. 文档、模板、skill guidance、deterministic regressions 和 `npm run validate:plugin` 保持一致。

## 实现边界

本 spec 本身不授权开始实现。接受后，应创建一个或多个有界 implementation Goal，先实现 communication policy、digest output 和 scope-drift routing。Checkpoint、authority、effect 和 orphan recovery 应分别作为后续 Goal，并关联 D-001 至 D-003。
