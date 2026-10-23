from datetime import datetime, timezone
from bson import ObjectId
from pymongo import DESCENDING

from database.mongo import db, users_col


# ============================================================
# COLLECTIONS
# ============================================================

feedback_forms_col = db["feedback_forms"]
feedback_responses_col = db["feedback_responses"]
feedback_categories_col = db["feedback_categories"]


# ============================================================
# HELPERS
# ============================================================

def _object_id(value):
    try:
        return ObjectId(value)
    except Exception:
        return None


def _now():
    return datetime.now(timezone.utc)


def _normalize_question(question, index=0):
    """
    Normalize a feedback question before storing it.
    """

    question_id = question.get("id") or f"q_{index + 1}"

    return {
        "id": str(question_id),
        "question": str(question.get("question", "")).strip(),
        "type": question.get("type", "long_text"),
        "required": bool(question.get("required", False)),
        "options": question.get("options", []) or [],
        "maxSelections": question.get("maxSelections"),
    }


def form_has_ended(form):
    """
    Check whether the feedback form deadline has passed.
    """

    end_date = form.get("endDate")

    if not end_date:
        return False

    try:
        if isinstance(end_date, datetime):
            end_dt = end_date

        else:
            end_date_str = str(end_date).replace("Z", "+00:00")
            end_dt = datetime.fromisoformat(end_date_str)

        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=timezone.utc)

        return _now() >= end_dt

    except Exception:
        return False


def is_form_active(form):
    """
    A form is active only when:
    - status is published/active
    - start date has arrived
    - end date has not passed
    """

    status = form.get("status")

    if status not in ["published", "active"]:
        return False

    now = _now()

    start_date = form.get("startDate")
    end_date = form.get("endDate")

    try:
        if start_date:
            start_dt = (
                start_date
                if isinstance(start_date, datetime)
                else datetime.fromisoformat(
                    str(start_date).replace("Z", "+00:00")
                )
            )

            if start_dt.tzinfo is None:
                start_dt = start_dt.replace(tzinfo=timezone.utc)

            if now < start_dt:
                return False

        if end_date:
            end_dt = (
                end_date
                if isinstance(end_date, datetime)
                else datetime.fromisoformat(
                    str(end_date).replace("Z", "+00:00")
                )
            )

            if end_dt.tzinfo is None:
                end_dt = end_dt.replace(tzinfo=timezone.utc)

            if now >= end_dt:
                return False

        return True

    except Exception:
        return False


# ============================================================
# CREATE FORM
# ============================================================

def create_feedback_form(data, created_by):
    """
    Create a new feedback form.

    Initial lifecycle:
        draft

    Admin can publish it later.
    """

    now = _now()

    questions = [
        _normalize_question(question, index)
        for index, question in enumerate(data.get("questions", []))
    ]

    form = {
        "title": str(data.get("title", "")).strip(),
        "description": str(data.get("description", "")).strip(),
        "category": data.get("category", "General"),

        "targetAudience": data.get(
            "targetAudience",
            {
                "type": "all_students"
            }
        ),

        "questions": questions,

        "anonymous": bool(data.get("anonymous", True)),

        "startDate": data.get("startDate"),
        "endDate": data.get("endDate"),

        "status": "draft",

        "createdBy": created_by,

        "createdAt": now,
        "updatedAt": now,
    }

    result = feedback_forms_col.insert_one(form)

    return str(result.inserted_id)


# ============================================================
# GET FORM
# ============================================================

def get_feedback_form(form_id):
    object_id = _object_id(form_id)

    if not object_id:
        return None

    form = feedback_forms_col.find_one({
        "_id": object_id
    })

    if not form:
        return None

    # Automatically close expired forms.
    if (
        form.get("status") in ["published", "active"]
        and form_has_ended(form)
    ):
        feedback_forms_col.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": "closed",
                    "updatedAt": _now()
                }
            }
        )

        form["status"] = "closed"

    return form


