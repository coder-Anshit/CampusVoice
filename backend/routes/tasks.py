from flask import Blueprint, jsonify, request
from bson import ObjectId

from database.mongo import (
    tasks_col,
    issues_col
)

from middleware.auth_middleware import require_role

from utils.helpers import now_iso
from utils.serializers import serial

from services.audit_service import create_audit_log


tasks_bp = Blueprint(
    "tasks",
    __name__,
    url_prefix="/api/tasks"
)


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def get_current_username():
    user = getattr(
        request,
        "user",
        None
    )

    if not user:
        return None

    return user.get("username")


def find_task(task_id):

    try:
        return tasks_col.find_one({
            "_id": ObjectId(task_id)
        })

    except Exception:
        return None


def is_task_owner(
    task,
    username
):

    assigned_to = (
        task.get("assignedTo")
        or {}
    )

    return (
        assigned_to.get(
            "username"
        ) == username
        or
        assigned_to.get(
            "userId"
        ) == username
    )


def add_timeline_event(
    task,
    action,
    username
):

    now = now_iso()

    timeline = (
        task.get("timeline")
        or []
    )

    timeline.append({
        "action": action,
        "by": username or "system",
        "time": now
    })

    return timeline, now


# ─────────────────────────────────────────────────────────────
# GET ALL TASKS
# Admin
# ─────────────────────────────────────────────────────────────

@tasks_bp.route(
    "/",
    methods=["GET"]
)
@require_role("admin")
def get_tasks():

    tasks = list(
        tasks_col
        .find()
        .sort(
            "createdAt",
            -1
        )
    )

    return jsonify([
        serial(task)
        for task in tasks
    ])


# ─────────────────────────────────────────────────────────────
# GET MY TASKS
# ─────────────────────────────────────────────────────────────

@tasks_bp.route(
    "/my",
    methods=["GET"]
)
@require_role(
    "employee",
    "faculty",
    "hod",
    "admin"
)
def get_my_tasks():

    username = get_current_username()

    if not username:

        return jsonify({
            "error":
                "Authenticated username missing"
        }), 401

    tasks = list(
        tasks_col.find({
            "$or": [
                {
                    "assignedTo.username":
                        username
                },
                {
                    "assignedTo.userId":
                        username
                }
            ]
        })
        .sort(
            "createdAt",
            -1
        )
    )

    return jsonify([
        serial(task)
        for task in tasks
    ])


# ─────────────────────────────────────────────────────────────
# GET SINGLE TASK
# ─────────────────────────────────────────────────────────────

@tasks_bp.route(
    "/<task_id>",
    methods=["GET"]
)
@require_role(
    "employee",
    "faculty",
    "hod",
    "admin"
)
def get_task(task_id):

    task = find_task(
        task_id
    )

    if not task:

        return jsonify({
            "error":
                "Task not found"
        }), 404

    username = (
        get_current_username()
    )

    if (
        request.user.get("role")
        != "admin"
    ):

        if not is_task_owner(
            task,
            username
        ):

            return jsonify({
                "error":
                    "You are not assigned "
                    "to this task"
            }), 403

    return jsonify(
        serial(task)
    )


# ─────────────────────────────────────────────────────────────
# TASK STATUS ENGINE
# ─────────────────────────────────────────────────────────────

