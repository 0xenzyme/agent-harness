# Complete Goal Toolchain Design

Status: Confirmed for goal handoff.

## 背景

当前 Agent Harness 的 loop engineering 骨架已经成立：

- `tasks.md` 作为项目任务状态的 source of truth。
- `.agent-harness/config.json` 记录项目策略。
- `.agent-harness/goals/` 保存 goal handoff。
- `.agent-harness/runs/` 保存 run packet 和执行证据。
- `agent-harness goal create` 可以从 `tasks.md` 生成 goal。
- `agent-harness run prepare` / `run status` 可以准备和查看 run packet。
- `agent-harness worktree recommend` 可以在执行前给出 checkout/worktree 建议。

但 goal 工具链还不完整。现在用户要回答“有哪些 goal、这个 goal 是否可执行、如何从 confirmed spec 生成 goal、如何准备执行、执行结果如何写回状态”时，仍需要读源码或靠人工约定。

## 核心原则

`/goal` 不是源头，而是从任务系统、confirmed spec、约束、验证方式、边界条件编译出来的一次执行指令。

Goal toolchain 应该覆盖这条链路：

```text
tasks.md -> confirmed spec -> goal handoff -> validated run packet -> manual execution -> verification evidence -> run/status/task update
```

工具要补强的是可观察、可验证、可停止、可恢复，而不是让 agent 无限循环或自动启动后台执行。

## 目标

- 让用户能用 CLI 清楚地生成、查看、验证和准备执行 goal。
- 让 executable goal 必须引用 confirmed spec，并要求执行前先读 spec。
- 让 malformed goal 在进入 run prepare 前就能被检测出来。
- 让 run 的完成、阻塞和验证摘要能写回 `.agent-harness/runs/` 的 machine-readable 状态。
- 更新相关 skills 和 docs，让“怎么生成 goal、怎么执行 goal、怎么收尾”成为稳定工作流。

## 建议命令面

保留现有命令，并补齐 goal/run lifecycle：

```bash
agent-harness goal create --cwd <project> --task <title-or-id> --spec <spec-path> [--work-mode local|worktree|ask] [--dry-run] [--force]
agent-harness goal list --cwd <project> [--json]
agent-harness goal inspect --cwd <project> --goal <goal-file> [--json]
agent-harness goal validate --cwd <project> --goal <goal-file> [--json]
agent-harness run prepare --cwd <project> --goal <goal-file>
agent-harness run record --cwd <project> --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>]
agent-harness run status --cwd <project> --run <run-dir>
```

命令名称可以在实现时小幅调整，但必须保持 goal 和 run 的边界：

- `goal *` 管理 durable goal handoff。
- `run *` 管理一次执行的 packet、状态和证据。

## Goal Validation Contract

`agent-harness goal validate` 至少检查：

- goal 文件存在且可读。
- `Spec:` 指向 repo 内存在的 spec 文件。
- spec 状态不是 `TBD`、空值或明显 draft。
- goal 包含 `Source Task`、`Read First`、`Work Mode Recommendation`、`Scope`、`Non-Goals`、`Verification`、`Completion Conditions`、`Pause Conditions`。
- `Read First` 包含 spec 路径，并明确执行前先读 spec。
- `Work Mode Recommendation` 是 `local`、`worktree` 或 `ask`。
- `Verification` 包含可执行命令或明确说明为什么只能人工验证。
- `Pause Conditions` 覆盖 spec 与代码/生产约束/用户新指令冲突，以及凭证、付费、破坏性操作、产品方向判断。

`--json` 输出应稳定，便于后续 automation 读取。

## Run Recording Contract

`agent-harness run record` 应只更新目标 run directory 下的文件，不自动改源码、不自动推送、不自动创建 PR。

最小行为：

- 更新 `status.json` 的 `phase`、`updatedAt`、`summary`、`verificationSummary`。
- 在 `logs/` 下写入一份 timestamped summary log。
- 支持 `completed` 和 `blocked` 两类停止状态。
- 保留后续扩展到 `failed`、`needs-review`、`budget-exhausted` 的空间。

是否自动更新 `tasks.md` 和 `.agent-harness/status.md` 可以作为实现中的明确决定；如果自动更新风险过高，先输出 next-step instructions，不要猜测任务迁移。

## 非目标

- 不自动启动 Codex session。
- 不创建 daemon、watcher、网络服务或 persistent background process。
- 不自动创建 branch/worktree；只读取或复用既有 worktree policy。
- 不 push、deploy、publish、open PR。
- 不把任何具体 downstream repo 的特例写进 core contract。
- 不实现 unattended infinite loop。

## 验证

最小验证：

```bash
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal list --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs goal inspect --cwd . --goal .agent-harness/goals/2026-06-21-complete-goal-toolchain.md --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal .agent-harness/goals/2026-06-21-complete-goal-toolchain.md --json
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd . --goal .agent-harness/goals/2026-06-21-complete-goal-toolchain.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd . --run <prepared-run-dir>
```

还需要用 temporary project 覆盖：

- confirmed spec + valid task -> goal create 成功。
- missing spec -> goal validate non-zero。
- `Spec: TBD` -> goal validate non-zero。
- missing required section -> goal validate non-zero。
- invalid work mode -> goal validate non-zero。
- run record `completed` 写入 `status.json` 和 `logs/`。
- run record `blocked` 写入 `status.json` 和 `logs/`。

## 完成条件

- 用户不用读源码就能知道当前有哪些 goal、每个 goal 的 spec/status/work mode/validation 状态。
- 从 `tasks.md` + confirmed spec 生成的新 goal 默认满足项目 `/goal` contract。
- `run prepare` 不再默默接受明显 malformed goal。
- 执行完成或阻塞后，run 结果能写回 `.agent-harness/runs/`。
- `README.md`、`docs/project-contract.md`、`plugins/agent-harness/skills/harness-goal/SKILL.md`、`plugins/agent-harness/skills/harness-run/SKILL.md` 描述新的稳定 workflow。
- `npm run validate:plugin` 通过。

## 暂停条件

- 需要决定是否把 `goal create` 无 spec 的旧行为改成 hard error。
- 需要决定是否让 `run record` 自动修改 `tasks.md` 或 `.agent-harness/status.md`。
- 需要启动 Codex session、daemon、watcher、push、PR、deploy、发布、凭证、付费 API 或生产访问。
- 发现本 spec 与现有 project contract、plugin manifest、Codex plugin 行为或用户新指令冲突。
- 需要判断某个 downstream repo 的特殊流程是否应该进入 core contract。
