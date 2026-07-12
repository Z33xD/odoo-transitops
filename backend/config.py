import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Load .env (try backend/ first, then project root) ──────────────────
for candidate in [
    os.path.join(BASE_DIR, ".env"),
    os.path.join(BASE_DIR, "..", ".env"),
]:
    resolved = os.path.normpath(candidate)
    if os.path.isfile(resolved):
        load_dotenv(resolved)
        print(f"[config] Loaded environment from {resolved}")
        break

DB_PATH = os.path.join(BASE_DIR, '..', 'database', 'transitops.db')

# ─── Email / SMTP (from env / .env, with Gmail defaults) ────────────────
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
EMAIL_USER = os.environ.get("EMAIL_USER", "")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", EMAIL_USER)
EMAIL_TEST_TO = os.environ.get("EMAIL_TEST_TO", "")  # override all recipients for testing
