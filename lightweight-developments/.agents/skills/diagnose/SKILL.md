---
name: diagnose
description: Investigate bugs, incidents, test failures, and unexpected system behavior by gathering evidence, localizing the fault, and testing hypotheses before proposing a minimal fix. Use for troubleshooting; do not use for ordinary feature design or code changes without investigation.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Diagnose

Explain what happened and why before changing business behavior.

## Use when

There is an observed failure, anomaly, regression, performance problem, integration issue, or inconsistent state whose cause is not yet established.

## Do not use when

- The user is requesting a known behavior change rather than reporting unexpected behavior.
- The task is solely a production-data question with no application fault to localize; use `production-database-analysis`.
- The artifact is a rule system being challenged without an observed incident; use `logic-audit`.

## Expected input

An issue description, symptoms, timestamps or examples when available, and access to relevant code or evidence sources. Missing reproduction steps do not justify guessing.

## Inspect first

Read repository instructions, errors and stack traces in full, relevant code and tests, recent diffs or history, configuration, request/response traces, logs, database state, and external API state as available and authorized. Mask secrets and personal data in outputs.

## Process

1. Define the symptom precisely: expected versus observed, affected scope, timing, and reproducibility.
2. Gather evidence at each relevant component boundary. Record source and time range.
3. Trace the failing value or state backward to the earliest supported divergence.
4. Form explicit hypotheses with predicted evidence.
5. Test the cheapest discriminating hypothesis first; vary one cause at a time.
6. State a root cause only when evidence explains both the symptom and the mechanism. Otherwise rank remaining hypotheses and name the missing evidence.
7. Propose the smallest fix that addresses the cause, plus a regression check. Write the Fix Contract before any implementation.

## Output

```markdown
## Observed Facts

## Root Cause
<!-- or Remaining Hypotheses -->

## Evidence

## Suggested Minimal Fix

## Fix Contract

## Verification
```

A Fix Contract is the Mini Spec for a defect. It states the confirmed cause it addresses, the expected behavior after the fix, the behavior that must remain unchanged, and the regression check, which must fail on the unfixed code and pass after the fix. Write it once the root cause is supported, even when no fix is authorized yet; omit it while only ranked hypotheses remain. `verify-change` verifies the fix against this contract.

Separate facts, inferences, and unknowns. Include reproduction or query details that another engineer can repeat safely.

When saving the investigation, start from [the diagnosis report template](assets/diagnosis-report-template.md).

## Permissions and safety

- Investigation is read-only by default. Do not modify business code, production data, configuration, or external state.
- A request to "look into" or "find out why" is not authorization to fix.
- If the user explicitly authorized a fix, implement only after the cause and Fix Contract are clear; apply `engineering-quality` and verify the regression.
- Never weaken a test or requirement merely to remove a failure.

## Stop or escalate

Stop when required evidence needs unavailable access, unsafe production experimentation, secret exposure, destructive action, or a material scope decision. If repeated fix attempts fail, return to localization and question the model rather than stacking patches.

## Routing examples

- Use: "The same contact was created twice. Find out why before changing anything."
- Do not use: "Add a deduplication option to the import screen." (`brief-to-mini-spec`)
- Borderline: "Why are 30,000 contacts waiting?" starts with `production-database-analysis` if the question is about population state; add `diagnose` only if evidence points to a system fault.

— NiuNiu Tang