def change_task_status(
    task_id,
    new_status,
    action
):

    task = find_task(
        task_id
    )

    if not task:

        return jsonify({
            "error":
                "Task not found"
        }), 404

    username = (
        get_current_username()
    )

    role = request.user.get(
        "role"
    )

    # Admin can manage any task.
    # Everyone else must own the task.
    if role != "admin":

        if not is_task_owner(
            task,
            username
        ):

            return jsonify({
                "error":
                    "You are not assigned "
                    "to this task"
            }), 403

    current_status = task.get(
        "status",
        "pending"
    )

    allowed_transitions = {

        "pending": [
            "accepted"
        ],

        "accepted": [
            "investigating"
        ],

        "investigating": [
            "completed"
        ],

        "completed": []
    }

    if new_status not in (
        allowed_transitions.get(
            current_status,
            []
        )
    ):

        return jsonify({
            "error":
                f"Invalid task transition: "
                f"{current_status} → "
                f"{new_status}"
        }), 400

    # ─────────────────────────────────────────
    # Resolution note
    # ─────────────────────────────────────────

    resolution_note = ""

    if new_status == "completed":

        data = (
            request.get_json(
                silent=True
            )
            or {}
        )

        resolution_note = (
            data.get(
                "resolutionNote"
            )
            or data.get(
                "note"
            )
            or ""
        ).strip()

        if not resolution_note:

            return jsonify({
                "error":
                    "Resolution note is required"
            }), 400

    # ─────────────────────────────────────────
    # Timeline
    # ─────────────────────────────────────────

    timeline, now = (
        add_timeline_event(
            task,
            action,
            username
        )
    )

    update_data = {
        "status":
            new_status,

        "updatedAt":
            now,

        "timeline":
            timeline
    }

    if new_status == "completed":

        update_data[
            "resolutionNote"
        ] = resolution_note

        update_data[
            "resolvedAt"
        ] = now

    # ─────────────────────────────────────────
    # Update task
    # ─────────────────────────────────────────

    tasks_col.update_one(
        {
            "_id":
                task["_id"]
        },
        {
            "$set":
                update_data
        }
    )

    # ─────────────────────────────────────────
    # IMPORTANT:
    # When task is completed, resolve
    # the associated grievance.
    # ─────────────────────────────────────────

    if (
        new_status == "completed"
    ):

        issue_id = task.get(
            "issueId"
        )

        if issue_id:

            try:

                issue_object_id = (
                    ObjectId(
                        issue_id
                    )
                )

            except Exception:

                issue_object_id = None

            if issue_object_id:

                issue = issues_col.find_one({
                    "_id":
                        issue_object_id
                })

                if issue:

                    issue_timeline = (
                        issue.get(
                            "timeline"
                        )
                        or []
                    )

                    issue_timeline.append({
                        "action":
                            "Resolved",

                        "by":
                            username,

                        "role":
                            role,

                        "time":
                            now,

                        "resolutionNote":
                            resolution_note
                    })

                    issues_col.update_one(
                        {
                            "_id":
                                issue["_id"]
                        },
                        {
                            "$set": {

                                "status":
                                    "resolved",

                                "resolutionNote":
                                    resolution_note,

                                "actualResolutionDate":
                                    now,

                                "updatedAt":
                                    now,

                                "timeline":
                                    issue_timeline
                            }
                        }
                    )

                    # Audit issue resolution
                    create_audit_log(
                        entity_type="issue",

                        entity_id=
                            str(
                                issue["_id"]
                            ),

                        action=
                            "resolved",

                        performed_by=
                            username,

                        role=
                            role,

                        details={
                            "taskId":
                                str(
                                    task["_id"]
                                ),

                            "resolutionNote":
                                resolution_note
                        }
                    )

    # ─────────────────────────────────────────
    # Audit task transition
    # ─────────────────────────────────────────

    create_audit_log(
        entity_type="task",

        entity_id=
            str(
                task["_id"]
            ),

        action=
            f"status_changed_to_{new_status}",

        performed_by=
            username,

        role=
            role
    )

    # ─────────────────────────────────────────
    # Return updated task
    # ─────────────────────────────────────────

    updated_task = (
        tasks_col.find_one({
            "_id":
                task["_id"]
        })
    )

    return jsonify(
        serial(
            updated_task
        )
    )


# ─────────────────────────────────────────────────────────────
# ACCEPT
# pending → accepted
# ─────────────────────────────────────────────────────────────

@tasks_bp.route(
    "/<task_id>/accept",
    methods=["PATCH"]
)
@require_role(
    "employee",
    "faculty",
    "hod",
    "admin"
)
def accept_task(task_id):

    return change_task_status(
        task_id,
        "accepted",
        "Task Accepted"
    )


# ─────────────────────────────────────────────────────────────
# START
# accepted → investigating
# ─────────────────────────────────────────────────────────────

@tasks_bp.route(
    "/<task_id>/start",
    methods=["PATCH"]
)
@require_role(
    "employee",
    "faculty",
    "hod",
    "admin"
)
def start_task(task_id):

    return change_task_status(
        task_id,
        "investigating",
        "Investigation Started"
    )


# ─────────────────────────────────────────────────────────────
# RESOLVE
# investigating → completed
# ─────────────────────────────────────────────────────────────

@tasks_bp.route(
    "/<task_id>/resolve",
    methods=["PATCH"]
)
@require_role(
    "employee",
    "faculty",
    "hod",
    "admin"
)
def resolve_task(task_id):

    return change_task_status(
        task_id,
        "completed",
        "Task Resolved"
    )