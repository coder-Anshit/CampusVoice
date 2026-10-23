from database.mongo import (
    users_col,
    positions_col
)


def resolve_approver(department_id, role_name):

    position = positions_col.find_one({
        "name": role_name,
        "active": True
    })

    if not position:
        return None

    # Roles that are NOT tied to a specific department
    institute_level_roles = ["Dean"]

    if role_name in institute_level_roles:
        query = {
            "positionId": str(position["_id"])
        }
    else:
        query = {
            "departmentId": department_id,
            "positionId": str(position["_id"])
        }

    user = users_col.find_one(query)

    return user