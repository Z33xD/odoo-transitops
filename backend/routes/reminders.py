"""
Flask Blueprint — Trigger email reminders (dashboard button).
"""

import logging
from flask import Blueprint, jsonify

from reminders import trigger_all_reminders
from config import EMAIL_USER, EMAIL_PASSWORD

logger = logging.getLogger(__name__)

bp = Blueprint("reminders", __name__, url_prefix="/api/reminders")


def _email_status() -> bool:
    return bool(EMAIL_USER and EMAIL_PASSWORD)


def _email_status_str() -> str:
    return "live" if _email_status() else "demo (simulated — no SMTP credentials)"


@bp.route("/status", methods=["GET"])
def status():
    """GET /api/reminders/status  — check email config"""
    return jsonify({
        "email_configured": _email_status(),
        "email_user": EMAIL_USER or None,
        "mode": _email_status_str(),
    })


@bp.route("/trigger", methods=["POST"])
def trigger():
    """POST /api/reminders/trigger   — normal thresholds"""
    try:
        results = trigger_all_reminders(force=False)
        total = sum(len(v) for v in results.values())
        return jsonify({
            "success": True,
            "total_sent": total,
            "mode": _email_status_str(),
            "details": results,
        })
    except Exception as e:
        logger.exception("Reminder trigger failed")
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route("/trigger-force", methods=["POST"])
def trigger_force():
    """POST /api/reminders/trigger-force   — send all (demo mode)"""
    try:
        results = trigger_all_reminders(force=True)
        total = sum(len(v) for v in results.values())
        return jsonify({
            "success": True,
            "total_sent": total,
            "mode": _email_status_str(),
            "details": results,
        })
    except Exception as e:
        logger.exception("Force reminder trigger failed")
        return jsonify({"success": False, "error": str(e)}), 500
