# app.py — CampusVoice Flask application factory and domain registration
# ─────────────────────────────────────────────────────────────────────────────
# Key improvements over the original:
#   1.  Blueprint-per-domain  — issues / polls / announcements / discussions
#   2.  Polls stored in MongoDB — not in a Python list that resets on restart
#   3.  _id serialisation helper — no more ad-hoc str(result.inserted_id) bugs
#   4.  Fixed discussions create_discussion — used wrong `result` variable
#   5.  Fixed comment_discussion — queried by ObjectId("id") but stored as int
#   6.  Consistent JSON error responses with proper HTTP status codes
#   7.  Status endpoint for issue workflow (open / in_progress / resolved)
#   8.  CORS locked to the dev origin — swap for env var in production
# ─────────────────────────────────────────────────────────────────────────────

import datetime

from  bson import ObjectId
from flask import Flask, Blueprint, request, jsonify
from  flask_cors import CORS
from pymongo import ASCENDING, DESCENDING
import os
from  dotenv  import load_dotenv

load_dotenv()
from  flask_bcrypt import Bcrypt
import jwt
from middleware.auth_middleware import require_role
from  database.mongo import (
    issues_col,
    polls_col,
    announcements_col,
    discussions_col,
    users_col,
    tasks_col,
    audit_logs_col,
    departments_col,
    escalation_rules_col,
    escalation_logs_col,
    positions_col,
    sla_rules_col,
    sla_violations_col,
    escalations_col,
    notifications_col,
    notification_templates_col,
    work_items_col,
    workflow_templates_col,
    workflow_instances_col,
    approvals_col,
    
)
from  utils.serializers import serial 
from  utils.helpers import (is_toxic,  now_iso)
from  services.audit_service import create_audit_log
from  services.task_service import create_task_from_issue
from  routes.issues import issues_bp
from  routes.departments import departments_bp
from  routes.tasks import tasks_bp
from  routes.users import users_bp
from  routes.positions import positions_bp
from  routes.sla import sla_bp
from  routes.escalations import escalations_bp
from  routes.notifications import notifications_bp
from  routes.dashboard import dashboard_bp
from  routes.leave_requests import leave_requests_bp
from  routes.workflow_templates import workflow_templates_bp
from  routes.approvals import approvals_bp
from routes.feedback import feedback_bp
from services.feedback_service import initialize_feedback_indexes




bcrypt = Bcrypt()

# Authentication blueprint. Authentication routes live here so server.py remains
# self-contained with the existing middleware contract.
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ─── DB setup ────────────────────────────────────────────────────────────────


JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))


# ____________________________ Departments ____________________________
DEPARTMENTS = [

    "Academics",

    "Hostel",

    "Library",

    "Transport",

    "Placement",

    "Finance",

    "IT Services",

    "Administration"

]
# Indexes — safe to call on every startup (no-op if already exist)
issues_col.create_index([("status", ASCENDING), ("createdAt", DESCENDING)])
issues_col.create_index([("category", ASCENDING)])
polls_col.create_index([("voters", ASCENDING)])        # fast "already voted" check
discussions_col.create_index([("timestamp", DESCENDING)])
tasks_col.create_index([("status", ASCENDING)])
tasks_col.create_index([("assignedTo.userId", ASCENDING)])
tasks_col.create_index([("department", ASCENDING)])
tasks_col.create_index([("createdAt", DESCENDING)])


# ─── Helpers ─────────────────────────────────────────────────────────────────



def create_token(user):

    payload = {

        "username": user["username"],

        "role": user["role"],

        "exp":
        datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(hours=JWT_EXPIRE_HOURS),

        "mustChangePassword": bool(user.get("mustChangePassword", False))

    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm="HS256"
    )

def get_manager(user_id):

    user = users_col.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        return None

    reports_to = user.get("reportsTo")

    if not reports_to:
        return None

    return users_col.find_one({
        "_id": ObjectId(reports_to)
    })

def parse_object_id(value):
    """Return ObjectId or None for malformed route IDs."""
    try:
        return ObjectId(value)
    except Exception:
        return None


AUTH_ROLES = ("student", "admin", "employee", "faculty", "hod")

# ─── Authentication Routes ────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    user = users_col.find_one({

"username":username

})

    if not user:
         return jsonify({

            "error":"Invalid"

        }),401


    valid = bcrypt.check_password_hash(

        user["password"],

        password

    )


    if not valid:

        return jsonify({

            "error":"Invalid"

        }),401


    token = create_token(user)


    return jsonify({

    "token":token,

    "username":user["username"],

    "role":user["role"],

    "mustChangePassword": bool(user.get("mustChangePassword", False))

    }),200





