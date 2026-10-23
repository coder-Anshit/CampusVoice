from  bson import ObjectId

from  database.mongo import (
    workflow_instances_col
)

from  utils.helpers import now_iso

from  services.workflow_template_service import (
    get_workflow_steps
)

from  services.approval_service import (
    create_approval,
    APPROVAL_STEP_ROLE_MAP
)

from bson import ObjectId

from database.mongo import (
    work_items_col
)

from services.approver_resolver_service import (
    resolve_approver
)

def create_workflow_instance(

    template_name,

    entity_type,

    entity_id,

    created_by

):

    print("STEP A")
    steps = get_workflow_steps(template_name)
    print("STEP B", steps)

    if not steps:
        return None

    instance = {

        "templateName": template_name,

        "entityType": entity_type,

        "entityId": entity_id,

        "currentStep": steps[0],

        "steps": steps,

        "createdBy": created_by,

        "createdAt": now_iso(),

        "updatedAt": now_iso(),

        "history": [

            {

                "step": steps[0],

                "action": "created",

                "time": now_iso()

            }

        ]

    }
    print("STEP C")
    result = workflow_instances_col.insert_one(
        instance
    )
    print("STEP D")

    instance["_id"] = result.inserted_id

    move_to_next_step(
        instance
    )
    



    return str(
        result.inserted_id
    )

def move_to_next_step(

    instance

):

    print("STEP E")

    steps = instance["steps"]

    current = instance["currentStep"]

    current_index = steps.index(
        current
    )

    if current_index == len(steps) - 1:

        return None

    next_step = steps[
        current_index + 1
    ]

    role = APPROVAL_STEP_ROLE_MAP.get(
    next_step
    )

    print("STEP F", role)

    if role:

        work_item = work_items_col.find_one({

            "_id": ObjectId(
                instance["entityId"]
            )

        })

        department_id = work_item.get(
            "departmentId"
        )

        print(
            "DEPARTMENT",
            department_id
        )

        user = resolve_approver(

            department_id,

            role

        )

        print(
            "STEP G",
            user
        )

        if user:

            create_approval(

                workflow_instance_id=
                str(instance["_id"]),

                step=next_step,

                assigned_to=
                str(user["_id"]),

                created_by=
                instance["createdBy"]

            )

    history = instance.get(
        "history",
        []
    )

    history.append({

        "step": next_step,

        "action": "advanced",

        "time": now_iso()

    })

    workflow_instances_col.update_one(

        {

            "_id":
            instance["_id"]

        },

        {

            "$set": {

                "currentStep":
                next_step,

                "updatedAt":
                now_iso(),

                "history":
                history

            }

        }

    )

    return next_step

def get_workflow_instance(instance_id):

    return workflow_instances_col.find_one({

        "_id": ObjectId(instance_id)

    })