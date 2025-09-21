import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

# Check if the environment variable exists
if 'GOOGLE_CREDENTIALS_JSON' in os.environ:
    # On Render: Load credentials from the environment variable
    creds_json_str = os.environ.get('GOOGLE_CREDENTIALS_JSON')
    creds_dict = json.loads(creds_json_str)
    cred = credentials.Certificate(creds_dict)
else:
    # Locally: Load credentials from the JSON file
    cred = credentials.Certificate('serviceAccountKey.json')

# Initialize the app if not already done
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