@auth_bp.route("/change-password", methods=["POST"])
@require_role("student", "admin", "employee", "faculty", "hod")
def change_password():
    data = request.get_json(force=True) or {}
    current_password = str(data.get("currentPassword", ""))
    new_password = str(data.get("newPassword", ""))
    username = getattr(request, "user", {}).get("username")

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400
    user = users_col.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user.get("password", ""), current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    if current_password == new_password:
        return jsonify({"error": "New password must be different from the current password"}), 400

    users_col.update_one({"_id": user["_id"]}, {"$set": {
        "password": bcrypt.generate_password_hash(new_password).decode("utf-8"),
        "mustChangePassword": False,
        "passwordChangedAt": now_iso(),
    }})
    create_audit_log("user", str(user["_id"]), "password_changed", username, user.get("role"), {})
    return jsonify({"success": True, "mustChangePassword": False})


# ____________________________ Audit Logs APIs ____________________________

audit_bp = Blueprint(

    "audit",

    __name__,

    url_prefix="/api/audit"

)

@audit_bp.route("/", methods=["GET"])
@require_role("admin")
def get_audit_logs():

    logs = list(

        audit_logs_col.find()

        .sort("timestamp", DESCENDING)

        .limit(500)

    )

    return jsonify([

        serial(log)

        for log in logs

    ])



# ─── Polls Blueprint ──────────────────────────────────────────────────────────
# FIX: polls were stored in a Python list — wiped on every server restart.
# Now stored in MongoDB polls collection.

polls_bp = Blueprint("polls", __name__, url_prefix="/api/polls")

@polls_bp.route("/", methods=["GET"])
def get_polls():
    return jsonify([serial(d) for d in polls_col.find()])

@polls_bp.route("/", methods=["POST"])
@require_role(*AUTH_ROLES)
def create_poll():
    data = request.get_json(force=True) or {}
    question = (data.get("question") or "").strip()
    raw_opts  = data.get("options", [])
    options   = [o.strip() for o in raw_opts if str(o).strip()]

    if not question:
        return jsonify({"error": "Question is required"}), 400
    if len(options) < 2:
        return jsonify({"error": "At least 2 options required"}), 400

    poll = {
        
        "question": question,
        "options":  [{"text": opt, "votes": 0} for opt in options],
        "voters":   [],
        "createdAt": now_iso(),
    }
    result = polls_col.insert_one(poll)
    poll["_id"] = str(result.inserted_id)
    return jsonify(poll), 201

@polls_bp.route("/<id>/vote", methods=["POST"])
@require_role(*AUTH_ROLES)
def vote_poll(id):
    data = request.get_json(silent=True) or {}
    voter = str(data.get("voterId") or getattr(request, "user", {}).get("username") or "").strip()
    option_index = data.get("option")

    if not voter:
        return jsonify({"error": "voterId is required"}), 400
    if not isinstance(option_index, int):
        return jsonify({"error": "option must be an integer"}), 400

    object_id = parse_object_id(id)
    if object_id is None:
        return jsonify({"error": "Invalid poll ID"}), 400

    poll = polls_col.find_one({"_id": object_id})
    if not poll:
        return jsonify({"error": "Not found"}), 404
    options = poll.get("options", [])
    if option_index < 0 or option_index >= len(options):
        return jsonify({"error": "Invalid option index"}), 400
    if voter in poll.get("voters", []):
        return jsonify({"error": "Already voted"}), 400

    field = f"options.{option_index}.votes"
    result = polls_col.update_one(
        {"_id": object_id, "voters": {"$ne": voter}},
        {"$inc": {field: 1}, "$addToSet": {"voters": voter}},
    )
    if result.modified_count != 1:
        return jsonify({"error": "Vote was not recorded"}), 409
    return jsonify(serial(polls_col.find_one({"_id": object_id})))

@polls_bp.route("/<id>", methods=["DELETE"])
@require_role("admin")
def delete_poll(id):
    object_id = parse_object_id(id)
    if object_id is None:
        return jsonify({"error": "Invalid poll ID"}), 400
    result = polls_col.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True})


# ─── Announcements Blueprint ──────────────────────────────────────────────────

announcements_bp = Blueprint("announcements", __name__, url_prefix="/api/announcements")

@announcements_bp.route("/", methods=["GET"])
def get_announcements():
    docs = list(announcements_col.find().sort("timestamp", DESCENDING))
    return jsonify([serial(d) for d in docs])

@announcements_bp.route("/", methods=["POST"])
@require_role("faculty", "admin", "hod")
def create_announcement():
    data = request.get_json(force=True) or {}
    announcement = {
        "title":     data.get("title", "").strip(),
        "details":   data.get("details", "").strip(),
        "priority":  data.get("priority", "normal"),
        "author":    data.get("author", "Admin"),
        "timestamp": data.get("timestamp") or now_iso(),
    }
    if not announcement["title"]:
        return jsonify({"error": "Title is required"}), 400

    result = announcements_col.insert_one(announcement)
    announcement["_id"] = str(result.inserted_id)
    return jsonify(announcement), 201

@announcements_bp.route("/<id>", methods=["DELETE"])
@require_role("admin")
def delete_announcement(id):
    object_id = parse_object_id(id)
    if object_id is None:
        return jsonify({"error": "Invalid announcement ID"}), 400
    result = announcements_col.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True})