# ============================================================
# GET ALL ADMIN FORMS
# ============================================================

def get_all_feedback_forms():
    forms = list(
        feedback_forms_col.find().sort(
            "createdAt",
            DESCENDING
        )
    )

    # Automatically close expired forms.
    now = _now()

    for form in forms:

        if (
            form.get("status") in ["published", "active"]
            and form_has_ended(form)
        ):

            feedback_forms_col.update_one(
                {"_id": form["_id"]},
                {
                    "$set": {
                        "status": "closed",
                        "updatedAt": now
                    }
                }
            )

            form["status"] = "closed"

    return forms


# ============================================================
# TARGET AUDIENCE
# ============================================================

def _student_context(student_context):
    """Resolve a complete student context from JWT/user data."""
    if isinstance(student_context, dict):
        context = dict(student_context)
        username = context.get("username")
    else:
        context = {}
        username = student_context

    if username:
        try:
            user = users_col.find_one({"username": username}, {"password": 0})
            if user:
                for key, value in user.items():
                    if key != "_id" and value is not None:
                        context.setdefault(key, value)
        except Exception:
            pass

    # Existing user records use departmentId; make it available to the
    # generic department matcher without changing the users schema.
    if context.get("departmentId") is not None:
        context.setdefault("department", context.get("departmentId"))

    return context


def _matches_target_audience(form, student_context):
    target = form.get("targetAudience") or {"type": "all_students"}
    target_type = str(target.get("type", "all_students")).strip().lower()
    target_value = str(target.get("value", "")).strip().lower()

    if target_type in ["", "all_students", "all"]:
        return True

    if not target_value:
        return False

    context = _student_context(student_context)
    aliases = {
        "department": ["department", "dept", "departmentId"],
        "course": ["course", "program", "programme", "courseName", "programName"],
        "semester": ["semester", "sem"],
        "class": ["class", "className", "section"],
    }

    fields = aliases.get(target_type, [target_type])

    for field in fields:
        value = context.get(field)
        if value is None:
            continue

        values = value if isinstance(value, (list, tuple, set)) else [value]
        normalized = [str(item).strip().lower() for item in values]

        if target_value in normalized:
            return True

    return False


def get_student_feedback_forms(student_context=None):
    """Return forms visible to the authenticated student, including active and closed cycles."""
    forms = list(
        feedback_forms_col.find({
            "status": {"$in": ["published", "active", "closed", "completed", "action_taken"]}
        }).sort("createdAt", DESCENDING)
    )

    visible = []
    now = _now()
    context = _student_context(student_context)

    for form in forms:
        if form.get("status") in ["published", "active"] and form_has_ended(form):
            feedback_forms_col.update_one(
                {"_id": form["_id"]},
                {"$set": {"status": "closed", "updatedAt": now}}
            )
            form["status"] = "closed"

        if _matches_target_audience(form, context):
            visible.append(form)

    return visible


# ============================================================
# GET ACTIVE STUDENT FORMS
# ============================================================

def get_active_feedback_forms(student_identifier=None):
    """Return currently active feedback forms visible to the student."""
    forms = get_student_feedback_forms(student_identifier)
    return [
        form for form in forms
        if form.get("status") in ["published", "active"]
        and is_form_active(form)
    ]


# ============================================================
# PUBLISH FORM
# ============================================================

def publish_feedback_form(form_id):
    object_id = _object_id(form_id)

    if not object_id:
        return None

    result = feedback_forms_col.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "published",
                "updatedAt": _now()
            }
        }
    )

    if result.matched_count == 0:
        return None

    return get_feedback_form(form_id)


# ============================================================
# CLOSE FORM
# ============================================================

def close_feedback_form(form_id):
    object_id = _object_id(form_id)

    if not object_id:
        return None

    result = feedback_forms_col.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "closed",
                "updatedAt": _now()
            }
        }
    )

    if result.matched_count == 0:
        return None

    return get_feedback_form(form_id)


