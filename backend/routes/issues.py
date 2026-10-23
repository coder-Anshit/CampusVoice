from  flask import Blueprint, request, jsonify
from  bson import ObjectId
from  pymongo import DESCENDING
from  utils.serializers import serial
from middleware.auth_middleware import require_role
from  utils.helpers import is_toxic, now_iso
from services.moderation_service import moderate_grievance
from  services.audit_service import create_audit_log
from database.mongo import issues_col, tasks_col, users_col
from  services.task_service import (
    create_task_from_issue
)
from  services.workflow_service import (
    can_transition,
    build_timeline_event,
    canonical_issue_status,
)

# ─── Issues Blueprint ─────────────────────────────────────────────────────────

issues_bp = Blueprint("issues", __name__, url_prefix="/api/issues")

def _public_issue(issue):
    """Return an issue using the current workflow vocabulary.

    Legacy databases may contain pending/approved from the retired approval
    workflow. They are exposed as created/viewed so old records remain usable.
    """
    if not issue:
        return issue
    payload = serial(issue)
    payload["status"] = canonical_issue_status(payload.get("status"))
    return payload

@issues_bp.route("/", methods=["GET"])
def get_issues():
    return jsonify([_public_issue(d) for d in issues_col.find({}).sort("createdAt", DESCENDING)])

@issues_bp.route("/", methods=["POST"])
@require_role("student")
def add_issue():
    data = request.get_json(force=True) or {}

    # ─────────────────────────────────────────
    # Validate title
    # ─────────────────────────────────────────

    title = (data.get("title") or "").strip()
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({
            "error": "Description is required"
        }), 400

    if len(text) < 10:
        return jsonify({
            "error": "Please provide a meaningful description."
        }), 400


    # =====================================================
    # AI CONTENT MODERATION
    # =====================================================

    moderation = moderate_grievance(
        title=title,
        text=text
    )


    # =====================================================
    # AUTO REJECTION
    # =====================================================

    if moderation["decision"] == "reject":

        return jsonify({
            "success": False,
            "moderated": True,
            "rejected": True,
            "error": moderation["reason"],
            "reason": moderation["reason"],
            "category": moderation["category"],
        }), 422

    # ─────────────────────────────────────────
    # Validate anonymous flag
    # ─────────────────────────────────────────

    anonymous = data.get("anonymous", True)

    if not isinstance(anonymous, bool):
        return jsonify({
            "error": "anonymous must be true or false"
        }), 400

    # ─────────────────────────────────────────
    # IMPORTANT:
    #
    # Never trust `user` sent by frontend.
    # The authenticated JWT identity is the
    # source of truth.
    # ─────────────────────────────────────────

    authenticated_username = request.user["username"]
    authenticated_role = request.user["role"]

    public_user = (
        "Anonymous"
        if anonymous
        else authenticated_username
    )

    # ─────────────────────────────────────────
    # Create issue
    # ─────────────────────────────────────────

    now = now_iso()

    issue = {
        "title": title,

        "text": text,

        "category": data.get(
            "category",
            "General"
        ),

        "department": None,

        "assignedTo": {
            "userId": None,
            "name": None
        },

        "assignedBy": None,

        "assignedAt": None,
        "viewedBy": None,
        "viewedAt": None,

        "expectedResolutionDays": None,

        "priority": data.get(
            "priority",
            "medium"
        ),

        "status": "created",

        "timeline": [
            {
                "action": "Created",

                # Public workflow display should
                # respect anonymity.
                "by": public_user,

                "role": "student",

                "time": now
            }
        ],

        "votes": 0,

        "comments": [],

        # Internal ownership.
        # This ALWAYS contains the real
        # authenticated account.
        "createdBy": {
            "username":
                authenticated_username,

            "role":
                authenticated_role
        },

        # Public identity.
        "user": public_user,

        "anonymous": anonymous,

        "reports": 0,

        "createdAt": now,

        "updatedAt": now
    }

    issues_col.insert_one(issue)

    return jsonify(_public_issue(issue)), 201


# ─────────────────────────────────────────
# GET MY ISSUES
# ─────────────────────────────────────────