# ─── Discussions Blueprint ────────────────────────────────────────────────────

discussions_bp = Blueprint("discussions", __name__, url_prefix="/api/discussions")

@discussions_bp.route("/", methods=["GET"])
def get_discussions():
    docs = list(discussions_col.find().sort("timestamp", DESCENDING))
    return jsonify([serial(d) for d in docs])

@discussions_bp.route("/", methods=["POST"])
@require_role(*AUTH_ROLES)
def create_discussion():
    data = request.get_json(force=True) or {}
    discussion = {
        "title":     data.get("title", "").strip(),
        "details":   data.get("details", "").strip(),
        "author":    data.get("author", "Admin"),
        "timestamp": data.get("timestamp") or now_iso(),
        "votes":     0,
        "voters":    [],
        "comments":  [],
    }
    if not discussion["title"]:
        return jsonify({"error": "Title is required"}), 400

    # FIX: original code did `discussion["_id"] = str(result.inserted_id)` but
    # `result` was imported from  unittest — undefined at runtime.
    insert_result = discussions_col.insert_one(discussion)
    discussion["_id"] = str(insert_result.inserted_id)
    return jsonify(discussion), 201

@discussions_bp.route("/<id>/comment", methods=["POST"])
@require_role(*AUTH_ROLES)
def comment_discussion(id):
    data = request.get_json(force=True) or {}
    comment = {
        "text": (data.get("text") or "").strip(),
        "user": data.get("user", "Anonymous"),
    }
    if not comment["text"]:
        return jsonify({"error": "Comment text is required"}), 400
    object_id = parse_object_id(id)
    if object_id is None:
        return jsonify({"error": "Invalid discussion ID"}), 400
    result = discussions_col.update_one(
        {"_id": object_id},
        {"$push": {"comments": comment}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Not found"}), 404
    updated = discussions_col.find_one({"_id": object_id})
    return jsonify(serial(updated))

@discussions_bp.route("/<id>/vote", methods=["POST"])
@require_role(*AUTH_ROLES)
def vote_discussion(id):
    data = request.get_json(silent=True) or {}
    voter = str(data.get("voterId") or getattr(request, "user", {}).get("username") or "").strip()
    if not voter:
        return jsonify({"error": "voterId is required"}), 400
    object_id = parse_object_id(id)
    if object_id is None:
        return jsonify({"error": "Invalid discussion ID"}), 400

    discussion = discussions_col.find_one({"_id": object_id})
    if not discussion:
        return jsonify({"error": "Not found"}), 404

    if voter in discussion.get("voters", []):
        discussions_col.update_one(
            {"_id": object_id},
            {"$pull": {"voters": voter}, "$inc": {"votes": -1}},
        )
    else:
        discussions_col.update_one(
            {"_id": object_id},
            {"$push": {"voters": voter}, "$inc": {"votes": 1}},
        )

    return jsonify(serial(discussions_col.find_one({"_id": object_id})))

@discussions_bp.route("/<id>", methods=["DELETE"])
@require_role("admin")
def delete_discussion(id):
    object_id = parse_object_id(id)
    if object_id is None:
        return jsonify({"error": "Invalid discussion ID"}), 400
    result = discussions_col.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True})


# ______________________ Escalation Rule ______________________________________

escalation_bp = Blueprint(
    "escalations",
    __name__,
    url_prefix="/api/escalations"
)

@escalation_bp.route("/rules", methods=["POST"])
@require_role("admin")
def create_escalation_rule():

    data = request.get_json(force=True) or {}

    rule = {

        "departmentId": data.get("departmentId"),

        "fromStatus": data.get("fromStatus"),

        "hours": data.get("hours"),

        "escalateToPosition": data.get("escalateToPosition"),

        "createdAt": now_iso()

    }

    result = escalation_rules_col.insert_one(rule)

    rule["_id"] = str(result.inserted_id)

    return jsonify(rule), 201

@escalation_bp.route("/rules", methods=["GET"])
@require_role("admin")
def get_escalation_rules():

    rules = list(
        escalation_rules_col.find()
    )

    return jsonify([
        serial(rule)
        for rule in rules
    ])

    
# ─── App factory ─────────────────────────────────────────────────────────────

def create_app():
    app = Flask(__name__)

    configured_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://duplicate-break-standing-looking.trycloudflare.com",
        ).split(",")
        if origin.strip()
    ]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": configured_origins,
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS",
                ],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                ],
                "supports_credentials": True,
            }
        }
    )


    app.register_blueprint(issues_bp)
    app.register_blueprint(polls_bp)
    app.register_blueprint(announcements_bp)
    app.register_blueprint(discussions_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(audit_bp)
    app.register_blueprint(departments_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(escalations_bp)
    app.register_blueprint(positions_bp)
    app.register_blueprint(sla_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(leave_requests_bp)
    app.register_blueprint(workflow_templates_bp)
    app.register_blueprint(approvals_bp)
    app.register_blueprint(feedback_bp)

    initialize_feedback_indexes()
    




    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)