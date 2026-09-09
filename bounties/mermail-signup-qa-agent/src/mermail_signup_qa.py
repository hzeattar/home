from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parseaddr, parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlparse

OTP_RE = re.compile(r"(?i)(?:code|otp|verification)[^0-9]{0,24}([0-9]{4,8})\b")
URL_RE = re.compile(r"https?://[^\s<>()\[\]{}\"']+")
SENSITIVE_TERMS = (
    "password reset",
    "account recovery",
    "recover your account",
    "refund",
    "payment",
    "invoice payment",
    "kyc",
    "identity verification",
    "legal notice",
    "wire transfer",
)


@dataclass(frozen=True)
class Policy:
    sender_domains: tuple[str, ...]
    link_domains: tuple[str, ...]
    max_age_seconds: int = 900


def _domain_from_sender(sender: str) -> str:
    _, address = parseaddr(sender or "")
    if "@" not in address:
        return ""
    return address.rsplit("@", 1)[1].strip().lower().rstrip(".")


def _domain_allowed(domain: str, allowed: tuple[str, ...]) -> bool:
    if not allowed:
        return True
    domain = domain.lower().rstrip(".")
    for candidate in allowed:
        candidate = candidate.lower().rstrip(".")
        if domain == candidate or domain.endswith("." + candidate):
            return True
    return False


def _received_at(value: str) -> datetime:
    if not value:
        raise ValueError("received_at is required")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        parsed = parsedate_to_datetime(value)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _redact(text: str) -> str:
    text = OTP_RE.sub(lambda m: m.group(0).replace(m.group(1), "[REDACTED_CODE]"), text)
    text = URL_RE.sub("[REDACTED_LINK]", text)
    return text


def analyze_message(message: dict, policy: Policy, now: datetime | None = None) -> dict:
    now = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    sender = str(message.get("from") or "")
    subject = str(message.get("subject") or "")
    body = str(message.get("body") or "")
    received = _received_at(str(message.get("received_at") or ""))
    age_seconds = max(0, int((now - received).total_seconds()))
    sender_domain = _domain_from_sender(sender)
    text = f"{subject}\n{body}"
    lower = text.lower()

    reasons: list[str] = []
    decision = "PASS"

    if any(term in lower for term in SENSITIVE_TERMS):
        decision = "ESCALATE"
        reasons.append("SENSITIVE_CONTEXT")

    if not _domain_allowed(sender_domain, policy.sender_domains):
        decision = "ESCALATE"
        reasons.append("UNEXPECTED_SENDER_DOMAIN")

    if age_seconds > policy.max_age_seconds:
        decision = "REJECT"
        reasons.append("STALE_MESSAGE")

    links = URL_RE.findall(text)
    otp_match = OTP_RE.search(text)
    safe_links: list[str] = []
    unsafe_link = False
    unexpected_link = False

    for raw in links:
        parsed = urlparse(raw.rstrip(".,;!"))
        if parsed.scheme.lower() != "https":
            unsafe_link = True
            continue
        host = (parsed.hostname or "").lower().rstrip(".")
        if not _domain_allowed(host, policy.link_domains):
            unexpected_link = True
            continue
        safe_links.append(raw.rstrip(".,;!"))

    if unsafe_link:
        decision = "REJECT"
        reasons.append("NON_HTTPS_VERIFICATION_LINK")
    elif unexpected_link and decision != "REJECT":
        decision = "ESCALATE"
        reasons.append("UNEXPECTED_LINK_DOMAIN")

    artifact_type = "none"
    artifact_present = False
    if otp_match:
        artifact_type = "otp"
        artifact_present = True
    elif safe_links:
        artifact_type = "magic_link"
        artifact_present = True

    verification_context = any(
        term in lower
        for term in ("verify", "verification", "confirm", "one-time", "one time", "otp", "sign in", "signup", "sign up")
    )
    if artifact_present and not verification_context and decision == "PASS":
        decision = "ESCALATE"
        reasons.append("AMBIGUOUS_ARTIFACT_CONTEXT")

    if not artifact_present and decision == "PASS":
        decision = "ESCALATE"
        reasons.append("NO_VERIFICATION_ARTIFACT")

    if not reasons:
        reasons.append("POLICY_OK")

    result = {
        "run_id": str(message.get("run_id") or ""),
        "checked_at": now.isoformat(),
        "sender_domain": sender_domain,
        "subject": subject,
        "received_at": received.isoformat(),
        "age_seconds": age_seconds,
        "artifact_type": artifact_type,
        "verification_host": urlparse(safe_links[0]).hostname if safe_links else None,
        "decision": decision,
        "reasons": reasons,
        "redacted_summary": _redact(text)[:500],
    }
    return result


def policy_from_payload(payload: dict) -> Policy:
    raw = payload.get("policy") or {}
    sender_domains = tuple(str(x).lower() for x in raw.get("sender_domains", []))
    link_domains = tuple(str(x).lower() for x in raw.get("link_domains", []))
    max_age = int(raw.get("max_age_seconds", 900))
    if max_age <= 0 or max_age > 86400:
        raise ValueError("max_age_seconds must be between 1 and 86400")
    return Policy(sender_domains, link_domains, max_age)


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze a synthetic/authorized verification email and emit redacted QA evidence.")
    parser.add_argument("fixture", type=Path)
    parser.add_argument("--now", help="UTC/offset ISO-8601 timestamp used for deterministic demos")
    args = parser.parse_args()

    payload = json.loads(args.fixture.read_text(encoding="utf-8"))
    now = datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
    result = analyze_message(payload["message"], policy_from_payload(payload), now)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["decision"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
