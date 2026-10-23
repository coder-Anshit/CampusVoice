"""
CampusVoice — Seed: Student Research Feedback Form
==================================================

Creates the research survey:
"Bridging the Learning Gap in Computer Science Education"

Run from the backend environment:
    python seed_student_learning_gap_survey.py

Required environment:
    MONGO_URL
Optional:
    MONGO_DB_NAME (default: campusvoice)

NOTE
----
The feedback UI/backend now supports native multi-select checkbox questions
with optional maximum-selection limits. This older survey remains a separate
research instrument; use seed_unfiltered_classroom_survey.py to seed the
"The Unfiltered Classroom" questionnaire.
"""
from pymongo import MongoClient

from datetime import datetime, timezone
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
load_dotenv()



MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("MONGO_DB_NAME", "campusvoice")

if not MONGO_URL:
    raise RuntimeError(
        "MONGO_URL environment variable is required. "
        "Set it before running this script."
    )


FORM_TITLE = "Bridging the Learning Gap in Computer Science Education"


def now():
    return datetime.now(timezone.utc)


def q(question_id, text, qtype="long_text", required=True, options=None):
    return {
        "id": question_id,
        "question": text,
        "type": qtype,
        "required": required,
        "options": options or [],
    }


def build_questions():
    questions = []

    # ---------------------------------------------------------
    # SECTION 1 — Student Profile
    # ---------------------------------------------------------
    questions += [
        q(
            "q1",
            "Q1. What is your current year of study?",
            "mcq",
            True,
            ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"],
        ),
        q(
            "q2",
            "Q2. What is your program?",
            "mcq",
            True,
            [
                "B.Tech CSE",
                "B.Tech CSE (AI/ML)",
                "B.Tech IT",
                "BCA",
                "MCA",
                "Other",
            ],
        ),
        q(
            "q3",
            "Q3. How would you describe your overall academic performance?",
            "mcq",
            True,
            [
                "Below average",
                "Average",
                "Above average",
                "Very good",
                "Excellent",
                "Prefer not to say",
            ],
        ),
    ]

    # ---------------------------------------------------------
    # SECTION 2 — Understanding & Learning
    # ---------------------------------------------------------
    scale = [
        "1 — Strongly Disagree",
        "2 — Disagree",
        "3 — Neutral",
        "4 — Agree",
        "5 — Strongly Agree",
    ]

    understanding = [
        "I usually understand the fundamental concepts taught in my Computer Science courses.",
        "I can explain Computer Science concepts in my own words rather than simply memorizing them.",
        "I can apply concepts learned in class to problems that are different from the examples taught by the teacher.",
        "I can connect theoretical Computer Science concepts with real-world applications.",
        "I can identify which concept or technique is appropriate when I encounter a new problem.",
        "I receive enough opportunities to practice and apply what I learn.",
    ]

    for i, text in enumerate(understanding, start=4):
        questions.append(q(f"q{i}", f"Q{i}. {text}", "mcq", True, scale))

    # ---------------------------------------------------------
    # SECTION 3 — Finding Learning Gaps
    # ---------------------------------------------------------
    questions += [
        q(
            "q10",
            "Q10. How often do you realize during assignments, practicals, or examinations that you did not fully understand a topic that had already been taught?",
            "mcq",
            True,
            ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        ),
        q(
            "q11",
            "Q11. What is the main reason you struggle with difficult Computer Science topics? "
            "(The current form supports one choice; multi-select can be added later.)",
            "mcq",
            True,
            [
                "Lack of prerequisite knowledge",
                "Lack of conceptual clarity",
                "Teaching pace is too fast",
                "Too much theoretical content",
                "Insufficient examples",
                "Insufficient programming practice",
                "Difficulty applying concepts",
                "Difficulty solving unfamiliar problems",
                "Difficulty understanding mathematical concepts",
                "Lack of individual feedback",
                "Lack of time for practice",
                "Fear of making mistakes",
                "Lack of motivation",
                "Other",
            ],
        ),
        q(
            "q12",
            "Q12. When you struggle with a topic, how often is the specific reason for your difficulty identified by your teacher?",
            "mcq",
            True,
            ["Never", "Rarely", "Sometimes", "Often", "Very often", "Not sure"],
        ),
        q(
            "q13",
            "Q13. Which transition is usually the most difficult for you?",
            "mcq",
            True,
            [
                "Understanding the basic concept",
                "Understanding examples",
                "Implementing the concept/programming it",
                "Solving a new problem",
                "Applying it to a real-world situation",
                "Designing my own solution",
            ],
        ),
    ]

    # ---------------------------------------------------------
    # SECTION 4 — Teaching Methods
    #
    # Original Q14 is a 12-row 1–5 grid. Current CampusVoice
    # does not support matrix questions, so each row is stored
    # as its own rating question while preserving the wording.
    # ---------------------------------------------------------
    methods = [
        "Traditional lecture",
        "Visual explanations/diagrams",
        "Real-world examples",
        "Live coding",
        "Solving problems during class",
        "Hands-on laboratory work",
        "Project-based learning",
        "Problem-based learning",
        "Group discussion",
        "Peer teaching",
        "Quizzes/formative assessment",
        "Simulations/visualization tools",
    ]

    rating_scale = ["1", "2", "3", "4", "5"]

    for index, method in enumerate(methods, start=14):
        questions.append(
            q(
                f"q14_{index}",
                f"Q14 — Teaching method: {method}. "
                "How helpful is this approach for your learning? "
                "1 = Not helpful, 5 = Extremely helpful.",
                "rating",
                True,
                rating_scale,
            )
        )

    # ---------------------------------------------------------
    # SECTION 5 — Theory → Problem Solving
    # ---------------------------------------------------------
    questions += [
        q(
            "q15",
            "Q15. After completing a Computer Science topic, how confident are you in applying it to a completely new problem?",
            "mcq",
            True,
            ["Very low", "Low", "Moderate", "High", "Very high"],
        ),
        q(
            "q16",
            "Q16. How often are you given problems where there is no single predefined procedure to follow?",
            "mcq",
            True,
            ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        ),
        q(
            "q17",
            "Q17. How often are you asked to explain why a particular solution or algorithm works, rather than only implement it?",
            "mcq",
            True,
            ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        ),
        q(
            "q18",
            "Q18. How well do you think your examinations measure your ability to apply Computer Science concepts to new problems?",
            "mcq",
            True,
            ["Very poorly", "Poorly", "Moderately", "Well", "Very well", "Not sure"],
        ),
    ]

    # ---------------------------------------------------------
    # SECTION 6 — Innovation & Creation
    # ---------------------------------------------------------
    questions += [
        q(
            "q19",
            "Q19. How often do your courses require you to create or design something beyond the examples provided by the teacher?",
            "mcq",
            True,
            ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        ),
        q(
            "q20",
            "Q20. How confident are you in developing your own solution when you are given a problem without a predefined method?",
            "mcq",
            True,
            ["Very low", "Low", "Moderate", "High", "Very high"],
        ),
        q(
            "q21",
            "Q21. Which factor is the biggest barrier to experimenting with your own ideas?",
            "mcq",
            True,
            [
                "Fear of failure",
                "Fear of low marks",
                "Lack of time",
                "Academic workload",
                "Lack of technical knowledge",
                "Lack of confidence",
                "Lack of mentorship",
                "Lack of resources",
                "Lack of exposure to real-world problems",
                "Lack of peer support",
                "Curriculum constraints",
                "I generally do not face significant barriers",
                "Other",
            ],
        ),
    ]

    # ---------------------------------------------------------
    # SECTION 7 — What Should Change?
    # ---------------------------------------------------------
    questions.append(
        q(
            "q22",
            "Q22. Which single change would most improve your Computer Science learning experience?",
            "mcq",
            True,
            [
                "More practical work",
                "More programming practice",
                "More real-world examples",
                "More problem-solving sessions",
                "More projects",
                "More open-ended assignments",
                "Better visualization of difficult concepts",
                "More individual feedback",
                "Smaller discussion/problem-solving sessions",
                "Better laboratory facilities",
                "More industry exposure",
                "More research exposure",
                "Better sequencing of prerequisites",
                "Less memorization",
                "More continuous assessment",
                "More interdisciplinary learning",
                "Other",
            ],
        )
    )

    # ---------------------------------------------------------
    # SECTION 8 — Open-ended Research Questions
    # ---------------------------------------------------------
    questions += [
        q(
            "q23",
            "Q23. Describe one Computer Science topic that you found particularly difficult to learn. What made it difficult?",
            "long_text",
            True,
        ),
        q(
            "q24",
            "Q24. Describe a situation where a teacher's method helped you understand a difficult Computer Science concept particularly well. What did the teacher do?",
            "long_text",
            True,
        ),
        q(
            "q25",
            "Q25. In your opinion, what is the biggest gap between what Computer Science students learn in college and what they need to solve real-world problems or create something new?",
            "long_text",
            True,
        ),
    ]

    return questions


