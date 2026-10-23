from  flask import Blueprint, request, jsonify

from  services.workitem_service import (
    create_work_item
)

leave_requests_bp = Blueprint(
    "leave_requests",
    __name__,
    url_prefix="/api/leave-requests"
)


@leave_requests_bp.route(
    "",
    methods=["POST"]
)
def create_leave_request():

    data = request.get_json(force=True)

    work_item_id = create_work_item(

        item_type="leave_request",

        title=data["reason"],

        description=data["reason"],

        created_by=data["createdBy"],

        workflow_template=
        "Leave Request Workflow",
        
        department_id=data["departmentId"]

    )

    return jsonify({

        "success": True,

        "workItemId": work_item_id

    }), 201