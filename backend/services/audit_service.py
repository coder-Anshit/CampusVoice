from  database.mongo import audit_logs_col
from  utils.helpers import now_iso



def create_audit_log(

    entity_type,
    entity_id,
    action,
    performed_by,
    role,
    details=None

):

    audit_logs_col.insert_one({

        "entityType": entity_type,

        "entityId": entity_id,

        "action": action,

        "performedBy": performed_by,

        "role": role,

        "details": details or {},

        "timestamp": now_iso()

    })
