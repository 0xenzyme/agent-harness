# Spec: Cybernetic Stability Model For Agent Harness

Created: 2026-07-06
Status: completed with validated-local protocol and documentation evidence

## Background

The current Agent Harness design was not built from a cybernetics model.
It already has several control-loop-shaped parts: intent routing, accepted
scope, Goals, Runs, verification, Delivery State, pause conditions, and state
sync. Those parts emerged from practical workflow needs rather than from an
explicit `sensor -> measurement -> error -> controller -> action` model.

The user wants to study control theory / cybernetics from a practical angle and
use it to improve Harness stability where it helps. The goal is not to make the
product performative or overly compatible with imagined future users. The
current repository still has one primary user, so the design may make larger
internal improvements when they clearly reduce instability, false completion,
stale state, or route confusion.

This spec records the accepted setpoint for the control-theory-inspired
stability pass. Documentation, workflow-skill guidance, templates, generated
CLI guidance, version-line metadata, and deterministic checks have been updated
against this spec.

## Goal

Strengthen Agent Harness as a stable control loop by making target selection,
observed state, gap comparison, feedback quality, and saturation / pause
conditions more explicit.

The intended outcome is higher stability, not new ceremony:

- fewer stale artifact mistakes;
- fewer false completion claims;
- fewer route oscillations between `orient`, `shape`, `goal`, `execute`, and
  `ask`;
- clearer handoff after context transitions;
- clearer stop conditions when evidence, authority, credentials, budget,
  risk, or user direction is insufficient.

## Scope

- Define an internal cybernetic control-loop model for Harness:
  `intent -> setpoint -> sensor -> measurement -> gap/error -> controller -> action -> feedback`.
- Treat intent recognition as setpoint selection:
  user language should be normalized before route decisions choose what state
  the loop is trying to reach.
- Define Harness sensor classes and their rough authority / freshness rules,
  including current conversation, user-confirmed decisions, repo state,
  `git diff`, tests, CI, `harness/tasks.md`, `harness/status.md`, specs,
  goals, runs, review comments, and command output.
- Define a lightweight measurement snapshot for orientation, shaping, goal
  creation, and execution closeout:
  current target, observed state, evidence, conflicts, stale artifacts, delivery
  state, and user-decision state.
- Define gap / error comparison in Harness language:
  remaining difference between accepted scope / completion conditions /
  Delivery State and observed current state.
- Define feedback quality checks:
  what kind of feedback is sufficient for completion, what is only advisory,
  what is stale, and what requires pause or re-orientation.
- Define stability and saturation triggers:
  route oscillation, repeated ineffective verification, stale state conflict,
  incomplete evidence, context limits, permission limits, credential / paid API
  needs, production risk, destructive-operation risk, and external feedback
  delay.
- Apply the model to docs, workflow skills, templates, generated guidance, and
  deterministic checks where it reduces ambiguity or false completion.
- Allow pragmatic internal restructuring when it improves the control loop, but
  require evidence that the added structure reduces instability rather than
  adding ceremony.
- Sync Harness task and status records when the spec is accepted or implemented.

## Non-Goals

- Do not expose cybernetics terminology as required user-facing product
  vocabulary unless it is clearly useful.
- Do not rename existing public work units such as `Roadmap`, `Milestone`,
  `Goal`, `Task`, `Run`, `Evidence`, `Delivery State`, or `Pause Conditions`.
- Do not add broad compatibility constraints solely for hypothetical external
  users.
- Do not implement a generic mathematical control-system engine.
- Do not add daemons, watchers, background automation, network services, paid
  APIs, credentials, production access, deploys, publishing, releases, commits,
  pushes, or PRs as part of this spec.
- Do not treat tests, run logs, or agent-written status as automatically
  authoritative when they conflict with newer user-confirmed state.

## Key Decisions

- The cybernetic model is first an internal product model. Public Harness
  language should stay practical: `intent`, `target`, `observed state`,
  `evidence`, `remaining gap`, `feedback quality`, and `pause condition`.
- `Intent recognition` is part of the control loop. It selects the target /
  setpoint before the controller decides a route.
- `Sensor` and `measurement` should become explicit enough that a future thread
  can recover the same current-state judgment from recorded evidence.
- `Gap/error` should be expressed as remaining work against accepted Harness
  artifacts, not as abstract math.
- Each meaningful execution loop should be able to say what gap was closed,
  what gap remains, and why continuing or pausing is the stable next action.
- Stronger control-loop modeling may justify larger changes because the project
  is still primarily used by its author, but every change must still reduce a
  concrete instability or ambiguity.

## Control Loop Model

