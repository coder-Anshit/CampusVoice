





from  flask import Blueprint, request, jsonify

from routes import tasks
from middleware.auth_middleware import require_role

from services.sla_service import check_task_sla
from utils.serializers import serial
from database.mongo import sla_rules_col
from utils.helpers import now_iso

from database.mongo import tasks_col
from  services.scheduler_service import (
    run_sla_checks
)




sla_bp = Blueprint(
    "sla",
    __name__,
    url_prefix="/api/sla"
)
@sla_bp.route("/rules", methods=["POST"])
@require_role("admin")
def create_sla_rule():

    data = request.get_json(force=True) or {}

    rule = {

        "priority": data.get("priority"),

        "hours": data.get("hours"),

        "active": True,

        "createdAt": now_iso()

    }

    result = sla_rules_col.insert_one(rule)

    rule["_id"] = str(result.inserted_id)

    return jsonify(rule), 201

@sla_bp.route("/rules", methods=["GET"])
@require_role("admin")
def get_sla_rules():

    rules = list(
        sla_rules_col.find()
    )

    return jsonify([
        serial(rule)
        for rule in rules
    ])

@sla_bp.route("/check", methods=["POST"])
@require_role("admin")
def run_sla_check():
   result = run_sla_checks()

   return jsonify(result)

@sla_bp.route("/scheduler-test", methods=["POST"])
@require_role("admin")
def scheduler_test():

    result = run_sla_checks()

    return jsonify({

        "success": True,

        "result": result

    })