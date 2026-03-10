// Tjek om bruger er logget ind
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Hent bruger info
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Log ind
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const result = await login(username, password);
        
        // Gem bruger i localStorage
        localStorage.setItem('user', JSON.stringify({
            id: result.user_id,
            username: result.username
        }));
        
        // Omdiriger til liste-siden
        window.location.href = 'index.html';
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
    }
}

// Opret bruger
async function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('signup-error');
    
    // Validering
    if (password !== confirmPassword) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Adgangskoderne matcher ikke';
        return;
    }
    
    if (password.length < 3) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Adgangskode skal være mindst 3 tegn';
        return;
    }
    
    try {
        await signup(username, password);
        // Omdiriger til login
        window.location.href = 'login.html?signup=success';
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
    }
}

// Log ud
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Opdater UI baseret på login status
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const usernameSpan = document.getElementById('username');
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            usernameSpan.textContent = user.username;
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Event listeners når siden loader
document.addEventListener('DOMContentLoaded', function() {
    // Tjek om vi er på login siden
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Tjek om vi er på signup siden
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Tjek for success message ved signup
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'success') {
        alert('Bruger oprettet! Du kan nu logge ind.');
    }
    
    // Opdater UI
    updateAuthUI();
});