"""
CampusVoice — Database Seed Script (server.py ke saath match karta hai)
========================================================================
Run: python seed.py
"""

from  pymongo import MongoClient
from  datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

# ── Apna MongoDB URI yahan daalo ──────────────────────────────
MONGO_URL = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
DB_NAME = os.getenv("MONGO_DB_NAME", "campusvoice")

if not MONGO_URL:
    host = os.getenv("MONGO_HOST")
    username = os.getenv("MONGO_USERNAME")
    password = os.getenv("MONGO_PASSWORD")
    if host and username and password:
        MONGO_URL = (
            f"mongodb+srv://{quote_plus(username)}:{quote_plus(password)}"
            f"@{host}/?retryWrites=true&w=majority"
        )

if not MONGO_URL:
    raise RuntimeError(
        "MongoDB configuration missing. Set MONGO_URI (or MONGO_URL), "
        "or MONGO_HOST/MONGO_USERNAME/MONGO_PASSWORD."
    )
# ─────────────────────────────────────────────────────────────

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
client.admin.command("ping")
db = client[DB_NAME]
bcrypt = Bcrypt()

def now_iso(days_ago=0, hours_ago=0):
    dt = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

def clear_all():
    db.users.drop()
    db.issues.drop()
    db.polls.drop()
    db.discussions.drop()
    db.announcements.drop()
    print("✓ Old data cleared")

# ── USERS ─────────────────────────────────────────────────────
# Pilot/test accounts for CampusVoice. Passwords are stored only as bcrypt hashes.
# Every seeded account starts with mustChangePassword=True.
def seed_users():
    credentials = [
        ("admin01", "CVAdmin01!", "admin", "Admin 01"),
        ("admin02", "CVAdmin02!", "admin", "Admin 02"),
        *[(f"student{i:02d}", f"CVStudent{i:02d}!", "student", f"Student {i:02d}") for i in range(1, 11)],
        *[(f"employee{i:02d}", f"CVEmployee{i:02d}!", "employee", f"Employee {i:02d}") for i in range(1, 6)],
    ]

    users = []
    for username, temporary_password, role, full_name in credentials:
        users.append({
            "username": username,
            "password": bcrypt.generate_password_hash(temporary_password).decode("utf-8"),
            "role": role,
            "fullName": full_name,
            "active": True,
            "usernameLocked": True,
            "mustChangePassword": True,
            "createdAt": now_iso(),
            "createdBy": "system-seed",
            "passwordChangedAt": None,
        })

    db.users.insert_many(users)
    print(f"✓ {len(users)} users inserted")
    print("  Admins: admin01, admin02")
    print("  Students: student01 ... student10")
    print("  Employees: employee01 ... employee05")
    print("  All 17 accounts start with mustChangePassword=True.")

