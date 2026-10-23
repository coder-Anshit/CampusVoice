"""MongoDB connection boundary for CampusVoice.

All routes/services import collections from this module instead of constructing
Mongo clients themselves. Credentials stay in environment variables.
"""

import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "campusvoice")
MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGO_URI")

if not MONGO_URL:
    host = os.getenv("MONGO_HOST")
    username = os.getenv("MONGO_USERNAME")
    password = os.getenv("MONGO_PASSWORD")
    if host and username and password:
        MONGO_URL = (
            f"mongodb+srv://{quote_plus(username)}:{quote_plus(password)}"
            f"@{host}/{MONGO_DB_NAME}?retryWrites=true&w=majority"
        )

if not MONGO_URL:
    raise RuntimeError(
        "MongoDB is not configured. Set MONGO_URL/MONGO_URI or "
        "MONGO_HOST, MONGO_USERNAME and MONGO_PASSWORD."
    )

client = MongoClient(
    MONGO_URL,
    serverSelectionTimeoutMS=int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "10000")),
    connectTimeoutMS=int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "10000")),
)

db = client[MONGO_DB_NAME]

# Domain collections ---------------------------------------------------------
issues_col = db["issues"]
polls_col = db["polls"]
announcements_col = db["announcements"]
discussions_col = db["discussions"]
users_col = db["users"]
tasks_col = db["tasks"]
audit_logs_col = db["audit_logs"]
departments_col = db["departments"]
escalation_rules_col = db["escalation_rules"]
escalation_logs_col = db["escalation_logs"]
positions_col = db["positions"]
sla_rules_col = db["sla_rules"]
sla_violations_col = db["sla_violations"]
escalations_col = db["escalations"]
notifications_col = db["notifications"]
notification_templates_col = db["notification_templates"]
work_items_col = db["work_items"]
workflow_templates_col = db["workflow_templates"]
workflow_instances_col = db["workflow_instances"]
approvals_col = db["approvals"]
