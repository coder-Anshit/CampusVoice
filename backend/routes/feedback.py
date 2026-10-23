from flask import Blueprint, request, jsonify

from middleware.auth_middleware import require_role
from utils.serializers import serial

from services.feedback_service import (
    create_feedback_form,
    get_feedback_form,
    get_all_feedback_forms,
    get_active_feedback_forms,
    get_student_feedback_forms,
    form_has_ended,
    publish_feedback_form,
    close_feedback_form,
    submit_feedback_response,
    get_feedback_responses,
    get_response_count,
    get_student_response,
    get_feedback_statistics,
    has_student_responded,

    # Feedback categorization
    create_feedback_category,
    get_feedback_categories,
    get_feedback_category,
    assign_response_to_category,
    remove_response_from_category,
    update_feedback_category,
)


# ============================================================
# BLUEPRINT
# ============================================================

feedback_bp = Blueprint(
    "feedback",
    __name__,
    url_prefix="/api/feedback"
)


# ============================================================
# ADMIN — LIST ALL FORMS
# ============================================================

@feedback_bp.route("/forms", methods=["GET"])
@require_role("admin")
def list_feedback_forms():

    forms = get_all_feedback_forms()

    return jsonify(
        [serial(form) for form in forms]
    ), 200


# ============================================================
# ADMIN — GET SINGLE FORM
# ============================================================

@feedback_bp.route("/forms/<form_id>", methods=["GET"])
@require_role("admin")
def get_single_feedback_form(form_id):

    form = get_feedback_form(form_id)

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    return jsonify(
        serial(form)
    ), 200


# ============================================================
# ADMIN — CREATE FORM
# ============================================================

@feedback_bp.route("/forms", methods=["POST"])
@require_role("admin")
def create_form():

    data = request.get_json(silent=True) or {}

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    title = str(
        data.get("title", "")
    ).strip()

    if not title:
        return jsonify({
            "error": "Feedback form title is required."
        }), 400

    questions = data.get("questions", [])

    if not isinstance(questions, list):
        return jsonify({
            "error": "Questions must be an array."
        }), 400

    if not questions:
        return jsonify({
            "error": "At least one question is required."
        }), 400

    # Current JWT contains username + role.
    # We use username as the creator identifier.
    created_by = request.user.get("username")

    form_id = create_feedback_form(
        data,
        created_by
    )

    form = get_feedback_form(form_id)

    return jsonify({
        "message": "Feedback form created successfully.",
        "form": serial(form)
    }), 201


# ============================================================
# ADMIN — PUBLISH FORM
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/publish",
    methods=["PATCH"]
)
@require_role("admin")
def publish_form(form_id):

    form = get_feedback_form(form_id)

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    if form.get("status") == "closed":
        return jsonify({
            "error": "A closed feedback form cannot be published."
        }), 400

    updated_form = publish_feedback_form(
        form_id
    )

    if not updated_form:
        return jsonify({
            "error": "Unable to publish feedback form."
        }), 400

    return jsonify({
        "message": "Feedback form published successfully.",
        "form": serial(updated_form)
    }), 200


# ============================================================
# ADMIN — CLOSE FORM
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/close",
    methods=["PATCH"]
)
@require_role("admin")
def close_form(form_id):

    form = get_feedback_form(form_id)

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    updated_form = close_feedback_form(
        form_id
    )

    if not updated_form:
        return jsonify({
            "error": "Unable to close feedback form."
        }), 400

    return jsonify({
        "message": "Feedback form closed successfully.",
        "form": serial(updated_form)
    }), 200


# ============================================================
# ADMIN — GET RESPONSES
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/responses",
    methods=["GET"]
)
@require_role("admin")
def get_responses(form_id):

    form = get_feedback_form(form_id)

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    responses = get_feedback_responses(
        form_id
    )

    return jsonify(
        [serial(response) for response in responses]
    ), 200


# ============================================================
# ADMIN — GET STATISTICS
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/statistics",
    methods=["GET"]
)
@require_role("admin")
def get_statistics(form_id):

    statistics = get_feedback_statistics(
        form_id
    )

    if not statistics:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    return jsonify(
        serial(statistics)
    ), 200


# ============================================================
# ADMIN — RESPONSE COUNT
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/response-count",
    methods=["GET"]
)
@require_role("admin")
def response_count(form_id):

    form = get_feedback_form(form_id)

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    count = get_response_count(
        form_id
    )

    return jsonify({
        "formId": form_id,
        "responseCount": count
    }), 200
# ============================================================
# ADMIN — FEEDBACK CATEGORIES
# ============================================================


