# Revenue Hunter Queue

Last verified: 2026-09-09

This queue contains only opportunities that were checked against the following gates before advancement:

- zero upfront participation cost;
- explicit monetary/token reward;
- AI-agent or AI-assisted participation allowed by the canonical source;
- concrete acceptance or judging criteria;
- no age/KYC/CAPTCHA/identity bypass;
- no gambling, prediction-market, trading-speculation, dangerous, or age-restricted work;
- no secrets or external-account credentials committed to Git.

## RH-001 — Mermail Signup QA Agent

- **Sponsor/platform:** Mermail / Superteam Earn
- **Reward:** 500 USDC prize pool
- **Status:** `IMPLEMENTATION_ACTIVE`
- **Repo work:** PR #3 (`bounty/mermail-signup-qa-agent`)
- **Current technical state:** deterministic QA implementation exists; fixture-read path traversal was hardened; latest SonarCloud / GitHub Advanced Security checks were green on the hardened head.
- **Remaining external gates:** authorized Mermail inbox live demo; Superteam eligibility/account claim flow; final bounty submission.
- **Dedupe key:** `superteam:mermail-agent-skill`

## RH-002 — T3N Trusted Enterprise Agent

- **Sponsor/platform:** Terminal 3 Network / Superteam Earn
- **Canonical listing:** https://superteam.fun/earn/listing/t3n-agent-build-challenge
- **Reward:** 290 USDC total prizes (100 / 50 / 50 / 30 / 30 / 30)
- **Verified live:** 2026-09-09; listing showed 115 submissions and ~23 days remaining.
- **Task:** obtain a T3N DID/API key, complete the refreshed Quickstart + Walkthrough, build a useful maintainable enterprise agent, document bugs, and submit a public Google Doc + public GitHub repo + screenshots plus maintain/handover preference.
- **Judging:** time-to-submit, build usefulness/maintainability, documentation quality, bug-report quality.
- **AI fit:** direct agent-building challenge; Superteam also exposes an official agent-submission interface for `AGENT_ALLOWED` / `AGENT_ONLY` listings.
- **Status:** `BLOCKED_ELIGIBILITY_AND_EXTERNAL_ACCOUNT`
- **Why blocked:** Superteam Terms currently require users aged 14–17 to have parent/legal-guardian consent, and users under 14 are not permitted. The workflow does not establish the operator's exact age/guardian-consent state. The bounty additionally requires T3N SSO, DID, and API key, so it cannot be honestly completed from GitHub alone.
- **Safe next step:** only after eligibility and authorized account access are established, create a dedicated implementation branch; keep DID/API credentials out of Git; add deterministic tests and a reproducible bug log before submission.
- **Dedupe key:** `superteam:t3n-agent-build-challenge`

## Rejected / watch-only sources from this scan

- **Agent Bounties / canonical Base tasks:** excluded when a solver bond or other upfront stake is required.
- **openbounty.ai:** useful agent-friendly feed, but its site currently states mock payments only during MVP, so it does not qualify as real paid work yet.
- **TaskBounty:** agent-friendly and paid on verified fixes, but advancement requires a platform API/account flow and payout eligibility not established in this workflow; watch only until eligibility is verified.
- **Causify / PayPal bounties:** not advanced because PayPal payout eligibility may be incompatible with a minor operator without an eligible guardian-owned arrangement; no bypass attempted.
- **Copperhead #66 ($50):** explicitly paid and clear scope, but the canonical bounty does not explicitly state AI-agent participation, and full reproduction depends on provider/KiCad environment; not advanced under the strict AI-allowed gate.
