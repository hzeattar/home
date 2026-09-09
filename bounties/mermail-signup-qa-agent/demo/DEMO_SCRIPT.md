# Demo Runbook — Mermail Signup QA Agent

## Goal

Demonstrate that an AI agent can use a Mermail inbox as a bounded QA instrument for an authorized signup/email-verification workflow and produce evidence without leaking reusable verification secrets.

## Part A — deterministic demo

Run:

```bash
python -m unittest discover -s tests -v
python src/mermail_signup_qa.py examples/verification-email.json --now 2026-09-09T19:00:00Z
```

Expected result:

- all unit tests pass;
- the synthetic verification message receives `PASS`;
- the report identifies an OTP artifact;
- the OTP and verification URL are redacted from `redacted_summary`.

## Part B — authorized live Mermail demo

1. Connect Mermail MCP/OAuth in the agent host. Do not paste credentials into the repository or recording.
2. Use one dedicated Mermail test inbox.
3. Set a unique run id, for example `signup-qa-<timestamp>`.
4. Trigger a verification email from a staging/test application that the tester controls or is authorized to test.
5. Use Mermail inbox search/read operations to retrieve only the matching message/thread.
6. Apply the allowlisted sender/link-domain policy and freshness window.
7. Generate the QA evidence report.
8. Demonstrate one negative case with a synthetic fixture, such as an unexpected sender or non-HTTPS link.

## What to show in the recording

- the project README and architecture;
- Mermail connected in the agent environment;
- a Mermail inbox search for the unique run id;
- the selected message with reusable secrets hidden;
- deterministic verifier output;
- PASS/ESCALATE/REJECT behavior;
- unit-test output;
- a final explanation of why the policy prevents an agent from blindly acting on inbox content.

## What NOT to show

- API keys, OAuth tokens, cookies, recovery codes, passwords, reusable OTPs, or magic-link query strings;
- real private customer email;
- unrelated third-party account signups;
- any payment, purchase, transfer, or trading flow.

## Suggested submission summary

**Mermail Signup QA Agent** turns a Mermail inbox into an evidence-producing test primitive for AI coding agents. It closes the email-verification gap in automated signup QA: the agent finds the right verification message, validates sender/domain/freshness policy, redacts secrets, and emits a deterministic report. Unsafe or ambiguous messages stop the run instead of being acted on automatically.
