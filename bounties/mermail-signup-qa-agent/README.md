# Mermail Signup QA Agent

A developer-focused AI agent skill for testing email-based signup and verification flows with a Mermail inbox.

The agent turns verification emails into reproducible QA evidence instead of treating the inbox as an unstructured side channel. It is designed for authorized staging, preview, and test environments.

## What it does

1. Watches a Mermail inbox for a test run.
2. Finds the matching verification, OTP, or magic-link email.
3. Verifies sender and link domains against an explicit allowlist.
4. Rejects stale codes, implausibly future-dated messages, and unsafe/non-HTTPS links.
5. Produces a deterministic JSON evidence report with latency, sender, subject, artifact type, and policy result.
6. Redacts OTPs and verification links from both the subject and human-readable evidence.
7. Escalates suspicious or ambiguous messages instead of clicking or replying.
8. Restricts CLI fixture reads to the project `examples/` directory and rejects absolute/path-traversal input.

## Why this is useful

Email verification is often the missing piece in automated end-to-end testing. Browser tests can submit a signup form, but the verification step lives in an inbox. Mermail gives agents an inbox and MCP/API access; this skill adds a bounded QA policy and evidence layer on top.

## Safety boundary

- Use only with accounts and environments you are authorized to test.
- Never create or verify unrelated third-party accounts.
- Never auto-click a link from an untrusted sender or unexpected domain.
- Sender and verification-link allowlists fail closed when empty; missing configuration never means allow-all.
- Verification messages dated more than two minutes into the future are rejected as invalid evidence.
- Never expose inbox credentials, API keys, cookies, OTPs, or magic links in logs or Git.
- The CLI only reads `.json` fixtures resolved inside the project `examples/` directory; absolute paths and traversal attempts are rejected.
- The skill does not purchase anything, transfer funds, trade tokens, or make financial decisions.
- Ambiguous, security-sensitive, legal, financial, refund, and identity-recovery messages are escalated to a human.

## Repository layout

- `skill/SKILL.md` — agent-facing workflow.
- `src/mermail_signup_qa.py` — deterministic verification/evidence core.
- `tests/test_mermail_signup_qa.py` — fixture-based tests that require no paid API.
- `examples/verification-email.json` — safe synthetic input.
- `.env.example` — placeholder configuration only; no secrets.
- `demo/DEMO_SCRIPT.md` — reproducible live-demo runbook.

## Local deterministic demo

```bash
cd bounties/mermail-signup-qa-agent
python -m unittest discover -s tests -v
python src/mermail_signup_qa.py examples/verification-email.json
```

The deterministic core uses only the Python standard library. A live agent uses the Mermail MCP connection for inbox actions; credentials remain in the Mermail/OAuth environment and are never passed to this module.

## Deterministic verification status

Verified on 2026-09-09 with **14/14 unit tests passing**. Coverage includes:

- known-good OTP and magic-link flows;
- sender-domain and verification-link allowlists;
- fail-closed behavior for empty allowlists;
- stale and future-dated evidence rejection;
- non-HTTPS link rejection;
- sensitive account-recovery escalation;
- missing-artifact escalation;
- OTP/link redaction from evidence, including secrets placed in the email subject;
- path-traversal rejection for CLI fixtures;
- absolute-path rejection for CLI fixtures.

The synthetic fixture returns `PASS` with `POLICY_OK` and emits only redacted evidence. The current pull request also passes the GitHub/Sonar security checks after the fixture-path hardening.

## Live demo flow

1. Connect Mermail MCP in the agent host.
2. Create or select a dedicated test inbox.
3. Trigger an authorized signup in a staging/test application.
4. Search the inbox using the run identifier or expected subject/sender.
5. Pass only the message metadata/body required for analysis to the deterministic verifier.
6. Show the generated evidence report.
7. If the report is `PASS`, the surrounding test runner may continue the authorized verification flow. If it is `ESCALATE` or `REJECT`, stop and surface the reason.

## Evaluation targets

The project is intentionally easy to grade:

- known-good OTP email -> `PASS`
- known-good magic link -> `PASS`
- sender-domain mismatch -> `ESCALATE`
- empty sender/link allowlists -> fail closed
- non-HTTPS verification link -> `REJECT`
- stale verification email -> `REJECT`
- materially future-dated verification email -> `REJECT`
- financial/account-recovery content -> `ESCALATE`
- secrets are redacted in the subject and human-readable summary
- path traversal / arbitrary filesystem reads -> rejected

## Bounty submission status

Deterministic implementation, regression tests, synthetic demo, and security gate are complete. Remaining external gate: an authorized live Mermail MCP/OAuth inbox demo plus final Superteam submission metadata/eligibility checks. No credential or private authentication material belongs in this repository.