# ── ISSUES ────────────────────────────────────────────────────
# Matches server.py fields: text, category, votes, voterIds, comments,
#                           user, anonymous, status, reports, createdAt
def seed_issues():
    issues = [
        {
            "text":      "Water supply cuts off every night after 11 PM. For the past two weeks there has been no water in hostel taps. Students who study late cannot even wash their hands.",
            "category":  "Hostel",
            "votes":     24,
            "voterIds":  ["student01", "student02", "student03"],
            "user":      "Himani Sharma",
            "anonymous": False,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=4),
            "comments": [
                { "id": 1, "text": "Same problem in Block C too. Going on for over 3 weeks.", "user": "Ajay Rawat",  "anonymous": False, "replies": [] },
                { "id": 2, "text": "I raised this with the warden last week but got no response.", "user": "Priya Negi", "anonymous": False, "replies": [] },
            ],
        },
        {
            "text":      "Mid-semester timetable clashes for CSE 3rd year. Data Structures and Operating Systems exams are scheduled at the same time on 28th May.",
            "category":  "Academics",
            "votes":     18,
            "voterIds":  ["student04", "student01"],
            "user":      "Shruthi Verma",
            "anonymous": False,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=5),
            "comments": [
                { "id": 1, "text": "Confirmed, both exams are in Room 201 at 10 AM. Fix this now.", "user": "Rohan Bisht", "anonymous": False, "replies": [] },
            ],
        },
        {
            "text":      "Mess food quality has dropped drastically. Dal is watery, rotis are half cooked, sabzi is the same for 3 days in a row. Students paying full mess fees deserve better.",
            "category":  "Food",
            "votes":     41,
            "voterIds":  ["student04", "student01", "student02", "student03"],
            "user":      "Anonymous",
            "anonymous": True,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=6),
            "comments": [
                { "id": 1, "text": "100% agree. The Sunday special used to be something to look forward to.",    "user": "Himani Sharma", "anonymous": False, "replies": [] },
                { "id": 2, "text": "I have started ordering from  outside every day which is getting expensive.", "user": "Ajay Rawat",    "anonymous": False, "replies": [] },
                { "id": 3, "text": "Mess committee should do a surprise inspection.",                            "user": "Priya Negi",    "anonymous": False, "replies": [] },
            ],
        },
        {
            "text":      "ML professor has been absent for 4 consecutive classes with no substitute arranged and no notice. Exams are approaching and syllabus is incomplete.",
            "category":  "Faculty",
            "votes":     13,
            "voterIds":  ["student04", "student02"],
            "user":      "Rohan Bisht",
            "anonymous": False,
            "status":    "resolved",
            "reports":   0,
            "createdAt": now_iso(days_ago=7),
            "comments": [
                { "id": 1, "text": "HOD has been informed. Extra classes will be scheduled from  next week.", "user": "Admin", "anonymous": False, "replies": [] },
            ],
        },
        {
            "text":      "Wi-Fi speed in the library is unusable during peak hours. Between 4 PM and 8 PM pages take over 2 minutes to load. Students cannot submit assignments or attend online classes.",
            "category":  "General",
            "votes":     33,
            "voterIds":  ["student04", "student01", "student02", "student05"],
            "user":      "Priya Negi",
            "anonymous": False,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=8),
            "comments": [
                { "id": 1, "text": "IT department said they are upgrading the router but gave no ETA.", "user": "Anshit Heera", "anonymous": False, "replies": [] },
            ],
        },
        {
            "text":      "Broken ceiling fan in Room 214 Block B is sparking when switched on. Maintenance informed twice but no one came. Serious safety issue in summer.",
            "category":  "Hostel",
            "votes":     9,
            "voterIds":  ["student03"],
            "user":      "Anonymous",
            "anonymous": True,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=2),
            "comments":  [],
        },
        {
            "text":      "Girls hostel gate closes at 9 PM which is too early. Library and labs are open till 10 PM. Boys hostel has no such restriction. This is unfair.",
            "category":  "Hostel",
            "votes":     29,
            "voterIds":  ["student04", "student03", "student02"],
            "user":      "Anonymous",
            "anonymous": True,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=3),
            "comments": [
                { "id": 1, "text": "This needs to be addressed immediately. Many of us miss important sessions.", "user": "Himani Sharma", "anonymous": False, "replies": [] },
            ],
        },
        {
            "text":      "Printing facility in the library is out of order for the past 10 days. Exams are near and students need to print assignments and hall tickets.",
            "category":  "General",
            "votes":     15,
            "voterIds":  ["student01", "student05"],
            "user":      "Ajay Rawat",
            "anonymous": False,
            "status":    "pending",
            "reports":   0,
            "createdAt": now_iso(days_ago=1),
            "comments":  [],
        },
    ]
    db.issues.insert_many(issues)
    print(f"✓ {len(issues)} issues inserted")

