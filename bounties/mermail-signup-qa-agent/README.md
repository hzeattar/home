# Mermail Signup QA Agent

A developer-focused AI agent skill for testing email-based signup and verification flows with a Mermail inbox.

The agent turns verification emails into reproducible QA evidence instead of treating the inbox as an unstructured side channel. It is designed for authorized staging, preview, and test environments.

## What it does

1. Watches a Mermail inbox for a test run.
2. Finds the matching verification, OTP, or magic-link email.
3. Verifies sender and link domains against an explicit allowlist.
4. Rejects stale codes and unsafe/non-HTTPS links.
5. Produces a deterministic JSON evidence report with latency, sender, subject, artifact type, and policy result.
6. Escalates suspicious or ambiguous messages instead of clicking or replying.

## Why this is useful

Email verification is often the missing piece in automated end-to-end testing. Browser tests can submit a signup form, but the verification step lives in an inbox. Mermail gives agents an inbox and MCP/API access; this skill adds a bounded QA policy and evidence layer on top.

## Safety boundary

- Use only with accounts and environments you are authorized to test.
- Never create or verify unrelated third-party accounts.
- Never auto-click a link from an untrusted sender or unexpected domain.
- Never expose inbox credentials, API keys, cookies, OTPs, or magic links in logs or Git.
- The skill does not purchase anything, transfer funds, trade tokens, or make financial decisions.
- Ambiguous, security-sensitive, legal, financial, refund, and identity-recovery messages are escalated to a human.

## Repository layout

- `skill/SKILL.md` — agent-facing workflow.
- `src/mermail_signup_qa.py` — deterministic verification/evidence core.
- `tests/test_mermail_signup_qa.py` — fixture-based tests that require no paid API.
- `examples/verification-email.json` — safe synthetic input.
- `.env.example` — placeholder configuration only; no secrets.

## Local deterministic demo

```bash
cd bounties/mermail-signup-qa-agent
python -m unittest discover -s tests -v
python src/mermail_signup_qa.py examples/verification-email.json
```

The deterministic core uses only the Python standard library. A live agent uses the Mermail MCP connection for inbox actions; credentials remain in the Mermail/OAuth environment and are never passed to this module.

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
- sender-domain mismatch -> `ESCALATE`
- non-HTTPS verification link -> `REJECT`
- stale verification email -> `REJECT`
- financial/account-recovery content -> `ESCALATE`
- secrets are redacted in the human-readable summary

## Bounty submission status

Work in progress for the Mermail agent-skill developer bounty. The live MCP demo and final submission metadata will be added only after the deterministic implementation and tests are complete.
