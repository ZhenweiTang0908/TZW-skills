# Broad and deep search playbook

## Build a branching search matrix

Start from the sanitized fingerprint and vary independent axes. Choose branches suggested by the problem, not every row mechanically.

| Axis | Useful query shapes | What it can establish |
|---|---|---|
| Exact symptom | `"stable error fragment" product`; exception class + component | Candidate reports; whether wording identifies the failing layer |
| Failure semantics | Operation + symptom, without the error text | Equivalent failures with different messages or wrappers |
| Environment differences | Product + symptom + version / region / proxy / managed service | Conditions under which the mechanism applies |
| Mechanism | Protocol or subsystem + timeout / identity / limits / concurrency | Explanations outside the initially blamed product |
| Lifecycle | Product + known issue / regression / release / migration / deprecation | Introduced, fixed, backported, or changed behavior |
| Firsthand experience | Product + incident / postmortem / reproduction / maintainer discussion | Actual sequence of events, attempts, and outcomes |
| Counterevidence | Candidate fix + still fails / regression / limitation | Failure boundaries and competing explanations |
| Prerequisites | Candidate solution + requirements / defaults / compatibility | Steps omitted from simplified examples |

First sweep: cover symptom, mechanism, compatibility, and counterexamples where relevant. Second sweep: deepen the strongest branches and investigate differences revealed by local evidence. Later sweeps should answer specific unresolved questions rather than restart the same search.

Do not combine every environment detail into one overconstrained query. Start with a distinctive error fragment, remove volatile identifiers, then add one discriminator. Search error substrings when no exact match exists. Identify which component emitted the message instead of assuming the UI or SDK displaying it caused it.

Domain-restricted queries help locate primary material, but alternate them with unrestricted discovery. Firsthand community evidence may be primary for what the author observed; it does not automatically establish a general technical rule. Use blogs, forums, and translated articles to locate original issue reports or direct experiments. Do not treat search ranking as evidence quality.

## Read for the complete evidence chain

For a promising page, determine:

1. Who observed what, using which environment and version?
2. Is the symptom the same, or merely similar language?
3. What mechanism is proposed, and what observation supports it?
4. Which fixes were attempted, and which result was actually reported?
5. Were there follow-up failures, corrections, reopened issues, or reversions?
6. Which commit, release, configuration, or prerequisite makes a claimed fix available?
7. What is transferable here, and what local evidence is still missing?

Follow a chain only while it changes applicability, mechanism, or next actions. On long threads, inspect the original report, maintainer analysis, competing reproductions, and resolution/follow-up; do not substitute the last comment for reading the argument. If a page is blocked or deleted, find an accessible official mirror, release note, or independently verifiable primary source. Label snippet-only or inaccessible leads as unverified.

## Keep a lightweight evidence ledger

Useful internal fields:

`ID | branch | direct URL | author/source type | published/updated date | affected versions | observed symptom | proposed mechanism | attempted fix | observed outcome | local match/difference | uncertainty`

Separate publication date, incident date, and version support. Record access date for mutable sources such as status pages and living documentation. Several domains quoting the same issue are one origin; count independent observations rather than URLs. Retain negative results when they narrow a branch. Avoid numeric confidence scores that imply nonexistent precision.

For a substantial investigation, the final coverage note should say which causal branches and source types were covered, what was traced deeply, and what remained inaccessible or unresolved. There is no mandatory page quota: a rare bug may have one decisive primary report, while a common error may require many searches to distinguish incompatible causes.

## Example: an intermittent upstream error

Request: “Production intermittently returns 502, but local runs work. How have others solved this, and what are we missing?”

Search both the exact sanitized error and independent branches such as intermediary idle/response timeouts, application process restarts, resource pressure, connection reuse, and endpoint readiness, guided by the observed topology. Consult status histories only for the actual incident window. Trace relevant firsthand reproductions and the deployed versions' documentation.

If a case describes an intermediary closing a reused connection, compare its connection lifetime and traffic pattern with ours. Ask what logs or traces distinguish that from an application crash. “Many people increased a timeout” is not enough: specify which timeout, which layer owns it, whether retries duplicate writes, and what observation would justify the change. Treat all mechanisms in this example as hypotheses, not product-specific facts.

## Example: an upgrade appears to lose data

Request: “Some tasks seem to disappear after an upgrade, and retries do not help. Research similar problems others have encountered.”

Search the deployed version pair, migration behavior, changed defaults, processing/visibility semantics, and firsthand upgrade regressions. Distinguish loss from delayed delivery, filtering, a different namespace, or a reader interpreting a changed format. Trace “fixed” reports to released versions and actual follow-up. Do not propose replay or repair until the observed state and duplication risk are established.

## Example: an unusual non-software workflow fails

Request: “Following this public tutorial always fails at the final step. Research other people's experience and find what might be missing.”

Replace the runtime fingerprint with relevant materials, equipment, local conditions, procedure version, sequence, and definitions of success. Search firsthand reproductions and failed attempts, trace authoritative instructions and prerequisites, and compare the hidden assumptions. Do not force cloud categories onto the problem. For regulated or high-stakes topics, ground consequential recommendations in current authoritative sources and state the limits of online anecdotes.
