from  bson import ObjectId

from  database.mongo import users_col


def get_reporting_chain(user_id):

    chain = []

    current = users_col.find_one({
        "_id": ObjectId(user_id)
    })

    while current:

        chain.append({

            "userId": str(current["_id"]),

            "username": current.get("username"),

            "fullName": current.get("fullName"),

            "positionId": current.get("positionId"),

            "departmentId": current.get("departmentId")

        })

        reports_to = current.get(
            "reportsTo"
        )

        if not reports_to:
            break

        current = users_col.find_one({

            "_id": ObjectId(reports_to)

        })

    return chain