from flask import Blueprint, jsonify, request
from bson import ObjectId
from pymongo import DESCENDING
from middleware.auth_middleware import require_role
from utils.serializers import serial
from utils.helpers import now_iso
from database.mongo import polls_col

polls_bp=Blueprint("polls",__name__,url_prefix="/api/polls")
@polls_bp.route("/",methods=["GET"],strict_slashes=False)
def get_polls(): return jsonify([serial(d) for d in polls_col.find().sort("createdAt",DESCENDING)])
@polls_bp.route("/",methods=["POST"],strict_slashes=False)
@require_role("student","admin")
def create_poll():
 data=request.get_json(silent=True) or {}; q=str(data.get("question") or "").strip(); opts=[str(o).strip() for o in (data.get("options") or []) if str(o).strip()]
 if not q:return jsonify({"error":"Question is required"}),400
 if len(opts)<2:return jsonify({"error":"At least 2 options required"}),400
 actor=getattr(request,"user",{}) or {}; poll={"question":q,"options":[{"text":o,"votes":0} for o in opts],"voters":[],"createdBy":actor.get("username"),"createdByRole":actor.get("role"),"createdAt":now_iso()}
 result=polls_col.insert_one(poll); poll["_id"]=result.inserted_id; return jsonify(serial(poll)),201
@polls_bp.route("/<id>/vote",methods=["POST"])
@require_role("student","admin")
def vote_poll(id):
 data=request.get_json(silent=True) or {}; voter=request.user.get("username")
 try: idx=int(data.get("option")); oid=ObjectId(id)
 except Exception:return jsonify({"error":"Invalid poll or option."}),400
 poll=polls_col.find_one({"_id":oid})
 if not poll:return jsonify({"error":"Poll not found."}),404
 if voter in poll.get("voters",[]):return jsonify({"error":"Already voted."}),409
 options=poll.get("options",[])
 if idx<0 or idx>=len(options):return jsonify({"error":"Invalid option index."}),400
 options[idx]["votes"]=int(options[idx].get("votes",0))+1; polls_col.update_one({"_id":oid},{"$set":{"options":options},"$push":{"voters":voter}}); return jsonify(serial(polls_col.find_one({"_id":oid})))
@polls_bp.route("/<id>",methods=["DELETE"])
@require_role("admin")
def delete_poll(id):
 try: oid=ObjectId(id)
 except Exception:return jsonify({"error":"Invalid poll id."}),400
 polls_col.delete_one({"_id":oid}); return jsonify({"success":True})
