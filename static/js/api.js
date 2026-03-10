const API_BASE_URL = '';

async function fetchAPI(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Fejl');
    return data;
}

function getDestinations() { return fetchAPI('/api/destinations'); }
function getDestination(id) { return fetchAPI(`/api/destinations/${id}`); }
function createDestination(data) { return fetchAPI('/api/destinations', { method: 'POST', body: JSON.stringify(data) }); }
function updateDestination(id, data) { return fetchAPI(`/api/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
function deleteDestination(id) { return fetchAPI(`/api/destinations/${id}`, { method: 'DELETE' }); }
function signup(username, password) { return fetchAPI('/api/signup', { method: 'POST', body: JSON.stringify({ username, password }) }); }
function login(username, password) { return fetchAPI('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }); }
function logout() { return fetchAPI('/api/logout', { method: 'POST' }); }