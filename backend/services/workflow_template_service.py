
from  database.mongo import workflow_templates_col


def get_workflow_template(name):

    return workflow_templates_col.find_one({

        "name": name,

        "active": True

    })


def get_workflow_steps(name):

    template = get_workflow_template(
        name
    )

    if not template:
        return []

    return template.get(
        "steps",
        []
    )

   