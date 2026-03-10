document.addEventListener('DOMContentLoaded', async () => {
    await loadDestination();
    if (isLoggedIn()) {
        document.getElementById('delete-btn')?.addEventListener('click', confirmDelete);
    }
    document.getElementById('destination-form').addEventListener('submit', handleUpdate);
});

async function loadDestination() {
    try {
        const d = await getDestination(window.destinationId);
        document.getElementById('destination-id').value = d.id;
        document.getElementById('title').value = d.title || '';
        document.getElementById('description').value = d.description || '';
        document.getElementById('location').value = d.location || '';
        document.getElementById('country').value = d.country || '';
        document.getElementById('date_from').value = d.date_from || '';
        document.getElementById('date_to').value = d.date_to || '';
        document.getElementById('form-title').textContent = `Rediger: ${d.title}`;
    } catch (error) {
        alert('Fejl: ' + error.message);
        window.location.href = '/';
    }
}

async function handleUpdate(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    if (!title) {
        document.getElementById('title-error').textContent = 'Titel er påkrævet';
        return;
    }
    const data = {
        title: title,
        description: document.getElementById('description').value.trim(),
        location: document.getElementById('location').value.trim(),
        country: document.getElementById('country').value.trim(),
        date_from: document.getElementById('date_from').value || null,
        date_to: document.getElementById('date_to').value || null
    };
    try {
        await updateDestination(window.destinationId, data);
        window.location.href = `/destination/${window.destinationId}`;
    } catch (error) {
        alert('Fejl: ' + error.message);
    }
}

function confirmDelete() {
    if (confirm('Slet destination?')) handleDelete();
}

async function handleDelete() {
    try {
        await deleteDestination(window.destinationId);
        window.location.href = '/';
    } catch (error) {
        alert('Fejl: ' + error.message);
    }
}