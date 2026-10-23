from  flask import Blueprint, request, jsonify


escalations_bp = Blueprint("escalations", __name__)

from middleware.auth_middleware import require_role
from utils.serializers import serial
from database.mongo import escalations_col

@escalations_bp.route("/", methods=["GET"])
@require_role("admin")
def get_escalations():

    escalations = list(
        escalations_col.find()
    )

    return jsonify([
        serial(e)
        for e in escalations
    ])