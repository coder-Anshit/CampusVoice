import os
import requests
from dotenv import load_dotenv
load_dotenv()

print(
    "OPENAI_API_KEY loaded:",
    bool(os.getenv("OPENAI_API_KEY"))
)


OPENAI_MODERATION_URL = (
    "https://api.openai.com/v1/moderations"
)

MODERATION_MODEL = (
    "omni-moderation-latest"
)


def moderate_grievance(title="", text=""):
    """
    AI moderation for CampusVoice grievances.

    Returns:
        {
            "decision": "allow" | "reject",
            "reason": str,
            "category": str | None,
            "flagged": bool,
            "categories": dict,
            "scores": dict
        }
    """

    api_key = os.getenv("OPENAI_API_KEY")

    # --------------------------------------------------
    # FAIL-SAFE:
    # If AI moderation is unavailable, DO NOT reject
    # a student's grievance.
    # --------------------------------------------------

    if not api_key:
        return {
            "decision": "allow",
            "reason": "AI moderation unavailable",
            "category": None,
            "flagged": False,
            "categories": {},
            "scores": {},
            "moderationAvailable": False,
        }

    content = ""

    if title:
        content += f"Title: {title}\n"

    content += f"Description: {text}"

    try:
        response = requests.post(
            OPENAI_MODERATION_URL,
            headers={
                "Authorization":
                    f"Bearer {api_key}",
                "Content-Type":
                    "application/json",
            },
            json={
                "model": MODERATION_MODEL,
                "input": content,
            },
            timeout=10,
        )

        response.raise_for_status()

        payload = response.json()

        result = (
            payload
            .get("results", [{}])[0]
        )

        flagged = bool(
            result.get("flagged", False)
        )

        categories = result.get(
            "categories",
            {}
        )

        scores = result.get(
            "category_scores",
            {}
        )

        # --------------------------------------------------
        # POLICY
        #
        # We only AUTO-REJECT clearly abusive/prohibited
        # content.
        #
        # A legitimate complaint mentioning harassment,
        # assault, threats, discrimination etc. should NOT
        # automatically disappear merely because the topic
        # is sensitive.
        # --------------------------------------------------

        rejection_category = None

        # Complaint/reporting context is important. A student may quote
        # hateful, threatening, sexual, or abusive language while reporting
        # misconduct. Those reports should not be silently suppressed.
        context_text = content.lower()
        complaint_markers = (
            "complaint", "grievance", "report", "reported",
            "harassment", "assault", "threat", "threatened",
            "discrimination", "misconduct", "abuse", "bullied",
            "bullying", "ragging", "molestation", "unwanted",
            "incident", "teacher", "faculty", "staff", "warden"
        )
        is_complaint_context = any(
            marker in context_text
            for marker in complaint_markers
        )

        # Sexual content involving minors is always prohibited.
        if categories.get("sexual/minors", False):
            rejection_category = "sexual_minors"

        # Self-harm instructions are prohibited. Merely discussing distress
        # or self-harm in a grievance is not automatically rejected.
        elif categories.get("self-harm/instructions", False):
            rejection_category = "self_harm_instructions"

        # Hate / graphic violence can appear in legitimate misconduct reports.
        # Reject only when there is no indication that the text is a report.
        elif (
            (
                categories.get("hate", False)
                or categories.get("hate/threatening", False)
            )
            and not is_complaint_context
        ):
            rejection_category = "hate"

        elif (
            categories.get("violence/graphic", False)
            and not is_complaint_context
        ):
            rejection_category = "graphic_violence"

        # High-confidence harassment without reporting context is treated as
        # abusive language. Reporting harassment remains allowed.
        elif (
            categories.get("harassment", False)
            and scores.get("harassment", 0) >= 0.92
            and not is_complaint_context
        ):
            rejection_category = "abusive_harassment"

        if rejection_category:

            reason_map = {
                "hate":
                    "Hateful or abusive content is not allowed.",
                "graphic_violence":
                    "Graphic violent content is not allowed.",
                "self_harm_instructions":
                    "Instructions for self-harm are not allowed.",
                "sexual_minors":
                    "Sexual content involving minors is not allowed.",
                "abusive_harassment":
                    "Abusive or insulting language is not allowed.",
            }

            return {
                "decision": "reject",
                "reason": reason_map.get(
                    rejection_category,
                    "This content violates CampusVoice content guidelines.",
                ),
                "category": rejection_category,
                "flagged": flagged,
                "categories": categories,
                "scores": scores,
                "moderationAvailable": True,
            }

        # --------------------------------------------------
        # Everything else is allowed.
        #
        # This intentionally allows legitimate sensitive
        # grievances to reach the institutional workflow.
        # --------------------------------------------------

        return {
            "decision": "allow",
            "reason": "Content passed moderation.",
            "category": None,
            "flagged": flagged,
            "categories": categories,
            "scores": scores,
            "moderationAvailable": True,
        }

    except Exception as error:

        print(
            "AI moderation error:",
            error
        )

        # --------------------------------------------------
        # NEVER suppress a grievance because the AI service
        # itself failed.
        # --------------------------------------------------

        return {
            "decision": "allow",
            "reason": "Moderation service unavailable",
            "category": None,
            "flagged": False,
            "categories": {},
            "scores": {},
            "moderationAvailable": False,
        }