# Spec: Refocus Agent Harness On Durable Project Control

Created: 2026-07-18
Status: accepted

## Decision

Refocus Agent Harness on the persistent project control plane that Codex runtime
does not provide by itself. Preserve deterministic config and doctor behavior,
adapter-configured paths, repository Goals/Runs/DAGs, run-scoped delivery
evidence, candidate-versus-accepted evidence, and controller gates. Return
ordinary execution, delegation, concurrency, cancellation, and model selection
to the Codex runtime.

## Scope

- Close config, init, run-directory, run-artifact, traversal, absolute-path,
  and symlink containment gaps before any write.
- Make Delivery State run-scoped by recording the starting Git snapshot and
  evaluating this Run's delta plus explicit delivery evidence.
- Give this repository a unique local marketplace identity and make the deploy
  helper validate marketplace name and root without deploying in this Run.
- Make Windows and locale test execution deterministic; prefer JSON assertions
  for behavior while preserving targeted English and Chinese display tests.
- Simplify the four public skills and internal routing so ordinary clear
  change/build requests use Codex directly and durable Harness ceremony is
  reserved for persistent, multi-worker, or high-risk control.
- Reduce Harness rules to a small set of domain invariants without losing the
  delivery ceiling, evidence acceptance, state sync, bounded status,
  project-neutrality, or Run/DAG ownership boundaries.
- Remove default worker/model pinning, delete explorer/implementer templates,
  and retain an optional read-only reviewer only if it adds an accepted-state
  boundary while inheriting parent model and effort.
- Remove or migrate configuration fields that do not drive runtime behavior;
  read legacy aliases, write canonical fields, and fail on conflicts.
- Align manifest, README/install docs, canonical contracts, eval naming, and
  version-consistency tests with current behavior.

## Non-Goals

- Do not create or repair Git tags or publish a new version.
- Do not implement activation provenance that the runtime does not expose.
- Do not commit, push, open review, integrate, release, deploy, or refresh the
  user plugin cache.
- Do not merge mutating intake behavior into read-only orient.
- Do not reduce Harness rules to three generic agent principles.
- Do not add network services, daemons, or project-specific core assumptions.

## Safety And Compatibility Requirements

- Every configured path used for writing must resolve within the project after
  handling existing parents and symlinks.
- Run commands accept only directories inside configured `paths.runs`.
- Run artifact paths such as node status/result and Goal/spec references must
  remain inside their configured roots.
- Existing legacy configuration remains readable for one migration boundary;
  canonical output uses only canonical fields and conflicting aliases fail.
- Existing durable evidence and adapter contracts remain mechanically
  inspectable.

## Acceptance Criteria

- Security regression tests cover absolute paths, `..`, external Run paths,
  malicious DAG artifact paths, and practical symlink escape cases.
- `run prepare` records `startHead`, `startBranch`, `startUpstream`, and
  `startDirtyState`; a clean repository with upstream is not reported as this
  Run's committed/pushed evidence without a Run delta or explicit evidence.
- `test:all` does not spawn `npm.cmd`; suite locale is deterministic; smoke and
  eval pass under `zh-CN` without relying on English behavior text.
- Ordinary change/build is documented and routed as direct Codex execution;
  durable Harness Goal/Run remains for recovery, audit, milestone/DAG, and
  persistent state sync.
- Public `mixed` is removed; intake implicit invocation is disabled; init and
  execute implicit scopes are narrowed; route and reference duplication is
  reduced.
- Harness does not default to worker launch or model/effort pinning. Custom
  explorer/implementer templates are gone; any retained reviewer is explicit,
  read-only, and inherits parent settings.
- Removed configuration fields no longer appear as effective behavior;
  consumed gate fields remain; worktree behavior only claims observable rules.
- Plugin `interface.defaultPrompt` is a string array and type-tested.
- README separates marketplace registration from Plugins Directory install;
  routing-classification eval no longer claims real activation provenance.
- Version tests compare canonical sources rather than hard-code `0.6.0`.
- All required validation passes locally and state artifacts are synchronized.

## Verification

```text
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
node --check evals/run-agent-harness-eval.mjs
npm run test:all
npm run test:eval
npm run validate:plugin
python -X utf8 <skill-creator>/scripts/quick_validate.py <each plugin skill>
git diff --check
```

## Delivery Policy

- Target Delivery State: `validated-local`
- Commit: no
- Push: no
- Review: no
- Integration: no
- Release/publish: no
- Deploy/plugin-cache refresh: no
