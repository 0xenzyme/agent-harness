# Smarter Worktree Recommendation Command Design

Status: Confirmed and implemented.

## 背景

当前 Agent Harness 已经有 `docs/worktree-policy.md` 和
`.agent-harness/config.json` 的 `worktree.defaultPolicy` / `worktree.autoRules`
配置，但实际执行前仍主要依赖 goal 文件里的静态 `Work Mode Recommendation`。
这会让 Codex 是否应该在当前 checkout 继续、切到新 worktree、或暂停询问变得不够显式。

已有 `run prepare` 会把 goal 中的推荐模式写入 run packet，但它不会读取真实
`git status` 后重新判断。因此需要一个独立、确定性、只读的 CLI 命令，在执行前
根据当前 repo 状态和 harness 配置输出推荐模式与原因。

## 目标

- 新增一个 worktree recommendation CLI command。
- 命令只报告 `local`、`worktree` 或 `ask`，并列出具体原因。
- 原因必须来自可观察的 git 状态和 `.agent-harness/config.json` 的 worktree 配置。
- 输出要能被人类阅读，也要能用于 deterministic verification。
- 不创建 branch，不创建 worktree，不修改文件，不启动 Codex session。
- 保持 core project contract 稳定，不把某个 downstream repo 的特殊规则写进通用逻辑。

## 命令入口

新增命令：

```bash
agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
```

