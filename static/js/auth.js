document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    // Redirect to the dashboard
                    window.location.href = `/dashboard/${user.uid}`;
                })
                .catch((error) => {
                    errorMessage.textContent = error.message;
                });
        });
    }

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            
            // Step 1: Create user in Firebase Auth
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Step 2: Prepare data for Firestore
                    const userData = {
                        uid: user.uid,
                        email: registerForm.email.value,
                        name: registerForm.name.value,
                        registerNumber: registerForm.registerNumber.value,
                        degree: registerForm.degree.value,
                        batch: registerForm.batch.value,
                        college: registerForm.college.value,
                    };
                    
                    // Step 3: Send data to our backend to save in Firestore
                    return fetch('/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData),
                    });
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Redirect to login page after successful registration
                        window.location.href = '/login';
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch((error) => {
                    errorMessage.textContent = error.message;
                });
        });
    }
});