# ── POLLS ─────────────────────────────────────────────────────
# Matches server.py fields: question, options[{text, votes}], voters, createdAt
def seed_polls():
    polls = [
        {
            "question":  "Which timing should the library extend its hours to?",
            "options": [
                { "text": "Keep current (10 PM)", "votes": 12 },
                { "text": "Extend to 11 PM",       "votes": 29 },
                { "text": "Extend to midnight",    "votes": 38 },
                { "text": "24/7 with ID card",     "votes": 8  },
            ],
            "voters":    [],
            "createdAt": now_iso(days_ago=3),
        },
        {
            "question":  "What should the mess improve first?",
            "options": [
                { "text": "Better breakfast variety",    "votes": 18 },
                { "text": "Improved dinner quality",     "votes": 54 },
                { "text": "More vegetarian options",     "votes": 31 },
                { "text": "Hygienic serving conditions", "votes": 21 },
            ],
            "voters":    [],
            "createdAt": now_iso(days_ago=5),
        },
        {
            "question":  "Who should be the student rep for the Academic Council?",
            "options": [
                { "text": "Himani Sharma (CSE-3A)", "votes": 72 },
                { "text": "Ajay Rawat (ECE-2B)",   "votes": 49 },
                { "text": "Shruthi Verma (CSE-3B)","votes": 61 },
                { "text": "Priya Negi (IT-4A)",    "votes": 21 },
            ],
            "voters":    [],
            "createdAt": now_iso(days_ago=7),
        },
        {
            "question":  "Annual cultural fest — October or December?",
            "options": [
                { "text": "October (before exams)",        "votes": 189 },
                { "text": "December (after semester ends)","votes": 129 },
            ],
            "voters":    [],
            "createdAt": now_iso(days_ago=9),
        },
    ]
    db.polls.insert_many(polls)
    print(f"✓ {len(polls)} polls inserted")

# ── DISCUSSIONS ───────────────────────────────────────────────
# Matches server.py fields: title, details, author, timestamp, votes, voters, comments
def seed_discussions():
    discussions = [
        {
            "title":     "Tips for cracking campus placement interviews",
            "details":   "Placements are starting in July. Let us compile a list of topics, resources, and tips that actually helped. Drop your experience — DSA, HR rounds, aptitude, everything counts.",
            "author":    "Anshit Heera",
            "createdAt": now_iso(days_ago=2),
            "timestamp": now_iso(days_ago=2),
            "votes":     47,
            "voters":    [],
            "comments": [
                { "text": "Striver's A2Z DSA sheet is the best resource. Do at least 150 problems before interviews start.", "user": "Ajay Rawat" },
                { "text": "For HR rounds research the company for 30 minutes before. They always ask why this company.",     "user": "Shruthi Verma" },
                { "text": "Mock interviews with friends are underrated. 5 to 6 sessions made a huge difference for me.",    "user": "Priya Negi" },
            ],
        },
        {
            "title":     "Best study spots on campus — share your secret locations",
            "details":   "Library gets too crowded after 5 PM. Where else do people study? Looking for quiet corners, rooftops, empty classrooms.",
            "author":    "Himani Sharma",
            "createdAt": now_iso(days_ago=3),
            "timestamp": now_iso(days_ago=3),
            "votes":     29,
            "voters":    [],
            "comments": [
                { "text": "Reading room on 3rd floor of the new academic block is almost always empty. Great lighting too.", "user": "Rohan Bisht" },
                { "text": "Canteen terrace after 7 PM — no one goes there, good breeze, WiFi somehow works better.",        "user": "Ajay Rawat"  },
            ],
        },
        {
            "title":     "Anyone else struggling with the new relative grading policy?",
            "details":   "The new system means your grade depends on how everyone else performs. This creates unnecessary competition. Should we push back through the student council?",
            "author":    "Rohan Bisht",
            "createdAt": now_iso(days_ago=4),
            "timestamp": now_iso(days_ago=4),
            "votes":     38,
            "voters":    [],
            "comments": [
                { "text": "Relative grading hurts students in smaller elective batches where one topper skews everyone.",  "user": "Shruthi Verma" },
                { "text": "We should draft a formal petition for the next Academic Council meeting. Who is in?",           "user": "Anshit Heera"  },
                { "text": "I support this. Absolute grading was more predictable and fair for everyone.",                  "user": "Himani Sharma" },
            ],
        },
        {
            "title":     "Weekend trek — Kasol or Kheerganga?",
            "details":   "Group of 10 planning a trek this weekend. Kasol is easier to reach but Kheerganga has better views. Budget around 2500 per person.",
            "author":    "Priya Negi",
            "createdAt": now_iso(days_ago=5),
            "timestamp": now_iso(days_ago=5),
            "votes":     21,
            "voters":    [],
            "comments": [
                { "text": "Kheerganga 100%. The hot spring at the top is worth every step. Start early to beat the crowd.", "user": "Ajay Rawat" },
            ],
        },
    ]
    db.discussions.insert_many(discussions)
    print(f"✓ {len(discussions)} discussions inserted")