# ============================================================
# CHECK DUPLICATE RESPONSE
# ============================================================

def has_student_responded(form_id, student_identifier):
    """
    Check whether a student has already submitted a response.

    student_identifier is currently the authenticated
    user's username.
    """

    if not student_identifier:
        return False

    object_id = _object_id(form_id)

    if not object_id:
        return False

    existing = feedback_responses_col.find_one({
        "formId": object_id,
        "studentId": student_identifier
    })

    return existing is not None


# ============================================================
# SUBMIT RESPONSE
# ============================================================

def submit_feedback_response(
    form_id,
    student_identifier,
    answers,
    student_context=None
):
    """
    Submit one student's feedback response.

    For anonymous forms:
        studentId is still stored internally to prevent
        duplicate submissions, but identity will not be
        exposed in student-facing results.

    For identified forms:
        studentId is available to authorized admins.
    """

    form = get_feedback_form(form_id)

    if not form:
        return {
            "success": False,
            "error": "Feedback form not found."
        }

    if not is_form_active(form):
        return {
            "success": False,
            "error": "This feedback form is no longer accepting responses."
        }

    if not _matches_target_audience(form, student_context or {}):
        return {
            "success": False,
            "error": "You are not eligible to submit this feedback form."
        }

    if not student_identifier:
        return {
            "success": False,
            "error": "Student identity could not be determined."
        }

    # --------------------------------------------------------
    # Prevent duplicate submissions
    # --------------------------------------------------------

    if has_student_responded(
        form_id,
        student_identifier
    ):
        return {
            "success": False,
            "error": "You have already submitted this feedback form."
        }

    # --------------------------------------------------------
    # Validate answers
    # --------------------------------------------------------

    valid_question_ids = {
        str(question["id"])
        for question in form.get("questions", [])
    }

    cleaned_answers = []

    for answer in answers or []:

        question_id = str(
            answer.get("questionId", "")
        )

        if question_id not in valid_question_ids:
            continue

        question_def = next((q for q in form.get("questions", []) if str(q.get("id")) == question_id), None)
        answer_value = answer.get("answer")
        if question_def and question_def.get("type") == "multi_select":
            if answer_value is None:
                answer_value = []
            if not isinstance(answer_value, list):
                return {"success": False, "error": f"Answer for '{question_def.get('question', 'question')}' must be a list of selections."}
            allowed = [str(option) for option in question_def.get("options", [])]
            answer_value = list(dict.fromkeys(str(value) for value in answer_value))
            if any(value not in allowed for value in answer_value):
                return {"success": False, "error": "One or more selected options are invalid."}
            limit = question_def.get("maxSelections")
            if limit and len(answer_value) > int(limit):
                return {"success": False, "error": f"Select no more than {int(limit)} options."}
        elif question_def and question_def.get("type") == "mcq":
            allowed = [str(option) for option in question_def.get("options", [])]
            if answer_value not in (None, "") and str(answer_value) not in allowed:
                return {"success": False, "error": "Selected option is invalid."}
        cleaned_answers.append({"questionId": question_id, "answer": answer_value})

    # --------------------------------------------------------
    # Required question validation
    # --------------------------------------------------------

    answered_question_ids = {
        answer["questionId"]
        for answer in cleaned_answers
    }

    missing_required = []

    for question in form.get("questions", []):

        if not question.get("required"):
            continue

        required_answer = next((item.get("answer") for item in cleaned_answers if item.get("questionId") == str(question["id"])), None)
        is_empty = required_answer is None or required_answer == "" or required_answer == [] or required_answer == {}
        if str(question["id"]) not in answered_question_ids or is_empty:
            missing_required.append(str(question["id"]))

    if missing_required:

        return {
            "success": False,
            "error": "Please answer all required questions.",
            "missingQuestions": missing_required
        }

    # --------------------------------------------------------
    # Store response
    # --------------------------------------------------------

    now = _now()

    response = {
        "formId": _object_id(form_id),

        # Internal identifier used only for duplicate
        # prevention and authorized admin access.
        "studentId": student_identifier,

        "anonymous": bool(
            form.get("anonymous", True)
        ),

        "answers": cleaned_answers,

        "submittedAt": now,
        "updatedAt": now,
    }

    try:

        result = feedback_responses_col.insert_one(
            response
        )

        return {
            "success": True,
            "responseId": str(result.inserted_id)
        }

    except Exception as e:

        # Handles a possible duplicate-key race if a unique
        # index is introduced later.
        print(
            "Feedback response insert error:",
            e
        )

        return {
            "success": False,
            "error": "Unable to submit feedback."
        }


