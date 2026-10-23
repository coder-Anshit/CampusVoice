"""Authentication and role authorization middleware."""

from functools import wraps
import os

import jwt
from dotenv import load_dotenv
from flask import jsonify, request

load_dotenv()


def require_role(*roles):
    """Require a valid bearer token and one of the supplied roles."""

    allowed_roles = set(roles)

    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            scheme, _, token = auth_header.partition(" ")

            if scheme.lower() != "bearer" or not token.strip():
                return jsonify({"error": "Bearer token missing"}), 401

            secret = os.getenv("JWT_SECRET")
            if not secret:
                return jsonify({"error": "Authentication service is not configured"}), 500

            try:
                decoded = jwt.decode(
                    token.strip(),
                    secret,
                    algorithms=["HS256"],
                )
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401

            user_role = decoded.get("role")
            if allowed_roles and user_role not in allowed_roles:
                return jsonify({"error": "Forbidden"}), 403

            request.user = decoded
            return view(*args, **kwargs)

        return wrapper

    return decorator
