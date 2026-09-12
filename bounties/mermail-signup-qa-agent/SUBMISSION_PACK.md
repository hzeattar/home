# Superteam Submission Pack — Mermail Signup QA Agent

Use this file only after the listing is verified as `AGENT_ALLOWED` or `AGENT_ONLY` through the official Superteam agent interface and the operator is eligible under current platform terms.

## Submission title
Mermail Signup & Email Verification QA Agent

## Short pitch
A bounded AI-agent skill that closes the email-verification gap in automated signup QA. It uses a dedicated Mermail inbox, validates sender/link domains, enforces freshness and HTTPS policy, redacts OTPs and magic links, and returns deterministic evidence instead of blindly trusting verification mail.

## What is shipped
- Mermail-focused agent skill (`skill/SKILL.md`)
- deterministic Python verification/evidence core
- fail-closed sender and verification-link allowlists
- stale/future timestamp checks
- HTTPS and sensitive-context gates
- OTP and magic-link redaction from subject and evidence
- fixture path isolation against absolute-path/traversal input
- synthetic fixture and reproducible demo flow
- 16 deterministic tests
- security-gate evidence recorded on PR

## Public implementation
Repository: `hzeattar/home`
Branch: `bounty/mermail-signup-qa-agent`
Pull request: `#3 — bounty: Mermail Signup QA Agent Skill`

## Reproduction
```bash
cd bounties/mermail-signup-qa-agent
python -m unittest discover -s tests -v
python src/mermail_signup_qa.py examples/verification-email.json
```

Expected deterministic result: all tests pass; synthetic fixture reports `PASS / POLICY_OK`; reusable verification secrets remain redacted.

## Live-demo requirement
Before submission, complete one authorized Mermail OAuth run using a dedicated staging/test inbox. Record only sanitized evidence in `demo/LIVE_DEMO_RESULT.md` using the provided template. Do not commit API keys, OAuth tokens, OTPs, magic links, cookies, mailbox credentials, or private message contents.

## Suggested `otherInfo`
Built a Mermail-native Signup & Email Verification QA Agent that turns inbox verification artifacts into deterministic QA evidence. The workflow validates expected sender and link domains, fails closed on missing allowlists, rejects stale/future or non-HTTPS verification artifacts, escalates sensitive/ambiguous messages, redacts OTPs and magic links, and prevents arbitrary local fixture reads. The implementation includes a standard-library Python core, reproducible synthetic demo, and 16 deterministic tests. A sanitized live Mermail OAuth inbox run is attached/referenced separately. No credentials or reusable verification secrets are stored in the repository.

## Final submission checklist
- [ ] Listing revalidated through official Superteam agent feed
- [ ] `agentAccess` confirmed as `AGENT_ALLOWED` or `AGENT_ONLY`
- [ ] Listing still open and deadline valid
- [ ] Operator/account eligibility checked truthfully
- [ ] Mermail OAuth connector authenticated locally
- [ ] Dedicated test mailbox selected
- [ ] Authorized staging/test message processed
- [ ] Sanitized live-demo result committed
- [ ] 16/16 deterministic tests still pass
- [ ] No secrets in Git history/diff
- [ ] Required eligibility questions answered truthfully
- [ ] Submission link points to accessible artifact/PR as required

Do not submit if any eligibility or authorization requirement is unresolved.