@issues_bp.route("/my", methods=["GET"])
@require_role("student")
def get_my_issues():
    """Return only grievances owned by the authenticated student."""

    username = request.user["username"]

    issues = list(
        issues_col.find({
            "$or": [
                {"createdBy.username": username},
                {
                    "user": username,
                    "anonymous": False
                }
            ]
        }).sort("createdAt", DESCENDING)
    )

    return jsonify([
        _public_issue(issue)
        for issue in issues
    ])

@issues_bp.route("/<id>/upvote", methods=["POST"])
@require_role("student", "admin", "employee", "faculty", "hod")
def upvote(id):
    """Toggle the authenticated user's vote and return the complete vote state."""
    voter_id = str(request.user.get("username") or "").strip()
    try:
        object_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid issue id"}), 400

    if not voter_id:
        return jsonify({"error": "Authenticated username is missing"}), 401

    issue = issues_col.find_one({"_id": object_id})
    if not issue:
        return jsonify({"error": "Not found"}), 404

    voter_ids = list(issue.get("voterIds", []) or [])
    if voter_id in voter_ids:
        voter_ids.remove(voter_id)
        voted = False
    else:
        voter_ids.append(voter_id)
        voted = True

    votes = len(voter_ids)
    issues_col.update_one(
        {"_id": object_id},
        {"$set": {"voterIds": voter_ids, "votes": votes, "updatedAt": now_iso()}},
    )

    return jsonify({
        "success": True,
        "voted": voted,
        "votes": votes,
        "voterIds": voter_ids,
    }), 200

@issues_bp.route("/<id>/comment", methods=["POST"])
@require_role("student", "admin", "employee", "faculty", "hod")
def add_comment(id):
    data    = request.get_json(force=True) or {}
    text    = (data.get("text") or "").strip()
    issue   = issues_col.find_one({"_id": ObjectId(id)})
    if not issue:
        return jsonify({"error": "Not found"}), 404

    comments = issue.get("comments", [])
    comments.append({
        "id":        len(comments) + 1,
        "text":      text,
        "user":      request.user.get("username", "Anonymous"),
        "anonymous": data.get("anonymous", True),
        "replies":   [],
    })
    issues_col.update_one({"_id": ObjectId(id)}, {"$set": {"comments": comments}})
    return jsonify({"success": True})

@issues_bp.route("/<issue_id>/reply/<int:comment_id>", methods=["POST"])
@require_role("student", "admin", "employee", "faculty", "hod")
def add_reply(issue_id, comment_id):
    data  = request.get_json(force=True) or {}
    text  = (data.get("text") or "").strip()
    issue = issues_col.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        return jsonify({"error": "Not found"}), 404

    comments = issue.get("comments", [])
    for comment in comments:
        if comment["id"] == comment_id:
            replies = comment.get("replies", [])
            replies.append({
                "id":        len(replies) + 1,
                "text":      text,
                "user":      data.get("user", "Anonymous"),
                "anonymous": data.get("anonymous", True),
            })
            comment["replies"] = replies
            break

    issues_col.update_one({"_id": ObjectId(issue_id)}, {"$set": {"comments": comments}})
    return jsonify({"success": True})

 
@issues_bp.route("/<id>/report", methods=["POST"])
@require_role("student", "admin", "employee", "faculty", "hod")
def report_issue(id):
    issue = issues_col.find_one({"_id": ObjectId(id)})
    if not issue:
        return jsonify({"error": "Not found"}), 404
    reports = issue.get("reports", 0) + 1
    issues_col.update_one({"_id": ObjectId(id)}, {"$set": {"reports": reports}})
    return jsonify(_public_issue(issues_col.find_one({"_id": ObjectId(id)})))

