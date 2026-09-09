import importlib.util
import pathlib
import sys
import unittest
from datetime import datetime, timezone

MODULE_PATH = pathlib.Path(__file__).parents[1] / "src" / "mermail_signup_qa.py"
spec = importlib.util.spec_from_file_location("mermail_signup_qa", MODULE_PATH)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mod
spec.loader.exec_module(mod)

NOW = datetime(2026, 9, 9, 19, 0, tzinfo=timezone.utc)
POLICY = mod.Policy(("example.test",), ("example.test",), 900)


def msg(body, sender="qa@example.test", received="2026-09-09T18:55:00Z", subject="Verify your signup"):
    return {
        "run_id": "demo-001",
        "from": sender,
        "subject": subject,
        "body": body,
        "received_at": received,
    }


class SignupQaTests(unittest.TestCase):
    def test_good_otp_passes_and_is_redacted(self):
        result = mod.analyze_message(msg("Your verification code is 482913"), POLICY, NOW)
        self.assertEqual(result["decision"], "PASS")
        self.assertEqual(result["artifact_type"], "otp")
        self.assertNotIn("482913", result["redacted_summary"])

    def test_good_magic_link_passes_and_is_redacted(self):
        result = mod.analyze_message(msg("Confirm signup: https://auth.example.test/verify?t=secret"), POLICY, NOW)
        self.assertEqual(result["decision"], "PASS")
        self.assertEqual(result["artifact_type"], "magic_link")
        self.assertEqual(result["verification_host"], "auth.example.test")
        self.assertNotIn("t=secret", result["redacted_summary"])

    def test_sender_mismatch_escalates(self):
        result = mod.analyze_message(msg("Verification code is 482913", sender="qa@unexpected.test"), POLICY, NOW)
        self.assertEqual(result["decision"], "ESCALATE")
        self.assertIn("UNEXPECTED_SENDER_DOMAIN", result["reasons"])

    def test_stale_message_rejected(self):
        result = mod.analyze_message(msg("Verification code is 482913", received="2026-09-09T18:00:00Z"), POLICY, NOW)
        self.assertEqual(result["decision"], "REJECT")
        self.assertIn("STALE_MESSAGE", result["reasons"])

    def test_http_link_rejected(self):
        result = mod.analyze_message(msg("Verify signup: http://example.test/verify?t=x"), POLICY, NOW)
        self.assertEqual(result["decision"], "REJECT")
        self.assertIn("NON_HTTPS_VERIFICATION_LINK", result["reasons"])

    def test_sensitive_recovery_escalates(self):
        result = mod.analyze_message(msg("Account recovery verification code is 482913"), POLICY, NOW)
        self.assertEqual(result["decision"], "ESCALATE")
        self.assertIn("SENSITIVE_CONTEXT", result["reasons"])

    def test_unknown_link_domain_escalates(self):
        result = mod.analyze_message(msg("Verify signup: https://evil.test/verify?t=x"), POLICY, NOW)
        self.assertEqual(result["decision"], "ESCALATE")
        self.assertIn("UNEXPECTED_LINK_DOMAIN", result["reasons"])

    def test_missing_artifact_escalates(self):
        result = mod.analyze_message(msg("Welcome to the test environment."), POLICY, NOW)
        self.assertEqual(result["decision"], "ESCALATE")
        self.assertIn("NO_VERIFICATION_ARTIFACT", result["reasons"])

    def test_empty_sender_allowlist_fails_closed(self):
        policy = mod.Policy((), ("example.test",), 900)
        result = mod.analyze_message(msg("Verification code is 482913"), policy, NOW)
        self.assertEqual(result["decision"], "ESCALATE")
        self.assertIn("UNEXPECTED_SENDER_DOMAIN", result["reasons"])

    def test_empty_link_allowlist_fails_closed(self):
        policy = mod.Policy(("example.test",), (), 900)
        result = mod.analyze_message(msg("Verify signup: https://auth.example.test/verify?t=x"), policy, NOW)
        self.assertEqual(result["decision"], "ESCALATE")
        self.assertIn("UNEXPECTED_LINK_DOMAIN", result["reasons"])

    def test_future_timestamp_rejected(self):
        result = mod.analyze_message(msg("Verification code is 482913", received="2026-09-09T19:10:00Z"), POLICY, NOW)
        self.assertEqual(result["decision"], "REJECT")
        self.assertIn("FUTURE_MESSAGE_TIMESTAMP", result["reasons"])

    def test_subject_secret_is_redacted(self):
        result = mod.analyze_message(
            msg("Use the code shown in the subject.", subject="Verification code 482913"),
            POLICY,
            NOW,
        )
        self.assertEqual(result["decision"], "PASS")
        self.assertNotIn("482913", result["subject"])
        self.assertIn("[REDACTED_CODE]", result["subject"])


if __name__ == "__main__":
    unittest.main()
