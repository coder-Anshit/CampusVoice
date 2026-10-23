from flask import Blueprint, jsonify
from bson import ObjectId

from database.mongo import notifications_col
from utils.serializers import serial
from middleware.auth_middleware import require_role

notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)


@notifications_bp.route("/<user_id>", methods=["GET"])
@require_role("student", "faculty", "hod", "admin")
def get_notifications(user_id):

    notifications = list(
        notifications_col.find(
            {"userId": user_id}
        ).sort(
            "createdAt", -1
        )
    )

    return jsonify([
        serial(n)
        for n in notifications
    ])


@notifications_bp.route("/<id>/read", methods=["PATCH"])
@require_role("student", "faculty", "hod", "admin")
def mark_read(id):

    try:
        result = notifications_col.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "read": True
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({
                "error": "Notification not found"
            }), 404

        return jsonify({
            "success": True
        })

    except Exception:
        return jsonify({
            "error": "Invalid notification id"
        }), 400