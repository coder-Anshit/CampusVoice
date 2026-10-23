# Security Checklist

This checklist is not a security certification.

- Keep `.env` files, JWT secrets, database credentials and API keys out of Git.
- Keep `.env.example` limited to placeholders.
- Rotate any credential that may have been exposed.
- Test backend role enforcement for every sensitive action; hiding a button is not authorization.
- Verify JWT expiry, signature configuration, token handling and password-change behaviour.
- Check anonymous submission responses and logs for identity leakage.
- Use least-privilege MongoDB credentials and restrict network access.
- Configure CORS for trusted origins and use HTTPS in deployed environments.
- Use synthetic users/data in screenshots and demos.
- Inspect staged files and Git history before public publication.
