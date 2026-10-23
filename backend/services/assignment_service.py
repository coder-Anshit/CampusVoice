from  bson import ObjectId

from  database.mongo import (
    users_col,
    positions_col
)


def find_user_by_position_name(position_name):

    return users_col.find_one({
        "position": position_name
    })