# ============================================================
# GET RESPONSES — ADMIN
# ============================================================

def get_feedback_responses(form_id):
    object_id = _object_id(form_id)

    if not object_id:
        return []

    responses = list(
        feedback_responses_col.find({
            "formId": object_id
        }).sort(
            "submittedAt",
            DESCENDING
        )
    )

    return responses


# ============================================================
# RESPONSE COUNT
# ============================================================

def get_response_count(form_id):
    object_id = _object_id(form_id)

    if not object_id:
        return 0

    return feedback_responses_col.count_documents({
        "formId": object_id
    })


# ============================================================
# GET STUDENT'S OWN RESPONSE
# ============================================================

def get_student_response(
    form_id,
    student_identifier
):
    object_id = _object_id(form_id)

    if not object_id or not student_identifier:
        return None

    return feedback_responses_col.find_one({
        "formId": object_id,
        "studentId": student_identifier
    })



# ============================================================
# PARTICIPATION / RESPONSE RATE
# ============================================================

def get_feedback_participation(form_id):
    """Return eligible student count, responses and response rate."""
    form = get_feedback_form(form_id)
    if not form:
        return None

    try:
        eligible = 0
        cursor = users_col.find({"role": "student", "active": {"$ne": False}}, {"password": 0})
        for user in cursor:
            if _matches_target_audience(form, user):
                eligible += 1
    except Exception:
        eligible = 0

    response_count = feedback_responses_col.count_documents({"formId": _object_id(form_id)})
    rate = round((response_count / eligible) * 100, 1) if eligible else None

    return {
        "eligibleCount": eligible,
        "responseCount": response_count,
        "responseRate": rate,
    }

# ============================================================
# STATISTICS
# ============================================================

