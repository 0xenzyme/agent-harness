# Retrospective Gate Reference

Retrospective gates capture why a review or milestone missed an issue and how
the harness should prevent repeats.

## Generic Format

```text
Retrospective Gate

Escaped issues:
Missed gate:
New invariants:
Global rules:
Regression checks:
Follow-up items:
Harness updates:
```

Use this when validation passed but review found a broader domain, workflow,
source-of-truth, or cross-surface issue. Keep project-specific invariants in
the project adapter or project artifacts, not plugin core.
