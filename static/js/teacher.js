document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton');
    const addVociSetButton = document.getElementById('addVociSetButton');

    logoutButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    addKlasseButton.addEventListener('click', function() {
        // TODO: Hier später die Logik für das Hinzufügen einer Klasse (Div einblenden)
        alert('Funktion zum Hinzufügen einer Klasse wird später implementiert (Div einblenden)');
    });

    addVociSetButton.addEventListener('click', function() {
        // TODO: Hier später die Logik für das Hinzufügen eines Voci Sets (neue Seite)
        alert('Funktion zum Hinzufügen eines Voci Sets (neue Seite) wird später implementiert');
        // window.location.href = 'add-vociset.html'; // Beispiel für neue Seite
    });


    // *** Klassen (Departments) laden ***
    function loadKlassen() {
        const apiKlassenUrl = '/api/departments'; // API für ALLE Departments

        fetch(apiKlassenUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
                // Cookie 'auth' wird automatisch mitgesendet, falls vorhanden
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => { // Response ist jetzt ein JSON-Objekt mit "departments" Array
            const departments = data.departments; // Zugriff auf das "departments" Array
            klassenContainer.innerHTML = ''; // Container leeren

            if (departments && Array.isArray(departments)) { // Überprüfen, ob Departments Array vorhanden ist
                departments.forEach(department => { // Iteriere über das Departments Array
                    const klasseCard = document.createElement('div');
                    klasseCard.classList.add('col'); // Für Bootstrap Grid Spalten
                    klasseCard.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="card-title">${department.label}</h5>
                                    <p class="card-text">${department.studentsCount} Schüler</p>
                                </div>
                                <button class="btn btn-danger delete-button" data-department-id="${department.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    klassenContainer.appendChild(klasseCard);
                });
            } else {
                klassenContainer.innerHTML = '<p>Keine Klassen gefunden.</p>'; // Nachricht, wenn keine Klassen da sind
            }


            // Event Listener für Delete-Buttons nach dem Erstellen hinzufügen
            klassenContainer.addEventListener('click', function(event) {
                if (event.target.classList.contains('fa-trash')) {
                    const deleteButton = event.target.closest('.delete-button');
                    const departmentIdToDelete = deleteButton.dataset.departmentId;
                    if (departmentIdToDelete) {
                        deleteKlasse(departmentIdToDelete);
                    }
                }
            });


        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassen:', error);
            klassenContainer.innerHTML = '<p>Fehler beim Laden der Klassen.</p>';
        });
    }

    function deleteKlasse(departmentId) {
        const apiDeleteKlasseUrl = `/api/departments/${departmentId}/delete`;

        fetch(apiDeleteKlasseUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
                // Cookie 'auth' wird automatisch mitgesendet, falls vorhanden
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`Klasse (Department) mit ID ${departmentId} gelöscht.`);
            loadKlassen(); // Klassen neu laden nach dem Löschen
        })
        .catch(error => {
            console.error('Fehler beim Löschen der Klasse (Department):', error);
            alert('Fehler beim Löschen der Klasse.');
        });
    }


    // *** Voci Sets laden ***
    function loadVociSets() {
        const apiVociSetsUrl = '/api/vocabulary-sets';

        fetch(apiVociSetsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
                // Cookie 'auth' wird automatisch mitgesendet, falls vorhanden
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => { // Geänderter Name von 'vociSets' zu 'data', da API Response ein JSON Objekt mit 'sets' ist
            const vociSets = data.sets; // Zugriff auf das 'sets' Array
            vociSetsContainer.innerHTML = ''; // Container leeren
            if (vociSets && Array.isArray(vociSets)) {
                vociSets.forEach(vociSet => {
                    const vociSetItem = document.createElement('li'); // Bootstrap List Item verwenden
                    vociSetItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    vociSetItem.innerHTML = `
                        <span>${vociSet.label} (Wörter: ${vociSet.wordsCount}, Gelernt: ${vociSet.learnedCount})</span>
                        <!-- Kein Delete Button für Voci Sets, da API nicht vorhanden -->
                    `;
                    vociSetsContainer.appendChild(vociSetItem);
                });
            } else {
                vociSetsContainer.innerHTML = '<p>Keine Voci Sets gefunden.</p>';
            }


        })
        .catch(error => {
            console.error('Fehler beim Laden der Voci Sets:', error);
            vociSetsContainer.innerHTML = '<p>Fehler beim Laden der Voci Sets.</p>';
        });
    }


    loadKlassen(); // Klassen beim Seitenladen laden
    loadVociSets(); // Voci Sets beim Seitenladen laden
});