@feedback_bp.route(
    "/forms/<form_id>/categories",
    methods=["POST"]
)
@require_role("admin")
def create_category(form_id):

    data = request.get_json(
        silent=True
    ) or {}

    question_id = data.get(
        "questionId"
    )

    name = str(
        data.get("name", "")
    ).strip()

    description = str(
        data.get("description", "")
    ).strip()

    if not question_id:
        return jsonify({
            "error": "Question ID is required."
        }), 400

    if not name:
        return jsonify({
            "error": "Category name is required."
        }), 400

    category_id = create_feedback_category(
        form_id=form_id,
        question_id=question_id,
        name=name,
        description=description,
    )

    if not category_id:
        return jsonify({
            "error": "Unable to create feedback category."
        }), 400

    category = get_feedback_category(
        form_id,
        category_id
    )

    return jsonify({
        "message": "Feedback category created successfully.",
        "category": serial(category)
    }), 201


@feedback_bp.route(
    "/forms/<form_id>/categories",
    methods=["GET"]
)
@require_role("admin")
def list_categories(form_id):

    form = get_feedback_form(
        form_id
    )

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    question_id = request.args.get(
        "questionId"
    )

    categories = get_feedback_categories(
        form_id=form_id,
        question_id=question_id
    )

    return jsonify([
        serial(category)
        for category in categories
    ]), 200


@feedback_bp.route(
    "/forms/<form_id>/categories/<category_id>",
    methods=["PATCH"]
)
@require_role("admin")
def update_category(form_id, category_id):

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    description = data.get("description")
    conclusion = data.get("conclusion")
    action = data.get("action")
    responsible_department = data.get("responsibleDepartment")
    expected_completion = data.get("expectedCompletion")
    action_status = data.get("actionStatus")

    if name is not None:
        name = str(name).strip()
        if not name:
            return jsonify({
                "error": "Category name cannot be empty."
            }), 400

    for value_name in ["description", "conclusion", "action", "responsible_department", "expected_completion"]:
        value = locals()[value_name]
        if value is not None:
            value = str(value).strip()
            if value_name == "description": description = value
            elif value_name == "conclusion": conclusion = value
            elif value_name == "action": action = value
            elif value_name == "responsible_department": responsible_department = value
            elif value_name == "expected_completion": expected_completion = value

    if action_status is not None:
        action_status = str(action_status).strip().lower()
        if action_status not in ["planned", "in_progress", "completed"]:
            return jsonify({
                "error": "Invalid action status. Use planned, in_progress, or completed."
            }), 400

    category = update_feedback_category(
        form_id=form_id,
        category_id=category_id,
        name=name,
        description=description,
        conclusion=conclusion,
        action=action,
        responsible_department=responsible_department,
        expected_completion=expected_completion,
        action_status=action_status,
    )

    if not category:
        return jsonify({
            "error": "Feedback category not found."
        }), 404

    return jsonify({
        "message": "Feedback category updated successfully.",
        "category": serial(category)
    }), 200

@feedback_bp.route(
    "/forms/<form_id>/categories/<category_id>/responses",
    methods=["POST"]
)
@require_role("admin")
def assign_category_response(
    form_id,
    category_id
):

    data = request.get_json(
        silent=True
    ) or {}

    response_id = data.get(
        "responseId"
    )

    question_id = data.get(
        "questionId"
    )

    if not response_id:
        return jsonify({
            "error": "Response ID is required."
        }), 400

    if not question_id:
        return jsonify({
            "error": "Question ID is required."
        }), 400

    result = assign_response_to_category(
        form_id=form_id,
        category_id=category_id,
        response_id=response_id,
        question_id=question_id,
    )

    if not result.get("success"):
        return jsonify(result), 400

    return jsonify(result), 200


@feedback_bp.route(
    "/forms/<form_id>/categories/<category_id>/responses",
    methods=["DELETE"]
)
@require_role("admin")
def remove_category_response(
    form_id,
    category_id
):

    data = request.get_json(
        silent=True
    ) or {}

    response_id = data.get(
        "responseId"
    )

    question_id = data.get(
        "questionId"
    )

    if not response_id:
        return jsonify({
            "error": "Response ID is required."
        }), 400

    if not question_id:
        return jsonify({
            "error": "Question ID is required."
        }), 400

    result = remove_response_from_category(
        form_id=form_id,
        category_id=category_id,
        response_id=response_id,
        question_id=question_id,
    )

    if not result.get("success"):
        return jsonify(result), 400

    return jsonify(result), 200

# ============================================================
# STUDENT — FEEDBACK FORMS
# ============================================================

@feedback_bp.route("/student/forms", methods=["GET"])
@require_role("student")
def student_feedback_forms():
    forms = get_student_feedback_forms(request.user)

    return jsonify([serial(form) for form in forms]), 200


# ============================================================
# STUDENT — ACTIVE FORMS
# ============================================================

