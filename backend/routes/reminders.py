"""
Flask Blueprint — Trigger email reminders (dashboard button).
"""

import logging
from flask import Blueprint, jsonify

from reminders import trigger_all_reminders

logger = logging.getLogger(__name__)

bp = Blueprint("reminders", __name__, url_prefix="/api/reminders")


@bp.route("/trigger", methods=["POST"])
def trigger():
    """POST /api/reminders/trigger   — normal thresholds"""
    try:
        results = trigger_all_reminders(force=False)
        total = sum(len(v) for v in results.values())
        return jsonify({"success": True, "total_sent": total, "details": results})
    except Exception as e:
        logger.exception("Reminder trigger failed")
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route("/trigger-force", methods=["POST"])
def trigger_force():
    """POST /api/reminders/trigger-force   — send all (demo mode)"""
    try:
        results = trigger_all_reminders(force=True)
        total = sum(len(v) for v in results.values())
        return jsonify({"success": True, "total_sent": total, "details": results})
    except Exception as e:
        logger.exception("Force reminder trigger failed")
        return jsonify({"success": False, "error": str(e)}), 500
