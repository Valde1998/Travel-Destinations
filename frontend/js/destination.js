let currentDestinationId = null;

document.addEventListener('DOMContentLoaded', async function() {
    updateAuthUI();
    
    // Hent ID fra URL
    const urlParams = new URLSearchParams(window.location.search);
    currentDestinationId = urlParams.get('id');
    
    if (!currentDestinationId) {
        alert('Ingen destination valgt');
        window.location.href = 'index.html';
        return;
    }
    
    await loadDestination();
    
    // Vis slet-knap kun for loggede ind brugere
    const deleteBtn = document.getElementById('delete-btn');
    if (isLoggedIn()) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.addEventListener('click', confirmDelete);
    }
    
    // Form submission
    const form = document.getElementById('destination-form');
    form.addEventListener('submit', handleUpdate);
});

async function loadDestination() {
    try {
        const dest = await getDestination(currentDestinationId);
        
        // Udfyld formular
        document.getElementById('destination-id').value = dest.id;
        document.getElementById('title').value = dest.title || '';
        document.getElementById('description').value = dest.description || '';
        document.getElementById('location').value = dest.location || '';
        document.getElementById('country').value = dest.country || '';
        document.getElementById('date_from').value = dest.date_from || '';
        document.getElementById('date_to').value = dest.date_to || '';
        
        document.getElementById('form-title').textContent = `Rediger: ${dest.title}`;
        
    } catch (error) {
        alert('Fejl ved indlæsning: ' + error.message);
        window.location.href = 'index.html';
    }
}

async function handleUpdate(event) {
    event.preventDefault();
    clearErrors();
    
    const title = document.getElementById('title').value.trim();
    const dateFrom = document.getElementById('date_from').value;
    const dateTo = document.getElementById('date_to').value;
    
    // Validering
    let isValid = true;
    
    if (!title) {
        showError('title', 'Titel er påkrævet');
        isValid = false;
    }
    
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        showError('date_to', 'Slutdato skal være efter startdato');
        isValid = false;
    }
    
    if (!isValid) return;
    
    try {
        const destinationData = {
            title: title,
            description: document.getElementById('description').value.trim(),
            location: document.getElementById('location').value.trim(),
            country: document.getElementById('country').value.trim(),
            date_from: dateFrom || null,
            date_to: dateTo || null
        };
        
        await updateDestination(currentDestinationId, destinationData);
        alert('Destination opdateret!');
        window.location.href = `destination.html?id=${currentDestinationId}`;
        
    } catch (error) {
        alert('Fejl: ' + error.message);
    }
}

function confirmDelete() {
    if (confirm('Er du sikker på at du vil slette denne destination?')) {
        handleDelete();
    }
}

async function handleDelete() {
    try {
        await deleteDestination(currentDestinationId);
        alert('Destination slettet!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Fejl ved sletning: ' + error.message);
    }
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.textContent = '';
    });
}