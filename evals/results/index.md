# Agent Harness Eval Results

This index records repeatable Agent Harness skill evaluation runs.

| Date | Package Version | Scope | Commands | Result | Follow-Up |
| --- | --- | --- | --- | --- | --- |
| 2026-06-30 | 0.3.0 | Baseline skill-eval assessment | `npm run test:smoke`; `npm run validate:plugin` | Pass; readiness `B+` | Add trigger cases, task cases, deterministic runner, transcript rubric, and result history. |
| 2026-06-30 | 0.3.0 | Deterministic Agent Harness skill eval | `npm run test:eval` | Pass; 36 trigger cases, 4 task cases, 8 hard CLI checks | Add transcript capture and calibrated LLM/human rubric scoring. |

## Metrics To Track

- `activation precision`
- `activation recall`
- `hard check pass rate`
- `task success rate`
- `human override rate`
- `regression count`