def get_feedback_statistics(form_id):
    """
    Basic statistics for MVP.

    Supports:
        rating
        mcq
        yes_no

    Open-ended responses are returned separately and will
    later feed into categorization.
    """

    form = get_feedback_form(form_id)

    if not form:
        return None

    responses = get_feedback_responses(form_id)

    statistics = []

    for question in form.get("questions", []):

        question_id = str(question["id"])

        question_answers = []

        for response in responses:

            for answer in response.get("answers", []):

                if str(
                    answer.get("questionId")
                ) == question_id:

                    question_answers.append(
                        answer.get("answer")
                    )

        question_type = question.get("type")

        item = {
            "questionId": question_id,
            "question": question.get("question"),
            "type": question_type,
            "responseCount": (
                sum(1 for value in question_answers if isinstance(value, list) and len(value) > 0)
                if question_type == "multi_select"
                else len(question_answers)
            ),
        }

        # ----------------------------------------------------
        # Rating
        # ----------------------------------------------------

        if question_type == "rating":

            numeric_values = []

            for value in question_answers:

                try:
                    numeric_values.append(
                        float(value)
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    pass

            item["average"] = (
                round(
                    sum(numeric_values)
                    / len(numeric_values),
                    2
                )
                if numeric_values
                else 0
            )

            item["distribution"] = {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
            }

            for value in numeric_values:

                key = str(
                    int(value)
                )

                if key in item["distribution"]:
                    item["distribution"][key] += 1

        # ----------------------------------------------------
        # MCQ / YES-NO
        # ----------------------------------------------------

        elif question_type in ["mcq", "multi_select", "yes_no"]:
            distribution = {}
            for value in question_answers:
                values = value if question_type == "multi_select" and isinstance(value, list) else [value]
                for selected_value in values:
                    key = str(selected_value)
                    distribution[key] = distribution.get(key, 0) + 1
            item["distribution"] = distribution

        # ----------------------------------------------------
        # Text
        # ----------------------------------------------------

        else:

            item["responses"] = [
                str(value)
                for value in question_answers
                if value is not None
                and str(value).strip()
            ]

        statistics.append(item)

    participation = get_feedback_participation(form_id) or {}

    return {
        "formId": str(form["_id"]),
        "title": form.get("title"),
        "responseCount": len(responses),
        "eligibleCount": participation.get("eligibleCount", 0),
        "responseRate": participation.get("responseRate"),
        "statistics": statistics,
    }

# ============================================================
# FEEDBACK CATEGORIES
# ============================================================

def create_feedback_category(
    form_id,
    question_id,
    name,
    description=""
):
    """
    Create a category for open-ended feedback responses.
    """

    form_object_id = _object_id(form_id)

    if not form_object_id:
        return None

    form = feedback_forms_col.find_one({
        "_id": form_object_id
    })

    if not form:
        return None

    category = {
        "formId": form_object_id,
        "questionId": str(question_id),
        "name": str(name).strip(),
        "description": str(description).strip(),
        "responseRefs": [],
        "createdAt": _now(),
        "updatedAt": _now(),
    }

    if not category["name"]:
        return None

    result = feedback_categories_col.insert_one(
        category
    )

    return str(result.inserted_id)


def get_feedback_categories(form_id, question_id=None):
    """
    Get categories belonging to a feedback form.
    Optionally filter by question.
    """

    form_object_id = _object_id(form_id)

    if not form_object_id:
        return []

    query = {
        "formId": form_object_id
    }

    if question_id is not None:
        query["questionId"] = str(question_id)

    return list(
        feedback_categories_col.find(query).sort(
            "createdAt",
            DESCENDING
        )
    )


def get_feedback_category(
    form_id,
    category_id
):
    """
    Get one category belonging to a form.
    """

    form_object_id = _object_id(form_id)
    category_object_id = _object_id(category_id)

    if not form_object_id or not category_object_id:
        return None

    return feedback_categories_col.find_one({
        "_id": category_object_id,
        "formId": form_object_id
    })


def assign_response_to_category(
    form_id,
    category_id,
    response_id,
    question_id
):
    """
    Assign one specific open-ended answer
    to a category.

    A response can have multiple answers,
    therefore responseId + questionId identifies
    the exact answer.
    """

    category = get_feedback_category(
        form_id,
        category_id
    )

    if not category:
        return {
            "success": False,
            "error": "Category not found."
        }

    response_object_id = _object_id(response_id)

    if not response_object_id:
        return {
            "success": False,
            "error": "Invalid response ID."
        }

    response = feedback_responses_col.find_one({
        "_id": response_object_id,
        "formId": _object_id(form_id)
    })

    if not response:
        return {
            "success": False,
            "error": "Response not found."
        }

    # Make sure the question actually exists
    answer_exists = False

    for answer in response.get("answers", []):
        if (
            str(answer.get("questionId"))
            == str(question_id)
        ):
            answer_exists = True
            break

    if not answer_exists:
        return {
            "success": False,
            "error": "Answer for this question was not found."
        }

    response_ref = {
        "responseId": str(response_object_id),
        "questionId": str(question_id)
    }

    existing_refs = category.get(
        "responseRefs",
        []
    )

    already_assigned = any(
        str(ref.get("responseId"))
        == str(response_object_id)
        and str(ref.get("questionId"))
        == str(question_id)
        for ref in existing_refs
    )

    if already_assigned:
        return {
            "success": True,
            "message": "Response is already assigned."
        }

    feedback_categories_col.update_one(
        {
            "_id": category["_id"]
        },
        {
            "$push": {
                "responseRefs": response_ref
            },
            "$set": {
                "updatedAt": _now()
            }
        }
    )

    return {
        "success": True,
        "message": "Response assigned successfully."
    }


def remove_response_from_category(
    form_id,
    category_id,
    response_id,
    question_id
):
    """
    Remove an answer from a category.
    """

    category = get_feedback_category(
        form_id,
        category_id
    )

    if not category:
        return {
            "success": False,
            "error": "Category not found."
        }

    feedback_categories_col.update_one(
        {
            "_id": category["_id"]
        },
        {
            "$pull": {
                "responseRefs": {
                    "responseId": str(response_id),
                    "questionId": str(question_id)
                }
            },
            "$set": {
                "updatedAt": _now()
            }
        }
    )

    return {
        "success": True,
        "message": "Response removed from category."
    }


def update_feedback_category(
    form_id,
    category_id,
    name=None,
    description=None,
    conclusion=None,
    action=None,
    responsible_department=None,
    expected_completion=None,
    action_status=None
):
    """
    Update a feedback category.

    Supports:
    - category name
    - description
    - admin conclusion
    - action plan
    - responsible department
    - expected completion
    - action status
    """

    form_object_id = _object_id(form_id)
    category_object_id = _object_id(category_id)

    if not form_object_id or not category_object_id:
        return None

    category = feedback_categories_col.find_one({
        "_id": category_object_id,
        "formId": form_object_id,
    })

    if not category:
        return None

    update_fields = {
        "updatedAt": _now()
    }

    if name is not None:
        update_fields["name"] = str(
            name
        ).strip()

    if description is not None:
        update_fields["description"] = str(
            description
        ).strip()

    if conclusion is not None:
        update_fields["conclusion"] = str(
            conclusion
        ).strip()

    if action is not None:
        update_fields["action"] = str(action).strip()

    if responsible_department is not None:
        update_fields["responsibleDepartment"] = str(
            responsible_department
        ).strip()

    if expected_completion is not None:
        update_fields["expectedCompletion"] = str(
            expected_completion
        ).strip()

    if action_status is not None:
        update_fields["actionStatus"] = str(
            action_status
        ).strip()

    feedback_categories_col.update_one(
        {
            "_id": category_object_id,
            "formId": form_object_id,
        },
        {
            "$set": update_fields
        }
    )

    return feedback_categories_col.find_one({
        "_id": category_object_id,
        "formId": form_object_id,
    })


# ============================================================
# INDEXES
# ============================================================

def initialize_feedback_indexes():
    """
    Create indexes used by the feedback system.

    We intentionally do NOT make studentId unique at the
    database level because anonymous/identified handling
    may evolve later.

    Duplicate prevention is handled by the service.
    """

    try:

        feedback_forms_col.create_index(
            [
                ("status", 1),
                ("startDate", 1),
                ("endDate", 1)
            ]
        )

        feedback_forms_col.create_index(
            [
                ("createdAt", DESCENDING)
            ]
        )

        feedback_responses_col.create_index(
            [
                ("formId", 1),
                ("studentId", 1)
            ]
        )

        feedback_responses_col.create_index(
            [
                ("formId", 1),
                ("submittedAt", DESCENDING)
            ]
        )
        feedback_categories_col.create_index(
            [
                ("formId", 1),
                ("questionId", 1),
                ("createdAt", DESCENDING)
            ]
        )

        print(
            "Feedback indexes initialized."
        )

    except Exception as e:

        print(
            "Feedback index initialization error:",
            e
        )