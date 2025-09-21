document.addEventListener('DOMContentLoaded', () => {
    const chatbotFab = document.querySelector('.chatbot-fab');
    const chatbotWidget = document.querySelector('.chatbot-widget');
    const chatMessages = document.querySelector('.chat-messages');
    const chatInputForm = document.querySelector('.chat-input-form');
    const chatInput = chatInputForm.querySelector('input');

    // Toggle chatbot widget visibility
    chatbotFab.addEventListener('click', () => {
        chatbotWidget.classList.toggle('active');
    });

    // Handle form submission
    chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage(userMessage, 'user');
        chatInput.value = '';

        // Get bot response
        fetchBotResponse(userMessage);
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    }

    function fetchBotResponse(message) {
        fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        })
        .then(res => res.json())
        .then(data => {
            addMessage(data.reply, 'bot');
        })
        .catch(err => console.error("Chatbot API Error:", err));
    }
});