等价 Node 调用：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd .
```

### Human Output

默认输出面向人类，格式保持稳定但不承诺作为机器 contract：

```text
Worktree recommendation: worktree
Reasons:
- git status: dirty checkout with 4 changed paths
- config rule: local_checkout_has_unrelated_changes -> worktree
- fallback: worktree.defaultPolicy=ask was not used
Action: create or choose a separate worktree before editing; this command did not create one.
```

当推荐为 `ask` 时：

```text
Worktree recommendation: ask
Reasons:
- git status: clean checkout
- config fallback: worktree.defaultPolicy=ask
Action: ask the user before choosing local or worktree.
```

`--lang` 继续使用现有 language resolution。技术标识如 `local`、`worktree`、
`ask`、path、command、git status code 和 config key 不翻译。

### JSON Output

`--json` 输出机器可读 JSON，不本地化：

```json
{
  "contract": "fixed",
  "cwd": "/path/to/project",
  "recommendation": "worktree",
  "reasons": [
    {
      "source": "git",
      "code": "dirty_checkout",
      "detail": "4 changed paths"
    },
    {
      "source": "config",
      "code": "auto_rule_matched",
      "rule": "local_checkout_has_unrelated_changes",
      "use": "worktree"
    }
  ],
  "git": {
    "isRepo": true,
    "root": "/path/to/project",
    "dirty": true,
    "statusCount": 4,
    "worktreeCount": 1
  },
  "config": {
    "defaultPolicy": "ask",
    "matchedRule": "local_checkout_has_unrelated_changes"
  }
}
```

`recommendation` 的唯一合法值是 `local`、`worktree` 或 `ask`。

## 推荐规则

实现应使用一个可复用 evaluator，例如：

```js
recommendWorkMode({ cwd, config, gitState })
```

规则顺序：

1. 读取 `.agent-harness/config.json`。
   - 缺失配置时使用内置默认：`worktree.defaultPolicy = "ask"`，`autoRules = []`。
   - 配置 JSON 无法解析时，命令失败并返回非零退出码；不要猜测。
2. 读取 git 状态。
   - `git rev-parse --show-toplevel` 判断是否在 Git repo 内。
   - `git status --short` 判断 checkout 是否 dirty。
   - `git worktree list --porcelain` 统计 worktree 数量；统计失败不应阻断推荐。
3. 如果不是 Git repo，推荐 `ask`。
   - reason: `not_git_repo`
4. 按 `worktree.autoRules` 的顺序检查可观察规则。
   - 首批必须支持 `local_checkout_has_unrelated_changes`。
   - 因为 CLI 无法可靠判断变更是否 unrelated，dirty checkout 应作为保守触发信号，并在 reason 中写明来自 `git status`。
   - 如果该 rule 的 `use` 是合法 mode，则采用该 mode。
   - 未识别的 `when` 不报错，记录为 skipped reason，继续检查后续 rule。
   - 非法的 `use` 不采用，记录 invalid reason，继续 fallback。
5. 如果没有 rule 匹配，使用 `worktree.defaultPolicy`。
   - 合法值：`local`、`worktree`、`ask`。
   - 缺失或非法时推荐 `ask`，reason 写明 invalid or missing fallback。

首批不实现无法从 git/config 稳定推断的规则：

- `user_explicitly_requests_no_branch_or_worktree`
- `parallel_or_unattended_work`
- `destructive_or_production_action`

这些规则可以保留在 config 中，但命令只报告它们不是可观察规则；不要凭空推断用户意图、生产风险或任务大小。

## 与现有命令的关系

- `doctor` 继续只做 harness health check，不承担 worktree recommendation。
- `run prepare` 第一阶段不自动调用 `worktree recommend`，避免改变现有 run packet contract。
- 后续如果要让 `run prepare` 写入动态 recommendation，必须另起 spec，因为这会改变 `.agent-harness/runs/*/status.json` 的含义。
- `goal create` 仍可生成静态 `Work Mode Recommendation`；本命令用于执行前根据真实 repo 状态复核。

## 文件范围

预期会触碰：

- `plugins/agent-harness/scripts/agent-harness.mjs`
  - `parseArgs` 支持 `--json`。
  - `usage` 增加 `worktree recommend`。
  - 增加 git/config evaluator 和输出函数。
- `README.md`
  - 增加命令示例和工作流位置。
- `docs/worktree-policy.md`
  - 说明 recommendation command 是只读建议，不自动创建 worktree。
- 必要时更新 `plugins/agent-harness/skills/harness-goal/SKILL.md`
  - 在执行 goal 前建议读取 command 输出，但不要把它变成强制自动化。

不应触碰：

- plugin manifest 的核心能力描述，除非只是补充短文案。
- `.agent-harness/config.json` contract 的 required path。
- 任何 downstream repo 特定路径或规则。

## 验证

最小验证：

```bash
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

建议再用临时项目覆盖三种推荐值：

```bash
tmpdir="$(mktemp -d)"
git -C "$tmpdir" init
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd "$tmpdir"
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd "$tmpdir" --json
```

验证场景：

- clean checkout + `worktree.defaultPolicy=local` -> `local`
- clean checkout + `worktree.defaultPolicy=ask` -> `ask`
- dirty checkout + `local_checkout_has_unrelated_changes -> worktree` -> `worktree`
- non-git directory -> `ask`
- invalid config JSON -> non-zero exit with clear error

## 完成条件

- 用户可以运行 `agent-harness worktree recommend --cwd <project>` 得到
  `local`、`worktree` 或 `ask`。
- 输出包含至少一条来自 git 状态或 config fallback/rule 的 reason。
- `--json` 输出稳定结构，便于后续自动化读取。
- 命令只读，不创建 worktree、branch、run packet 或 goal file。
- README 和 worktree policy 文档说明命令用途与边界。
- `npm run validate:plugin` 通过。
- 现有 `init`、`doctor`、`goal create`、`run prepare`、`run status` 行为不被破坏。

## 暂停条件

- 需要决定是否让 `run prepare` 自动消费动态 recommendation。
- 需要新增 task context flags 来判断 production、destructive、parallel 或 user intent。
- 需要创建 worktree、branch、push、PR、deploy、发布、凭证、付费 API 或生产访问。
- 发现 spec 与现有 project contract、plugin manifest、Codex plugin 行为或用户新指令冲突。
- 需要判断 dirty checkout 中哪些变更属于当前任务、哪些属于其他人。
