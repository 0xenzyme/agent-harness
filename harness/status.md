# Project Status

## Focus

- Current change: replace Run/evidence-centered control with Goal/Milestone delivery control.
- Release: `0.14.0`; local Codex plugin cache synchronized at `~/.codex/plugins/cache/agent-harness-local/harness/0.14.0/`.
- Accepted boundary: host owns sessions, resume, workers and full logs; Harness owns accepted outcomes and bounded state.
- Historical task records remain unchanged. Legacy Run/checkpoint config is ignored, not migrated or monitored.

## Verification

- Passed: targeted Goal/Milestone completion and no-hash drift tests.
- Passed: portable plugin integrity, protocol and regression suites.
- M1.5 read-only check returns `done` after later source edits, without source hashing or downstream writes.
- Passed: `npm run test:all`, `npm run test:eval`, and live-development dry-run with mock interruption.
- Official plugin validator: local script missing; not passed.
- Local deployment: `npm run deploy:local-plugin:portable` passed with explicit portable-validation mode.

## Route

- Need user: none.
- Remaining: none in this change. Official validator can be rerun when its external script is available.
