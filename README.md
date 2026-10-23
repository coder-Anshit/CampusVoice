# campus-voice-advance

## Security and configuration

- Copy `backend/.env.example` to `backend/.env` and set private local values before starting the backend.
- Copy `frontend/.env.example` to `frontend/.env` and set the API base URL for your environment.
- Never commit real `.env` files, passwords, tokens, database connection strings or real user data.
- This source bundle was cleaned for repository preparation; the app has not been runtime-tested as part of this packaging step.

## Feedback form question types

The feedback builder supports long text, short text, single choice, checkboxes (select multiple), rating and Yes/No questions. Checkbox questions can optionally enforce a maximum number of selections; the backend validates submitted options and limits.

### Seed the student research survey

With the backend virtual environment active and `MONGO_URL` or `MONGO_URI` configured in `backend/.env`, run from the `backend` directory:

```bash
python seed_unfiltered_classroom_survey.py
```

This upserts and publishes **The Unfiltered Classroom 🎓** with 22 questions. It targets all students and marks the form anonymous in the UI; the app's existing backend may retain an internal student identifier to prevent duplicate submissions. Test with a non-production database first.
