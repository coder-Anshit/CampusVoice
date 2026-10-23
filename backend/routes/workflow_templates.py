from  flask import Blueprint, request, jsonify
from database.mongo import workflow_templates_col
from middleware.auth_middleware import require_role
from utils.helpers import now_iso
from utils.serializers import serial


workflow_templates_bp = Blueprint(
    "workflow_templates",
    __name__,
    url_prefix="/api/workflow_templates"
)


@workflow_templates_bp.route("/", methods=["POST"])
@require_role("admin")
def create_workflow_template():

    data = request.get_json(force=True)

    template = {

        "name": data["name"],

        "description": data.get(
            "description",
            ""
        ),

        "steps": data["steps"],

        "active": True,

        "createdAt": now_iso()

    }

    result = workflow_templates_col.insert_one(
        template
    )

    template["_id"] = str(
        result.inserted_id
    )

    return jsonify(template), 201

@workflow_templates_bp.route("/", methods=["GET"])
def get_templates():

    templates = list(
        workflow_templates_col.find()
    )

    return jsonify([
        serial(t)
        for t in templates
    ])