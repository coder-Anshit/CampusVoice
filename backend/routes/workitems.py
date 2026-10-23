

from  flask import Blueprint, request, jsonify
from  services.workitem_service import create_work_item



workitems_bp = Blueprint(
    "workitems",
    __name__,
    url_prefix="/api/workitems"
)

@workitems_bp.route("/", methods=["POST"])
def create_workitem():

    data = request.get_json(force=True)

    work_item_id = create_work_item(

        item_type=data["type"],

        title=data["title"],

        description=data["description"],

        created_by=data["createdBy"],

        workflow_template=data["workflowTemplate"],

        department_id=data.get(
            "departmentId"
        )

    )

    return jsonify({

        "id": work_item_id

    }),201