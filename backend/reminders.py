"""
TransitOps — Email Reminder Service

Sends HTML email reminders for:
  1. Driver License Expiry          → Safety Officer + Fleet Manager
  2. Vehicle Document Expiry        → Fleet Manager
  3. Maintenance Due / Overdue      → Fleet Manager

Main entry point:
    from reminders import trigger_all_reminders
    trigger_all_reminders()              # only exact threshold days
    trigger_all_reminders(force=True)    # send everything (demo mode)

CLI:
    python reminders.py                  # normal
    python reminders.py --force          # demo mode
"""

import logging
import smtplib
import argparse
from datetime import datetime, date
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from database import get_db
from config import SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, EMAIL_TEST_TO

logger = logging.getLogger(__name__)

# ─── Role constants (match seed.sql) ────────────────────────────────────────
ROLE_FLEET_MANAGER = 1
ROLE_SAFETY_OFFICER = 3

# ─── Reminder windows (days before expiry) ──────────────────────────────────
LICENSE_WINDOWS = {30, 15, 7, 1}
DOCUMENT_WINDOWS = {30, 15, 7}

# ═══════════════════════════════════════════════════════════════════════════
#  HTML TEMPLATES
# ═══════════════════════════════════════════════════════════════════════════

def _base_html(title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9">
    <tr>
      <td align="center" style="padding:30px 10px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
          <tr>
            <td style="padding:30px 40px 10px;text-align:center;border-bottom:1px solid #e8eaed">
              <h1 style="margin:0;font-size:22px;color:#1a73e8">🚛 TransitOps</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#5f6368">Smart Transport Operations Platform</p>
            </td>
          </tr>
          <tr><td style="padding:25px 40px 15px">{body}</td></tr>
          <tr>
            <td style="padding:15px 40px 25px;text-align:center;border-top:1px solid #e8eaed;font-size:12px;color:#9aa0a6">
              TransitOps &bull; Smart Transport Operations Platform<br>
              This is an automated reminder &mdash; please do not reply directly.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _alert_badge(text: str, color: str = "#ea4335") -> str:
    return f'<span style="display:inline-block;background:{color};color:#fff;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600">{text}</span>'


def _info_row(label: str, value: str) -> str:
    return f"""<tr>
  <td style="padding:8px 0;font-size:14px;color:#5f6368;width:140px">{label}</td>
  <td style="padding:8px 0;font-size:14px;color:#202124;font-weight:500">{value}</td>
</tr>"""


# ── 1. License Expiry ───────────────────────────────────────────────────────

def license_reminder_html(driver: dict, days_left: int) -> str:
    is_critical = days_left <= 7
    badge_color = "#ea4335" if is_critical else "#fbbc04"
    urgency = "🔴 EXPIRING SOON" if is_critical else "⚠️ UPCOMING EXPIRY"

    body = f"""
<p style="font-size:16px;color:#202124;margin:0 0 6px">Hello,</p>
<p style="font-size:14px;color:#5f6368;margin:0 0 18px">
  The following driver's license is expiring in <strong>{days_left}</strong> day{'s' if days_left != 1 else ''}.
  Please take the necessary action.
</p>
{_alert_badge(urgency, badge_color)}
<br><br>
<table cellpadding="0" cellspacing="0" style="width:100%">
  {_info_row("👤 Driver", driver["name"])}
  {_info_row("🆔 License #", driver["license_number"])}
  {_info_row("📅 Expiry Date", driver["license_expiry_date"])}
  {_info_row("⏳ Days Left", str(days_left))}
  {_info_row("📞 Contact", driver.get("contact_number") or "—")}
</table>
"""
    return _base_html(f"License Expiry – {driver['name']}", body)


# ── 2. Document Expiry ──────────────────────────────────────────────────────

def document_reminder_html(doc: dict, days_left: int) -> str:
    is_critical = days_left <= 7
    badge_color = "#ea4335" if is_critical else "#fbbc04"
    urgency = "🔴 EXPIRING SOON" if is_critical else "⚠️ UPCOMING EXPIRY"

    body = f"""
<p style="font-size:16px;color:#202124;margin:0 0 6px">Hello,</p>
<p style="font-size:14px;color:#5f6368;margin:0 0 18px">
  A vehicle document is expiring in <strong>{days_left}</strong> day{'s' if days_left != 1 else ''}.
  Please arrange for renewal.
</p>
{_alert_badge(urgency, badge_color)}
<br><br>
<table cellpadding="0" cellspacing="0" style="width:100%">
  {_info_row("🚛 Vehicle", doc["vehicle_reg"])}
  {_info_row("🏷️ Model", doc.get("vehicle_model", "—"))}
  {_info_row("📄 Document Type", doc["document_type"])}
  {_info_row("📅 Expiry Date", doc["expiry_date"])}
  {_info_row("⏳ Days Left", str(days_left))}
</table>
"""
    return _base_html(f"Document Expiry – {doc['document_type']}", body)


# ── 3. Maintenance Due / Overdue ────────────────────────────────────────────

def maintenance_reminder_html(mtce: dict, category: str, days_open: int) -> str:
    if category == "overdue":
        badge = _alert_badge("🔴 OVERDUE", "#ea4335")
        heading = "Overdue Maintenance Alert"
        msg = "The following maintenance task is overdue and requires immediate attention."
    else:
        badge = _alert_badge("🟡 DUE SOON", "#fbbc04")
        heading = "Maintenance Due Reminder"
        msg = "The following maintenance task has been open for several days."

    body = f"""
<p style="font-size:16px;color:#202124;margin:0 0 6px">Hello,</p>
<p style="font-size:14px;color:#5f6368;margin:0 0 18px">{msg}</p>
{badge}
<br><br>
<table cellpadding="0" cellspacing="0" style="width:100%">
  {_info_row("🚛 Vehicle", mtce["vehicle_reg"])}
  {_info_row("🏷️ Model", mtce.get("vehicle_model", "—"))}
  {_info_row("🔧 Description", mtce["description"])}
  {_info_row("📅 Started", mtce["start_date"])}
  {_info_row("📆 Days Open", str(days_open))}
  {_info_row("📋 Status", mtce["status"])}
</table>
"""
    return _base_html(heading, body)


# ═══════════════════════════════════════════════════════════════════════════
#  DATABASE HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _get_users_by_role(role_id: int) -> list[dict]:
    with get_db() as db:
        rows = db.execute(
            "SELECT id, email, name FROM users WHERE role_id = ?", (role_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def _get_expiring_licenses() -> list[dict]:
    with get_db() as db:
        rows = db.execute("""
            SELECT id, name, license_number, license_expiry_date, contact_number
            FROM drivers
            WHERE license_expiry_date IS NOT NULL
              AND date(license_expiry_date) >= date('now')
              AND date(license_expiry_date) <= date('now', '+30 days')
        """).fetchall()
    return [dict(r) for r in rows]


def _get_expiring_documents() -> list[dict]:
    with get_db() as db:
        rows = db.execute("""
            SELECT d.id, d.document_type, d.expiry_date,
                   v.id AS vehicle_id,
                   v.registration_number AS vehicle_reg,
                   v.name_model AS vehicle_model
            FROM vehicle_documents d
            JOIN vehicles v ON v.id = d.vehicle_id
            WHERE d.expiry_date IS NOT NULL
              AND date(d.expiry_date) >= date('now')
              AND date(d.expiry_date) <= date('now', '+30 days')
        """).fetchall()
    return [dict(r) for r in rows]


def _get_active_maintenance() -> list[dict]:
    with get_db() as db:
        rows = db.execute("""
            SELECT m.id, m.description, m.start_date, m.status, m.cost,
                   v.id AS vehicle_id,
                   v.registration_number AS vehicle_reg,
                   v.name_model AS vehicle_model
            FROM maintenance_logs m
            JOIN vehicles v ON v.id = m.vehicle_id
            WHERE m.status = 'Open'
              AND date(m.start_date) <= date('now', '-3 days')
        """).fetchall()
    return [dict(r) for r in rows]


# ═══════════════════════════════════════════════════════════════════════════
#  EMAIL SENDING
# ═══════════════════════════════════════════════════════════════════════════

def send_email(to_emails: list[str] | str, subject: str, html_body: str) -> bool:
    if not EMAIL_USER or not EMAIL_PASSWORD:
        logger.info("[DEMO] Would send: %s  →  %s", subject, to_emails)
        return True  # simulated success for demo

    if isinstance(to_emails, str):
        to_emails = [to_emails]

    # EMAIL_TEST_TO overrides all recipients (handy for demos)
    if EMAIL_TEST_TO:
        to_emails = [EMAIL_TEST_TO]
        subject = f"[TEST → {EMAIL_TEST_TO}] {subject}"

    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_FROM
    msg["To"] = ", ".join(to_emails)
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, to_emails, msg.as_string())
        logger.info("✓ Sent: %s  →  %s", subject, ", ".join(to_emails))
        return True
    except Exception as e:
        logger.error("✗ Failed [%s]: %s", subject, e)
        return False


# ═══════════════════════════════════════════════════════════════════════════
#  REMINDER DISPATCHERS
# ═══════════════════════════════════════════════════════════════════════════

def send_license_reminders(force: bool = False) -> list[dict]:
    drivers = _get_expiring_licenses()
    if not drivers:
        logger.info("No drivers with expiring licenses found.")
        return []

    recipients = _get_users_by_role(ROLE_SAFETY_OFFICER) + _get_users_by_role(ROLE_FLEET_MANAGER)
    to_emails = list({r["email"] for r in recipients})
    if not to_emails:
        logger.warning("No Safety Officer or Fleet Manager users found — cannot send license reminders.")
        return []

    sent = []
    today = date.today()

    for driver in drivers:
        expiry = datetime.strptime(driver["license_expiry_date"], "%Y-%m-%d").date()
        days_left = (expiry - today).days

        if not force and days_left not in LICENSE_WINDOWS:
            continue

        label = f"{days_left} day{'s' if days_left != 1 else ''}"
        if force:
            label += " [FORCE]"

        subject = f"⚠️ License Expiry – {driver['name']} ({label})"
        html = license_reminder_html(driver, days_left)

        if send_email(to_emails, subject, html):
            sent.append({
                "type": "license",
                "driver_id": driver["id"],
                "driver_name": driver["name"],
                "days_left": days_left,
                "recipients": list(to_emails),
            })

    return sent


def send_document_reminders(force: bool = False) -> list[dict]:
    docs = _get_expiring_documents()
    if not docs:
        logger.info("No expiring vehicle documents found.")
        return []

    recipients = _get_users_by_role(ROLE_FLEET_MANAGER)
    to_emails = list({r["email"] for r in recipients})
    if not to_emails:
        logger.warning("No Fleet Manager users found — cannot send document reminders.")
        return []

    sent = []
    today = date.today()

    for doc in docs:
        expiry = datetime.strptime(doc["expiry_date"], "%Y-%m-%d").date()
        days_left = (expiry - today).days

        if not force and days_left not in DOCUMENT_WINDOWS:
            continue

        label = f"{days_left} day{'s' if days_left != 1 else ''}"
        if force:
            label += " [FORCE]"

        subject = f"📄 Document Expiry – {doc['vehicle_reg']} ({doc['document_type']}, {label})"
        html = document_reminder_html(doc, days_left)

        if send_email(to_emails, subject, html):
            sent.append({
                "type": "document",
                "document_id": doc["id"],
                "vehicle_reg": doc["vehicle_reg"],
                "document_type": doc["document_type"],
                "days_left": days_left,
                "recipients": list(to_emails),
            })

    return sent


def send_maintenance_reminders() -> list[dict]:
    items = _get_active_maintenance()
    if not items:
        logger.info("No active maintenance items due or overdue.")
        return []

    recipients = _get_users_by_role(ROLE_FLEET_MANAGER)
    to_emails = list({r["email"] for r in recipients})
    if not to_emails:
        logger.warning("No Fleet Manager users found — cannot send maintenance reminders.")
        return []

    sent = []
    today = date.today()

    for item in items:
        start = datetime.strptime(item["start_date"], "%Y-%m-%d").date()
        days_open = (today - start).days

        if days_open >= 7:
            category = "overdue"
        elif days_open >= 3:
            category = "due"
        else:
            continue

        label = "🔴 OVERDUE" if category == "overdue" else "🟡 DUE"
        subject = f"{label} – {item['vehicle_reg']} ({item['description'][:50]})"
        html = maintenance_reminder_html(item, category, days_open)

        if send_email(to_emails, subject, html):
            sent.append({
                "type": f"maintenance_{category}",
                "maintenance_id": item["id"],
                "vehicle_reg": item["vehicle_reg"],
                "description": item["description"],
                "days_open": days_open,
                "recipients": list(to_emails),
            })

    return sent


# ═══════════════════════════════════════════════════════════════════════════
#  MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

def trigger_all_reminders(force: bool = False) -> dict:
    """
    Call this from the dashboard button or a scheduler.

    Args:
        force: If True, send reminders for *all* upcoming items regardless
               of the exact threshold day (useful for demos).

    Returns:
        dict with keys 'license_reminders', 'document_reminders',
        'maintenance_reminders', each containing a list of sent-item dicts.
    """
    email_ok = bool(EMAIL_USER and EMAIL_PASSWORD)
    logger.info("=" * 55)
    logger.info("  🚛 TRANSITOPS — EMAIL REMINDERS")
    logger.info("  Mode: %s", "FORCE (demo)" if force else "Normal thresholds")
    logger.info("  Email: %s", "LIVE (sending via SMTP)" if email_ok else "DEMO (simulated — no credentials)")
    logger.info("=" * 55)

    results = {
        "license_reminders": send_license_reminders(force=force),
        "document_reminders": send_document_reminders(force=force),
        "maintenance_reminders": send_maintenance_reminders(),
    }

    total = sum(len(v) for v in results.values())
    logger.info("=" * 55)
    logger.info("  ✅ Total reminders sent: %d", total)
    logger.info("=" * 55)

    return results


# ═══════════════════════════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    parser = argparse.ArgumentParser(description="TransitOps Email Reminders")
    parser.add_argument("--force", action="store_true", help="Send all reminders (ignore thresholds)")
    args = parser.parse_args()
    trigger_all_reminders(force=args.force)
