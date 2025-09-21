document.addEventListener('DOMContentLoaded', () => {
    // --- Get User ID and Topic from the HTML ---
    const userId = document.body.dataset.userId;
    const topic = document.querySelector('.quiz-container').dataset.topic;

    // --- Select the correct question set based on the topic ---
    const questions = allQuestions[topic] || [];

    // --- STATE VARIABLES ---
    let currentQuestionIndex = 0;
    let timeLeft = 30 * 60; // 30 minutes in seconds
    let timerInterval;
    const userAnswers = new Array(questions.length).fill(null);
    const questionStatus = new Array(questions.length).fill('not-answered'); // 'not-answered', 'answered', 'marked-for-review'

    // --- ELEMENT REFERENCES ---
    const questionNumberEl = document.getElementById('question-number');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainerEl = document.getElementById('options-container');
    const timerEl = document.getElementById('timer');
    const questionPaletteEl = document.getElementById('question-palette');
    
    const saveNextBtn = document.getElementById('save-next-btn');
    const markReviewBtn = document.getElementById('mark-review-btn');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');

    // --- INITIALIZATION ---
    function initQuiz() {
        if (!userId || questions.length === 0) {
            alert("Error: Could not load quiz. Please go back and try again.");
            return;
        }
        renderPalette();
        loadQuestion(currentQuestionIndex);
        startTimer();
        setupEventListeners();
    }

    // --- CORE FUNCTIONS ---
    function loadQuestion(index) {
        currentQuestionIndex = index;
        const question = questions[index];
        
        questionNumberEl.textContent = `Question ${index + 1} of ${questions.length}`;
        questionTextEl.textContent = question.q;
        optionsContainerEl.innerHTML = '';

        question.options.forEach((option, i) => {
            const li = document.createElement('li');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'option';
            input.id = `option${i}`;
            input.value = i;
            
            const label = document.createElement('label');
            label.htmlFor = `option${i}`;
            label.textContent = option;
            
            li.appendChild(input);
            li.appendChild(label);
            optionsContainerEl.appendChild(li);

            if (userAnswers[index] === i) {
                input.checked = true;
            }
        });
        updatePalette();
    }

    function renderPalette() {
        questionPaletteEl.innerHTML = '';
        for (let i = 0; i < questions.length; i++) {
            const btn = document.createElement('button');
            btn.classList.add('palette-btn');
            btn.textContent = i + 1;
            btn.dataset.index = i;
            questionPaletteEl.appendChild(btn);
        }
    }

    function updatePalette() {
        const paletteButtons = questionPaletteEl.querySelectorAll('.palette-btn');
        paletteButtons.forEach((btn, index) => {
            btn.classList.remove('current', 'answered', 'marked-for-review');
            
            if (questionStatus[index] === 'answered') {
                btn.classList.add('answered');
            } else if (questionStatus[index] === 'marked-for-review') {
                btn.classList.add('marked-for-review');
            }

            if (index === currentQuestionIndex) {
                btn.classList.add('current');
            }
        });
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitTest();
            }
        }, 1000);
    }
    
    function saveCurrentAnswer() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption) {
            userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
            return true;
        }
        return false;
    }

    function submitTest() {
        clearInterval(timerInterval);
        let score = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === questions[index].answer) {
                score++;
            }
        });
        
        const totalQuestions = questions.length;
        const attempted = userAnswers.filter(a => a !== null).length;

        // Send results to the backend
        const resultData = {
            topic: topic,
            score: score,
            totalQuestions: totalQuestions
        };

        fetch(`/api/user/${userId}/submit_test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData)
        });

        // Display results modal
        const modal = document.createElement('div');
        modal.className = 'result-modal';
        modal.innerHTML = `
            <div class="result-content">
                <h2>Test Submitted!</h2>
                <p>Your Score: <strong>${score} / ${totalQuestions}</strong></p>
                <p>Questions Attempted: <strong>${attempted} / ${totalQuestions}</strong></p>
                <button id="dashboardRedirectBtn" class="btn btn-primary">Go to Dashboard</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('dashboardRedirectBtn').addEventListener('click', () => {
            window.location.href = `/dashboard/${userId}`;
        });
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        saveNextBtn.addEventListener('click', () => {
            const answered = saveCurrentAnswer();
            if(answered) {
                 questionStatus[currentQuestionIndex] = 'answered';
            }
            if (currentQuestionIndex < questions.length - 1) {
                loadQuestion(currentQuestionIndex + 1);
            } else {
                alert("This is the last question. Click 'Submit Test' to finish.");
            }
        });
        
        markReviewBtn.addEventListener('click', () => {
            saveCurrentAnswer();
            questionStatus[currentQuestionIndex] = 'marked-for-review';
            if (currentQuestionIndex < questions.length - 1) {
                loadQuestion(currentQuestionIndex + 1);
            } else {
                alert("This is the last question. Click 'Submit Test' to finish.");
            }
        });

        clearBtn.addEventListener('click', () => {
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (selectedOption) {
                selectedOption.checked = false;
            }
            userAnswers[currentQuestionIndex] = null;
            questionStatus[currentQuestionIndex] = 'not-answered';
            updatePalette();
        });

        questionPaletteEl.addEventListener('click', (e) => {
            if (e.target.matches('.palette-btn')) {
                const index = parseInt(e.target.dataset.index);
                loadQuestion(index);
            }
        });

        submitBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to submit the test?")) {
                submitTest();
            }
        });
    }

    // --- START THE QUIZ ---
    initQuiz();
});