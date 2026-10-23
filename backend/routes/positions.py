from  flask import Blueprint, request, jsonify
from  bson import ObjectId

from  database.mongo import positions_col
from  middleware.auth_middleware import require_role
from  utils.serializers import serial
from  utils.helpers import now_iso
from  services.audit_service import create_audit_log

positions_bp = Blueprint(
    "positions",
    __name__,
    url_prefix="/api/positions"
)


@positions_bp.route("/", methods=["POST"])
@require_role("admin")
def create_position():

    data = request.get_json(force=True) or {}

    name = data.get("name", "").strip()

    if not name:
        return jsonify({
            "error": "Position name required"
        }), 400

    existing = positions_col.find_one({
        "name": name
    })

    if existing:
        return jsonify({
            "error": "Position already exists"
        }), 400

    position = {

    "name": name,

    "level": data.get(
        "level",
        1
    ),

    "active": True,

    "createdAt": now_iso(),

    "updatedAt": now_iso()
}

    result = positions_col.insert_one(
        position
    )

    position["_id"] = str(
        result.inserted_id
    )

    create_audit_log(

        entity_type="position",

        entity_id=position["_id"],

        action="created",

        performed_by=request.user["username"],

        role=request.user["role"]

    )

    return jsonify(position), 201


@positions_bp.route("/", methods=["GET"])
@require_role("admin")
def get_positions():

    positions = list(
        positions_col.find()
    )

    return jsonify([
        serial(position)
        for position in positions
    ])


@positions_bp.route("/<id>", methods=["PATCH"])
@require_role("admin")
def update_position(id):

    data = request.get_json(force=True) or {}

    update_data = {}

    if "name" in data:
        update_data["name"] = data["name"]

    update_data["updatedAt"] = now_iso()

    positions_col.update_one(

        {"_id": ObjectId(id)},

        {"$set": update_data}

    )

    create_audit_log(

        entity_type="position",

        entity_id=id,

        action="updated",

        performed_by=request.user["username"],

        role=request.user["role"]

    )

    updated = positions_col.find_one({

        "_id": ObjectId(id)

    })

    return jsonify(
        serial(updated)
    )


@positions_bp.route("/<id>/disable", methods=["PATCH"])
@require_role("admin")
def disable_position(id):

    positions_col.update_one(

        {"_id": ObjectId(id)},

        {

            "$set": {

                "active": False,

                "updatedAt": now_iso()

            }

        }

    )

    create_audit_log(

        entity_type="position",

        entity_id=id,

        action="disabled",

        performed_by=request.user["username"],

        role=request.user["role"]

    )

    return jsonify({
        "success": True
    })