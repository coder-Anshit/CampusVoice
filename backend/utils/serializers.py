from  bson import ObjectId

def serial(doc):

    for key, value in doc.items():

        if isinstance(value, ObjectId):
            doc[key] = str(value)

        elif isinstance(value, list):
            doc[key] = [
                str(v) if isinstance(v, ObjectId)
                else v
                for v in value
            ]

        elif isinstance(value, dict):
            doc[key] = serial(value)

    return doc