```text
Raw user signal
-> intent recognition
-> target / setpoint selection
-> sensor selection
-> measurement snapshot
-> gap / error comparison
-> controller route decision
-> authorized action
-> feedback
-> updated measurement or pause
```

Harness mapping:

- `intent recognition`: normalize user language to `Milestone`, `Goal`,
  `Task`, `Run`, `Priority`, `Spec`, `Question`, `Research`, or `Ask`.
- `target / setpoint`: accepted scope, completion conditions, acceptance map,
  Delivery State, or research question.
- `sensor`: conversation, configured artifacts, git state, tests, run evidence,
  review comments, command output, CI, and user feedback.
- `measurement snapshot`: current target, current observed state, evidence
  status, stale/conflict risks, delivery posture, and user-decision state.
- `gap / error`: what remains unsatisfied against the target.
- `controller`: current thread route and role, such as `orient`, `intake`,
  `shape`, `goal`, `execute`, `ask`, `gate-only`, `mixed`, or `implementer`.
- `action`: edit, verify, ask, pause, prepare a goal/run, update state, or
  close out.
- `feedback`: verification result, user response, review result, CI result,
  git diff, state update, or newly discovered conflict.

## Product Rules

- `harness-rule:intent-setpoint-selection`: normalize user intent before route
  selection and treat the normalized target as the control-loop setpoint.
- `harness-rule:sensor-freshness`: prefer newer user-confirmed state and fresh
  local observations over stale artifacts; report conflicts instead of silently
  choosing an old plan.
- `harness-rule:measurement-snapshot`: before execution and closeout, record or
  summarize the observed current state, evidence, delivery state, conflicts,
  and user-decision state.
- `harness-rule:remaining-gap`: every non-trivial closeout should state what
  gap was closed and what remains; if no gap shrank, re-orient or pause.
- `harness-rule:feedback-quality`: do not treat low-quality or delayed
  feedback as completion evidence; distinguish tests, CI, review, user
  confirmation, command output, agent summary, and stale status.
- `harness-rule:stability-saturation`: pause or re-route when the loop shows
  oscillation, repeated ineffective actions, context saturation, authority
  limits, missing credentials, cost/risk limits, or delayed external feedback.

These rules are implemented as stable protocol anchors across the capability
matrix, project contract, cybernetic stability document, task-routing
reference, workflow skills, templates, generated CLI guidance, and
deterministic checks.

## Task Routing

- Level: standard adapter protocol and documentation implementation.
- Reason: this changes default Harness routing guidance, workflow skill
  behavior, templates, generated packets, closeout expectations, and protocol
  checks.
- Required docs before implementation: `AGENTS.md`, `.harness/config.json`,
  `harness/README.md`, `harness/tasks.md`, `harness/status.md`, this spec,
  mental models, task-routing reference, capability matrix, project contract,
  workflow skills, templates, CLI generator, `scripts/test-suites.mjs`, and
  `tests/smoke.mjs`.
- Required gates before completion: accepted scope, deterministic tests,
  plugin validation, git whitespace check, Harness state sync, and explicit
  Delivery State.
- Work mode: current checkout unless the user asks for an isolated worktree.
- Execution role: `mixed` main-control execution in the current thread after
  the user explicitly asked this thread to act as main control and complete the
  spec.
- Optional competition needed: no by default; use only if the scope becomes
  broad enough that alternative architectures need comparison.
- Escalation triggers: public API expansion, schema/storage migration,
  activation behavior change, hidden compatibility commitments, background
  automation, destructive operations, production risk, or delivery above
  `validated-local`.

## Evidence Plan

- Accepted evidence:
  - spec acceptance by the user;
  - implementation diff tied to concrete instability reductions;
  - generated guidance showing target, measurement, gap, feedback quality, and
    saturation behavior where applicable;
  - deterministic protocol and smoke coverage;
  - Harness state sync.
- Candidate evidence sources:
  - current discussion;
  - implementation diff;
  - CLI generated goal/run/prompt text;
  - workflow skill guidance;
  - protocol and smoke test output.
- State records to update:
  - `harness/tasks.md`;
  - `harness/status.md`;
  - future goal file and run packet if implementation is authorized.

## Spec Acceptance Checklist

