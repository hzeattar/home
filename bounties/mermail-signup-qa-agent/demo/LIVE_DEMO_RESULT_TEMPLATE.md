# Live Mermail Demo Result Template

Copy this file to `LIVE_DEMO_RESULT.md` only after completing an authorized staging/test run.

## Run metadata
- Date/time (UTC):
- Environment: staging/test only
- Test run ID:
- Mermail mailbox identifier: REDACTED/HASHED ONLY
- Expected sender domain:
- Expected verification-link domain:

## Connection check
- Mermail MCP endpoint: `https://console.mermail.app/mcp`
- OAuth connected: YES/NO
- Read-only/least-privilege inbox profile used where available: YES/NO
- `list_mailboxes` succeeded: YES/NO
- Inbox search succeeded: YES/NO

## Verification evidence
Do not paste the raw email, OTP, magic link, OAuth token, cookies, headers containing credentials, or any reusable secret.

- Matching message found: YES/NO
- Artifact type: OTP / MAGIC_LINK / OTHER
- Sender policy: PASS / ESCALATE / REJECT
- Link policy: PASS / ESCALATE / REJECT / N/A
- Freshness policy: PASS / REJECT
- Sensitive-context policy: PASS / ESCALATE
- Final verifier status: PASS / ESCALATE / REJECT
- Policy code:
- Sanitized latency/evidence summary:

## Deterministic regression
```text
python -m unittest discover -s tests -v
RESULT: __/14 PASS
```

## Secret-scan confirmation
- No API key committed: YES/NO
- No OAuth token committed: YES/NO
- No OTP/magic link committed: YES/NO
- No mailbox credentials committed: YES/NO
- Git diff reviewed before push: YES/NO

## Demo conclusion
One or two sentences explaining what the live run proves, without revealing any reusable verification artifact.
