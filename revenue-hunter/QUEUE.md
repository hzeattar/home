# Revenue Hunter Queue

Last verified: 2026-09-10

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
- **Verified live:** 2026-09-10; listing still showed 115 submissions and ~23 days remaining.
- **Task:** obtain a T3N DID/API key, complete the refreshed Quickstart + Walkthrough, build a useful maintainable enterprise agent, document bugs, and submit a public Google Doc + public GitHub repo + screenshots plus maintain/handover preference.
- **Judging:** time-to-submit, build usefulness/maintainability, documentation quality, bug-report quality.
- **AI fit:** direct agent-building challenge; Superteam also exposes an official agent-submission interface for `AGENT_ALLOWED` / `AGENT_ONLY` listings.
- **Status:** `BLOCKED_ELIGIBILITY_AND_EXTERNAL_ACCOUNT`
- **Why blocked:** Superteam Terms currently require users aged 14–17 to have parent/legal-guardian consent, and users under 14 are not permitted. The workflow does not establish the operator's exact age/guardian-consent state. The bounty additionally requires T3N SSO, DID, and API key, so it cannot be honestly completed from GitHub alone.
- **Safe next step:** only after eligibility and authorized account access are established, create a dedicated implementation branch; keep DID/API credentials out of Git; add deterministic tests and a reproducible bug log before submission.
- **Dedupe key:** `superteam:t3n-agent-build-challenge`

## RH-003 — Sourcey Startup Offer Catalog

- **Sponsor/platform:** Sourcey / Frantic
- **Canonical bounty:** https://gofrantic.com/bounties/120
- **Reward:** $1 per accepted claim; canonical bounty shows funded status and a 150-slot pool.
- **Verified live:** 2026-09-10; direct bounty page showed `work open`, 126/150 slots open, and public receipts including paid claims.
- **Task:** add exactly one genuinely useful, currently available startup-specific vendor offer to `sourcey/startup-credits` as one data-only vendor YAML, using first-party English-language sources and complete structured fields.
- **Acceptance:** exactly one new vendor/offer; no existing vendor, generic free tier, ordinary trial, coupon, affiliate/aggregator listing, expired offer, code, schema, generated output, or unrelated files; candidate verifier + changed-closure CI + DCO must pass; Sourcey human review must merge the PR and the vendor must appear on the live Sourcey surface before Frantic acceptance.
- **AI fit:** the canonical GitHub issue explicitly says agents and humans are welcome; Frantic describes itself as a bounty board for agent workers.
- **Upfront cost:** none to the worker; canonical page says `$1 FUNDED` and Frantic states no wallet or fee is required to enlist.
- **Status:** `WATCH_ONLY_EXTERNAL_IDENTITY_GATE`
- **Why not advanced to implementation:** the canonical claim gate requires `agent_kid`, `agent_token`, and verified email or RunX/GitHub contact identity. That external Frantic identity state is not established in this workflow, and the acceptance contract requires the claimant's verified GitHub identity to author the upstream PR. No external registration, identity verification, claim, star, or submission was attempted.
- **Safe next step:** if an already-authorized eligible Frantic identity becomes available, claim a slot first, then verify vendor uniqueness against the live Sourcey catalog before creating exactly one data-only upstream PR.
- **Dedupe key:** `frantic:120:sourcey-startup-offer`

## Rejected / watch-only sources from this scan

- **Agent Bounties / canonical Base tasks:** excluded when a solver bond or other upfront stake is required.
- **openbounty.ai:** useful agent-friendly feed, but its site currently states mock payments only during MVP, so it does not qualify as real paid work yet.
- **TaskBounty:** agent-friendly and paid on verified fixes, but advancement requires a platform API/account flow and payout eligibility not established in this workflow; watch only until eligibility is verified.
- **Causify / PayPal bounties:** not advanced because PayPal payout eligibility may be incompatible with a minor operator without an eligible guardian-owned arrangement; no bypass attempted.
- **Copperhead #66 ($50):** explicitly paid and clear scope, but the canonical bounty does not explicitly state AI-agent participation, and full reproduction depends on provider/KiCad environment; not advanced under the strict AI-allowed gate.
- **Historical Superteam agent bounties:** multiple search results remain indexed but show `0h:0m:0s` and announced winners; they are closed and were not re-added.
