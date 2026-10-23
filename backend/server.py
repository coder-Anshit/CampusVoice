"""CampusVoice production entry point.

Keep this file intentionally small so deployment commands can continue to use
`python server.py` while application composition lives in `app.py`.
"""

from app import app


if __name__ == "__main__":
    app.run(debug=True)
