# Planned Execution Contract

An accepted Goal or Milestone stores its version 1 execution plan beside its
Markdown document as `<target-filename>.plan.json`. The document has a literal
`Execution Plan: <repo-relative-plan-path>` line. Every Goal in a Milestone
plan references that Milestone-adjacent plan; only a standalone single-Goal
plan is adjacent to its Goal. [Execution plan schema](../schemas/execution-plan.schema.json)
and [candidate receipt schema](../schemas/candidate-evidence.schema.json) give
the JSON shapes. `plan validate` also checks configured roots, document items,
coverage, unique IDs, missing dependencies, and cycles; JSON Schema alone
cannot establish those repository facts.
When a Milestone `Goal List` contains concrete Doc rows, the plan must cover
exactly those Goal paths once each. The bound target contract hashes Goal
name, Doc, priority, dependency and gate fields; it excludes mutable Status
cells, so Goal closeout can update Status without invalidating the plan.
For a single-Goal target, optional root `verification` entries must each be
identical to a check in that Goal's Task `verification`; the controller does
not leave a final check unassigned. Milestone root `verification` is required.
In fixed-contract projects, Spec references remain project-local when
`paths.specs` is not configured; an explicit `paths.specs` constrains them to
that root. The optional Milestone root can use `harness/milestones/` as its
default. Neither path adds a required directory to fixed `init`.

## Minimal single-Goal example

Assume the configured Goal root is `harness/goals/`, the task index contains a
matching source task, and `src/app.js` exists. Put this in
`harness/goals/example.md` along with the normal Goal sections required by
`goal validate`:

```md
# Goal: Example

Execution Plan: harness/goals/example.md.plan.json
Checkpoint Policy: enforced
Status: active.

## Spec Acceptance Checklist

- Item: app-loads
  - Acceptance: The app parses successfully.
  - Evidence: TBD
  - Status: pending
  - Unblocker: N/A
```

Put the following JSON in `harness/goals/example.md.plan.json`:

```json
{
  "version": 1,
  "target": { "kind": "goal", "path": "harness/goals/example.md" },
  "goals": [
    {
      "id": "example",
      "path": "harness/goals/example.md",
      "dependsOn": [],
      "tasks": [
        {
          "id": "build",
          "label": "Implement and check the app",
          "dependsOn": [],
          "type": "implementation",
          "ownership": { "read": ["src/app.js"], "write": ["src/app.js"] },
          "acceptance": [
            { "path": "harness/goals/example.md", "section": "Spec Acceptance Checklist", "item": "app-loads" }
          ],
          "verification": [
            { "id": "syntax", "command": "node --check src/app.js", "inputs": ["src/app.js"] }
          ]
        }
      ]
    }
  ]
}
```

The plan's `version` is 1; a Run prepared from it uses manifest v2 and an
enforced checkpoint. `goal create --plan PATH` is the planned creation route
and defaults its new Goal to enforced checkpointing. For an existing Goal,
set `Checkpoint Policy: enforced` before `run prepare --plan`. An unplanned
Run may still use manifest v1; its existing path remains readable.

## Inputs and receipt

Validate and prepare the plan, then ask for its current input hashes. The
`inputs` commands are read-only and return check IDs, exact commands, and
current SHA-256 hashes keyed by repo-relative input paths:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs plan validate --cwd <project> --plan harness/goals/example.md.plan.json --json
node plugins/agent-harness/scripts/agent-harness.mjs plan inputs --cwd <project> --plan harness/goals/example.md.plan.json --json
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd <project> --goal harness/goals/example.md --plan harness/goals/example.md.plan.json --json
node plugins/agent-harness/scripts/agent-harness.mjs run node inputs --cwd <project> --run <run-path> --node build --json
```

After actually running `node --check src/app.js`, save its real output to a
regular log file inside that same Run and record its exit code.
Check and executor observation timestamps must be at or after the prepared
Run manifest's `createdAt`.
Write the candidate receipt to the
Run's `agents/build/candidate.json`. Its shape is:

```json
{
  "version": 1,
  "target": { "kind": "goal", "path": "harness/goals/example.md" },
  "goal": "harness/goals/example.md",
  "run": "<run-path>",
  "node": "build",
  "summary": "Implemented and checked the app.",
  "changedFiles": ["src/app.js"],
  "stateSyncNotes": "Controller must synchronize the mapped item and Goal index after acceptance.",
  "risks": [],
  "remaining": [],
  "needUser": null,
  "executor": {
    "status": "completed",
    "observedAt": "<actual ISO timestamp>",
    "observedSource": "current host foreground execution"
  },
  "checks": [
    {
      "id": "syntax",
      "command": "node --check src/app.js",
      "exitCode": 0,
      "observedAt": "<actual ISO timestamp>",
      "inputs": { "src/app.js": "<hash from run node inputs after verification>" },
      "log": "<run-path>/logs/syntax.log",
      "logHash": "<SHA-256 of exact log bytes>"
    }
  ]
}
```

Replace the bracketed values with observed values; the example makes no
claim that a check ran. `checks[].id` and `command` must match the plan.
Omit `executor.thread` for foreground work. If a delegated node was recorded
as `running`, set `executor.thread` to exactly the recorded worker identity.
`checks[].inputs` must equal the current `run node inputs` map exactly; the
controller rehashes files during review and later completion. Each `logHash`
must match the bytes at `log`, and the log must contain concrete evidence.
The log must live inside the node's own bound Run, and its check's
`observedAt` must be at or after that Run's manifest creation.
Manual checks also record `humanDecision`. `changedFiles` must stay inside
that Task's `ownership.write` and outside authoritative Harness artifacts.
The plan's source `ownership.write` scope itself cannot include Goal, Spec,
Milestone, Run, status, task index, or config artifacts.
Input snapshots exclude `.git`, `node_modules`, configured control roots and
files (including Specs, config, sync journal and project lock), status, and the
task index. A root `.` input hashes the remaining source tree, so creating a
sync journal or lock cannot invalidate its own verification hash. An input
pointing directly at an excluded control artifact is rejected.
For `accepted`, every required check has exit code zero, `remaining` is empty,
and `needUser` is null. A failed check may support `request-fix` or `blocked`.

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run node review --cwd <project> --run <run-path> --node build --evidence <run-path>/agents/build/candidate.json --decision accepted --expected-revision <current-revision> --json
```