# ── ANNOUNCEMENTS ─────────────────────────────────────────────
# Matches server.py fields: title, details, priority, author, timestamp
def seed_announcements():
    announcements = [
        {
            "title":     "End-semester examination schedule released",
            "details":   "The end-semester exam timetable for May-June 2026 is now on the portal. Download hall tickets before 25th May. Report discrepancies to the exam controller by 23rd May.",
            "priority":  "important",
            "author":    "Admin",
            "timestamp": now_iso(days_ago=1),
        },
        {
            "title":     "Hostel fee deadline — 31st May",
            "details":   "All hostel students must clear fee dues for 2025-26 by 31st May 2026. Late payments attract Rs 50 per day fine. Contact hostel office Room 104 Admin Block.",
            "priority":  "urgent",
            "author":    "Admin",
            "createdAt": now_iso(days_ago=2),
            "timestamp": now_iso(days_ago=2),
        },
        {
            "title":     "Campus recruitment — Infosys and Wipro on 10th and 12th June",
            "details":   "Eligible students (CGPA 6.5+, no backlogs) must register on the TPO portal by 30th May. Pre-placement talks on 5th June in the Seminar Hall.",
            "priority":  "normal",
            "author":    "Admin",
            "createdAt": now_iso(days_ago=3),
            "timestamp": now_iso(days_ago=3),
        },
        {
            "title":     "Annual Sports Day — registrations open till 28th May",
            "details":   "Sports Day is on 7th June. Register for 100m sprint, badminton, table tennis, chess, and carrom at the Sports Room, Ground Floor Main Block.",
            "priority":  "normal",
            "author":    "Admin",
            "createdAt": now_iso(days_ago=4),
            "timestamp": now_iso(days_ago=4),
        },
        {
            "title":     "Power shutdown — 22nd May, 8 AM to 2 PM",
            "details":   "Complete power shutdown across campus for electrical maintenance. Includes hostels, academic blocks, and library. No generator backup available.",
            "priority":  "urgent",
            "author":    "Admin",
            "createdAt": now_iso(days_ago=5),
            "timestamp": now_iso(days_ago=5),
        },
        {
            "title":     "New mess menu from  1st June",
            "details":   "Based on student feedback the mess committee has revised the weekly menu. Expanded breakfast, South Indian option on Thursdays, improved Sunday specials.",
            "priority":  "normal",
            "author":    "Admin",
            "createdAt": now_iso(days_ago=6),
            "timestamp": now_iso(days_ago=6),
        },
    ]
    db.announcements.insert_many(announcements)
    print(f"✓ {len(announcements)} announcements inserted")


if __name__ == "__main__":
    print("\n🌱 CampusVoice — Database seed kar raha hoon...\n")
    clear_all()
    seed_users()
    seed_issues()
    seed_polls()
    seed_discussions()
    seed_announcements()
    print("\n✅ Done! Ab server.py chala aur site refresh kar.\n")
    print("Login karo with seeded temporary credentials:")
    print("  Admins   → admin01 / CVAdmin01!   |   admin02 / CVAdmin02!")
    print("  Students → student01 / CVStudent01! ... student10 / CVStudent10!")
    print("  Employees → employee01 / CVEmployee01! ... employee05 / CVEmployee05!")
    print("  All accounts must change password on first login.")
    client.close()