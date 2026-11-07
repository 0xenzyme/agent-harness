# Delivery Control Feedback

Harness compares the accepted target with verified outcomes and bounded state.
It does not compare current source to an old fingerprint.

For each Goal, verify candidate results, required gates and whole-target
constraints, then synchronize the existing acceptance records. A Milestone
remains open until every required Goal and stage check is accepted.

Direct work uses the host and needs no Harness artifact. Postflight performs a
bounded update to existing state. The host owns execution, resume and full
logs; Harness is not a runtime scheduler or audit-log store.
