from  database.mongo import (
    issues_col,
    tasks_col,
    escalations_col,
    notifications_col,
    sla_violations_col
)


def get_system_dashboard():

    return {

        "totalIssues":
            issues_col.count_documents({}),

        "openIssues":
            issues_col.count_documents({

                "status": {

                    "$nin": [

                        "closed"

                    ]

                }

            }),

        "totalTasks":
            tasks_col.count_documents({}),

        "openTasks":
            tasks_col.count_documents({

                "status": {

                    "$ne": "completed"

                }

            }),

        "openEscalations":
            escalations_col.count_documents({

                "status": "open"

            }),

        "slaViolations":
            sla_violations_col.count_documents({

                "status": "open"

            }),

        "notifications":
            notifications_col.count_documents({

                "read": False

            })

    }