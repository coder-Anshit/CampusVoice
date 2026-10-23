# Drop-in replacement for backend/routes/users.py (or routes/users.py in the current backend layout).
# Adds the missing admin-only pilot account creation endpoint used by the mobile and desktop Users UI.

from flask import Blueprint, jsonify, request
from bson import ObjectId
from flask_bcrypt import Bcrypt
import re
import secrets

from middleware.auth_middleware import require_role
from utils.serializers import serial
from utils.helpers import now_iso
from database.mongo import users_col
from services.hierarchy_service import get_reporting_chain

users_bp = Blueprint("users", __name__, url_prefix="/api/users")
bcrypt = Bcrypt()

ROLE_PREFIXES = {
    "student": "student",
    "employee": "employee",
    "admin": "admin",
    "faculty": "faculty",
    "hod": "hod",
}


def _next_available_username(role, start=1):
    """Return the first unused deterministic pilot username for a role."""
    prefix = ROLE_PREFIXES.get(role, role)
    # Keep the scan bounded, but comfortably above normal pilot sizes.
    for number in range(max(1, int(start)), 10001):
        candidate = f"{prefix}{number:02d}"
        if not users_col.find_one({"username": candidate}, {"_id": 1}):
            return candidate
    return None


def _category_payload(data):
    """Normalize academic/user grouping metadata used by admin provisioning."""
    raw = data.get("category") if isinstance(data.get("category"), dict) else {}
    program = str(raw.get("program", data.get("program", "")) or "").strip()
    course = str(raw.get("course", data.get("course", "")) or "").strip()
    semester = str(raw.get("semester", data.get("semester", "")) or "").strip()
    section = str(raw.get("section", data.get("section", "")) or "").strip()
    batch = str(raw.get("batch", data.get("batch", "")) or "").strip()
    category_name = str(raw.get("name", data.get("categoryName", "")) or "").strip()
    key_parts = [x for x in [program, course, f"Sem {semester}" if semester else "", f"Sec {section}" if section else "", batch] if x]
    return {
        "name": category_name or " / ".join(key_parts) or "Uncategorized",
        "program": program,
        "course": course,
        "semester": semester,
        "section": section,
        "batch": batch,
    }


def _create_user_record(username, role, full_name, temporary_password, actor, category=None, roll_number=None):
    """Create one admin-provisioned account and return its credential payload."""
    user = {
        "username": username,
        "password": bcrypt.generate_password_hash(temporary_password).decode("utf-8"),
        "role": role,
        "fullName": full_name or username,
        "active": True,
        "usernameLocked": True,
        "mustChangePassword": True,
        "createdAt": now_iso(),
        "createdBy": actor.get("username", "admin"),
        "passwordChangedAt": None,
        "category": category or {"name": "Uncategorized", "program": "", "course": "", "semester": "", "section": "", "batch": ""},
        "rollNumber": roll_number,
        "attendanceEnabled": role == "student",
        "profile": {},
    }
    result = users_col.insert_one(user)
    created = users_col.find_one({"_id": result.inserted_id}, {"password": 0})
    return {
        "user": serial(created),
        "temporaryPassword": temporary_password,
    }



@users_bp.route("/", methods=["GET"], strict_slashes=False)
@require_role("admin")
def get_users():
    users = list(users_col.find({}, {"password": 0}))
    return jsonify([serial(user) for user in users])


