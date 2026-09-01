# Run Checkpoint 与 Recovery Protocol

Status: `accepted`

日期：2026-09-01

来源：

- `/Users/liuyj/project/geocn/docs/harness/2026-08-29-agent-harness-production-workflow-handoff.md`
- `/Users/liuyj/project/geocn/docs/harness/2026-08-29-geocn-project-workflow-hardening-handoff.md`
- `/Users/liuyj/project/skills/agent-harness/harness/specs/2026-08-29-bounded-goal-scope-drift-human-centered-handoff.md`
- GeoCN/FundGEO 2026-08-29 至 2026-08-31 的脱敏 Run 恢复证据

本文是生产多阶段恢复能力的第一份小 spec。它只解决 Run checkpoint、revision-safe mutation、contract drift、reconciliation 和 `orient` 恢复，不包含授权与外部副作用 ledger。

## 决策摘要

Agent Harness 应为显式声明的 enforced managed Run 提供独立 `checkpoint.json`，使 controller 在对话压缩、换人、执行中断或 Goal/Spec contract 变化后，可以从机器可读状态恢复，而不是从聊天摘要推断下一步。

Checkpoint 不替代 Goal、Run status、DAG、项目数据库、CI/CD 或 Backend job state：

- Goal/Task 仍是 accepted completion authority；
- `status.json` 仍是 Run/DAG execution projection；
- `checkpoint.json` 是当前控制阶段、暂停和恢复动作的 projection；
- adapter 扩展业务维度并提供业务 evidence；
- 项目权威系统继续证明真实外部状态。

## 问题

当前 Harness 已能绑定 prepared Run 的 Goal/Spec/DAG contract，并在 contract hash 变化后 fail closed。但它缺少标准恢复路径：

1. Run 当前处于哪个控制阶段不明确；
2. 上一个已完成阶段、下一动作和禁止重复动作依赖聊天摘要；
3. Goal/Spec 变化后，CLI 只拒绝旧 Run，不能明确表达 `replan-required`；
4. 外部动作可能已发生但 state sync 失败时，缺少 `reconciliation-required` 状态；
5. controller 更换后，`orient next` 不能输出唯一、可执行的恢复动作；
6. 普通 fast path 不应因此承担新的 durable ceremony。

## 范围

本 spec 覆盖：

1. 独立 `checkpoint.json` 的最小 schema；
2. 显式 enforced managed Run 的启用和生成规则；
3. lock-protected、atomic、revision-safe mutation；
4. checkpoint 与 manifest、Goal、Run status、DAG 的一致性校验；
5. Goal/Spec contract drift 后的 pause、replan、supersede 和新 Run 路径；
6. `reconciliation-required` 和禁止盲目 retry 的恢复语义；
7. `orient next` 的 compaction-safe 输出；
8. v1/legacy Run 读取兼容；
9. tracked 与 local-only Run 的证据生命周期边界；
10. project-neutral regression/eval fixture。

## Non-Goals

本 spec 不实现或详细定义：

- authority ledger、授权过期或一次性授权消费；
- external-effect ledger 或幂等执行器；
- `run stage advance/reopen` 等完整 stage CLI；
- 自动 heartbeat、process lease 或外部 job liveness 判断；
- 多 writer、跨机器 compare-and-set 或分布式锁；
- event sourcing 或 append-only control event log；
- 自动创建 thread、worker、incident 或 replacement Run；
- 生产部署、Provider 调用、预算 claim 或 Backend job state machine；
- GeoCN/FundGEO 业务 stage、组件名称、模型、预算和产品规则；
- 修改版本号或执行发布。

## 启用规则

### 1. 显式启用

Checkpoint 只对显式声明 recovery/checkpoint 要求的 managed prepared Run 启用。普通 managed Run、`codex-direct`、`codex-direct-postflight` 和没有 prepared Run 的工作保持现有行为。

最终字段名可在实现 Goal 中收敛，但 canonical Goal/Run 必须持久化一个 resolved policy，至少能区分：

- `disabled`：不生成 checkpoint；
- `enforced`：`run prepare` 必须生成、绑定并校验 checkpoint。

Adapter 可以要求某类 durable Goal 使用 `enforced`，但 core 不识别“生产”“付费”或某个项目名称。未声明时默认 `disabled`，避免扩大 fast path。

### 2. Managed Run 边界

Checkpoint 只绑定拥有有效 `manifest.json` 的 managed Run。Legacy、status-only、missing-manifest 或 invalid-manifest Run 可以继续 inspect，但不得自动升级为 checkpoint authority。

历史 Run 不批量重写。只有新 prepare 或显式 migrate 才创建 checkpoint。

## Checkpoint Schema

第一版 checkpoint 使用独立文件：

