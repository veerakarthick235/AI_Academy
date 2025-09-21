# --- All imports should be at the top ---
from flask import Flask, render_template, request, jsonify, redirect, url_for
from firebase_config import db
import datetime
from google.cloud import firestore
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

# Load environment variables from your .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = 'your_very_secret_key' # Change this for production

# --- Cloudinary Configuration ---
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# --- Authentication Routes ---
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        uid = data.get('uid')
        email = data.get('email')
        name = data.get('name')
        register_number = data.get('registerNumber')
        degree = data.get('degree')
        batch = data.get('batch')
        college = data.get('college')

        try:
            user_doc_ref = db.collection('users').document(uid)
            user_doc_ref.set({
                'name': name,
                'email': email,
                'registerNumber': register_number,
                'degree': degree,
                'batch': batch,
                'college': college,
                'lastUpdated': datetime.datetime.now().strftime("%d/%m/%Y %I:%M %p"),
                'courses': {'completed': 0, 'inProgress': 0},
                'overallScore': 0
            })
            return jsonify({'success': True, 'message': 'User registered successfully!'})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    return render_template('register.html')


# --- Main Application Routes ---
@app.route('/dashboard/<user_id>')
def dashboard(user_id):
    return render_template('dashboard.html', user_id=user_id, active_page='dashboard')

@app.route('/profile/<user_id>')
def profile(user_id):
    return render_template('profile.html', user_id=user_id, active_page='profile')

@app.route('/assessments/<user_id>')
def assessments(user_id):
    return render_template('assessments.html', user_id=user_id, active_page='assessments')

@app.route('/leaderboard/<user_id>')
def leaderboard(user_id):
    return render_template('leaderboard.html', user_id=user_id, active_page='leaderboard')

# --- Route for Starting an Assessment ---
@app.route('/assessment/<user_id>/<topic>')
def start_test(user_id, topic):
    topic_map = {
        "python": "Python Programming",
        "java": "Java Programming",
        "cplusplus": "C++ Programming",
        "javascript": "JavaScript",
        "sql": "SQL & Databases",
        "dsa": "Data Structures & Algorithms",
        "quantitative": "Quantitative Aptitude",
        "logical": "Logical Reasoning",
        "verbal": "Verbal Ability"
    }
    topic_name = topic_map.get(topic, "Unknown Test")
    
    return render_template(
        'test_page.html', 
        user_id=user_id, 
        topic_name=topic_name, 
        topic_key=topic,
        active_page='assessments'
    )