The controller copies the accepted receipt into a revisioned review artifact.
Only that acceptance releases dependent Tasks. Planned `run node record`
supports `running` and `blocked` with `--expected-revision`; `completed`
cannot bypass review. Project sync resumes through `run sync --run <run-path>
--expected-revision <current-revision>` before more work. `execute next` then
continues until the whole selected Goal or Milestone is `done`.

The next-action enum is exactly `execute-node`, `wait`, `review-node`,
`verify-node`, `sync`, `prepare-run`, `complete-goal`,
`complete-milestone`, `reconcile`, `replan`, `need-user`, and `done`.
`reconcile` with `needUser: null` identifies a non-user blocker. A
`complete-milestone` action includes an anchor `run` and
`checkpointRevision`; pass that revision as `--expected-revision` to
`milestone complete`. Successful completion increments that Run's checkpoint
revision.
For a ready `human` Task, `execute next` checks every mapped acceptance item.
If all are `satisfied` and have concrete `Evidence`, it returns `verify-node`
so the controller can verify the existing accepted record and put that
decision in the receipt's `humanDecision`. It does not ask the same question
again. If the record is missing, `need-user` carries the concrete question.
After three identical verification failures without progress, the blocked
node returns `reconcile` with `needUser: null`, a reason naming the no-progress
count and failure summary, and the review receipt in `requiredEvidence`.
A Goal explicitly marked `blocked` also returns `reconcile` and cannot be
prepared or executed until its accepted recovery changes that phase.

For a Milestone plan, set `target.kind` to `milestone`, list its Goals with
`dependsOn`, and give every Goal a `milestoneItem` reference into the target's
`Milestone Completion Map`. Include a nonempty top-level `verification` array
for stage checks. The Milestone map must cover every required item exactly
once. Each Goal's Task acceptance references its Goal or referenced Spec.
Goal dependencies gate Run preparation; Task dependencies gate node execution.
Plan validation checks each Goal's structural contract and adapter-required
gates before compilation. Planned Goals use explicit map items and do not
inherit legacy batch or M-number phasing heuristics.
Validation covers `Spec Acceptance Checklist`, `Required Gate Evidence`,
`Milestone Completion Map`, legacy `Stage Completion Map`, and
`Source Task Acceptance Map` entries on the Goal or referenced Spec. The
last two use their declared item labels, without an M-number naming rule.
The controller runs every necessary Task and stage check and saves the real
logs and receipt. The CLI validates that recorded evidence; it does not run
those commands. Milestone completion updates `Current Status` and `Goal List`,
records `Completion Evidence Hash` for the accepted receipt, and increments
the anchor Run checkpoint revision. Rechecking `done` verifies the receipt
hash and stage evidence.
Stage verification logs must be inside that same anchor Run. Stage check
`observedAt` must be at or after the latest `completedAt` among all required
Goal Runs (using a legacy `updatedAt` fallback where needed).
An explicitly blocked root Milestone prevents new Runs and Task starts until
its accepted state is recovered. A completed Run with an active Goal returns
`complete-goal` rather than scheduling duplicate implementation. Repeated
successful Goal or Milestone closeout is idempotent and preserves revision.
The bounded status file follows the current target; later accepted work can
replace its projection without reopening historical completed targets.
