from  database.mongo import tasks_col
from  services.sla_service import check_task_sla


def run_sla_checks():

    tasks = list(
        tasks_col.find()
    )

    checked = 0
    violations = 0

    for task in tasks:

        checked += 1

        if check_task_sla(task):

            violations += 1

    return {

        "checked": checked,

        "violations": violations

    }