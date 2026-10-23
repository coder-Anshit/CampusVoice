





# __________________________ Departments Blueprints ____________________________

from  bson import ObjectId
from  flask import Blueprint, jsonify, request

from middleware.auth_middleware import require_role
from utils.serializers import serial
from utils.helpers import now_iso
from database.mongo import departments_col


departments_bp = Blueprint(

    "departments",

    __name__,

    url_prefix="/api/departments"

)

@departments_bp.route("/", methods=["POST"])
@require_role("admin")
def create_department():

    data = request.get_json(force=True) or {}

    name = data.get("name", "").strip()

    if not name:

        return jsonify({
            "error":"Department name required"
        }),400

    existing = departments_col.find_one({

        "name": name

    })

    if existing:

        return jsonify({
            "error":"Department already exists"
        }),400

    department = {

    "name": name,

    "code": data.get("code"),

    "description": data.get(
        "description",
        ""
    ),

    "active": True,

    "createdAt": now_iso()

}

    result = departments_col.insert_one(
        department
    )

    department["_id"] = str(
        result.inserted_id
    )

    return jsonify(
        department
    ),201

@departments_bp.route("/", methods=["GET"], strict_slashes=False)
@require_role("admin")
def get_departments():

    departments = list(
        departments_col.find()
    )

    return jsonify([

        serial(d)

        for d in departments

    ])

