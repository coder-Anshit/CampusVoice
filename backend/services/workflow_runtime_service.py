from bson import ObjectId

from database.mongo import (
    workflow_instances_col,
    work_items_col
)

from services.workflow_instance_service import (
    get_workflow_instance,
    move_to_next_step
)

from services.approval_service import (
    create_approval,
    APPROVAL_STEP_ROLE_MAP
)

from services.assignment_service import (
    find_user_by_position_name
)

from utils.helpers import now_iso


def process_approval_approved(
    approval
):

    workflow_instance = get_workflow_instance(
        approval["workflowInstanceId"]
    )

    if not workflow_instance:
        return

    next_step = move_to_next_step(
        workflow_instance
    )

    if not next_step:
        print("WORKFLOW COMPLETION CALLED")

        complete_workflow(
            workflow_instance
        )


def process_approval_rejected(
    approval,
    reason=None
):

    workflow_instance = get_workflow_instance(
        approval["workflowInstanceId"]
    )

    if not workflow_instance:
        return

    workflow_instances_col.update_one(

        {
            "_id": workflow_instance["_id"]
        },

        {
            "$set": {

                "status": "rejected",

                "rejectedAt": now_iso(),

                "rejectionReason": reason
            }
        }
    )

    work_items_col.update_one(

        {
            "_id": ObjectId(
                workflow_instance["entityId"]
            )
        },

        {
            "$set": {
                "status": "rejected",
                "updatedAt": now_iso()
            }
        }
    )


def complete_workflow(
    workflow_instance
):

    workflow_instances_col.update_one(

        {
            "_id": workflow_instance["_id"]
        },

        {
            "$set": {

                "status": "completed",

                "completedAt": now_iso(),

                "updatedAt": now_iso()
            }
        }
    )

    work_items_col.update_one(

        {
            "_id": ObjectId(
                workflow_instance["entityId"]
            )
        },

        {
            "$set": {

                "status": "completed",

                "completedAt": now_iso(),

                "updatedAt": now_iso()
            }
        }
    )