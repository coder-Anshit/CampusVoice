from  database.mongo import (
    notifications_col
)

from  utils.helpers import now_iso


def create_notification(

    user_id,

    title,

    message,

    notification_type="system"

):

    notification = {

        "userId": user_id,

        "title": title,

        "message": message,

        "type": notification_type,

        "read": False,

        "createdAt": now_iso()

    }

    result = notifications_col.insert_one(
        notification
    )

    return str(
        result.inserted_id
    )