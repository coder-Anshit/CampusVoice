"""Seed the student research survey: The Unfiltered Classroom.

Run from the backend folder in the configured Python environment:
    python seed_unfiltered_classroom_survey.py

Requires MONGO_URL; optional MONGO_DB_NAME (defaults to campusvoice).
The script upserts by exact title and publishes the form. It does not collect
student names or emails in the form itself. The app may still retain an internal
student identifier to prevent duplicate submissions, according to its existing
response service.
"""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "campusvoice")
FORM_TITLE = "The Unfiltered Classroom 🎓"

if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable is required. Set it in backend/.env before running this script.")

def now():
    return datetime.now(timezone.utc)

def q(qid, text, qtype="long_text", required=False, options=None, max_selections=None):
    item = {"id": qid, "question": text, "type": qtype, "required": required, "options": options or []}
    if qtype == "multi_select":
        item["maxSelections"] = max_selections
    return item

QUESTIONS = [
    q("q1", "Be honest. When a teacher finishes a difficult topic, which situation describes you best? 😂", "mcq", True, [
        "🟢 I understood it, and I can explain it to someone else.",
        "🟡 I understood it in class, but I'd struggle to solve a question alone.",
        "🔵 I understood nothing in class, but YouTube saved me later.",
        "🟣 I understood the example, but a slightly different question destroys me.",
        "🔴 I memorized it. Bhagwan bharose exam de dunga.",
        "⚫ It depends entirely on the teacher and the subject."]),
    q("q2", "Have you ever scored good marks in a subject but felt you couldn't actually use that knowledge?", "mcq", True, [
        "Yes, marks aaye par knowledge ka pata nahi. 💀", "Sometimes, especially in theoretical subjects.",
        "No, I can generally apply what I learn.", "I've experienced the opposite: I understand concepts but don't score well.", "Haven't thought about it."]),
    q("q3", "Imagine you studied an entire chapter yesterday. Today, a friend asks you to explain it without opening your notes. What happens?", "mcq", True, [
        "Easy. I can explain it in my own words.", "I remember the concept but forget important details.",
        "I remember the answer when I see the question.", "I need to revise everything.", "Bhai, which chapter? 💀"]),
    q("q4", "What is the most frustrating thing about learning a difficult Computer Science topic? (Choose up to 2)", "multi_select", True, [
        "Teacher goes too fast.", "I don't understand the basics needed for that topic.", "The concept makes sense, but coding it is difficult.",
        "I can solve textbook questions but not new ones.", "Nobody explains WHY we're learning it.", "Too much theory, too little implementation.",
        "I don't know what exactly I'm not understanding.", "I understand better from online resources than classroom lectures.",
        "Honestly, I struggle to concentrate.", "Something else: (describe in the optional comment below)"], 2),
    q("q5", "You are stuck on a programming problem for 30 minutes. What's your first move?", "mcq", True, [
        "🧠 Keep trying different approaches.", "🔎 Google the error or search for hints.", "▶️ Watch a YouTube explanation.",
        "🤝 Ask a friend.", "🤖 Ask ChatGPT or another AI tool.", "📖 Revisit the concept or notes.", "😭 Leave it for later."]),
    q("q6", "Suppose your teacher gives you a completely new coding problem. You know the concepts involved, but you've never solved that type of question before. What usually stops you from starting?", "mcq", True, [
        "I don't know how to break the problem into smaller parts.", "I don't know which algorithm or concept to use.",
        "I can imagine the solution but struggle to write code.", "I'm afraid of wasting time on the wrong approach.",
        "I need to see a similar example first.", "I can usually figure out how to start.", "Something else." ]),
    q("q7", "Which of these sounds most like your learning experience?", "mcq", True, [
        "I understand WHY the code works.", "I understand the code when someone explains it.",
        "I can reproduce the code, but I struggle to create it myself.", "I can solve familiar problems, but unfamiliar ones are difficult.",
        "I learn best when I build something myself."]),
    q("q8", "If you could magically fix ONE problem in your learning process, what would you choose?", "long_text", False),
    q("q9", "Imagine you are teaching a difficult topic to your classmates tomorrow. How would you teach it?", "mcq", True, [
        "🎬 Start with a real-world problem and explain the theory afterward.", "💻 Build a small working project together.",
        "🎨 Use animations, diagrams and visual demonstrations.", "🧩 Give students a problem and let them figure things out before explaining.",
        "👨‍🏫 Explain the concept clearly, then solve several examples.", "👥 Let students work in groups and explain solutions to each other.",
        "🎯 Give students different exercises depending on what they struggle with.", "🔀 Combine several methods."]),
    q("q10", "What would make you genuinely excited to attend a Computer Science class? (Choose up to 3)", "multi_select", True, [
        "Building something useful in every unit.", "Solving interesting real-world problems.", "Teachers explaining difficult concepts through visual demonstrations.",
        "Freedom to experiment and make mistakes.", "Working on projects with friends.", "Learning how technologies actually work internally.",
        "Getting personal feedback on my weaknesses.", "Exploring topics beyond the prescribed syllabus.", "More coding and fewer slides.",
        "Understanding how concepts are used in actual companies.", "Being allowed to choose projects based on my interests.", "Other."], 3),
    q("q11", "Suppose your college gives you two options for learning Data Structures and Algorithms. Which would you choose?", "mcq", True, [
        "Definitely A — traditional teaching: explanations, examples, assignments and exams.", "Probably A.", "Both, depending on the topic.",
        "Probably B — build-first learning: build a small app, encounter problems, then learn and test the needed concepts.", "Definitely B."]),
    q("q12", "Which classroom experience would teach you the most?", "mcq", True, [
        "Solving 20 standard questions with the teacher.", "Solving 5 challenging questions with hints and feedback.",
        "Building a small project using the concept.", "Explaining the concept to another student.", "Exploring a real-world problem with multiple possible solutions."]),
    q("q13", "Have you ever thought of building an app, website, device or other solution to a real-world problem?", "mcq", True, [
        "Yes, and I've built it.", "Yes, and I've started building it.", "Yes, but I never got around to starting.",
        "I have ideas, but I don't know how to turn them into projects.", "Not really, but I'd like to try.", "I haven't thought much about it."]),
    q("q14", "Imagine you've got a genuinely good project idea. What is MOST likely to stop you from building it? (Choose up to 3)", "multi_select", True, [
        "I don't know where to start.", "I lack the technical skills.", "I don't know which technologies to use.", "I don't have a mentor.",
        "I don't have teammates.", "I don't have enough time because of college work.", "I worry the idea won't work.", "I lack money or resources.",
        "I struggle to connect concepts from different subjects.", "I don't know how to test whether the idea solves a real problem.",
        "Nothing. I'll find a way to try.", "Other."], 3),
    q("q15", "Which sentence describes your current relationship with innovation?", "mcq", True, [
        "I regularly experiment with ideas and build things.", "I enjoy projects when someone provides a clear problem statement.",
        "I have ideas but struggle to execute them.", "I mostly focus on completing assignments and preparing for exams.",
        "I haven't explored building my own solutions yet, but I want to."]),
    q("q16", "What would help you move from 'I have an idea' to 'I built something'? (Choose up to 3)", "multi_select", True, [
        "A teacher who guides me step by step.", "A mentor from industry.", "More time for independent projects.",
        "A team of students with different skills.", "Access to tools, laboratories and resources.", "Learning how to break large problems into smaller ones.",
        "Freedom to experiment without worrying about marks.", "More practical knowledge of technologies.", "Small project challenges based on real problems.",
        "Feedback from people who might actually use my solution."], 3),
    q("q17", "Complete this sentence: 'I would understand Computer Science much better if my classes…'", "long_text", False),
    q("q18", "Tell us about a moment when something you learned in college finally made sense. What happened? What helped you understand it?", "long_text", False),
    q("q19", "If you could redesign ONE Computer Science subject, which would you choose, and how would you teach it differently?", "long_text", False),
    q("q20", "Imagine you have 5 minutes with the people who design your university syllabus. What would you tell them?", "long_text", False),
    q("q21", "What's one thing teachers or colleges misunderstand about how students learn?", "long_text", False),
    q("q22", "Is there anything about your learning experience that we haven't asked but should understand?", "long_text", False),
]

