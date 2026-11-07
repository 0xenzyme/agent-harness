# Project Mental Models

Record durable project reasoning here, not execution history.

| Model | Purpose | Path |
| --- | --- | --- |
| User / Scenario | How a user adopts Harness | `01-user-scenario.md` |
| Work Unit | What an accepted Goal contains | `02-work-unit.md` |
| Control Loop / Handoff | How delivery and state sync proceed | `03-control-loop-handoff.md` |
| Ownership / Boundary | Core, adapter, host and artifact responsibilities | `04-ownership-boundary.md` |

Core defines protocol; adapters own project facts. Host sessions, resume,
workers and full logs do not belong in these documents.
