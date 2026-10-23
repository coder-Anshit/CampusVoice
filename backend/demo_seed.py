from datetime import datetime, timezone, timedelta

from flask_bcrypt import Bcrypt

from database.mongo import (
    users_col,
    departments_col,
    issues_col,
    polls_col,
    announcements_col,
    discussions_col,
)

bcrypt = Bcrypt()


# =========================================================
# DEMO UNIVERSITY
# =========================================================

UNIVERSITY = "Himalayan Institute of Technology"


DEPARTMENTS = [
    {
        "name": "Academics",
        "code": "ACAD",
    },
    {
        "name": "Hostel",
        "code": "HOSTEL",
    },
    {
        "name": "Library",
        "code": "LIB",
    },
    {
        "name": "Transport",
        "code": "TRANS",
    },
    {
        "name": "Placement",
        "code": "PLACE",
    },
    {
        "name": "Finance",
        "code": "FIN",
    },
    {
        "name": "IT Services",
        "code": "IT",
    },
    {
        "name": "Administration",
        "code": "ADMIN",
    },
]


# =========================================================
# USERS
# =========================================================

USERS = [
    {
        "username": "hit_admin",
        "password": "HIT@Admin123",
        "role": "admin",
        "fullName": "Rohan Mehta",
        "department": "Administration",
    },
    {
        "username": "hod_cse",
        "password": "HIT@Hod123",
        "role": "hod",
        "fullName": "Dr. Arjun Sharma",
        "department": "Academics",
    },
    {
        "username": "faculty_cse",
        "password": "HIT@Faculty123",
        "role": "faculty",
        "fullName": "Prof. Neha Kapoor",
        "department": "Academics",
    },
    {
        "username": "faculty_hostel",
        "password": "HIT@Hostel123",
        "role": "faculty",
        "fullName": "Prof. Vikram Singh",
        "department": "Hostel",
    },
    {
        "username": "faculty_library",
        "password": "HIT@Library123",
        "role": "faculty",
        "fullName": "Ms. Priya Nair",
        "department": "Library",
    },
    {
        "username": "student_cse01",
        "password": "HIT@Student123",
        "role": "student",
        "fullName": "Aarav Verma",
        "department": "Academics",
        "course": "B.Tech CSE",
        "semester": 7,
        "studentId": "HIT-CSE-23001",
    },
    {
        "username": "student_cse02",
        "password": "HIT@Student123",
        "role": "student",
        "fullName": "Ananya Gupta",
        "department": "Academics",
        "course": "B.Tech CSE",
        "semester": 5,
        "studentId": "HIT-CSE-24018",
    },
    {
        "username": "student_ece01",
        "password": "HIT@Student123",
        "role": "student",
        "fullName": "Kabir Thakur",
        "department": "Academics",
        "course": "B.Tech ECE",
        "semester": 7,
        "studentId": "HIT-ECE-23011",
    },
]


# =========================================================
# HELPERS
# =========================================================

def now(offset_days=0):
    value = datetime.now(timezone.utc) - timedelta(days=offset_days)
    return value.isoformat()


def add_user(user):
    password = user.pop("password")

    existing = users_col.find_one(
        {"username": user["username"]}
    )

    user["password"] = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")

    user["active"] = True
    user["createdAt"] = now()

    if existing:
        users_col.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    **user,
                    "password": user["password"],
                }
            },
        )
    else:
        users_col.insert_one(user)


# =========================================================
# DEPARTMENTS
# =========================================================

def seed_departments():
    for department in DEPARTMENTS:
        departments_col.update_one(
            {"name": department["name"]},
            {
                "$set": {
                    **department,
                    "institution": UNIVERSITY,
                }
            },
            upsert=True,
        )


# =========================================================
# USERS
# =========================================================

def seed_users():
    for raw in USERS:
        user = dict(raw)
        add_user(user)


# =========================================================
# ISSUES
# =========================================================

