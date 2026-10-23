"""Central workflow rules for CampusVoice grievances.

The service is deliberately side-effect free: routes/tasks own persistence while
this module owns the state machine. Keeping the transition graph here prevents
role-specific UI code from becoming the source of truth.
"""

from utils.helpers import now_iso

VALID_ISSUE_STATUSES = (
    "created",
    "viewed",
    "assigned",
    "accepted",
    "investigating",
    "resolved",
    "verified",
    "closed",
    "escalated",
)

ALLOWED_TRANSITIONS = {
    # Intake is intentionally explicit: opening an issue does not change state.
    # An administrator must explicitly mark it as viewed.
    "created": ["viewed"],
    "viewed": ["assigned"],

    # Assignment creates a task. The task service owns these employee states.
    "assigned": ["accepted", "escalated"],
    "accepted": ["investigating"],
    "investigating": ["resolved"],

    # Student verification/feedback owns the final branch.
    "resolved": ["verified", "closed", "escalated"],
    "verified": ["closed", "escalated"],

    # Terminal / exception states.
    "closed": [],
    "escalated": ["assigned"],
}


LEGACY_STATUS_MAP = {
    # Existing installations may still contain the old intake states.
    "pending": "created",
    "approved": "viewed",
    "rejected": "closed",
}

def canonical_issue_status(status):
    """Translate legacy intake states to the current canonical workflow."""
    value = str(status or "created").strip().lower()
    return LEGACY_STATUS_MAP.get(value, value)

def can_transition(current_status, new_status):
    """Return whether the requested state transition is valid."""
    current_status = canonical_issue_status(current_status)
    new_status = canonical_issue_status(new_status)
    if current_status not in VALID_ISSUE_STATUSES:
        return False
    if new_status not in VALID_ISSUE_STATUSES:
        return False
    return new_status in ALLOWED_TRANSITIONS.get(current_status, [])


def build_timeline_event(action, username, role, **extra):
    """Create a consistent, serialisable workflow timeline event."""
    event = {
        "action": action,
        "by": username,
        "role": role,
        "time": now_iso(),
    }
    event.update(extra)
    return event
