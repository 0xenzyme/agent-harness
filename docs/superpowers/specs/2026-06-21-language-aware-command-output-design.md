# Language-Aware Command Output Design

Status: Draft; requires user confirmation before implementation.

## 背景

当前 `agent-harness` CLI 的用户可见输出都是英文，例如 `doctor` 输出
`Project`、`Git root`、`Harness files`、`Git status`、`Worktrees`。这对
中文用户不够自然，也会让 Codex skill 的中文对话和终端输出不一致。

## 目标

- CLI 的人类可读输出可以根据用户语言显示。
- Codex skill 的最终回复默认使用用户输入语言。
- 保留代码、命令、路径、类名、函数名、包名、skill 名称、API 名称、模型名、缩写术语和 Git commit message 的原始英文形式。
- 不破坏现有命令、文件路径、JSON contract、退出行为和自动化脚本。

## 语言选择规则

实现应使用确定性的语言解析顺序：

1. CLI 显式参数：`--lang <code>`，例如 `--lang zh-CN`、`--lang en`、`--lang auto`。
2. 环境变量：`AGENT_HARNESS_LANG`。
3. 项目配置：`.agent-harness/config.json` 中可选的 `language.default`。
4. 系统 locale：`LANG`、`LC_ALL`、`LC_MESSAGES`。
5. 回退：`en`。

首批只要求支持 `en` 和 `zh-CN`。`zh`、`zh_CN.UTF-8`、`zh-Hans` 可归一到
`zh-CN`；未知语言回退 `en`。

## 设计约束

- 不引入重量级 i18n 依赖；优先在 CLI 内维护小型 message catalog。
- `print-contract` 继续输出稳定 JSON，不做本地化。
- `git status --short` 等机器输出原样保留。
- 初始化出来的 contract 文件路径保持不变。
- 生成文件模板是否本地化不纳入本 goal，除非实现中有非常低风险的自然扩展。
- `doctor`、`init`、help/usage 是第一批本地化范围。

## 预期实现方向

- 在 `plugins/agent-harness/scripts/agent-harness.mjs` 中添加语言解析函数和
  `t(lang, key, vars)` 风格的消息函数。
- 在 `parseArgs` 中支持 `--lang`。
- 在 `buildConfig` 或模板中增加可选 `language.default`，默认 `auto`，并确保旧配置缺失该字段时不报错。
- 更新 `plugins/agent-harness/skills/*/SKILL.md`，要求对用户报告时使用用户语言，同时保留英文技术标识。
- 更新 README 或 install docs，说明语言选择优先级和示例命令。

## 验证

- `npm run validate:plugin`
- `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang en`
- `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`
- `AGENT_HARNESS_LANG=zh-CN node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .`
- 使用临时目录验证 `init --lang zh-CN` 不覆盖现有文件，且控制文件路径仍符合 contract。

## 完成条件

- `doctor`、`init`、help/usage 的用户可见标签能在 `en` 和 `zh-CN` 间切换。
- 未传语言参数时，英文环境保持原行为语义。
- 中文语言环境下，输出是自然中文，但路径、状态短码、命令名等技术标识不被翻译。
- 文档说明语言选择规则。
- plugin validation 通过。

## 暂停条件

- 发现 spec 与现有代码 contract、plugin manifest、Codex plugin 行为冲突。
- 需要决定是否本地化生成的 `tasks.md` / `.agent-harness/status.md` 模板内容。
- 需要引入第三方 i18n 依赖。
- 需要破坏性操作、发布、push、付费 API、凭证或生产环境访问。
- 用户给出新的产品方向指令，与本 spec 冲突。
