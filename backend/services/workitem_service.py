from  database.mongo import work_items_col
from  utils.helpers import now_iso
from  services.workflow_instance_service import create_workflow_instance


def create_work_item(

    item_type,
    title,
    description,
    created_by,
    workflow_template,
    department_id=None

):

    work_item = {

        "type": item_type,

        "title": title,

        "description": description,

        "status": "created",

        "departmentId": department_id,

        "createdBy": created_by,

        "assignedTo": None,

        "createdAt": now_iso(),

        "updatedAt": now_iso()

    }

    result = work_items_col.insert_one(
        work_item
    )
    workflow_instance_id = (
        create_workflow_instance(

            template_name=
            workflow_template,

            entity_type=
            "work_item",

            entity_id=
            str(result.inserted_id),

            created_by=
            created_by

        )
    )
    work_items_col.update_one(

        {
            "_id":
            result.inserted_id
        },

        {

            "$set": {

                "workflowInstanceId":
                workflow_instance_id

            }

        }

    )

    return str(
        result.inserted_id
    )