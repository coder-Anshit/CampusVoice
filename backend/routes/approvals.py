from  bson import ObjectId
from  flask import Blueprint, jsonify
from  database.mongo import approvals_col
from  services.workflow_instance_service import get_workflow_instance, move_to_next_step
from  services.approval_service import (
    approve_request,
    get_approval
)


approvals_bp = Blueprint("approvals", __name__,url_prefix="/api/approvals")

from  utils.serializers import serial
@approvals_bp.route(
    "/pending/<user_id>",
    methods=["GET"]
)
def pending_approvals(user_id):

    approvals = list(

        approvals_col.find({

            "assignedTo": user_id,

            "status": "pending"

        })

    )

    return jsonify([
        serial(a)
        for a in approvals
    ])

@approvals_bp.route(
    "/<approval_id>/approve",
    methods=["POST"]
)
def approve(approval_id):

    approval = get_approval(
        approval_id
    )

    if not approval:

        return jsonify({
            "error": "Approval not found"
        }), 404

    approve_request(

        approval_id=
        ObjectId(approval_id),

        approved_by=
        "test-user"

    )

   

    return jsonify({

        "success": True

    }), 200