```json
{
  "schemaVersion": 1,
  "revision": 0,
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-01T00:00:00.000Z",
  "runDir": ".harness/runs/example",
  "goalPath": "harness/goals/example.md",
  "manifestRef": "manifest.json",
  "controlState": "active",
  "currentStage": null,
  "lastCompletedStage": null,
  "nextAction": "execute the next ready DAG node",
  "pauseReason": null,
  "reconciliationRequired": false,
  "requiredEvidence": [],
  "prohibitedActions": [],
  "replacementRun": null,
  "adapterDimensions": {}
}
```

### Core 固定字段

Core 必须理解并校验：

- `schemaVersion`；
- 单调递增的 `revision`；
- Run/Goal/manifest binding；
- `controlState`；
- `currentStage`、`lastCompletedStage`；
- `nextAction`、`pauseReason`；
- `reconciliationRequired`；
- `requiredEvidence`、`prohibitedActions`；
- `replacementRun`；
- timestamps。

`currentStage` 与 `lastCompletedStage` 是可空的 recovery label，不构成第二套 stage 状态机。Core 只校验类型、大小和安全字符；具体 stage vocabulary 由 accepted Goal/adapter 声明并校验。没有显式 stage map 的 Run 可以保持 `null`，继续以 DAG node 状态作为 execution authority。

### Control state

第一版固定状态：

- `active`：可以执行 checkpoint 指定的下一动作；
- `waiting`：等待已知的非用户条件或已有执行结果；
- `blocked`：存在明确 blocker，不能继续；
- `replan-required`：accepted contract 需要修改，旧 Run 不能继续；
- `reconciliation-required`：外部状态可能已变化，必须先 inspect；
- `superseded`：已经由一个明确的 replacement Run 取代；
- `completed`：Run control flow 已结束，但不自动表示 Goal 或 delivery accepted。

普通 mutation 必须遵守单调转换。`completed` 和 `superseded` 不允许回到 `active`。发现新的工作时创建新 Run，不复活旧 Run。

### Adapter dimensions

`adapterDimensions` 由 adapter 声明和值域校验，用于表达 deployment、component acceptance、delivery readiness 或其他项目维度。Core：

- 不内置 GeoCN/FundGEO 业务值；
- 不从一个维度推导另一个维度；
- 不允许 adapter dimension 覆盖 core 字段；
- 限制总大小和嵌套深度；
- 拒绝 secret-like key、凭证、token、完整 payload 和超大 inline evidence；
- 只保存非敏感状态和 evidence reference。

## 文件与 Manifest 绑定

Checkpoint-enabled `run prepare` 应：

1. 生成 `checkpoint.json`；
2. 在 `manifest.json` 中绑定 checkpoint path、schema version 和 resolved policy；
3. 在 `status.json` 中保存 checkpoint reference，但不复制 checkpoint control state；
4. 不把可变 checkpoint 内容 hash 写入 immutable manifest；
5. 保持现有 Goal/Spec/DAG contract hash 不变。

Manifest 证明“该 Run 使用什么 checkpoint contract”；checkpoint revision 证明“当前控制状态是什么”。两者不能互相替代。

`checkpoint.json` 是 checkpoint revision 与 control state 的唯一权威。`status.json` 不得成为必须同步更新的第二份 revision authority；如果为了诊断保存 `observedCheckpointRevision`，它只能是允许滞后的 observation，不能参与 checkpoint mutation 的 compare-and-set，也不能仅因滞后导致 Run invalid。

## Mutation Protocol

### 1. 基本规则

所有 checkpoint mutation 必须：

- 持有现有 Run lock；
- 使用 atomic write；
- 提供 `expectedRevision`；
- 重新校验 managed Run、manifest binding 和当前 checkpoint schema；
- 校验状态转换、必填 pause/reconciliation evidence 和路径 containment；
- 成功后令 `revision + 1`；
- 失败时不留下部分写入。

读取 revision 为 `N` 后，只有 `expectedRevision=N` 的 mutation 可以成功。当前 revision 已变化时必须拒绝覆盖，并要求重新 `show/orient`。

通常 mutation 还必须确认当前 Goal/Spec contract hash 与 manifest 一致。唯一例外是 source contract 已先发生 drift 时的 fail-closed recovery mutation：在 manifest 自身完整、checkpoint binding 有效且 mismatch evidence 被记录的前提下，只允许把旧 Run 收紧为 `replan-required`，或在 replacement Run 已验证后进一步变为 `superseded`。该例外不能修改 manifest、重绑新 contract、清除 reconciliation、恢复 `active`，也不能执行任何项目动作。

### 2. 最小 CLI 能力

具体参数拼写可以在实现 Goal 中调整，但 MVP 至少提供等价能力：

```text
agent-harness run checkpoint show
agent-harness run checkpoint validate
agent-harness run checkpoint update
agent-harness run validate
agent-harness orient next
```