@issues_bp.route("/<id>/view", methods=["POST"])
@require_role("admin")
def mark_issue_viewed(id):
    """Explicitly acknowledge that an administrator has reviewed the issue."""
    try:
        object_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid issue id"}), 400

    issue = issues_col.find_one({"_id": object_id})
    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    current_status = canonical_issue_status(issue.get("status"))
    if current_status != "created":
        if current_status == "viewed":
            return jsonify(_public_issue(issue))
        return jsonify({
            "error": f"Only a new issue can be marked as viewed (current state: {current_status})"
        }), 400

    now = now_iso()
    timeline = issue.get("timeline") or []
    timeline.append(build_timeline_event(
        "Viewed by admin",
        request.user["username"],
        request.user["role"],
    ))

    issues_col.update_one(
        {"_id": object_id},
        {"$set": {
            "status": "viewed",
            "viewedBy": request.user["username"],
            "viewedAt": now,
            "updatedAt": now,
            "timeline": timeline,
        }}
    )

    create_audit_log(
        entity_type="issue",
        entity_id=str(object_id),
        action="viewed_by_admin",
        performed_by=request.user["username"],
        role=request.user["role"],
        details={"previousStatus": current_status, "viewedAt": now},
    )

    return jsonify(_public_issue(issues_col.find_one({"_id": object_id})))
@issues_bp.route("/<id>", methods=["DELETE"])
@require_role("admin")
def delete_issue(id):
    issues_col.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True})   
@issues_bp.route("/<id>/assign", methods=["PATCH"])
@require_role("admin")
def assign_issue(id):

    data = request.get_json(force=True) or {}

    issue = issues_col.find_one({
        "_id": ObjectId(id)
    })

    if not issue:
        return jsonify({
            "error": "Issue not found"
        }), 404

    current_status = canonical_issue_status(issue.get("status"))
    if current_status not in {"viewed", "assigned", "escalated"}:
        return jsonify({
            "error": f"Cannot assign an issue in {current_status} state"
        }), 400

    department = str(data.get("department") or "").strip()
    assigned_to = data.get("assignedTo") or {}
    expected_days = data.get("expectedDays")

    if not department:
        return jsonify({"error": "Department is required"}), 400
    if not isinstance(assigned_to, dict) or not assigned_to.get("username"):
        return jsonify({"error": "A valid employee assignment is required"}), 400
    try:
        expected_days = int(expected_days)
    except (TypeError, ValueError):
        return jsonify({"error": "expectedDays must be a positive integer"}), 400
    if expected_days <= 0:
        return jsonify({"error": "expectedDays must be a positive integer"}), 400

    assigned_user = users_col.find_one({
        "username": assigned_to.get("username"),
        "active": {"$ne": False},
    })
    if not assigned_user or assigned_user.get("role") not in {"employee", "faculty", "hod"}:
        return jsonify({"error": "Selected assignee is not an active employee, faculty member or HOD"}), 400

    assigned_to = {
        "userId": str(assigned_user["_id"]),
        "username": assigned_user["username"],
        "name": assigned_user.get("fullName") or assigned_user["username"],
        "role": assigned_user.get("role", "employee"),
    }

    now = now_iso()

    timeline = issue.get("timeline", [])

    timeline.append({

        "action": "Assigned",

        "department": department,

        "assignedTo": assigned_to.get("name"),

        "by": request.user["username"],

        "role": request.user["role"],

        "time": now

    })

    task = create_task_from_issue(
        issue=issue,
        department=department,
        assigned_to=assigned_to,
        assigned_by=request.user["username"],
        expected_days=expected_days
    )

    create_audit_log(

    entity_type="issue",

    entity_id=str(issue["_id"]),

    action="assigned",

    performed_by=request.user["username"],

    role=request.user["role"],

    details={

        "department": department,

        "assignedTo": assigned_to

    }

)

    issues_col.update_one(

        {"_id": ObjectId(id)},

        {

            "$set": {

                "status": "assigned",

                "department": department,

                "assignedTo": assigned_to,

                "assignedBy": request.user["username"],

                "assignedAt": now,

                "expectedResolutionDays": expected_days,

                "updatedAt": now,

                "timeline": timeline,

                "taskId": task,

            }

        }

    )

    updated = issues_col.find_one({

        "_id": ObjectId(id)

    })

    return jsonify(

        serial(updated)

    )

