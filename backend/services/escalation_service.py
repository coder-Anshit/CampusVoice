from  database.mongo import (
    users_col,
    escalations_col
)

from  services.audit_service import (
    create_audit_log
)

from  services.hierarchy_service import (
    get_reporting_chain
)

from  utils.helpers import now_iso
from  services.notification_service import (
    create_notification
)


def create_escalation(task):

    assigned_to = task.get(
        "assignedTo",
        {}
    )

    user_id = assigned_to.get(
        "userId"
    )

    if not user_id:
        return None

    chain = get_reporting_chain(
        user_id
    )

    if len(chain) < 2:
        return None

    manager = chain[1]

    existing = escalations_col.find_one({

        "taskId": str(task["_id"]),

        "status": "open"

    })
    if existing:
        return None

    escalation = {

        "taskId": str(task["_id"]),

        "issueId": task.get(
            "issueId"
        ),

        "escalatedfrom ": user_id,

        "escalatedTo": manager[
            "userId"
        ],

        "status": "open",

        "createdAt": now_iso()

    }

    result = escalations_col.insert_one(
        escalation
    )

    create_notification(

        user_id=manager["userId"],

        title="Task Escalated",

        message=(
            f"Task {task.get('title')} "
            f"has been escalated to you."
        ),

        notification_type="escalation"

    )

   

    create_audit_log(

        entity_type="task",

        entity_id=str(task["_id"]),

        action="auto_escalated",

        performed_by="system",

        role="system"

    )

    return str(
        result.inserted_id
    )