# --- API Endpoints for Data ---
@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_data(user_id):
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        user_data = user_doc.to_dict()

        # Get all test results for the user
        tests_ref = user_ref.collection('test_results').stream()
        
        completed_topics = set()
        monthly_scores = [0] * 12 # [Jan, Feb, ..., Dec]

        for test in tests_ref:
            test_data = test.to_dict()
            completed_topics.add(test_data.get('topic'))
            
            timestamp = test_data.get('timestamp')
            if timestamp:
                month_index = timestamp.month - 1
                monthly_scores[month_index] = max(monthly_scores[month_index], test_data.get('percentage', 0))

        total_courses = 9
        completed_count = len(completed_topics)
        in_progress_count = total_courses - completed_count
        
        user_data['courses'] = {
            'completed': completed_count,
            'inProgress': in_progress_count
        }

        user_data['performance'] = {
            'monthly': {'exam': monthly_scores, 'attendance': [90, 85, 92, 88, 95, 91, 89, 93, 94, 91, 93, 90]},
            'weekly': {'exam': [0]*5, 'attendance': [0]*5}
        }

        response = jsonify({'success': True, 'data': user_data})
        
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/<user_id>/update', methods=['POST'])
def update_user_data(user_id):
    try:
        data = request.get_json()
        user_ref = db.collection('users').document(user_id)
        user_ref.update(data)
        return jsonify({'success': True, 'message': 'User data updated successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/<user_id>/upload_image', methods=['POST'])
def upload_profile_image(user_id):
    try:
        if 'profileImage' not in request.files:
            return jsonify({'success': False, 'message': 'No file part'}), 400
        
        file_to_upload = request.files['profileImage']

        if file_to_upload.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400

        upload_result = cloudinary.uploader.upload(
            file_to_upload,
            public_id=user_id,
            folder="quiz_portal_profiles"
        )

        secure_url = upload_result['secure_url']
        user_ref = db.collection('users').document(user_id)
        user_ref.update({'profileImageUrl': secure_url})

        return jsonify({'success': True, 'imageUrl': secure_url})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/<user_id>/submit_test', methods=['POST'])
def submit_test_result(user_id):
    try:
        data = request.get_json()
        user_ref = db.collection('users').document(user_id)

        user_ref.collection('test_results').add({
            'topic': data.get('topic'),
            'score': data.get('score'),
            'totalQuestions': data.get('totalQuestions'),
            'percentage': (data.get('score') / data.get('totalQuestions')) * 100,
            'timestamp': datetime.datetime.now()
        })

        all_tests_snapshot = user_ref.collection('test_results').stream()
        total_percentage = 0
        test_count = 0
        for test in all_tests_snapshot:
            total_percentage += test.to_dict().get('percentage', 0)
            test_count += 1
        
        overall_score = total_percentage / test_count if test_count > 0 else 0
        user_ref.update({'overallScore': round(overall_score, 2)})

        return jsonify({'success': True, 'message': 'Test result saved.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/leaderboard')
def get_leaderboard():
    try:
        users_ref = db.collection('users').order_by('overallScore', direction=firestore.Query.DESCENDING).limit(100)
        users_stream = users_ref.stream()

        leaderboard_data = []
        for user in users_stream:
            user_data = user.to_dict()
            leaderboard_data.append({
                'name': user_data.get('name'),
                'college': user_data.get('college'),
                'profilePic': user_data.get('profileImageUrl', 'https://i.stack.imgur.com/34AD2.jpg'),
                'score': user_data.get('overallScore', 0)
            })
        
        return jsonify({'success': True, 'leaderboard': leaderboard_data})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# Add this to app.py
# In app.py, replace the get_chatbot_response function with this

def get_chatbot_response(user_message):
    """
    A simple rule-based function to get a chatbot response.
    """
    message = user_message.lower()

    # --- NEW: Added custom name responses ---
    if "karthick" in message:
        return "Veerakarthick is a developer of the AI Academy portal."
    elif "sarjan" in message:
        return "Sarjan is a developer of the AI Academy portal."
    elif "vinith" in message:
        return "Vinith is a developer of the AI Academy portal."
    # --- END of new code ---

    elif "leaderboard" in message:
        return "The leaderboard shows student rankings based on their average test scores. Scores are updated every time you complete a new assessment."
    elif "assessment" in message or "test" in message:
        return "You can take tests on various subjects in the Assessments section. Your scores will contribute to your overall ranking on the leaderboard."
    elif "profile" in message:
        return "You can view and edit your profile details, including your name, college, and profile picture, on the Profile page."
    elif "score" in message:
        return "Your overall score is the average of the percentage you get on all completed tests. Keep taking assessments to improve it!"
    elif "dashboard" in message:
        return "The dashboard gives you an overview of your performance in tests and your progress in completing all the available courses."
    elif "hello" in message or "hi" in message:
        return "Hello! How can I help you with the AI Academy portal today? You can ask me about the dashboard, assessments, profile, or leaderboard."
    else:
        return "Sorry, I can only answer questions about this portal. Try asking about the 'leaderboard', 'assessments', 'profile', or your 'score'."

@app.route('/api/chatbot', methods=['POST'])
def chatbot_api():
    try:
        data = request.get_json()
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'reply': 'Please say something.'})

        bot_reply = get_chatbot_response(user_message)
        return jsonify({'reply': bot_reply})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)