from  flask import Blueprint, jsonify

from  services.dashboard_service import (
    get_system_dashboard
)

dashboard_bp = Blueprint(

    "dashboard",

    __name__,

    url_prefix="/api/dashboard"

)


@dashboard_bp.route("/", methods=["GET"])
def dashboard():

    return jsonify(

        get_system_dashboard()

    )