# Harness Run And Subagent Workflow Design

Status: Draft; requires user confirmation before implementation.

## 背景

当前 `agent-harness:harness-goal` 可以把任务整理成 goal handoff，但执行仍然依赖人手动把 prompt 交给新 session 或 `/goal`。这会产生两个问题：

- 从 `goal prompt` 到真实执行之间缺少便捷入口。
- 大任务没有标准拆分方式，容易在一个 context 内堆太多探索、实现和验证，最终触发压缩或丢失上下文。

## 当前应有工作流

1. `harness-goal` 负责生成 durable goal handoff。
   - 读取 `tasks.md`、`.agent-harness/config.json`、`.agent-harness/status.md` 和 git 状态。
   - 判断推荐 work mode：`local`、`worktree` 或 `ask`。
   - 写入 `.agent-harness/goals/YYYY-MM-DD-<slug>.md`。
   - 必要时更新 `tasks.md` 和 `.agent-harness/status.md`。
   - 不直接执行实现，不自动创建 branch，不自动 push。
2. 执行阶段应该读取 goal handoff，并开始一个受控 run。
   - 读取 goal 里的 spec、约束、验证命令、完成条件、暂停条件。
   - 根据 work mode 决定使用当前 checkout 还是新 worktree。
   - 将 run 的计划、日志、产物记录到 `.agent-harness/runs/<timestamp>-<slug>/`。
   - 对复杂任务生成 subagent 切分建议，确保每个子任务有清晰输入、输出和文件边界。

## 目标

- 增加一个便捷的 `run` 工作流，让用户不需要手动拼接执行步骤。
- 明确 `goal` 和 `run` 的职责边界：
  - `goal`: 生成可复用 handoff。
  - `run`: 准备并执行或半自动执行一个 goal。
- 为复杂任务提供 subagent task plan，让主 agent 能把探索、实现、验证拆成可控单元。
- 降低 context 压缩概率：单个 subagent 只拿必要文件、明确任务、明确退出条件。

## 设计方向

### CLI Commands

第一阶段实现确定性、低风险的命令：

- `agent-harness goal create --task <title-or-id> --cwd <project>`
  - 从 `tasks.md` 选任务，生成 `.agent-harness/goals/YYYY-MM-DD-<slug>.md`。
- `agent-harness run prepare --goal <goal-file> --cwd <project>`
  - 创建 `.agent-harness/runs/<timestamp>-<slug>/`。
  - 写入 `run.md`、`prompt.md`、`subagents.md`、`status.json`。
  - 输出下一步手动执行说明。
- `agent-harness run status --run <run-dir>`
  - 汇总 run 当前状态、验证命令和剩余任务。

第二阶段再评估是否添加直接执行入口：

- `agent-harness run start --goal <goal-file>`
  - 只有在本机 Codex CLI 支持稳定 stdin/file prompt 调用时才实现。
  - 否则保持 `prepare` 生成可复制 prompt，不做不稳定封装。

### Run Directory Contract

每次 run 使用独立目录：

```text
.agent-harness/runs/
  YYYYMMDD-HHMMSS-<slug>/
    run.md
    prompt.md
    subagents.md
    status.json
    logs/
```

- `run.md`: 这次执行的来源、work mode、步骤和人工检查点。
- `prompt.md`: 可以交给 `/goal` 或新 Codex session 的完整 prompt。
- `subagents.md`: 建议拆分的 explorer/worker/verification 子任务。
- `status.json`: 机器可读状态，包含 goal path、phase、createdAt、updatedAt、workMode。
- `logs/`: 后续命令输出、验证结果或自动化日志。

### Subagent Split Policy

实现一个轻量拆分策略，不自动生成无限子任务：

- `small`: 不拆 subagent，主 agent 直接完成。
- `medium`: 拆成 `explorer` 和 `worker`，或 `worker` 和 `verification`。
- `large`: 拆成多个互不重叠的 worker，每个 worker 有明确文件 ownership。
- `ask`: 当拆分涉及产品方向、生产、破坏性操作或文件边界不清时暂停。

每个 subagent task 必须包含：

- 背景和 goal path。
- 只读或可写范围。
- 明确文件 ownership。
- 不能 revert 他人修改的约束。
- 预期输出。
- 停止条件。

## 非目标

- 不做长期 daemon。
- 不默认启动多个并行 Codex session。
- 不把 downstream repo 的特定规则写死到 core contract。
- 不绕过用户对 branch/worktree/push/deploy 的明确边界。
- 不要求所有任务都拆 subagent；小任务保持单 agent。

## 验证

- `npm run validate:plugin`
- `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .`
- `node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd . --task "Add language-aware command output" --dry-run`
- `node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd . --goal .agent-harness/goals/2026-06-21-language-aware-command-output.md`
- 检查 `.agent-harness/runs/<timestamp>-language-aware-command-output>/` 包含 `run.md`、`prompt.md`、`subagents.md`、`status.json`。
- 用临时项目验证 `run prepare` 不修改目标代码，只创建 `.agent-harness/runs/` 下的 run packet。

## 完成条件

- 用户可以通过 CLI 生成 goal handoff，并通过 `run prepare` 得到下一步执行包。
- `goal` 文件仍写入 `.agent-harness/goals/`。
- `run` 产物写入 `.agent-harness/runs/<timestamp>-<slug>/`。
- `subagents.md` 能给出合理拆分，且每个子任务足够小，适合一个 context 内完成。
- 文档解释完整 workflow：init -> tasks -> goal -> run prepare -> execute -> verify -> update tasks/status。
- 现有 `init`、`doctor`、`print-contract` 行为不被破坏。

## 暂停条件

- 需要确认 Codex CLI 是否有稳定的文件 prompt / stdin / `/goal` 调用方式。
- 需要决定是否自动创建 worktree 或自动启动 Codex session。
- 需要引入长期后台服务、daemon 或外部队列。
- 需要凭证、付费 API、生产环境、push、PR、deploy 或破坏性操作。
- spec 与现有 project contract、plugin manifest 或用户新指令冲突。
