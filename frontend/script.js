const apiUrl = "http://127.0.0.1:5000/destinations";

function loadDestinations() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("destinations");
            container.innerHTML = "";

            data.forEach(d => {
                container.innerHTML += `
                    <div>
                        <h3>${d.title}</h3>
                        <p>${d.country}</p>
                        <button onclick="window.location='edit.html?id=${d.id}'">Edit</button>
                        <button onclick="deleteDestination(${d.id})">Delete</button>
                    </div>
                `;
            });
        });
}

function deleteDestination(id) {
    if (confirm("Are you sure?")) {
        fetch(`${apiUrl}/${id}`, {
            method: "DELETE"
        }).then(() => loadDestinations());
    }
}

loadDestinations();