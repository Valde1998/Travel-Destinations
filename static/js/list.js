document.addEventListener('DOMContentLoaded', loadDestinations);

async function loadDestinations() {
    const list = document.getElementById('destinations-list');
    try {
        list.innerHTML = '<div class="loading">Henter...</div>';
        const dests = await getDestinations();
        if (dests.length === 0) {
            list.innerHTML = '<p>Ingen destinationer endnu.</p>';
            return;
        }
        list.innerHTML = dests.map(d => `
            <div class="destination-card" data-id="${d.id}">
                <h3>${d.title}</h3>
                <p><strong>Land:</strong> ${d.country || 'Ikke angivet'}</p>
                <p><strong>Lokation:</strong> ${d.location || 'Ikke angivet'}</p>
                <p><strong>Periode:</strong> ${formatDate(d.date_from)} - ${formatDate(d.date_to)}</p>
                <div class="card-actions">
                    <a href="/destination/${d.id}" class="btn">Detaljer</a>
                    ${isLoggedIn() ? `<button onclick="deleteFromList(${d.id})" class="btn btn-danger">Slet</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = `<p class="error">Fejl: ${error.message}</p>`;
    }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('da-DK') : 'Ikke angivet'; }

async function deleteFromList(id) {
    if (!confirm('Slet destination?')) return;
    try {
        await deleteDestination(id);
        document.querySelector(`.destination-card[data-id="${id}"]`).remove();
        const list = document.getElementById('destinations-list');
        if (list.children.length === 0) {
            list.innerHTML = '<p>Ingen destinationer endnu.</p>';
        }
    } catch (error) {
        alert('Fejl: ' + error.message);
    }
}