- Item: `Setpoint clarity`
  - Acceptance: The spec defines the intended target for a cybernetic stability
    pass without immediately authorizing implementation.
  - Evidence: `This spec defines the cybernetic stability setpoint and was
    used to add docs/cybernetic-stability.md, README / README.zh-CN version
    positioning, docs/releases/v0.5.0.md, CHANGELOG.md, aligned version
    metadata, workflow skill guidance, templates, generated CLI guidance, and
    deterministic checks.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Practical boundary`
  - Acceptance: The spec focuses on concrete Harness stability problems rather
    than ornamental cybernetics terminology.
  - Evidence: `docs/cybernetic-stability.md maps control-theory concepts to
    practical Harness terms: target, observed state, evidence, remaining gap,
    feedback quality, pause condition, and saturation. README / README.zh-CN
    present the upgrade as practical stability work rather than public
    academic vocabulary.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Sensor and measurement model`
  - Acceptance: The spec defines sensor classes, freshness expectations, and a
    measurement snapshot concept that can be implemented in docs/templates/CLI
    guidance.
  - Evidence: `docs/cybernetic-stability.md defines sensor classes, default
    freshness precedence, and a lightweight measurement snapshot shape.
    docs/project-contract.md, plugins/agent-harness/references/task-routing.md,
    workflow skills, goal/spec/worker templates, and generated CLI guidance
    now carry `harness-rule:sensor-freshness` and
    `harness-rule:measurement-snapshot`.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Gap and feedback quality`
  - Acceptance: The spec defines how Harness should express remaining gap and
    distinguish strong, weak, stale, or delayed feedback.
  - Evidence: `docs/cybernetic-stability.md defines remaining gap, strong
    feedback, weak or insufficient feedback, and the rule that weak feedback
    should lead to verification, re-orientation, or pause instead of completion
    claims. The same `harness-rule:remaining-gap` and
    `harness-rule:feedback-quality` anchors are enforced in protocol checks
    across task routing, execute guidance, templates, and generated guidance.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Stability and saturation`
  - Acceptance: The spec defines route instability, ineffective loops, context
    limits, authority limits, and external dependency delay as pause or
    re-route triggers.
  - Evidence: `docs/cybernetic-stability.md defines route oscillation,
    repeated ineffective verification, stale artifact conflicts, delivery
    overclaims, parent milestone false completion, context saturation,
    authority limits, credentials, paid APIs, production access, destructive
    approval, external feedback delay, and risk/cost overflow as pause or
    re-route triggers. The same `harness-rule:stability-saturation` anchor is
    enforced in protocol checks across task routing, skills, templates, and
    generated guidance.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Protocol and generated guidance`
  - Acceptance: Docs, workflow skills, templates, generated goal/run/prompt
    guidance, and deterministic checks carry the cybernetic stability rules.
  - Evidence: `Implemented across docs/HARNESSES.md, docs/project-contract.md,
    docs/cybernetic-stability.md, plugins/agent-harness/references/task-routing.md,
    plugins/agent-harness/skills/orient/SKILL.md,
    plugins/agent-harness/skills/intake/SKILL.md,
    plugins/agent-harness/skills/execute/SKILL.md,
    plugins/agent-harness/templates/goal.md,
    plugins/agent-harness/templates/spec.md,
    plugins/agent-harness/templates/worker-prompt.md,
    plugins/agent-harness/scripts/agent-harness.mjs, scripts/test-suites.mjs,
    and tests/smoke.mjs.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Verification protects the cybernetic stability anchors and
    generated guidance.
  - Evidence: `node --check plugins/agent-harness/scripts/agent-harness.mjs,
    node --check scripts/test-suites.mjs, node --check tests/smoke.mjs,
    git diff --check, npm run test:protocol, npm run test:presentation,
    npm run test:smoke, npm run test:all, and npm run validate:plugin passed.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Acceptance Criteria

- The accepted spec identifies what control-loop weaknesses are being fixed:
  intent/setpoint selection, sensor quality, measurement snapshot, remaining
  gap, feedback quality, stability, and saturation.
- The accepted spec states which cybernetic concepts stay internal and which
  practical Harness terms become user-facing guidance.
- The accepted spec allows pragmatic improvement without adding empty ceremony.
- The accepted spec gives implementation enough boundary to update docs,
  skills, templates, generated guidance, and tests without changing unrelated
  product areas.
- The accepted spec defines pause conditions for unclear product direction,
  evidence conflicts, authority limits, and external risk.

## Verification

Implementation verification should include, at minimum:

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
```

Config schema validation needed: only if implementation changes config/schema
behavior.

## Pause Conditions

- The spec conflicts with repository instructions, adapter rules, code
  constraints, production constraints, or newer user instructions.
- The intended stability model becomes unclear in a way that affects product
  direction, user-facing terminology, implementation size, compatibility, or
  cost/risk.
- Implementation would require schema/storage migration, activation behavior
  changes, public API expansion, daemons, watchers, automation, production
  access, credentials, paid APIs, destructive operations, commits, pushes,
  PRs, deploys, publishing, or releases.
- Feedback quality is insufficient to decide whether a proposed implementation
  reduces real instability or only adds process.
- The work expands into broad control-theory research beyond the practical
  Harness stability pass.
