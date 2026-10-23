import datetime

from  database.mongo import audit_logs_col


BAD_WORDS = {
    "badword1",
    "badword2",
    "badword3"
}


def is_toxic(text):

    lower = text.lower()

    return any(
        word in lower
        for word in BAD_WORDS
    )


def now_iso():

    return datetime.datetime.now(
        datetime.timezone.utc
    ).strftime(
        "%Y-%m-%dT%H:%M:%S.000Z"
    )