def seed_issues():
    issues = [
        {
            "title": "CSE Lab systems frequently unavailable",
            "text": (
                "Several systems in the CSE laboratory are unavailable "
                "during practical sessions. Students are unable to "
                "complete assigned laboratory work."
            ),
            "category": "Academics",
            "department": "Academics",
            "priority": "high",
            "status": "pending",
            "user": "Anonymous",
            "anonymous": True,
            "createdBy": {
                "username": "student_cse01",
                "role": "student",
            },
        },
        {
            "title": "Hostel Wi-Fi connectivity issues",
            "text": (
                "Internet connectivity in Block B becomes extremely "
                "slow during evening hours and frequently disconnects."
            ),
            "category": "Hostel",
            "department": "Hostel",
            "priority": "high",
            "status": "assigned",
            "user": "Anonymous",
            "anonymous": True,
            "createdBy": {
                "username": "student_cse02",
                "role": "student",
            },
        },
        {
            "title": "Library reading room needs better lighting",
            "text": (
                "Students using the evening reading room have reported "
                "insufficient lighting in several sections."
            ),
            "category": "Library",
            "department": "Library",
            "priority": "medium",
            "status": "investigating",
            "user": "student_cse01",
            "anonymous": False,
            "createdBy": {
                "username": "student_cse01",
                "role": "student",
            },
        },
        {
            "title": "Bus route timing needs review",
            "text": (
                "The evening campus shuttle leaves before several "
                "laboratory sessions finish, making transportation "
                "difficult for students."
            ),
            "category": "Transport",
            "department": "Transport",
            "priority": "medium",
            "status": "approved",
            "user": "Anonymous",
            "anonymous": True,
            "createdBy": {
                "username": "student_ece01",
                "role": "student",
            },
        },
        {
            "title": "Placement cell appointment scheduling",
            "text": (
                "Students are experiencing delays while booking "
                "appointments with the placement office."
            ),
            "category": "Placement",
            "department": "Placement",
            "priority": "medium",
            "status": "resolved",
            "user": "student_ece01",
            "anonymous": False,
            "createdBy": {
                "username": "student_ece01",
                "role": "student",
            },
            "resolutionNote": (
                "A new appointment schedule has been published "
                "and additional consultation slots have been added."
            ),
        },
        {
            "title": "Fee receipt download problem",
            "text": (
                "The student portal occasionally fails to generate "
                "downloadable fee receipts after successful payment."
            ),
            "category": "Finance",
            "department": "Finance",
            "priority": "high",
            "status": "verified",
            "user": "student_cse02",
            "anonymous": False,
            "createdBy": {
                "username": "student_cse02",
                "role": "student",
            },
            "resolutionNote": (
                "The finance portal issue was corrected and receipt "
                "generation is now functioning."
            ),
        },
        {
            "title": "Smart classroom projector not working",
            "text": (
                "The projector in CSE classroom C-204 has stopped "
                "working and lectures are being affected."
            ),
            "category": "Academics",
            "department": "Academics",
            "priority": "medium",
            "status": "closed",
            "user": "Anonymous",
            "anonymous": True,
            "createdBy": {
                "username": "student_cse01",
                "role": "student",
            },
            "resolutionNote": (
                "Projector replaced and classroom equipment tested."
            ),
        },
        {
            "title": "Mess menu feedback for weekend meals",
            "text": (
                "Students have requested more variety in the weekend "
                "mess menu."
            ),
            "category": "Hostel",
            "department": "Hostel",
            "priority": "low",
            "status": "escalated",
            "user": "Anonymous",
            "anonymous": True,
            "createdBy": {
                "username": "student_cse02",
                "role": "student",
            },
        },
    ]

    for index, issue in enumerate(issues):
        created = now(index + 1)
        issue.update(
            {
                "institution": UNIVERSITY,
                "assignedTo": {
                    "userId": None,
                    "name": None,
                },
                "assignedBy": None,
                "assignedAt": None,
                "expectedResolutionDays": None,
                "timeline": [
                    {
                        "action": "Created",
                        "by": (
                            "Anonymous"
                            if issue["anonymous"]
                            else issue["createdBy"]["username"]
                        ),
                        "role": "student",
                        "time": created,
                    }
                ],
                "votes": index % 7,
                "voterIds": [],
                "comments": [],
                "reports": 0,
                "createdAt": created,
                "updatedAt": created,
            }
        )

        if issue["status"] in {
            "assigned",
            "investigating",
            "resolved",
            "verified",
            "closed",
        }:
            issue["assignedTo"] = {
                "userId": (
                    "faculty_hostel"
                    if issue["department"] == "Hostel"
                    else "faculty_cse"
                ),
                "username": (
                    "faculty_hostel"
                    if issue["department"] == "Hostel"
                    else "faculty_cse"
                ),
                "name": (
                    "Prof. Vikram Singh"
                    if issue["department"] == "Hostel"
                    else "Prof. Neha Kapoor"
                ),
                "role": "faculty",
            }

            issue["assignedBy"] = "hit_admin"
            issue["assignedAt"] = now(max(index, 1))
            issue["expectedResolutionDays"] = 3

            issue["timeline"].append(
                {
                    "action": "Assigned",
                    "by": "hit_admin",
                    "role": "admin",
                    "time": issue["assignedAt"],
                }
            )

        if issue["status"] in {
            "investigating",
            "resolved",
            "verified",
            "closed",
        }:
            issue["timeline"].append(
                {
                    "action": "Accepted",
                    "by": issue["assignedTo"]["username"],
                    "role": "faculty",
                    "time": now(max(index - 1, 0)),
                }
            )

            issue["timeline"].append(
                {
                    "action": "Investigating",
                    "by": issue["assignedTo"]["username"],
                    "role": "faculty",
                    "time": now(max(index - 2, 0)),
                }
            )

        if issue["status"] in {
            "resolved",
            "verified",
            "closed",
        }:
            issue["timeline"].append(
                {
                    "action": "Resolved",
                    "by": issue["assignedTo"]["username"],
                    "role": "faculty",
                    "time": now(max(index - 3, 0)),
                }
            )
            issue["actualResolutionDate"] = now(
                max(index - 3, 0)
            )

        if issue["status"] == "verified":
            issue["timeline"].append(
                {
                    "action": "Verified",
                    "by": issue["createdBy"]["username"],
                    "role": "student",
                    "time": now(max(index - 2, 0)),
                }
            )

        if issue["status"] == "closed":
            issue["timeline"].append(
                {
                    "action": "Closed",
                    "by": "hit_admin",
                    "role": "admin",
                    "time": now(max(index - 1, 0)),
                }
            )

        if issue["status"] == "escalated":
            issue["timeline"].append(
                {
                    "action": "Escalated",
                    "by": issue["createdBy"]["username"],
                    "role": "student",
                    "time": now(0),
                }
            )

        issues_col.update_one(
            {
                "title": issue["title"],
                "createdBy.username": issue[
                    "createdBy"
                ]["username"],
            },
            {"$set": issue},
            upsert=True,
        )


