# AI Academy - Interactive Learning Portal

![AI Academy Dashboard](https://i.imgur.com/L1i1A5E.png)

AI Academy is a full-stack web application designed as an interactive learning and assessment platform for students. It provides a complete ecosystem for students to manage their profiles, take timed assessments across various subjects, and track their performance on a real-time leaderboard.

---
## ## Features

* **User Authentication:** Secure user registration and login system powered by Firebase Authentication.
* **Dynamic Dashboard:** A personalized dashboard that visualizes student performance with interactive charts for test scores and course completion.
* **Profile Management:** Users can view and edit their personal details and upload a profile picture, with image hosting managed by Cloudinary.
* **Comprehensive Assessments:** A timed, 25-question quiz module with a dynamic question-fetching system for multiple subjects, including:
    * Python, Java, C++, JavaScript
    * SQL & Databases, Data Structures & Algorithms
    * Quantitative Aptitude, Logical Reasoning, and Verbal Ability
* **Real-Time Leaderboard:** A live leaderboard that ranks students based on their cumulative average score, updated instantly after every completed test.
* **AI Assistant Chatbot:** A simple, rule-based chatbot to help users with common questions about the portal's features.

---
## ## Technology Stack

* **Backend:** Python with the **Flask** web framework.
* **Database:** **Google Firestore** for real-time data storage (user info, test results).
* **Authentication:** **Firebase Authentication**.
* **Image Storage:** **Cloudinary** for cloud-based media management.
* **Frontend:** Vanilla **JavaScript (ES6)**, **HTML5**, and **CSS3**.
* **Charting Library:** **Chart.js** for data visualization on the dashboard.

---
## ## Setup and Installation

To run this project locally, follow these steps:

### ### Prerequisites

* Python 3.8+
* Git
* A Firebase project with Firestore enabled.
* A Cloudinary account.

### ### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/AI-Academy-Portal.git](https://github.com/your-username/AI-Academy-Portal.git)
    cd AI-Academy-Portal
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    * Create a file named `.env` in the root directory.
    * Add your Cloudinary credentials to this file:
        ```
        CLOUDINARY_CLOUD_NAME=your_cloud_name
        CLOUDINARY_API_KEY=your_api_key
        CLOUDINARY_API_SECRET=your_api_secret
        ```

5.  **Set up your Firebase credentials:**
    * Download your `serviceAccountKey.json` file from your Firebase project settings.
    * Place it in the root directory of the project. **Note:** The `.gitignore` file is configured to prevent this file from being uploaded to GitHub.

6.  **Run the application:**
    ```bash
    python app.py
    ```

The application will be available at `http://127.0.0.1:5000`.
