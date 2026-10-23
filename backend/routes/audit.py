# ____________________________ Audit Logs APIs ____________________________

from  flask import Blueprint


from  flask import jsonify

from utils.serializers import serial
from middleware.auth_middleware import require_role
from database.mongo import audit_logs_col

from  pymongo import DESCENDING


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
