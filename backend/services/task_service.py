from database.mongo import tasks_col
from utils.helpers import now_iso
from datetime import datetime, timezone, timedelta


def create_task_from_issue(
    issue,
    department,
    assigned_to,
    assigned_by,
    expected_days
):

    now = now_iso()

    due_date = None

    if expected_days:
        due_date = (
            datetime.now(timezone.utc)
            + timedelta(days=int(expected_days))
        ).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    # ---------------------------------------------------------
    # Public identity shown to the employee.
    #
    # IMPORTANT:
    # If grievance is anonymous, employee must NOT receive
    # the student's real username.
    # ---------------------------------------------------------

    is_anonymous = issue.get(
        "anonymous",
        True
    )

    submitted_by = (
        "Anonymous"
        if is_anonymous
        else issue.get(
            "user",
            "Anonymous"
        )
    )

    task = {

        # -----------------------------------------------------
        # Issue reference
        # -----------------------------------------------------

        "issueId": str(
            issue["_id"]
        ),

        # -----------------------------------------------------
        # Grievance information
        # -----------------------------------------------------

        "title": issue.get(
            "title",
            "Untitled Issue"
        ),

        "description": issue.get(
            "text",
            ""
        ),

        "category": issue.get(
            "category",
            "General"
        ),

        "anonymous": is_anonymous,

        "submittedBy": submitted_by,

        "submittedAt": issue.get(
            "createdAt",
            now
        ),

        # -----------------------------------------------------
        # Assignment information
        # -----------------------------------------------------

        "department": department,

        "priority": issue.get(
            "priority",
            "medium"
        ),

        "assignedTo": assigned_to,

        "assignedBy": assigned_by,

        # -----------------------------------------------------
        # Task lifecycle
        # -----------------------------------------------------

        "status": "pending",

        "expectedResolutionDays":
            expected_days,

        "dueDate": due_date,

        "createdAt": now,

        "updatedAt": now,

        # -----------------------------------------------------
        # Task timeline
        # -----------------------------------------------------

        "timeline": [
            {
                "action": "Task Created",
                "by": assigned_by,
                "time": now
            }
        ]
    }

    result = tasks_col.insert_one(
        task
    )

    return str(
        result.inserted_id
    )