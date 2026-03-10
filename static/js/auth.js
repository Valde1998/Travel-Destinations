function isLoggedIn() { return window.loggedIn === true; }

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    try {
        await login(username, password);
        window.location.href = '/';
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('signup-error');
    if (password !== confirm) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Adgangskoder matcher ikke';
        return;
    }
    try {
        await signup(username, password);
        window.location.href = '/login?signup=success';
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
    }
}

async function logout() {
    await fetchAPI('/api/logout', { method: 'POST' });
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    }
    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', handleSignup);
    }
});