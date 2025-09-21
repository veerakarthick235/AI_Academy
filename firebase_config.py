import firebase_admin
from firebase_admin import credentials, firestore, auth

# Load the service account key
cred = credentials.Certificate('serviceAccountKey.json')

# Initialize the app if it's not already initialized
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Get a reference to the Firestore database and Auth service
db = firestore.client()
firebase_auth = auth