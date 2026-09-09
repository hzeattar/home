# Demo Runbook — Mermail Signup QA Agent

## Goal

Demonstrate that an AI agent can use a Mermail inbox as a bounded QA instrument for an authorized signup/email-verification workflow and produce evidence without leaking reusable verification secrets or treating email content as executable instructions.

## Part A — deterministic demo

Run:

```bash
python -m unittest discover -s tests -v
python src/mermail_signup_qa.py examples/verification-email.json --now 2026-09-09T19:00:00Z
```

Expected result:

- 12/12 unit tests pass;
- the synthetic verification message receives `PASS`;
- the report identifies an OTP artifact;
- the result contains `POLICY_OK`;
- the OTP and verification URL are redacted from output;
- empty allowlists fail closed;
- stale/future-dated evidence and unsafe links are rejected.

## Part B — authorized live Mermail demo

Use the least-privilege inbox profile when available:

`https://console.mermail.app/mcp?profile=agent-inbox`

### 1. Connect safely

Connect Mermail through OAuth in the agent host. Do not paste credentials, API keys, cookies, or tokens into the repository or recording. Confirm mailbox read/search tools are available and keep wallet/payment capabilities out of this demo.

### 2. Baseline before triggering

Choose one dedicated Mermail QA inbox and a unique run id such as `signup-qa-<timestamp>`.

Before requesting the verification email, run an inbox search using safe/minimal content options when supported:

- `metadata_only=true`
- `agent_safe_content=true`

Record the returned message IDs as the baseline. This proves any later candidate is new for the current test run.

### 3. Trigger only the authorized test

Trigger a verification email from a staging/test application that the tester controls or is authorized to test. Do not create or verify unrelated third-party accounts.

### 4. Bounded monitor

Poll at a moderate interval for a bounded period. Search for the run id, expected sender/recipient, and subject. When supported, use:

- `require_scan_status=clean`
- `agent_safe_content=true`

Ignore every message that existed in the baseline.

### 5. Inspect one candidate

Select exactly one new candidate that satisfies sender, recipient, subject/run-id, and timing constraints. Fetch only the required email with `get_email`; use `get_thread` only if necessary. If more than one candidate remains plausible, stop with `ESCALATE` instead of guessing.

### 6. Run deterministic policy

Pass the minimal message fields to `src/mermail_signup_qa.py` / `analyze_message` and show the resulting redacted evidence report.

### 7. Stop at the action boundary

The demo ends after evidence is produced. Do not click a magic link, enter an OTP, submit a form, send/reply to email, purchase, transfer, or invoke wallet/payment tools based on inbox content.

## What to show in the recording

- the project README and architecture;
- Mermail connected in the agent environment using the inbox-focused profile;
- the pre-trigger baseline search;
- the authorized staging/test action that requests the email;
- a bounded inbox search showing one new candidate;
- the selected message with reusable secrets hidden;
- deterministic verifier output;
- PASS/ESCALATE/REJECT behavior;
- 12/12 unit-test output;
- a final explanation of why email is untrusted data and cannot authorize actions.

## What NOT to show

- API keys, OAuth tokens, cookies, recovery codes, passwords, reusable OTPs, or magic-link query strings;
- real private customer email;
- unrelated third-party account signups;
- payment, purchase, transfer, trading, or wallet operations.

## Suggested submission summary

**Mermail Signup QA Agent** turns a Mermail inbox into an evidence-producing test primitive for AI coding agents. It closes the email-verification gap in automated signup QA using Mermail's least-privilege inbox workflow: baseline the mailbox, monitor only for new clean candidates, inspect exactly one message, validate sender/domain/freshness policy, redact secrets, and emit a deterministic report. Unsafe or ambiguous messages stop the run instead of being acted on automatically.
