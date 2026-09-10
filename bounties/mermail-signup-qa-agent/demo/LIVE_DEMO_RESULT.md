# Live Mermail Demo Result

## Run
- UTC window: 2026-09-10 00:07-00:08
- Environment: authorized synthetic QA
- Run ID: `RH-MERMAIL-20260910-001`
- Expected sender domain: `gmail.com`
- Verification mode: OTP-only

## Evidence
- Authenticated Mermail web console visible: YES
- Dedicated test mailbox visible: YES
- Matching Revenue Hunter QA message visible in Inbox: YES
- Receipt occurred inside the expected test window: YES
- MCP host connection verified: NOT YET
- MCP `list_mailboxes` verified: NOT YET
- MCP message search/read verified: NOT YET

This distinguishes visual console evidence from MCP evidence so the submission does not claim a tool call that has not occurred.

## Deterministic replay
After the matching message was visibly confirmed in Mermail, the exact authorized outbound test payload was replayed transiently through the verifier without committing the raw test code.

- Matching message: YES
- Artifact: OTP
- Sender policy: PASS
- Freshness policy: PASS
- Final status: PASS
- Reason: `POLICY_OK`

## QA findings fixed during the live run
The live test exposed two edge cases before submission: an explicit safe disclaimer could cause a false escalation because of keyword-only matching, and digits in the structured run ID could be mistaken for an OTP. Both cases now have regression coverage while genuine sensitive instructions still escalate.

## Regression target
`python -m unittest discover -s tests -v`

Expected suite size after this fix: 16 tests. GitHub Actions remains the authoritative CI result.

## Conclusion
The delivery path into the dedicated Mermail inbox is proven through the authenticated web console. The remaining technical evidence gap is the MCP mailbox-list and message-read run, which is intentionally not claimed here.
