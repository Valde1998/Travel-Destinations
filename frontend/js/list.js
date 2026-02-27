document.addEventListener('DOMContentLoaded', async function() {
    await loadDestinations();
    updateAuthUI();
});

async function loadDestinations() {
    const listElement = document.getElementById('destinations-list');
    
    try {
        listElement.innerHTML = '<div class="loading">Henter destinationer...</div>';
        
        const destinations = await getDestinations();
        
        if (destinations.length === 0) {
            listElement.innerHTML = '<p>Ingen destinationer endnu. Tilføj din første destination!</p>';
            return;
        }
        
        listElement.innerHTML = destinations.map(dest => `
            <div class="destination-card" data-id="${dest.id}">
                <h3>${dest.title}</h3>
                <p><strong>Land:</strong> ${dest.country || 'Ikke angivet'}</p>
                <p><strong>Lokation:</strong> ${dest.location || 'Ikke angivet'}</p>
                <p><strong>Periode:</strong> ${formatDate(dest.date_from)} - ${formatDate(dest.date_to)}</p>
                <div class="card-actions">
                    <a href="destination.html?id=${dest.id}" class="btn">Se detaljer</a>
                    ${isLoggedIn() ? `
                        <button onclick="deleteFromList(${dest.id})" class="btn btn-danger">Slet</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        listElement.innerHTML = `<p class="error">Fejl: ${error.message}</p>`;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Ikke angivet';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK');
}

async function deleteFromList(id) {
    if (!confirm('Er du sikker på at du vil slette denne destination?')) {
        return;
    }
    
    try {
        await deleteDestination(id);
        // Fjern kortet fra DOM uden at genindlæse siden
        const card = document.querySelector(`.destination-card[data-id="${id}"]`);
        if (card) {
            card.remove();
        }
        
        // Tjek om listen nu er tom
        const listElement = document.getElementById('destinations-list');
        if (listElement.children.length === 0) {
            listElement.innerHTML = '<p>Ingen destinationer endnu. Tilføj din første destination!</p>';
        }
    } catch (error) {
        alert('Fejl ved sletning: ' + error.message);
    }
}