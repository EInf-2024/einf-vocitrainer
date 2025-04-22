document.addEventListener('DOMContentLoaded', function () {
    // --- HTML Elemente ---
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton'); // Klasse Hinzufügen Button (Hauptseite)
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton'); // Voci Set Hinzufügen Button (Hauptseite)

    // Voci Set Detail/Edit Elemente
    const vocisetDetailSection = document.getElementById('vociset-detail-section'); // NEUE ID
    const closeVocisetDetailSectionButton = document.getElementById('closeVocisetDetailSection'); // NEUE ID
    const vocisetDetailNameHeader = document.getElementById('vociset-detail-name-header'); // NEUE ID
    const vocisetAssignedClassesList = document.getElementById('vociset-assigned-classes-list'); // NEU UL für zugewiesene Klassen
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton');
    const existingWordsDropdown = document.getElementById('existing-words-dropdown'); // UL für Wörter im Dropdown
    const deutschesWortInput = document.getElementById('deutschesWort');
    const französischesWortInput = document.getElementById('französischesWort');
    const addWordButton = document.getElementById('addWordButton'); // Wort hinzufügen Button
    const vocisetDetailNameButtonSpan = document.getElementById('vociset-detail-name-button'); // NEUE ID Element für Voci Set Name im Dropdown Button

    // Klassen Detail Elemente
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsNameSpan = document.getElementById('class-details-name'); // Element für Klassen Name
    const classStudentsListUl = document.getElementById('class-students-list'); // UL für Schülerliste
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection'); // Schliessen Button im Klassen Details Div
    const addClassStudentButton = document.getElementById('addClassStudentButton'); // Schüler hinzufügen Button

    // Schüler Hinzufügen Modal Elemente
    const addStudentModalElement = document.getElementById('addStudentModal'); // Das Modal HTML Element
    const addStudentModal = new bootstrap.Modal(addStudentModalElement); // Bootstrap Modal Instanz
    const studentUsernameInput = document.getElementById('studentUsername');
    const saveNewStudentButton = document.getElementById('saveNewStudentButton');

    // NEUE Voci Set Hinzufügen Modal Elemente (Zum ERSTELLEN)
    const createVocisetModalElement = document.getElementById('createVocisetModal'); // NEUE ID
    const createVocisetModal = new bootstrap.Modal(createVocisetModalElement); // NEUE ID Bootstrap Modal Instanz
    const vocisetNameInput = document.getElementById('vocisetNameInput'); // NEUE ID
    const saveNewVocisetButton = document.getElementById('saveNewVocisetButton'); // NEUE ID


    // --- Zustandsvariablen ---
    let currentVociSetId = null; // Speichert die ID des aktuell bearbeiteten Voci Sets
    let currentDepartmentIdForClassDetails = null; // Speichert die ID der Klasse, deren Details gerade angezeigt werden


    // --- Event Listeners ---

    // Logout Button - (API Aufruf sollte vom Partner implementiert werden)
    logoutButton.addEventListener('click', async function() {
        // TODO: Hier den fetch Request an die /api/logout API einfügen, sobald sie existiert
        // Beispiel:
        // try {
        //     await fetch('/api/logout', { method: 'POST' });
        // } catch (error) {
        //     console.error('Logout API error:', error);
        // }
        window.location.href = '/'; // Weiterleitung zur Basis-URL (Login)
    });


    // Klasse Hinzufügen Button (Hauptseite) - TODO Logik
    addKlasseButton.addEventListener('click', function() {
        // TODO: Logik zum Hinzufügen einer Klasse implementieren (z.B. Modal öffnen)
        alert('Funktion zum Hinzufügen einer Klasse wird später implementiert (z.B. Modal)');
    });

    // Voci Set Hinzufügen Button (Hauptseite) - Öffnet jetzt das Modal zum ERSTELLEN
    addVociSetButtonMainPage.addEventListener('click', function() {
        vocisetNameInput.value = ''; // Eingabefeld im Modal leeren
        createVocisetModal.show(); // Modal zum Erstellen öffnen
    });

    // Speichern Button im "Neues Voci Set erstellen" Modal
    saveNewVocisetButton.addEventListener('click', function() {
        const vocisetName = vocisetNameInput.value.trim();

        if (!vocisetName) {
            alert('Bitte geben Sie einen Namen für das neue Voci Set ein.');
            return;
        }

        createNewVociset(vocisetName); // Funktion zum Erstellen des Sets aufrufen
    });


    // Schliessen Button im Voci Set Detail/Edit Bereich
    closeVocisetDetailSectionButton.addEventListener('click', hideVocisetDetailSection);

    // Schliessen Button im Klassen Detail Bereich
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection);

    // Wort Hinzufügen Button im Voci Set Detail Bereich
    addWordButton.addEventListener('click', addWordToVociset);

    // Schüler Hinzufügen Button im Klassen Detail Bereich
    addClassStudentButton.addEventListener('click', function() {
        if (currentDepartmentIdForClassDetails) {
             showAddStudentModalForClass(currentDepartmentIdForClassDetails);
        } else {
            console.error("Keine Klasse ausgewählt, um Schüler hinzuzufügen.");
            alert("Bitte wählen Sie zuerst eine Klasse aus.");
        }
    });

    // Speichern Button im Schüler Hinzufügen Modal
    saveNewStudentButton.addEventListener('click', function() {
        const studentUsername = studentUsernameInput.value.trim();

        if (!studentUsername) {
            alert('Bitte geben Sie einen Benutzernamen ein.');
            return;
        }

        if (currentDepartmentIdForClassDetails) {
            addStudentToClass(currentDepartmentIdForClassDetails, studentUsername);
        } else {
            console.error('Department ID nicht gesetzt beim Versuch, Schüler hinzuzufügen.');
            alert('Fehler: Klasse nicht ausgewählt.');
        }
    });


    // Event Delegation für Klicks im Klassen Container (für Delete- und View-Buttons)
    klassenContainer.addEventListener('click', function(event) {
        const target = event.target;
        const deleteButton = target.closest('.delete-button');
        const viewClassButton = target.closest('.view-class-button');

        if (deleteButton) {
            const departmentIdToDelete = deleteButton.dataset.departmentId;
            if (departmentIdToDelete && confirm('Möchtest du diese Klasse wirklich löschen?')) {
                deleteKlasse(departmentIdToDelete);
            }
        } else if (viewClassButton) {
            const departmentIdToView = viewClassButton.dataset.departmentId;
            if (departmentIdToView) {
                loadClassDetails(departmentIdToView);
            }
        }
    });


    // Event Delegation für Delete-Word-Buttons im Voci Set Dropdown
    existingWordsDropdown.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-word-button');
        if (deleteButton) {
            const wordIdToDelete = deleteButton.dataset.wordId;
            const vocabularySetId = deleteButton.dataset.vocabularySetId;
            if (wordIdToDelete && vocabularySetId) {
                 if (confirm('Möchtest du dieses Wort wirklich löschen?')) {
                     deleteWordFromVociset(vocabularySetId, wordIdToDelete);
                }
            }
        }
    });

    // Event Delegation für Delete-Student-Buttons in der Schülerliste
    classStudentsListUl.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-student-button');
        if (deleteButton) {
            const studentIdToDelete = deleteButton.dataset.studentId;
            const departmentId = deleteButton.dataset.departmentId;
            if (studentIdToDelete && departmentId) {
                 if (confirm('Möchtest du diesen Schüler wirklich löschen?')) {
                     deleteStudent(departmentId, studentIdToDelete);
                }
            }
        }
    });

     // Event Delegation für Klicks in der Voci Sets Liste auf der Hauptseite
     vociSetsContainer.addEventListener('click', function(event) {
         const editButton = event.target.closest('.edit-vociset-button'); // Button zum Bearbeiten finden
         if (editButton) {
             const vocisetId = editButton.dataset.vocisetId;
             const vocisetLabel = editButton.dataset.vocisetLabel;
             if (vocisetId && vocisetLabel) {
                 // Ruft die Funktion auf, um den Detail/Bearbeitungsbereich zu zeigen und Daten zu laden
                 showVocisetDetailSection(vocisetId, vocisetLabel); // NEUE Funktion
             }
         }
     });


    // --- Funktionen zum Anzeigen/Verstecken der Detail-Bereiche ---

    // Zeigt den Bereich für Voci Set Details/Bearbeiten an
    // Wird vom Hauptseiten "Voci Set hinzufügen" Button aufgerufen (initiiert neues Set)
    // ODER von showVocisetDetailSection (zum Bearbeiten eines existierenden)
    function showVocisetDetailSection(vocabularySetId = null, vocabularySetName = null) { // Parameter optional machen
        // Zuerst alle anderen Detailbereiche verstecken
        hideClassDetailsSection();

        vocisetDetailSection.style.display = 'block'; // Bereich anzeigen

        if (vocabularySetId !== null) { // Wenn eine ID übergeben wurde (existierendes Set)
            currentVociSetId = vocabularySetId; // Voci Set ID speichern

            // Setze Namen und lade Wörter und zugewiesene Klassen
            vocisetDetailNameHeader.textContent = `Voci Set: ${vocabularySetName}`;
            vocisetDetailNameButtonSpan.textContent = vocabularySetName;
            loadWordsForVociset(vocabularySetId); // Lade Wörter
            loadAssignedClassesForVociset(vocabularySetId); // NEU: Lade zugewiesene Klassen
        } else { // Wenn keine ID übergeben wurde (Neues Set initiieren)
             // Dieser Fall wird vom Hauptseiten "Voci Set hinzufügen" Button ausgelöst
             // (Obwohl die eigentliche Erstellung im Modal passiert)
             // Hier setzen wir nur den Bereich in einen "Erstellen" Zustand, falls das Modal nicht genutzt wird.
             // Aber da wir jetzt ein Modal nutzen, wird dieser Teil so nicht direkt für die ERSTELLUNG verwendet,
             // sondern showVocisetDetailSection wird NACH der Erstellung mit der neuen ID aufgerufen.
             // Daher ist dieser 'else' Block hier streng genommen redundant mit der aktuellen Logik,
             // da die Erstellung im Modal passiert und dann showVocisetDetailSection mit ID aufgerufen wird.
             // Belassen wir ihn als Fallback oder für zukünftige Änderungen.
             currentVociSetId = null; // Wichtig: ID ist null für neues Set
             vocisetDetailNameHeader.textContent = 'Neues Voci Set erstellen';
             vocisetDetailNameButtonSpan.textContent = 'Neues Voci Set';
             existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Noch keine Wörter</li>';
             vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Klassen können nach dem Erstellen zugewiesen werden.</li>';
             deutschesWortInput.value = '';
             französischesWortInput.value = '';
        }
    }

    // Versteckt den Bereich für Voci Set Details/Bearbeiten
    function hideVocisetDetailSection() {
        vocisetDetailSection.style.display = 'none'; // Bereich verstecken
        // Zustand und Eingaben zurücksetzen
        deutschesWortInput.value = '';
        französischesWortInput.value = '';
        currentVociSetId = null; // Wichtig: ID zurücksetzen
        existingWordsDropdown.innerHTML = ''; // Dropdown leeren
        vocisetDetailNameHeader.textContent = ''; // Header leeren
        vocisetDetailNameButtonSpan.textContent = ''; // Button Text leeren
        vocisetAssignedClassesList.innerHTML = ''; // Liste der Klassen leeren
    }


    // Zeigt den Bereich für Klassendetails an
    function showClassDetailsSection() {
        hideVocisetDetailSection(); // Anderen Detailbereich verstecken

        classDetailsSection.style.display = 'block'; // Bereich anzeigen
    }

    // Versteckt den Bereich für Klassendetails
    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none'; // Bereich verstecken
        // Zustand und Inhalte zurücksetzen
        currentDepartmentIdForClassDetails = null;
        classDetailsNameSpan.textContent = '';
        classStudentsListUl.innerHTML = '';
    }

     // Zeigt das Modal zum Hinzufügen eines Schülers für eine spezifische Klasse an
     function showAddStudentModalForClass(departmentId) {
         currentDepartmentIdForClassDetails = departmentId; // Sicherstellen, dass die ID gesetzt ist
         studentUsernameInput.value = ''; // Eingabefeld leeren
         addStudentModal.show(); // Modal öffnen
     }


    // --- Daten Laden & API Interaktionen ---

    // NEUE Funktion: Ein neues Voci Set erstellen
    function createNewVociset(vocisetName) {
        const apiCreateVocisetUrl = `/api/vocabulary-sets/create`; // API zum Erstellen eines neuen Sets

        fetch(apiCreateVocisetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                label: vocisetName // Annahme: API erwartet 'label'
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json(); // Annahme: API gibt das neu erstellte Set zurück (mit ID)
        })
        .then(newVocisetData => {
            console.log('Voci Set erfolgreich erstellt:', newVocisetData);
            alert(`Voci Set "${newVocisetData.label}" erfolgreich erstellt!`);

            createVocisetModal.hide(); // Modal schließen

            // Lade Voci Sets Liste neu, um das neue Set anzuzeigen
            loadVociSets();

            // Optional: Direkt den Detailbereich für das neue Set öffnen
            if (newVocisetData && newVocisetData.id) {
                // Kleine Verzögerung, falls die Liste erst aktualisiert werden muss
                 setTimeout(() => {
                     showVocisetDetailSection(newVocisetData.id, newVocisetData.label); // Detailbereich für NEUES Set öffnen
                 }, 100);
            } else {
                 console.error("Neues Voci Set erstellt, aber ID fehlt in der Antwort.");
                 alert("Voci Set erstellt, aber Details können nicht sofort angezeigt werden (ID fehlt).");
            }
        })
        .catch(error => {
            console.error('Fehler beim Erstellen des Voci Sets:', error);
            alert('Fehler beim Erstellen des Voci Sets: ' + error.message);
             // Modal nicht schließen
        });
    }


    // Funktion zum Laden der Wörter eines Voci Sets und Anzeigen im Dropdown
    function loadWordsForVociset(vocabularySetId) {
        const apiVocisetWordsUrl = `/api/vocabulary-sets/${vocabularySetId}`;

        fetch(apiVocisetWordsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                 // Versuch, Fehlerdetails vom Server zu lesen und als Error zu werfen
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(vocisetData => {
            const words = vocisetData.words;

            // Optional: Hier auch den Voci Set Namen setzen, falls nicht schon von showVocisetDetailSection gesetzt
            // vocisetDetailNameHeader.textContent = vocisetData.label;
            // vocisetDetailNameButtonSpan.textContent = vocisetData.label;

            existingWordsDropdown.innerHTML = '';

            if (words && Array.isArray(words) && words.length > 0) {
                words.forEach(word => {
                    const wordItem = document.createElement('li');
                    wordItem.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    wordItem.innerHTML = `
                        <span>${word.word} - ${word.translation}</span>
                         <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${word.id}" data-vocabulary-set-id="${vocabularySetId}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    existingWordsDropdown.appendChild(wordItem);
                });
            } else {
                existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter vorhanden</li>';
            }
             // Event Delegation Listener ist schon oben registriert
        })
        .catch(error => {
            console.error('Fehler beim Laden der Wörter für Voci Set:', error);
            existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Fehler beim Laden der Wörter</li>';
             alert('Fehler beim Laden der Wörter für Voci Set: ' + error.message);
        });
    }

    // NEUE Funktion: Zugewiesene Klassen für ein Voci Set laden und anzeigen
    function loadAssignedClassesForVociset(vocabularySetId) {
        const apiAssignedClassesUrl = `/api/vocabulary-sets/${vocabularySetId}/departments`; // NEUE API

         // Setze Platzhalter, während geladen wird
         vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Wird geladen...</li>';

        fetch(apiAssignedClassesUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json(); // Annahme: API gibt ein Objekt mit einem 'departments' Array zurück
        })
        .then(data => {
            const departments = data.departments;
            vocisetAssignedClassesList.innerHTML = ''; // Liste leeren

            if (departments && Array.isArray(departments) && departments.length > 0) {
                departments.forEach(department => {
                    const classItem = document.createElement('li');
                    classItem.classList.add('list-group-item', 'list-group-item-info'); // Bootstrap Styling
                    classItem.textContent = department.label; // Zeige Klassennamen
                    // TODO: Optional: Button zum Entfernen der Zuweisung hinzufügen
                    vocisetAssignedClassesList.appendChild(classItem);
                });
            } else {
                vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Dieses Voci Set ist keiner Klasse zugewiesen.</li>';
            }
             // TODO: Später: Logik/UI zum Zuweisen von Klassen hinzufügen
        })
        .catch(error => {
            console.error('Fehler beim Laden der zugewiesenen Klassen:', error);
            vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Fehler beim Laden der zugewiesenen Klassen.</li>';
             alert('Fehler beim Laden der zugewiesenen Klassen: ' + error.message);
        });
    }


    // Funktion zum Hinzufügen eines Wortes zu einem Voci Set
    function addWordToVociset() { // Funktion umbenannt für Konsistenz
        const deutschesWort = deutschesWortInput.value.trim();
        const französischesWort = französischesWortInput.value.trim();

        if (!deutschesWort || !französischesWort) {
            alert('Bitte geben Sie sowohl ein deutsches als auch ein französisches Wort ein.');
            return;
        }
        if (currentVociSetId === null) {
             alert('Ein Fehler ist aufgetreten: Kein Voci Set zum Hinzufügen von Wörtern ausgewählt.');
             return;
        }

        const apiAddWordUrl = `/api/vocabulary-sets/${currentVociSetId}/words/create`;

        fetch(apiAddWordUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                word: deutschesWort,
                translation: französischesWort
                 // TODO: Weitere Felder
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Wort erfolgreich hinzugefügt:', data);
            alert('Wort erfolgreich hinzugefügt!');
            deutschesWortInput.value = '';
            französischesWortInput.value = '';
            loadWordsForVociset(currentVociSetId);
            loadVociSets();
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Wortes:', error);
            alert('Fehler beim Hinzufügen des Wortes: ' + error.message);
        });
    }


    // Funktion zum Löschen eines Wortes aus einem Voci Set
    function deleteWordFromVociset(vocabularySetId, wordId) { // Funktion umbenannt für Konsistenz
         if (!confirm('Möchtest du dieses Wort wirklich löschen?')) {
            return;
        }

        const apiDeleteWordUrl = `/api/vocabulary-sets/${vocabularySetId}/words/${wordId}/delete`;

        fetch(apiDeleteWordUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
             return response.text().then(text => text ? JSON.parse(text) : {});
        })
         .then(data => {
            console.log(`Wort mit ID ${wordId} aus Voci Set ${vocabularySetId} gelöscht.`, data);
            alert('Wort erfolgreich gelöscht!');
            loadWordsForVociset(vocabularySetId);
            loadVociSets();
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Wortes:', error);
            alert('Fehler beim Löschen des Wortes: ' + error.message);
        });
    }


    // Klassen (Departments) laden
    function loadKlassen() {
        const apiKlassenUrl = '/api/departments';

        fetch(apiKlassenUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(data => {
            const departments = data.departments;
            klassenContainer.innerHTML = '';

            if (departments && Array.isArray(departments)) {
                departments.forEach(department => {
                    const klasseCardCol = document.createElement('div');
                    klasseCardCol.classList.add('col');
                    klasseCardCol.dataset.departmentId = department.id;
                    klasseCardCol.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="card-title">${department.label}</h5>
                                    <p class="card-text">${department.studentsCount} Schüler</p>
                                </div>
                                <div class="d-flex flex-column align-items-end">
                                     <button class="btn btn-info btn-sm mb-1 view-class-button" data-department-id="${department.id}">
                                        <i class="fas fa-eye"></i> Anzeigen
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-button" data-department-id="${department.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    klassenContainer.appendChild(klasseCardCol);
                });
            } else {
                klassenContainer.innerHTML = '<p>Keine Klassen gefunden.</p>';
            }
             // Event Delegation Listener für Klassen Container ist oben registriert
        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassen:', error);
            klassenContainer.innerHTML = '<p>Fehler beim Laden der Klassen.</p>';
             alert('Fehler beim Laden der Klassen: ' + error.message);
        });
    }


     // Funktion zum Löschen einer Klasse
    function deleteKlasse(departmentId) {
         if (!confirm('Möchtest du diese Klasse wirklich löschen?')) {
            return;
        }
        const apiDeleteKlasseUrl = `/api/departments/${departmentId}/delete`;

        fetch(apiDeleteKlasseUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                 return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
             return response.text().then(text => text ? JSON.parse(text) : {});
        })
         .then(data => {
            console.log(`Klasse (Department) mit ID ${departmentId} gelöscht.`);
            alert('Klasse erfolgreich gelöscht!');
            loadKlassen();
            hideClassDetailsSection();
        })
        .catch(error => {
            console.error('Fehler beim Löschen der Klasse (Department):', error);
            alert('Fehler beim Löschen der Klasse: ' + error.message);
        });
    }


    // Voci Sets laden
    function loadVociSets() {
        const apiVociSetsUrl = '/api/vocabulary-sets';

        fetch(apiVociSetsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(data => {
            const vociSets = data.sets;
            vociSetsContainer.innerHTML = '';
            if (vociSets && Array.isArray(vociSets)) {
                vociSets.forEach(vociSet => {
                    const vociSetItem = document.createElement('li');
                    vociSetItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    vociSetItem.innerHTML = `
                        <span>${vociSet.label} (Wörter: ${vociSet.wordsCount}, Gelernt: ${vociSet.learnedCount})</span>
                        <button class="btn btn-success btn-sm edit-vociset-button" data-vociset-id="${vociSet.id}" data-vociset-label="${vociSet.label}">Bearbeiten</button>
                    `;
                    vociSetsContainer.appendChild(vociSetItem);
                });
            } else {
                vociSetsContainer.innerHTML = '<p>Keine Voci Sets gefunden.</p>';
            }
             // Event Delegation Listener für Voci Sets ist oben registriert
        })
        .catch(error => {
            console.error('Fehler beim Laden der Voci Sets:', error);
            vociSetsContainer.innerHTML = '<p>Fehler beim Laden der Voci Sets.</p>';
             alert('Fehler beim Laden der Voci Sets: ' + error.message);
        });
    }


    // Funktion: Klassendetails laden und anzeigen
    function loadClassDetails(departmentId) {
        currentDepartmentIdForClassDetails = departmentId;
        const apiClassDetailsUrl = `/api/departments/${departmentId}`;

        fetch(apiClassDetailsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                 return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(departmentData => {
            classDetailsNameSpan.textContent = departmentData.label;
            classStudentsListUl.innerHTML = '';

            if (departmentData.students && Array.isArray(departmentData.students) && departmentData.students.length > 0) {
                departmentData.students.forEach(student => {
                    const studentItem = document.createElement('li');
                    studentItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    studentItem.innerHTML = `
                        <span>${student.username}</span>
                        <button class="btn btn-danger btn-sm delete-student-button" data-student-id="${student.id}" data-department-id="${departmentData.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    classStudentsListUl.appendChild(studentItem);
                });
            } else {
                classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler in dieser Klasse</li>';
            }
             // Event Delegation Listener für Schüler ist oben registriert
            hideVocisetDetailSection(); // Anderen Detailbereich verstecken
            showClassDetailsSection();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassendetails:', error);
            classDetailsNameSpan.textContent = 'Fehler beim Laden der Klassendetails';
            classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Fehler beim Laden der Schülerliste</li>';
            hideVocisetDetailSection(); // Anderen Detailbereich verstecken, auch bei Fehler
            showClassDetailsSection();
             alert('Fehler beim Laden der Klassendetails: ' + error.message);
        });
    }


    // Funktion: Schüler löschen
    function deleteStudent(departmentId, studentId) {
         if (!confirm('Möchtest du diesen Schüler wirklich löschen?')) {
            return;
        }

        const apiDeleteStudentUrl = `/api/departments/${departmentId}/students/${studentId}/delete`;

        fetch(apiDeleteStudentUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
             return response.text().then(text => text ? JSON.parse(text) : {});
        })
        .then(data => {
            console.log(`Schüler mit ID ${studentId} aus Department ${departmentId} gelöscht.`);
            alert('Schüler erfolgreich gelöscht!');
            loadClassDetails(departmentId);
            loadKlassen();
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Schülers:', error);
            alert('Fehler beim Löschen des Schülers: ' + error.message);
        });
    }

    // Funktion: Schüler hinzufügen (wird vom Modal aufgerufen)
    function addStudentToClass(departmentId, studentUsername) {
        const apiAddStudentUrl = `/api/departments/${departmentId}/students/create`;

        fetch(apiAddStudentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                username: studentUsername
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(data => {
            console.log(`Schüler ${studentUsername} erfolgreich zu Department ${departmentId} hinzugefügt.`, data);
            alert('Schüler erfolgreich hinzugefügt!');
            addStudentModal.hide();
            loadClassDetails(departmentId);
            loadKlassen();
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Schülers:', error);
            alert('Fehler beim Hinzufügen des Schülers: ' + error.message);
        });
    }


    // --- Initiales Laden der Daten ---
    loadKlassen();
    loadVociSets();
});