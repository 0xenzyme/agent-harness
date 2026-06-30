# Agent Harness Skill Evaluation

Date: 2026-06-30

Source framework: user-provided `research_report_20260630_skill_eval.md`

Evaluated package: `plugins/agent-harness`

## Summary

Agent Harness has a strong process-evaluation foundation and a partial
activation-evaluation foundation. The four shipped workflow skills have clear
frontmatter descriptions, explicit negative routing language, reference maps,
process checklists, and hard boundaries. The smoke test already verifies many
contract-level invariants.

The main gap is that skill evaluation is not yet represented as versioned
trigger cases and task cases. Current eval fixtures describe downstream
project shapes and scoring criteria, but they do not yet provide a reusable
case set for activation precision, activation recall, boundary conflicts, or
LLM/human rubric scoring over transcripts.

Overall readiness: `B+`.

## Scorecard

| Dimension | Score | Evidence | Gap |
| --- | ---: | --- | --- |
| Activation clarity | 8/10 | Each skill description includes `Use` and `Do not use` language. `execute` requires accepted scope, role, verification, completion, and pause conditions. | No `trigger_cases.yaml` or negative/boundary activation suite. |
| Skill boundary separation | 9/10 | The plugin ships exactly `orient`, `intake`, `init`, and `execute`; legacy wrappers are excluded by smoke tests. | `shape`, `goal`, and `competition` are route names but not skills, so eval should test that agents route correctly without expecting missing skills. |
| Procedure compliance | 8/10 | Skills require reading repo instructions, config, adapter artifacts, task index, status, and relevant specs/goals/runs. | No transcript-level checker yet to prove the agent actually loaded the required references. |
| Artifact contract | 8/10 | CLI and smoke tests verify config, goal, run, DAG, evidence, gate, and state-sync behavior. | Eval fixtures are blueprints, not generated runnable task cases with expected outputs. |
| Boundary and safety behavior | 9/10 | `orient`, `intake`, `init`, and `execute` all prohibit mutation outside their scope; `gate-only` is explicit. | Need near-neighbor cases for ambiguous user language such as "review and fix if easy". |
| Regression automation | 7/10 | `npm run test:smoke` and `npm run validate:plugin` pass and cover many hard constraints. | No score history, results index, or automated fixture runner for `evals/fixtures/*`. |
| Human/LLM rubric readiness | 6/10 | `evals/README.md` defines 0-2 scoring criteria and pass threshold. | No concrete rubric file, judge prompt, calibration notes, or human override tracking. |

## Strengths

1. The skill package has a small, inspectable surface. The README states that
   the plugin intentionally ships four workflow skills, which reduces routing
   ambiguity.

2. The frontmatter descriptions are practical routing interfaces. `orient`,
   `intake`, `init`, and `execute` each include both positive trigger language
   and exclusion language.

3. `execute` has the strongest process contract. It separates `gate-only`,
   `implementer`, and `mixed`, requires accepted boundaries before editing, and
   ties completion to verification and state sync.

4. The project already tests important hard constraints in `tests/smoke.mjs`:
   shipped skill set, description exclusions, reference links, config schema,
   no hooks, project-neutral docs, gate evidence, DAG node recording, and
   README packaging shape.

5. The existing eval fixtures already match the research report's process
   evaluation philosophy: they check route choice, artifact reading, boundary
   preservation, state discipline, and evidence quality.

## Gaps

1. Activation eval is not first-class yet. There is no dataset with positive,
   negative, and boundary user requests for `harness:orient`, `harness:intake`,
   `harness:init`, and `harness:execute`.

2. Output eval is mostly a blueprint. `evals/fixtures/*` documents scenarios,
   but there is no runner that materializes the fixture state, captures an
   agent transcript, and scores the result.

3. Procedure eval is asserted more than observed. The skill files say what to
   read, and smoke tests verify references exist, but no checker verifies that
   a live run actually read the right reference files before acting.

4. Rubric judging has no calibration layer. The eval README defines criteria,
   but there is no judge prompt, anchor examples, or human override log.

5. Regression history is missing. There is no durable scoreboard tracking
   activation precision, activation recall, hard check pass rate, task success
   rate, human override rate, or regression count.

## Recommended Next Work

1. Add `evals/skills/agent-harness/trigger_cases.yaml`.
   Include at least 20 positive cases, 10 negative cases, and 5 boundary cases
   across the four workflow skills.

2. Add `evals/skills/agent-harness/task_cases.yaml`.
   Start with the existing four project shapes: new project, legacy project,
   non-harness project, and messy realistic project. For each case, define
   setup files, required reads, forbidden operations, expected route, hard
   checks, and soft rubric items.

3. Add a minimal runner that executes deterministic CLI checks first.
   It should create temporary fixture directories, run `doctor`,
   `config inspect`, `config validate`, and `orient next`, then compare JSON
   fields before any LLM or human scoring.

4. Add a transcript scoring template.
   Score `contract detection`, `artifact reading`, `route choice`,
   `boundary preservation`, `state discipline`, and `evidence quality` from
   0 to 2, with concrete pass/fail anchors.

5. Add `evals/results/index.md`.
   Record date, package version, tested commit, validation commands, score,
   regressions, and follow-up changes for each eval run.

## Initial Cases To Add

### Activation Cases

Positive:

- `Use harness:orient in the current repo and tell me the next safe route.`
- `Use harness:intake to triage this idea without implementing it: Add an import wizard.`
- `Use harness:init in this repo and preview activation. Do not edit AGENTS.md.`
- `Use harness:execute for the confirmed goal in harness/goals/example.md. Verify and sync state.`

Negative:

- `What is Agent Harness? Answer in three sentences.`
- `Show me the package version.`
- `Review this unrelated React component.`
- `Create a new skill from this template.`

Boundary:

- `Use harness to inspect this repo and fix the first easy issue you find.`
- `Act as the control lane, but also patch the worker output if it is tiny.`
- `Add this idea and immediately implement it.`
- `Set up harness in this repo and update AGENTS.md for me.`
- `Complete this task, but I do not have a spec or verification command.`

### Task Cases

Start from existing fixtures:

- `new-project`: should route to `init` or preview setup, not implementation.
- `legacy-project`: should import config without creating a duplicate task
  index.
- `non-harness-project`: should stay report-only unless adoption is requested.
- `messy-realistic`: should read configured artifacts, account for dirty
  state, and avoid completion without verification.

## Verified Baseline

Commands run on 2026-06-30:

```bash
npm run test:smoke
npm run validate:plugin
```

Both commands passed.
