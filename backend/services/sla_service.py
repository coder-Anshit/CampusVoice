

from  datetime import datetime, timezone

from services.audit_service import create_audit_log
from  database.mongo import (
    sla_violations_col
)
from  services.escalation_service import (
    create_escalation
)

def check_task_sla(task):

    due_date = task.get("dueDate")

    if not due_date:
        return False

    if task.get("status") == "completed":
        return False

    due = datetime.strptime(

        due_date,

        "%Y-%m-%dT%H:%M:%S.000Z"

    ).replace(
        tzinfo=timezone.utc
    )

    now = datetime.now(
        timezone.utc
    )

    if now > due:

        existing = sla_violations_col.find_one({

            "taskId": str(task["_id"])

        })

        if existing:
            return True

        sla_violations_col.insert_one({

            "taskId": str(task["_id"]),

            "issueId": task.get("issueId"),

            "status": "open",

            "detectedAt": now.isoformat()

        })

        create_audit_log(

            entity_type="task",

            entity_id=str(task["_id"]),

            action="sla_violated",

            performed_by="system",

            role="system"

        )

        create_escalation(task)

        return True

    return False