@feedback_bp.route(
    "/active",
    methods=["GET"]
)
@require_role("student")
def active_forms():

    forms = get_student_feedback_forms(request.user)
    forms = [
        form for form in forms
        if form.get("status") in ["published", "active"]
        and not form_has_ended(form)
    ]

    return jsonify([serial(form) for form in forms]), 200


@feedback_bp.route(
    "/active/<form_id>",
    methods=["GET"]
)
@require_role("student")
def get_active_form(form_id):

    student_identifier = request.user.get(
        "username"
    )

    form = get_feedback_form(
        form_id
    )

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    if form.get("status") not in [
        "published",
        "active"
    ]:
        return jsonify({
            "error": "This feedback form is not active."
        }), 400

    # Target-audience check and active-window check.
    from services.feedback_service import (
        is_form_active,
        _matches_target_audience,
    )

    if not _matches_target_audience(form, request.user):
        return jsonify({
            "error": "You are not eligible to access this feedback form."
        }), 403

    if not is_form_active(form):
        return jsonify({
            "error": "This feedback form is no longer active."
        }), 400

    already_responded = has_student_responded(
        form_id,
        student_identifier
    )

    return jsonify({
        "form": serial(form),
        "alreadyResponded": already_responded
    }), 200


# ============================================================
# STUDENT — SUBMIT RESPONSE
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/responses",
    methods=["POST"]
)
@require_role("student")
def submit_response(form_id):

    data = request.get_json(
        silent=True
    ) or {}

    answers = data.get(
        "answers",
        []
    )

    if not isinstance(answers, list):
        return jsonify({
            "error": "Answers must be an array."
        }), 400

    student_identifier = request.user.get(
        "username"
    )

    result = submit_feedback_response(
        form_id=form_id,
        student_identifier=student_identifier,
        answers=answers,
        student_context=request.user
    )

    if not result.get("success"):
        return jsonify(result), 400

    return jsonify({
        "message": "Feedback submitted successfully.",
        "responseId": result.get("responseId")
    }), 201


# ============================================================
# STUDENT — MY RESPONSE
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/my-response",
    methods=["GET"]
)
@require_role("student")
def my_response(form_id):

    student_identifier = request.user.get(
        "username"
    )

    response = get_student_response(
        form_id,
        student_identifier
    )

    if not response:
        return jsonify({
            "submitted": False,
            "response": None
        }), 200

    return jsonify({
        "submitted": True,
        "response": serial(response)
    }), 200


# ============================================================
# STUDENT — RESULTS
# ============================================================

@feedback_bp.route(
    "/forms/<form_id>/results",
    methods=["GET"]
)
@require_role("student")
def feedback_results(form_id):

    form = get_feedback_form(form_id)

    if not form:
        return jsonify({
            "error": "Feedback form not found."
        }), 404

    from services.feedback_service import _matches_target_audience

    if not _matches_target_audience(form, request.user):
        return jsonify({
            "error": "You are not eligible to view this feedback form."
        }), 403

    if form.get("status") not in [
        "closed",
        "completed",
        "action_taken"
    ]:
        return jsonify({
            "error": "Results are not available yet."
        }), 403

    statistics = get_feedback_statistics(form_id) or {}
    responses = get_feedback_responses(form_id)
    categories = get_feedback_categories(form_id)

    public_categories = []

    for category in categories:
        refs = category.get("responseRefs", []) or []
        category_responses = []

        for ref in refs:
            response = next(
                (item for item in responses
                 if str(item.get("_id")) == str(ref.get("responseId"))),
                None
            )
            if not response:
                continue

            answer_value = None
            for answer in response.get("answers", []):
                if str(answer.get("questionId")) == str(ref.get("questionId")):
                    answer_value = answer.get("answer")
                    break

            if answer_value is None or not str(answer_value).strip():
                continue

            if isinstance(answer_value, list):
                answer_value = ", ".join(map(str, answer_value))
            elif isinstance(answer_value, dict):
                answer_value = str(answer_value)

            category_responses.append({
                "answer": str(answer_value)
            })

        public_categories.append({
            "id": str(category["_id"]),
            "name": category.get("name", ""),
            "description": category.get("description", ""),
            "responseCount": len(category_responses),
            "responses": category_responses,
            "conclusion": category.get("conclusion", ""),
            "action": category.get("action", ""),
            "responsibleDepartment": category.get("responsibleDepartment", ""),
            "expectedCompletion": category.get("expectedCompletion", ""),
            "actionStatus": category.get("actionStatus", "planned"),
        })

    return jsonify({
        "formId": str(form["_id"]),
        "title": form.get("title"),
        "responseCount": len(responses),
        "eligibleCount": statistics.get("eligibleCount", 0),
        "responseRate": statistics.get("responseRate"),
        "statistics": statistics.get("statistics", []),
        "categories": public_categories,
    }), 200