@users_bp.route("/pilot", methods=["POST"])
@require_role("admin")
def create_pilot_user():
    """Create one admin-controlled account with a one-time temporary password."""
    data = request.get_json(silent=True) or {}

    username = str(data.get("username", "")).strip().lower()
    full_name = str(data.get("fullName", "")).strip()
    role = str(data.get("role", "student")).strip().lower()
    supplied_password = str(data.get("temporaryPassword", "")).strip()
    category = _category_payload(data)
    roll_number = str(data.get("rollNumber", "")).strip() or None

    allowed_roles = set(ROLE_PREFIXES)

    # If the client leaves username blank, generate the next available pilot
    # username server-side. This avoids stale frontend user lists/race conditions.
    if not username:
        username = _next_available_username(role)
        if not username:
            return jsonify({"error": f"No available {role} usernames remain."}), 409

    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{2,31}", username):
        return jsonify({
            "error": "Username must be 3-32 characters and use letters, numbers, dot, underscore or hyphen."
        }), 400

    if role not in allowed_roles:
        return jsonify({"error": "Invalid role."}), 400

    if users_col.find_one({"username": username}, {"_id": 1}):
        return jsonify({"error": f"Username '{username}' already exists."}), 409

    temporary_password = supplied_password or ("CV-" + secrets.token_urlsafe(9))
    if len(temporary_password) < 8:
        return jsonify({"error": "Temporary password must be at least 8 characters."}), 400

    actor = getattr(request, "user", {}) or {}
    created = _create_user_record(
        username=username,
        role=role,
        full_name=full_name,
        temporary_password=temporary_password,
        actor=actor,
        category=category,
        roll_number=roll_number,
    )

    return jsonify({
        "message": "User created successfully.",
        **created,
    }), 201


@users_bp.route("/provision", methods=["POST"])
@require_role("admin")
def provision_users():
    """
    Provision multiple deterministic pilot accounts atomically from the
    server's current MongoDB state.

    Request:
      {"role":"student","count":10}

    Response contains the generated one-time credentials for each account.
    """
    data = request.get_json(silent=True) or {}
    role = str(data.get("role", "student")).strip().lower()

    try:
        count = int(data.get("count", 1))
    except (TypeError, ValueError):
        return jsonify({"error": "count must be an integer."}), 400

    if role not in ROLE_PREFIXES:
        return jsonify({"error": "Invalid role."}), 400
    if count < 1 or count > 100:
        return jsonify({"error": "count must be between 1 and 100."}), 400

    actor = getattr(request, "user", {}) or {}
    category = _category_payload(data)
    try:
        start_roll = int(data.get("startRollNumber", 1))
    except (TypeError, ValueError):
        return jsonify({"error": "startRollNumber must be an integer."}), 400
    accounts = []

    # Re-check MongoDB before every insert so concurrent admin requests don't
    # reuse a username.
    for _ in range(count):
        username = _next_available_username(role)
        if not username:
            break

        temporary_password = "CV-" + secrets.token_urlsafe(9)
        try:
            roll_number = start_roll + len(accounts)
            created = _create_user_record(
                username=username,
                role=role,
                full_name=f"{category['name']} · {roll_number}" if role == "student" else username,
                temporary_password=temporary_password,
                actor=actor,
                category=category,
                roll_number=roll_number,
            )
            accounts.append({
                "username": created["user"]["username"],
                "role": created["user"]["role"],
                "fullName": created["user"].get("fullName"),
                "temporaryPassword": created["temporaryPassword"],
                "category": created["user"].get("category"),
                "rollNumber": created["user"].get("rollNumber"),
            })
        except Exception:
            # If a concurrent request won the username, move on to the next.
            continue

    if not accounts:
        return jsonify({
            "error": f"No available {role} usernames remain.",
            "created": 0,
            "accounts": [],
        }), 409

    return jsonify({
        "message": f"Provisioned {len(accounts)} {role} account(s).",
        "created": len(accounts),
        "requested": count,
        "accounts": accounts,
    }), 201


@users_bp.route("/<id>", methods=["PATCH"])
@require_role("admin")
def update_user(id):
    data = request.get_json(force=True) or {}
    update_data = {}
    allowed = ["fullName", "email", "departmentId", "positionId", "employeeId", "studentId", "reportsTo", "active", "category", "rollNumber", "attendanceEnabled", "profile"]
    for field in allowed:
        if field in data:
            update_data[field] = data[field]
    users_col.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    updated = users_col.find_one({"_id": ObjectId(id)}, {"password": 0})
    return jsonify(serial(updated))


@users_bp.route("/hierarchy/<id>", methods=["GET"])
@require_role("admin")
def user_hierarchy(id):
    return jsonify(get_reporting_chain(id))