def seed():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    forms = db["feedback_forms"]

    questions = build_questions()

    form = {
        "title": FORM_TITLE,
        "description": (
            "This anonymous academic research survey investigates how "
            "undergraduate Computer Science students learn, where learning "
            "gaps occur, which teaching methods are most effective, and what "
            "factors influence problem-solving and innovation. "
            "Estimated time: 5–7 minutes."
        ),
        "category": "Academic Research",
        "targetAudience": {"type": "all_students", "value": ""},
        "questions": questions,
        "anonymous": True,
        "startDate": now(),
        "endDate": None,
        "status": "published",
        "createdBy": "system-seed",
        "createdAt": now(),
        "updatedAt": now(),
    }

    existing = forms.find_one({"title": FORM_TITLE})

    if existing:
        forms.update_one(
            {"_id": existing["_id"]},
            {"$set": form},
        )
        print(f"✓ Existing form updated: {existing['_id']}")
        print(f"✓ Questions stored: {len(questions)}")
    else:
        result = forms.insert_one(form)
        print(f"✓ Research form created: {result.inserted_id}")
        print(f"✓ Questions stored: {len(questions)}")

    print("✓ Status: published")
    print("✓ Anonymous: True")
    print("✓ Target: all students")
    print()
    print("NOTE:")
    print("- Q14 remains expanded into 12 rating items because matrix/grid")
    print("  questions are not currently supported by the feedback renderer.")
    print("- Native multi-select is now available for new survey forms.")


if __name__ == "__main__":
    seed()