Mutation 支持 `--cwd`、`--run`、`--expected-revision`、`--json` 和 dry-run/preview。CLI 不直接执行项目部署、Provider 调用或 replacement Run 创建。

### 3. 必填语义

- `blocked` 必须有具体 `pauseReason`；
- `replan-required` 必须说明哪个 accepted contract 边界变化；
- `reconciliation-required` 必须包含 inspect next action，并在 `prohibitedActions` 中列出不能盲目重试的动作；
- `superseded` 必须引用一个已存在、受 containment 保护且绑定同一 accepted outcome 的 replacement Run；
- `completed` 必须和 Run/DAG terminal evidence 一致，但不能自动修改 Goal completion 或 adapter delivery dimension。

## Contract Drift 与 Replan

Prepared Run 后 Goal/Spec execution contract 发生变化时，旧 manifest 不得重绑。

标准顺序：

```text
detect scope/contract drift
-> checkpoint = replan-required
-> record old Run blocked/non-complete evidence
-> accept and update Goal/Spec contract
-> prepare a new Run
-> validate replacement Run
-> old checkpoint = superseded + replacementRun
-> continue only in the new Run
```

如果 Goal/Spec 已经先被修改，现有 contract-hash rejection 继续 fail closed。CLI 应输出上述恢复路径，而不是建议绕过或覆盖 manifest。

此时旧 Run 不能因为 validation rejection 而卡在无法持久化暂停状态：Mutation Protocol 中定义的 restricted recovery mutation 可以记录 mismatch evidence，并单调进入 `replan-required`。它是 quarantine transition，不是对新 contract 的接受或对旧 manifest 的重绑。

旧 Run 的已完成 evidence 保留为历史事实。新 Run 可以引用它，但不能把旧 external effect 当成未发生，也不能自动接受旧 evidence 的 freshness。

## Reconciliation

本 spec 不建立完整 external-effect ledger，但必须定义安全恢复状态。

当 controller 知道以下任一事实时，应进入 `reconciliation-required`：

- 外部命令已启动，但结果未知；
- 外部动作可能完成，但 checkpoint/state sync 写入失败；
- command return、项目数据库、CI/CD 或 Run evidence 相互冲突；
- 重试可能造成重复成本、重复部署或不可逆副作用。

在 adapter 提供 fresh authoritative inspection evidence 前：

- `orient next` 只推荐 inspect/reconcile；
- 不得推荐 retry、redeploy、replay 或将状态标为 completed；
- 不得把聊天摘要作为外部完成或授权证据；
- 不得自动清除 `reconciliationRequired`。

清除 reconciliation 必须记录 evidence reference、observed time、observed source 和确定后的 next action。完整 effect identity、authority consumption 和 idempotency 语义由后续 spec 定义。

## `orient next` 恢复输出

对 checkpoint-enabled active Run，`orient next` 应优先输出 L0/L1 digest，而不是重新叙述完整历史。

L0 至少包含：

- current Run 和 checkpoint revision；
- `controlState`；
- current/last completed stage；
- 唯一 next action；
- user decision（如有）；
- pause condition；
- prohibited actions。

L1 可以补充：

- checkpoint 与 status/DAG/Goal 是否一致；
- required evidence；
- adapter dimensions 的关键变化；
- 为什么必须 replan 或 reconcile。

完整 Goal、Run、logs 和聊天摘要属于 L2 evidence，默认不倾倒给用户。

如果存在多个候选 active checkpoint，`orient next` 必须报告歧义并暂停选择，不能根据文件时间或聊天记忆静默挑选。

## 状态所有权与完成语义

Checkpoint 不新增第二个 accepted completion authority：

```text
checkpoint.controlState = completed
!= Goal completed

Run phase = completed
!= adapter delivery accepted

local verification passed
!= external deployment verified
```

Goal/Task completion仍需 accepted scope、fresh verification、required gates 和 State Sync Notes。Adapter dimensions 只能记录项目事实，不能越权覆盖项目数据库或发布系统。

## Artifact Lifecycle

- tracked Run 可以将 checkpoint 作为 durable recovery evidence；
- local-only Run 在 active/nonterminal 期间可以使用 checkpoint 恢复，但不能把它作为清理后的唯一 durable conclusion；
- nonterminal、`replan-required` 或 `reconciliation-required` Run 不得被 prune；
- local-only terminal Run 在 prune 前，必须把 durable conclusion、replacement/reconciliation 结果和必要 evidence reference 同步到配置的 Goal/status/milestone 等 durable roots；
- checkpoint 不改变现有 retention 的 preview-first、containment 和 explicit apply 规则。

## 兼容性

