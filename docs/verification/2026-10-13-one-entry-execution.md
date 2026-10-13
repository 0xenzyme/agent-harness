# One-entry execution implementation verification

Date: 2026-10-13
Status: implementation verified; external validation limitations recorded

Goal: `harness/goals/2026-10-13-implement-one-entry-goal-and-milestone-execution.md`
Run: `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution`

## Requirement audit

| Accepted requirement | Current evidence |
| --- | --- |
| Single entry for Goal or multi-Goal Milestone | CLI `execute next`, controller loop in execute skill, generated prompts and host packs; real two-Goal test proceeds to next Goal and stage closeout. |
| Explicit two-level plan and acceptance coverage | Execution plan schema and CLI validation; duplicate/unknown/cyclic dependencies, path escape, omitted Goal List member and missing gate coverage fail. |
| Real per-Goal DAG and manifest v2 | Task dependency compilation and preparation checks; M-number phasing does not infer planned scope. |
| Controller acceptance releases dependencies | Candidate review tests, manual data-contract approval before Maker, request-fix then acceptance and forbidden completed-record bypass. |
| Fresh validation and final current-code evidence | Command logs and source input hashes; foreign Run logs, stale hashes, prematurely observed stage checks and modified accepted receipts fail. |
| Continue independent work and observe executors | Three unchanged failed repairs block one node; independent verification remains ready. Unknown delegated and foreground liveness requires reconciliation. |
| Shared closeout and state sync | Goal/Run/Milestone completion checks; pending acceptance, incomplete Goals, explicit blocked stage and inconsistent records fail; repeated closeout preserves revision. |
| Resume interrupted sync and preserve edits | Two-file journal replay with checkpoint at revision +1; conflicts leave pending destinations and user edits untouched. |
| Fixed, adapter, legacy and ordinary execution compatibility | Fixed Milestone and arbitrary legacy Spec paths; standard index table preservation; v1 Run path plus existing smoke/regression/routing checks. |
| Four public skills and consistent documents | Presentation/protocol and Codex/Grok host checks; README, usage, CLI, schemas, templates and project contract aligned. |
| Opt-in live development evaluator | Temporary three-Goal code fixture, independent oracle, human approval, actual process-group interruption and single recovery entry; dry-run fixture and mock host process checks pass. |
| Portable validator invocation | Explicit validator path and environment override; missing official tool remains a failing environment diagnostic. |
| Authorized boundaries | Package/plugin stay 0.12.0; no commit, push, release, scheduler, automatic AGENTS edit or visible chat creation. |

## Commands observed

- `npm run test:all`: passed presentation/protocol/Codex/Grok/smoke/regressions and all 22 planned execution integration tests.
- `npm run test:routing-classification`: passed 40 triggers, 4 task cases, 8 CLI checks, 12 behavior traces and 1 Codex trace.
- `npm run validate:plugin:local`: passed portable manifest, skills, references, schemas and package integrity; this is separate from official validation.
- `node evals/run-live-development.mjs --dry-run`: fixture validation and mock interruption/spawn-error/provenance/external-call checks passed without a model call.
- `git diff --check`: passed.
- `npm run validate:plugin`: exit 1, environment error. The official script at `/Users/liuyj/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py` is absent. It is not recorded as passed.

## Limits

- Actual live Codex/model development execution was not launched. The live launcher is implemented and preflight-validated; one-entry host execution success remains unmeasured until explicitly enabled.
- Automatic waking after interruption belongs to the host; no scheduler was added.
- POSIX process-group interruption is required by the live recovery case; unsupported hosts report a limitation.
- Official plugin validation can be rerun with `--validator PATH` or `AGENT_HARNESS_PLUGIN_VALIDATOR` after the external tool is available.

## Evidence logs

- `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution/logs/live-development-preflight.log`: SHA-256 `8f6c2d0b5d28afd6af56499b3e949416d255f3b879e9099909e6f2c6a69466b4`.
- `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution/logs/plugin-local.log`: SHA-256 `f017d54ccd86bd730f88927b5fb15acac16f9a6f25dd9a9c26ecab62d7edf472`.
- `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution/logs/plugin-official-environment-error.log`: SHA-256 `46815f4b8e9b9d7d57d6a89fa49b1b12091617cbdbbe7470c90867c42fad9711`.
- `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution/logs/routing-classification.log`: SHA-256 `e85a6a620ef98fad0d174df65b5ba07a8aa0705255e7f1f268c78e895c503416`.
- `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution/logs/test-all.log`: SHA-256 `55989d52e2085d47c9d7096db102a5e2945130cf529b4a65a6fa5b852e6c7bd1`.