def seed():
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
    client.admin.command("ping")
    forms = client[DB_NAME]["feedback_forms"]
    timestamp = now()
    form = {
        "title": FORM_TITLE,
        "description": (
            "🧠 Have you ever understood a topic only after watching a short online explanation? "
            "Have you memorized an answer and forgotten it later, or had a project idea you never built? "
            "This anonymous survey explores what learning actually feels like for Computer Science students. "
            "There are no right or wrong answers. Share your experiences, frustrations, ideas and ambitions. "
            "Estimated time: 5–7 minutes. Open-ended questions are optional."
        ),
        "category": "Academic Research",
        "targetAudience": {"type": "all_students", "value": ""},
        "questions": QUESTIONS,
        "anonymous": True,
        "startDate": timestamp,
        "endDate": None,
        "status": "published",
        "createdBy": "system-seed",
        "createdAt": timestamp,
        "updatedAt": timestamp,
    }
    existing = forms.find_one({"title": FORM_TITLE})
    if existing:
        forms.update_one({"_id": existing["_id"]}, {"$set": form})
        print(f"Updated existing form: {existing['_id']}")
    else:
        result = forms.insert_one(form)
        print(f"Created form: {result.inserted_id}")
    print(f"Questions: {len(QUESTIONS)} | status: published | anonymous: true")
    print("Multi-select enabled for Q4, Q10, Q14 and Q16 (maximum 2/3/3/3 selections).")
    client.close()

if __name__ == "__main__":
    seed()
