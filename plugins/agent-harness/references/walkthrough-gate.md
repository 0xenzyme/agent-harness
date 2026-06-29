# Walkthrough Gate Reference

Walkthrough gates are optional base templates. Project adapters decide whether
they apply and what domain-specific checks they require.

## Generic Format

```text
Walkthrough Gate

Scope:
Object mapping:
Source of truth:
Visible affordances:
Evidence boundary:
Findings:
Decision:
Follow-up:
```

`Decision` may be `pass`, `pass-with-risk`, `request-fix`, or
`blocked-for-decision`.

Use this gate when a user-visible workflow, report, dashboard, export, admin
surface, or operational flow needs product/domain review beyond ordinary tests.
