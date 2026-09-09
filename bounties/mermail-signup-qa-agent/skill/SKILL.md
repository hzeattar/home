---
name: mermail-signup-qa
description: Verify authorized signup, OTP, and magic-link email flows through a Mermail inbox and produce auditable QA evidence.
---

# Mermail Signup QA

Use this skill when a developer needs to test an email-verification flow in an application they own or are authorized to test.

## Required context

Before touching the inbox, establish:

- a unique `run_id` for the test;
- expected sender domain(s);
- allowed verification-link domain(s);
- maximum acceptable email age/latency;
- the target is a staging, preview, local, or otherwise authorized environment.

If authorization is unclear, stop and request human confirmation. Do not use this workflow to create or verify unrelated third-party accounts.

## Mermail workflow

Use the connected Mermail tools/MCP. Tool names can vary by client; common Mermail operations include inbox search, thread retrieval, drafts, and send actions.

For this skill, prefer read-only inbox actions:

1. Search for a message matching the `run_id`, expected recipient, expected sender, or expected subject.
2. If there are multiple plausible messages, fetch the relevant thread and choose the newest message that satisfies the test constraints.
3. Do not send or reply unless the explicit QA scenario requires an outbound test message.
4. Never place inbox credentials, API keys, cookies, OTP values, or magic-link URLs into Git commits, public issues, screenshots, or chat summaries.

## Verification policy

Pass message metadata and body to the deterministic verifier in `src/mermail_signup_qa.py` or apply the same policy exactly:

- sender domain must be allowlisted;
- message must be fresh enough for the configured test window;
- verification links must use HTTPS;
- link hosts must be allowlisted when an allowlist is supplied;
- OTP/magic-link artifacts must be associated with a verification context;
- account recovery, password reset, payment/refund, KYC/identity, legal, or financial-action messages require human escalation;
- unexpected domains, ambiguous artifacts, or mixed-purpose messages must not be auto-used.

## Decision states

### PASS

The message is fresh, sender and link domains are expected, and a verification artifact is present. Record evidence and return the artifact only to the authorized test runner that initiated this run.

### ESCALATE

The message may be legitimate but requires human review, for example sender mismatch, identity/account-recovery content, financial content, or ambiguous verification artifacts. Do not click, reply, or continue the signup automatically.

### REJECT

The message is stale or contains an unsafe verification link such as non-HTTPS. Stop the run and record the reason.

## Evidence report

For every run, produce a compact report containing:

- run id;
- timestamp checked;
- sender domain;
- subject;
- received timestamp and age;
- verification artifact type (`otp`, `magic_link`, `none`);
- verification host when applicable;
- decision (`PASS`, `ESCALATE`, `REJECT`);
- reason codes;
- latency/age metric;
- a redacted human-readable summary.

Never include the full OTP or magic-link secret in the report.

## Demo expectations

A strong demo shows at least these cases using synthetic fixtures plus one authorized live Mermail inbox run:

1. good OTP -> PASS;
2. good magic link -> PASS;
3. sender mismatch -> ESCALATE;
4. stale message -> REJECT;
5. HTTP link -> REJECT;
6. financial/account-recovery wording -> ESCALATE.

The live demo should show Mermail inbox search/read operations and the resulting evidence report without exposing credentials or reusable verification secrets.
