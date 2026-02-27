document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('destination-form');
    
    // Tjek om bruger er logget ind
    updateAuthUI();
    
    // Frontend validering
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Ryd tidligere fejl
        clearErrors();
        
        // Hent værdier
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
        
        // Opret destination
        try {
            const destinationData = {
                title: title,
                description: document.getElementById('description').value.trim(),
                location: document.getElementById('location').value.trim(),
                country: document.getElementById('country').value.trim(),
                date_from: dateFrom || null,
                date_to: dateTo || null
            };
            
            const result = await createDestination(destinationData);
            alert('Destination oprettet!');
            window.location.href = `destination.html?id=${result.id}`;
            
        } catch (error) {
            alert('Fejl: ' + error.message);
        }
    });
});

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