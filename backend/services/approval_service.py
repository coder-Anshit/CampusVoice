from bson import ObjectId

from database.mongo import approvals_col
from utils.helpers import now_iso

APPROVAL_STEP_ROLE_MAP = {

    "hod_review": "HOD",

    "dean_review": "Dean"
}


def create_approval(

    workflow_instance_id,

    step,

    assigned_to,

    created_by

):

    approval = {

        "workflowInstanceId":
        workflow_instance_id,

        "step": step,

        "assignedTo":
        assigned_to,

        "status": "pending",

        "createdBy":
        created_by,

        "createdAt":
        now_iso(),

        "updatedAt":
        now_iso()

    }

    result = approvals_col.insert_one(
        approval
    )

    return str(
        result.inserted_id
    )


def approve_request(

    approval_id,

    approved_by

):

    approvals_col.update_one(

        {
            "_id": approval_id
        },

        {

            "$set": {

                "status": "approved",

                "approvedBy":
                approved_by,

                "updatedAt":
                now_iso()

            }

        }

    )

    approval = approvals_col.find_one({

        "_id": approval_id

    })

    from services.workflow_runtime_service import (
        process_approval_approved
    )

    process_approval_approved(
        approval
    )


def reject_request(

    approval_id,

    rejected_by,

    reason

):

    approvals_col.update_one(

        {
            "_id": approval_id
        },

        {

            "$set": {

                "status": "rejected",

                "rejectedBy":
                rejected_by,

                "reason":
                reason,

                "updatedAt":
                now_iso()

            }

        }

    )

    approval = approvals_col.find_one({

        "_id": approval_id

    })

    from services.workflow_runtime_service import (
        process_approval_rejected
    )

    process_approval_rejected(

        approval,

        reason

    )


def get_approval(approval_id):

    return approvals_col.find_one({

        "_id": ObjectId(approval_id)

    })