1. 没有 checkpoint 的 v1 managed Run 继续按现有逻辑读取和记录。
2. Legacy/unmanaged Run 继续 inspect，但不能自动创建 checkpoint authority。
3. 新字段不要求批量重写历史 artifacts。
4. Checkpoint-disabled Run 不增加新 gate 或 mutation obligation。
5. 现有 manifest contract hash protection 保持 fail closed。
6. 现有 `status.json` phase 和 DAG node 状态继续可读。
7. Plugin validation 同时覆盖 checkpoint-enabled 和 checkpoint-disabled 路径。

## 脱敏 Regression / Eval Fixture

使用 project-neutral fixture：

```text
Goal: validate a configurable advisory pipeline
Run: managed + checkpoint enforced
Stages: diagnosis -> contract -> deploy -> validation -> delivery

Facts:
- local contract verification passed
- deployment may have completed
- state sync failed
- controller was interrupted
- Goal acceptance contract later changed

Expected:
- first recovery is reconciliation-required
- orient recommends authoritative inspection only
- deploy is listed as prohibited until reconciliation
- after reconciliation, old Run becomes replan-required
- modified Goal cannot rebind the old manifest
- a replacement Run is prepared and the old Run becomes superseded
- delivery is not inferred from Run completion
```

Fixture 不包含真实产品、客户、Provider、凭证、价格或生产 payload。

## 验收标准

实现只有在以下条件全部满足时才完成：

1. 显式 enforced managed Run prepare 后生成 schema-valid `checkpoint.json`。
2. 未启用 checkpoint 的 Run 和 fast path 行为保持不变。
3. `show/validate` 能读取 checkpoint、manifest、status、DAG 和 Goal binding。
4. mutation 使用 Run lock、atomic write 和 `expectedRevision`。
5. stale revision、非法转换、越界路径和无 pause/reconciliation evidence 的更新被拒绝。
6. Goal/Spec contract drift 不允许重绑 manifest，并得到明确 replan/replacement 指引。
7. replacement Run 验证后，旧 Run 可单调进入 `superseded`，且历史 evidence 不被删除。
8. `reconciliation-required` 时 `orient next` 只推荐 inspect，并明确禁止盲目 retry。
9. `orient next` 输出 checkpoint revision、状态、唯一 next action、pause 和 prohibited actions。
10. 多个 active checkpoint 时不会静默选择。
11. Checkpoint completion 不自动完成 Goal 或 adapter delivery dimension。
12. v1 managed Run 和 legacy/unmanaged Run 保持读取兼容，不批量改写。
13. local-only nonterminal/recovery Run 不会被错误 prune。
14. Adapter dimensions 保持 project-neutral，并拒绝 secret-like/oversized inline payload。
15. Deterministic regression、behavior eval、CLI 文档、templates、skills、project contract 和 README 保持一致。
16. `npm run test:all`、`npm run test:eval`、`npm run validate:plugin` 和 `git diff --check` 通过。

## 暂停条件

Spec shaping 或后续实现必须在以下情况暂停：

- 本 spec 与已接受的 bounded Goal/scope-drift spec、现有 manifest safety 或 artifact lifecycle contract 冲突；
- 实现需要把项目业务 stage、Provider、预算或生产规则写入 core；
- 需要凭证、生产访问、付费 API、部署、发布、破坏性操作或持久 daemon；
- checkpoint 被设计成替代 Goal completion、Backend job state 或外部权威系统；
- 为支持 MVP 必须引入多 writer、分布式锁或完整 event sourcing；
- exact configuration naming 会导致现有 adapter 无法兼容，且没有明确 migration path。

## Deferred / Follow-up Register

| ID | Deferred 项 | 原因 | 重新打开条件 |
| --- | --- | --- | --- |
| RC-D1 | Scoped Authority and External Effect Protocol | 与 checkpoint 分离，避免第一份 spec 过大 | 本 spec 接受且 checkpoint fixture 通过 |
| RC-D2 | Orphan Run lease/heartbeat | 需要 runtime/adapter liveness evidence contract | 有脱敏 orphan fixture 和明确 host boundary |
| RC-D3 | Full stage advance/reopen CLI | 避免在 checkpoint MVP 中增加第二套状态机 | adapter stage validation contract 稳定 |
| RC-D4 | Multi-writer/cross-machine CAS | MVP 只保证单 controller + local Run lock | 出现真实并发 writer evidence |
| RC-D5 | Append-only control event log | 当前 materialized checkpoint 足以满足恢复 | 需要审计重建或事件历史证明 |
| RC-D6 | Gate overhead benchmark | 与恢复安全分开评估 | 有代表性长 Goal baseline |

Deferred 项不自动成为 active Goal。它们应在后续 intake 中单独 promotion。

## 实现边界

本 draft spec 不授权开始实现。接受后应创建一个 bounded implementation Goal，只实现本 spec 的 checkpoint/recovery MVP。

`Scoped Authority and External Effect Protocol` 必须作为后续独立 spec/Goal，不得通过实现过程中的 scope drift 静默并入。
