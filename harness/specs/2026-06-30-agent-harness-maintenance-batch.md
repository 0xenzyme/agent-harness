# Agent Harness Maintenance Batch

Created: 2026-06-30
Status: Implemented.

## Background

The current task index has several small follow-ups that all improve the
same Agent Harness contract surface:

- evaluation fixtures for checking behavior across project shapes
- representative downstream project examples
- Idea Inbox Thread workflow support
- optional competition routing for high-ambiguity shaping work
- JSON schema validation for `.harness/config.json`

These are closely related enough to execute as one foreground batch. The
conditional bootstrap / hooks follow-up is intentionally excluded because it
depends on plugin manifest and runtime support outside this batch.

## Goal

Deliver the smallest useful version of the maintenance batch so Agent Harness
can document and validate its current contract across representative project
shapes, route idea-inbox and competition work explicitly, and validate
`.harness/config.json` deterministically.

## Scope

### Evaluation Fixtures And Examples

- Add an `evals/` blueprint covering new-project, legacy-project,
  non-harness-project, and messy-realistic project fixtures.
- Include scenario prompts, expected outcomes, and a semi-automatic scoring
  plan for agent behavior.
- Add representative downstream project shape examples that stay
  project-neutral and avoid downstream-specific product facts.
- Cross-reference the examples from public docs or project-contract docs only
  where they help users evaluate adoption.

### Idea Inbox Thread Workflow

- Define the capture-thread workflow, prompts, promotion rules, and
  non-execution boundary.
- Make clear that raw ideas are recorded or summarized first and only enter
  task index, specs, or goals after `harness:intake` or equivalent triage.
- Keep the control thread responsible for accepting candidate evidence and
  choosing execution.

### Optional Competition Routing

- Define when optional proposal competition is recommended.
- Define allowed outputs, forbidden outputs, and how competition fits Shape
  before Execute.
- Keep competition as a documented protocol in this batch, not a new
  installed `harness:compete` skill.

### Config Schema Validation

- Add a JSON Schema for `.harness/config.json` that covers fixed and adapter
  contracts.
- Add deterministic CLI validation that reports schema errors for active
  project config files.
- Integrate schema validation with existing config/doctor behavior without
  changing default artifact paths or adding runtime dependencies.
- Add smoke coverage for valid fixed, adapter, custom, and invalid config
  cases.

## Non-Goals

- Do not implement conditional bootstrap or `.codex-plugin/plugin.json` hooks.
- Do not create a new branch or worktree.
- Do not push, open a PR, deploy, publish, release, start a daemon, launch
  background sessions, or use credentials / paid APIs.
- Do not add project-specific product facts to plugin core examples,
  templates, references, or public docs.
- Do not add a new installed `harness:compete` skill in this batch.
- Do not replace existing fixed or adapter contract defaults.

## Key Decisions

- This batch is one development unit because the docs, examples, workflow
  routing, and schema checks all describe the same contract boundary.
- Evaluation fixtures should measure agent behavior, not only CLI exit codes.
- Representative project shapes are documentation fixtures, not live
  downstream projects.
- Idea Inbox and competition outputs are candidate evidence until the active
  control thread validates and accepts them.
- Schema validation should be dependency-free for now and should use the
  project-owned JSON Schema as the public contract artifact.

## Task Routing

- Level: 3 Cross-Surface Adapter.
- Reason: The batch touches public docs, project contracts, references,
  workflow skills, templates, CLI behavior, tests, and current harness state.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, relevant mental models, and this
  spec.
- Required gates: spec, execution, integration.
- Optional competition needed: no. The routing contract is being documented,
  not used to choose an implementation approach.
- Escalation triggers: public API rename, package version / release decision,
  hook or bootstrap support, daemon / automation behavior, or unclear product
  direction.

## Evidence Plan

- Accepted evidence:
  - committed-in-worktree files under `evals/` and project-neutral example docs
  - schema file and CLI validation output
  - smoke tests and plugin validation passing
  - updated task/status state
- Candidate evidence sources:
  - existing mental-model notes about Idea Inbox and evaluation scenarios
  - prior task-routing and design-principle references
  - smoke fixture failures during implementation
- State records to update:
  - `harness/tasks.md`
  - `harness/status.md`
  - this spec
  - the related goal handoff

## Affected Files

Expected files include:

- `plugins/agent-harness/scripts/agent-harness.mjs`
- `plugins/agent-harness/schemas/config.schema.json`
- `tests/smoke.mjs`
- `README.md`
- `README.zh-CN.md`
- `docs/project-contract.md`
- `docs/install.md`
- `plugins/agent-harness/references/*.md`
- `plugins/agent-harness/templates/*.md`
- `plugins/agent-harness/skills/*.md`
- `evals/README.md`
- `evals/fixtures/*/README.md`
- `docs/examples/*.md`
- `harness/tasks.md`
- `harness/status.md`

Implementation may touch nearby files when existing contracts require docs,
templates, CLI help, and tests to stay aligned.

## Acceptance Criteria

- `evals/` exists and defines the four required fixture shapes, scenario
  prompts, expected outcomes, and semi-automatic scoring plan.
- Representative downstream project examples exist and are linked from public
  or contract docs.
- Idea Inbox Thread workflow support is explicit in routing references,
  templates, skills, and public docs.
- Optional competition mode is explicit as a Shape-only documented protocol.
- `.harness/config.json` schema validation is available through the CLI and
  covered by smoke tests.
- Invalid config files fail clearly with actionable schema errors.
- The hooks / conditional bootstrap todo remains out of scope.
- Task and status files record the batch outcome and verification evidence.

## Implementation Summary

- Added `plugins/agent-harness/schemas/config.schema.json` and dependency-free
  CLI validation via `agent-harness config validate`.
- Integrated config schema status into `doctor` and `config inspect`.
- Added smoke coverage for valid fixed, adapter, custom, configured, malformed,
  and schema-invalid config cases.
- Added `evals/` fixture blueprints and
  `docs/examples/downstream-project-shapes.md`.
- Documented Idea Inbox promotion and optional competition routing across
  project contracts, references, workflow skills, and templates.
- Left conditional bootstrap / hooks out of scope as instructed.

## Verification

Run:

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-agent-harness-maintenance-batch.md --json
rg -n "b3ehive|~/project|/Users/" README.md README.zh-CN.md docs plugins/agent-harness evals
```

The final grep should return no matches for public docs, plugin files, or
evaluation docs.

## Completion Conditions

- All in-scope acceptance criteria are satisfied.
- Validation passes, or any failure is recorded with a concrete blocker and
  next step.
- `harness/tasks.md` moves the completed in-scope tasks to Done and leaves the
  conditional bootstrap / hooks item untouched.
- `harness/status.md` records the implementation, verification commands, and
  out-of-scope hooks decision.

## Pause Conditions

- The spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects compatibility, public API,
  versioning, or product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, release, hooks, daemons, or background automation are
  required.
