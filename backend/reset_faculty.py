from dotenv import load_dotenv
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import os

load_dotenv()

mongo = MongoClient(os.getenv("MONGO_URL"))
db = mongo["campusvoice"]

bcrypt = Bcrypt()

new_password = "Faculty@123"

hashed_password = bcrypt.generate_password_hash(
    new_password
).decode("utf-8")

result = db.users.update_one(
    {"username": "faculty_cse"},
    {"$set": {"password": hashed_password}}
)

print("Matched:", result.matched_count)
print("Modified:", result.modified_count)

if result.matched_count == 1:
    print("SUCCESS: faculty_cse password reset.")
    print("Username: faculty_cse")
    print("Password: Faculty@123")
else:
    print("ERROR: faculty_cse user was not found.")
