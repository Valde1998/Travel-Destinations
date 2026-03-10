document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('destination-form').addEventListener('submit', async (e) => {
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
            const result = await createDestination(data);
            window.location.href = `/destination/${result.id}`;
        } catch (error) {
            alert('Fejl: ' + error.message);
        }
    });
});