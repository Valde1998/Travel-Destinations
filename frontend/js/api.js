const API_BASE_URL = 'http://localhost:5000';

// Hjælpefunktion til fetch
async function fetchAPI(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Noget gik galt');
    }
    
    return data;
}

// Destination endpoints
async function getDestinations() {
    return fetchAPI('/destinations');
}

async function getDestination(id) {
    return fetchAPI(`/destinations/${id}`);
}

async function createDestination(destinationData) {
    return fetchAPI('/destinations', {
        method: 'POST',
        body: JSON.stringify(destinationData)
    });
}

async function updateDestination(id, destinationData) {
    return fetchAPI(`/destinations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(destinationData)
    });
}

async function deleteDestination(id) {
    return fetchAPI(`/destinations/${id}`, {
        method: 'DELETE'
    });
}

// Auth endpoints
async function signup(username, password) {
    return fetchAPI('/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

async function login(username, password) {
    return fetchAPI('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}