# =========================================================
# POLLS
# =========================================================

def seed_polls():
    polls = [
        {
            "question": "How would you rate campus Wi-Fi?",
            "options": [
                {"text": "Excellent", "votes": 18},
                {"text": "Good", "votes": 31},
                {"text": "Average", "votes": 24},
                {"text": "Poor", "votes": 9},
            ],
        },
        {
            "question": "Which campus facility needs the most improvement?",
            "options": [
                {"text": "Hostel", "votes": 22},
                {"text": "Library", "votes": 14},
                {"text": "Transport", "votes": 18},
                {"text": "Academic Labs", "votes": 27},
            ],
        },
        {
            "question": "Preferred timing for student support desk?",
            "options": [
                {"text": "9 AM – 1 PM", "votes": 16},
                {"text": "1 PM – 4 PM", "votes": 21},
                {"text": "4 PM – 6 PM", "votes": 34},
            ],
        },
    ]

    for poll in polls:
        poll["institution"] = UNIVERSITY
        poll["voters"] = []
        poll["createdAt"] = now(2)

        polls_col.update_one(
            {
                "question": poll["question"],
                "institution": UNIVERSITY,
            },
            {"$set": poll},
            upsert=True,
        )


# =========================================================
# ANNOUNCEMENTS
# =========================================================

def seed_announcements():
    announcements = [
        {
            "title": "Mid-Semester Examination Schedule Released",
            "details": (
                "The mid-semester examination schedule has been "
                "published. Students are requested to check their "
                "department notice board."
            ),
            "priority": "normal",
            "author": "HIT Administration",
        },
        {
            "title": "Campus Wi-Fi Maintenance",
            "details": (
                "Scheduled network maintenance will take place "
                "between 11 PM and 1 AM tonight."
            ),
            "priority": "normal",
            "author": "IT Services",
        },
        {
            "title": "Placement Drive — TechNova Systems",
            "details": (
                "TechNova Systems will conduct a campus recruitment "
                "drive for eligible final-year students."
            ),
            "priority": "high",
            "author": "Placement Cell",
        },
        {
            "title": "Library Extended Hours During Examinations",
            "details": (
                "The central library will remain open until 10 PM "
                "during the examination preparation period."
            ),
            "priority": "normal",
            "author": "Central Library",
        },
    ]

    for item in announcements:
        item["institution"] = UNIVERSITY
        item["timestamp"] = now(1)

        announcements_col.update_one(
            {
                "title": item["title"],
                "institution": UNIVERSITY,
            },
            {"$set": item},
            upsert=True,
        )


# =========================================================
# DISCUSSIONS
# =========================================================

def seed_discussions():
    discussions = [
        {
            "title": "Should the library remain open later?",
            "details": (
                "What closing time would be most useful for students "
                "during examination preparation?"
            ),
            "author": "student_cse01",
            "votes": 14,
        },
        {
            "title": "Suggestions for improving campus transport",
            "details": (
                "Share practical suggestions for improving shuttle "
                "routes and timings."
            ),
            "author": "student_ece01",
            "votes": 9,
        },
        {
            "title": "Ideas for better student support",
            "details": (
                "What changes would make it easier to get help from "
                "university administration?"
            ),
            "author": "student_cse02",
            "votes": 21,
        },
    ]

    for item in discussions:
        item.update(
            {
                "institution": UNIVERSITY,
                "voters": [],
                "comments": [],
                "timestamp": now(2),
            }
        )

        discussions_col.update_one(
            {
                "title": item["title"],
                "institution": UNIVERSITY,
            },
            {"$set": item},
            upsert=True,
        )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    print()
    print("=" * 60)
    print("CAMPUSVOICE DEMO UNIVERSITY SEED")
    print(UNIVERSITY)
    print("=" * 60)

    seed_departments()
    print("✓ Departments")

    seed_users()
    print("✓ Users")

    seed_issues()
    print("✓ Grievances")

    seed_polls()
    print("✓ Polls")

    seed_announcements()
    print("✓ Announcements")

    seed_discussions()
    print("✓ Discussions")

    print()
    print("Demo data ready.")
    print()
    print("Admin      : hit_admin / HIT@Admin123")
    print("HOD        : hod_cse / HIT@Hod123")
    print("Faculty    : faculty_cse / HIT@Faculty123")
    print("Student    : student_cse01 / HIT@Student123")
    print()