@issues_bp.route("/<id>/status", methods=["PATCH"])
@require_role("admin")
def update_issue_status(id):
    data = request.get_json(silent=True) or {}
    new_status = str(data.get("status") or "").strip().lower()

    if new_status not in {
        "created", "viewed", "assigned", "accepted",
        "investigating", "resolved", "verified", "closed", "escalated"
    }:
        return jsonify({
            "error": "Unsupported workflow state."
        }), 400

    try:
        object_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid issue id"}), 400

    issue = issues_col.find_one({"_id": object_id})
    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    current_status = canonical_issue_status(issue.get("status"))
    new_status = canonical_issue_status(new_status)
    if not can_transition(current_status, new_status):
        return jsonify({
            "error": f"Cannot move from {current_status} to {new_status}"
        }), 400

    now = now_iso()
    timeline = issue.get("timeline") or []
    timeline.append(build_timeline_event(
        new_status.title(),
        request.user["username"],
        request.user["role"],
    ))

    issues_col.update_one(
        {"_id": object_id},
        {"$set": {"status": new_status, "updatedAt": now, "timeline": timeline}}
    )
    return jsonify(_public_issue(issues_col.find_one({"_id": object_id})))

@issues_bp.route("/<id>/verify", methods=["POST"])
@require_role("student")
def verify_issue(id):
    """Student satisfaction gate: close a satisfactory resolution or escalate it."""
    data = request.get_json(silent=True) or {}
    action = str(data.get("action") or "").strip().lower()

    # Keep legacy client actions working while exposing the clearer API contract.
    if action == "verify":
        action = "close"
    elif action == "reject":
        action = "escalate"

    if action not in {"close", "escalate"}:
        return jsonify({"error": "action must be close or escalate"}), 400

    try:
        object_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid issue id"}), 400

    issue = issues_col.find_one({"_id": object_id})
    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    owner = (issue.get("createdBy") or {}).get("username")
    if owner and owner != request.user.get("username"):
        return jsonify({"error": "Only the submitting student can verify this issue"}), 403

    if canonical_issue_status(issue.get("status")) not in {"resolved", "verified"}:
        return jsonify({
            "error": "Student verification is available only after the employee resolves the issue."
        }), 400

    new_status = "closed" if action == "close" else "escalated"
    now = now_iso()
    timeline = issue.get("timeline") or []
    timeline.append(build_timeline_event(
        "Closed by student" if action == "close" else "Escalated by student",
        request.user["username"],
        request.user["role"],
    ))

    issues_col.update_one(
        {"_id": object_id},
        {"$set": {"status": new_status, "updatedAt": now, "timeline": timeline}}
    )

    create_audit_log(
        entity_type="issue",
        entity_id=str(object_id),
        action="student_closed" if action == "close" else "student_escalated",
        performed_by=request.user["username"],
        role=request.user["role"],
        details={"previousStatus": issue.get("status")},
    )

    return jsonify(_public_issue(issues_col.find_one({"_id": object_id})))

@issues_bp.route("/<id>/close", methods=["PATCH"])
@require_role("student", "admin")
def close_issue(id):

    issue = issues_col.find_one({

        "_id": ObjectId(id)

    })

    if not issue:

        return jsonify({
            "error": "Issue not found"
        }), 404

    if canonical_issue_status(issue.get("status")) not in {"resolved", "verified"}:
        return jsonify({
            "error": "Issue must be resolved before closing"
        }), 400

    if request.user.get("role") == "student":
        owner = (issue.get("createdBy") or {}).get("username")
        if owner and owner != request.user.get("username"):
            return jsonify({"error": "Only the submitting student can close this issue"}), 403

    timeline = issue.get(
        "timeline",
        []
    )

    timeline.append({

        "action": "Closed",

        "by": request.user["username"],

        "role": request.user["role"],

        "time": now_iso()

    })

    issues_col.update_one(

        {"_id": ObjectId(id)},

        {

            "$set": {

                "status": "closed",

                "updatedAt": now_iso(),

                "timeline": timeline

            }

        }

    )

    return jsonify(

        serial(

            issues_col.find_one({

                "_id": ObjectId(id)

            })

        )

    )