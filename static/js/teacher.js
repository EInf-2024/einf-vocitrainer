document.addEventListener('DOMContentLoaded', function () {
    // --- HTML Elemente ---
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton');
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton');

    // Voci Set Detail/Edit Elemente
    const addVociSetSection = document.getElementById('add-voci-set-section');
    const closeAddVociSetSectionButton = document.getElementById('closeAddVociSetSection');
    const vociSetNameHeader = document.getElementById('voci-set-name-header');
    const vociSetClassSpan = document.getElementById('voci-set-class');
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton');
    const existingWordsDropdown = document.getElementById('existing-words-dropdown');
    const deutschesWortInput = document.getElementById('deutschesWort');
    const französischesWortInput = document.getElementById('französischesWort');
    const addWordButton = document.getElementById('addWordButton');
    const vociSetNameButtonSpan = document.getElementById('voci-set-name-button');

    // Klassen Detail Elemente
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsNameSpan = document.getElementById('class-details-name');
    const classStudentsListUl = document.getElementById('class-students-list');
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection');
    const addClassStudentButton = document.getElementById('addClassStudentButton');

    // Schüler Hinzufügen Modal Elemente
    const addStudentModalElement = document.getElementById('addStudentModal');
    const addStudentModal = new bootstrap.Modal(addStudentModalElement); // Bootstrap Modal Instanz
    const studentUsernameInput = document.getElementById('studentUsername');
    const saveNewStudentButton = document.getElementById('saveNewStudentButton');

    // NEUE Klasse Hinzufügen Modal Elemente
    const addClassModalElement = document.getElementById('addClassModal');
    const addClassModal = new bootstrap.Modal(addClassModalElement); // Bootstrap Modal Instanz
    const classNameInput = document.getElementById('classNameInput');
    const saveNewClassButton = document.getElementById('saveNewClassButton');


    // --- Zustandsvariablen ---
    let currentVociSetId = null;
    let currentDepartmentIdForClassDetails = null; // Speichert aktuelle Department ID für Klassendetails


    // --- Event Listeners (zentralisiert durch Delegation oder direkte IDs) ---

    logoutButton.addEventListener('click', function() {
        window.location.href = 'index.html'; // Weiterleitung zur Indexseite
    });

    // Event Listener für den "Klasse hinzufügen" Button (öffnet jetzt ein Modal)
    addKlasseButton.addEventListener('click', function() {
        classNameInput.value = ''; // Eingabefeld leeren
        addClassModal.show(); // Neues Modal öffnen
    });

    // Event Listener für den "Speichern" Button im "Klasse hinzufügen" Modal
    saveNewClassButton.addEventListener('click', function() {
        const className = classNameInput.value.trim();

        if (!className) {
            alert('Bitte geben Sie einen Namen für die neue Klasse ein.');
            return;
        }

        createNewClass(className); // Funktion zum Erstellen der Klasse aufrufen
    });


    addVociSetButtonMainPage.addEventListener('click', function() {
        // TODO: Logik zum STARTEN des Hinzufügens eines NEUEN Voci Sets
        alert('Funktion zum Hinzufügen eines NEUEN Voci Sets wird später implementiert.');
        showAddVociSetSection(); // Zeigt den Bearbeitungsbereich an (Platzhalter)
    });

    // Event Listener für die Schliessen Buttons in den Detail-Sektionen
    closeAddVociSetSectionButton.addEventListener('click', hideAddVociSetSection);
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection);

    // Event Listener für den "Wort hinzufügen" Button im Voci Set Detail Bereich
    addWordButton.addEventListener('click', addWordToVociSet);

    // Event Listener für den "Schüler hinzufügen" Button im Klassen Detail Bereich
    addClassStudentButton.addEventListener('click', function() {
        // Diese Funktion ruft jetzt unsere gemeinsame Modal-Anzeigefunktion auf
        if (currentDepartmentIdForClassDetails) {
             showAddStudentModalForClass(currentDepartmentIdForClassDetails);
        } else {
            // Dies sollte nicht passieren, wenn der Button nur in der Klassendetailansicht sichtbar ist
            console.error("Keine Klasse ausgewählt, um Schüler hinzuzufügen.");
            alert("Bitte wählen Sie zuerst eine Klasse aus.");
        }
    });

    // Event Listener für den "Speichern" Button im "Schüler hinzufügen" Modal
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
        const viewClassButton = target.closest('.view-class-button'); // Den 'Anzeigen' Button finden

        if (deleteButton) {
            // Klick auf einen Lösch-Button in einer Klassenkarte
            const departmentIdToDelete = deleteButton.dataset.departmentId;
            if (departmentIdToDelete && confirm('Möchtest du diese Klasse wirklich löschen?')) {
                deleteKlasse(departmentIdToDelete);
            }
        } else if (viewClassButton) {
             // Klick auf den 'Anzeigen' Button in einer Klassenkarte
            const departmentIdToView = viewClassButton.dataset.departmentId;
            if (departmentIdToView) {
                loadClassDetails(departmentIdToView);
            }
        }
        // Klicks auf andere Teile der Klassenkarte (außer Buttons) werden ignoriert
    });


    // Event Delegation für Delete-Word-Buttons im Voci Set Dropdown
    // Listener auf das übergeordnete ul-Element
    existingWordsDropdown.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-word-button');
        if (deleteButton) {
            const wordIdToDelete = deleteButton.dataset.wordId;
            const vocabularySetId = deleteButton.dataset.vocabularySetId;
            if (wordIdToDelete && vocabularySetId) {
                 if (confirm('Möchtest du dieses Wort wirklich löschen?')) {
                     deleteWordFromVociSet(vocabularySetId, wordIdToDelete);
                }
            }
        }
    });

    // Event Delegation für Delete-Student-Buttons in der Schülerliste
    // Listener auf das übergeordnete ul-Element
    classStudentsListUl.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-student-button');
        if (deleteButton) {
            const studentIdToDelete = deleteButton.dataset.studentId;
            const departmentId = deleteButton.dataset.departmentId; // Department ID vom Button holen
            if (studentIdToDelete && departmentId) {
                 if (confirm('Möchtest du diesen Schüler wirklich löschen?')) {
                     deleteStudent(departmentId, studentIdToDelete);
                }
            }
        }
    });

     // Event Delegation für Klicks in der Voci Sets Liste auf der Hauptseite
     // Um auf den "Bearbeiten" Button zu reagieren
     vociSetsContainer.addEventListener('click', function(event) {
         const editButton = event.target.closest('.edit-vociset-button'); // Button zum Bearbeiten finden
         if (editButton) {
             const vocisetId = editButton.dataset.vocisetId;
             const vocisetLabel = editButton.dataset.vocisetLabel;
             if (vocisetId && vocisetLabel) {
                 // Ruft die Funktion auf, um den Bearbeitungsbereich zu zeigen und Daten zu laden
                 showAddVociSetSectionForExisting(vocisetId, vocisetLabel);
             }
         }
     });


    // --- Funktionen zum Anzeigen/Verstecken der Bereiche ---

    // Zeigt den Bereich zum Bearbeiten/Hinzufügen von Voci Sets
    // Wird vom Hauptseiten "Voci Set hinzufügen" Button aufgerufen (initiiert neues Set)
    function showAddVociSetSection() {
        hideClassDetailsSection(); // Anderen Detailbereich verstecken

        addVociSetSection.style.display = 'block'; // Bereich anzeigen

        // Setze Platzhalterwerte für ein NEUES Set (diese Funktion wird beim Klick auf "Voci Set hinzufügen" aufgerufen)
        vociSetNameHeader.textContent = 'Neues Voci Set erstellen';
        vociSetClassSpan.textContent = 'Nicht zugewiesen'; // TODO: Klasse ermitteln/auswählen lassen?
        vociSetNameButtonSpan.textContent = 'Neues Voci Set';
        existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Noch keine Wörter</li>'; // Wörterliste leer bei neuem Set
        currentVociSetId = null; // Wichtig: ID ist null, da es noch kein Set gibt
        deutschesWortInput.value = '';
        französischesWortInput.value = '';

        // TODO: Hier Logik zum Erstellen eines NEUEN Voci Sets implementieren.
        // Das könnte ein Modal sein (wahrscheinlich besser), das den Namen des Sets abfragt,
        // und dann die /api/vocabulary-sets/create API aufruft.
        // Nach erfolgreicher Erstellung, sollte dann showAddVociSetSectionForExisting
        // mit der ID des neu erstellten Sets aufgerufen werden.
    }

    // Versteckt den Bereich zum Bearbeiten/Hinzufügen von Voci Sets
    function hideAddVociSetSection() {
        addVociSetSection.style.display = 'none'; // Bereich verstecken
        // Inhalte und Zustand zurücksetzen
        deutschesWortInput.value = '';
        französischesWortInput.value = '';
        currentVociSetId = null;
        existingWordsDropdown.innerHTML = '';
        vociSetNameHeader.textContent = '';
        vociSetNameButtonSpan.textContent = '';
        vociSetClassSpan.textContent = '';
    }

    // Zeigt den Bereich für Klassendetails
    function showClassDetailsSection() {
        hideAddVociSetSection(); // Anderen Detailbereich verstecken

        classDetailsSection.style.display = 'block'; // Bereich anzeigen
    }

    // Versteckt den Bereich für Klassendetails
    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none'; // Bereich verstecken
        // Inhalte und Zustand zurücksetzen
        currentDepartmentIdForClassDetails = null;
        classDetailsNameSpan.textContent = '';
        classStudentsListUl.innerHTML = '';
    }

    // Zeigt das Modal zum Hinzufügen eines Schülers für eine spezifische Klasse
     function showAddStudentModalForClass(departmentId) {
         // Wir speichern die Department ID bereits in loadClassDetails und createNewClass
         // Wir müssen hier nur sicherstellen, dass sie gesetzt ist.
         if (departmentId) {
             currentDepartmentIdForClassDetails = departmentId; // Sicherstellen, dass die ID gesetzt ist
             studentUsernameInput.value = ''; // Eingabefeld leeren
             addStudentModal.show(); // Modal öffnen
         } else {
             console.error("Ungültige Department ID beim Versuch, Schüler-Modal zu öffnen.");
             alert("Ein Fehler ist aufgetreten: Klasse nicht gefunden.");
         }
     }


     // Funktion zum Anzeigen des "Voci Set hinzufügen" Bereichs für ein EXISTIERENDES Voci Set
     function showAddVociSetSectionForExisting(vocabularySetId, vocabularySetName) {
         hideClassDetailsSection(); // Anderen Detailbereich verstecken

         addVociSetSection.style.display = 'block'; // Bereich anzeigen
         currentVociSetId = vocabularySetId; // Voci Set ID speichern

         // Setze Namen und lade Wörter
         vociSetNameHeader.textContent = `Voci Set bearbeiten: ${vocabularySetName}`;
         vociSetNameButtonSpan.textContent = vocabularySetName;
         loadWordsForVociSet(vocabularySetId); // Lade Wörter für das gewählte Voci Set

         // TODO: Klasse des Voci Sets laden und anzeigen - vociSetClassSpan.textContent = ...; (API benötigt, um Voci Set mit Klasse zu verknüpfen?)
         vociSetClassSpan.textContent = 'Wird geladen...'; // Platzhalter
     }


    // --- Daten Laden & API Interaktionen ---

    // Funktion zum Laden der Wörter eines Voci Sets und Anzeigen im Dropdown
    function loadWordsForVociSet(vocabularySetId) {
        const apiVociSetWordsUrl = `/api/vocabulary-sets/${vocabularySetId}`;

        fetch(apiVociSetWordsUrl, {
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
            return response.json(); // Annahme: API gibt JSON zurück
        })
        .then(vociSetData => {
            const words = vociSetData.words;

             // Optional: Hier auch den Voci Set Namen setzen, falls nicht schon von showAddVociSetSectionForExisting gesetzt
             // vociSetNameHeader.textContent = vociSetData.label;
             // vociSetNameButtonSpan.textContent = vociSetData.label;

            existingWordsDropdown.innerHTML = ''; // Dropdown leeren

            if (words && Array.isArray(words) && words.length > 0) {
                words.forEach(word => {
                    const wordItem = document.createElement('li');
                    // Bootstrap Dropdown Item Styling + Flexbox für Layout
                    wordItem.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center');
                     // data-vocabulary-set-id zum Button hinzufügen (für Event Delegation)
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

             // Event Delegation Listener ist schon oben registriert (existingWordsDropdown.addEventListener)

        })
        .catch(error => {
            console.error('Fehler beim Laden der Wörter für Voci Set:', error);
            existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Fehler beim Laden der Wörter</li>';
             alert('Fehler beim Laden der Wörter für Voci Set: ' + error.message);
        });
    }


    // Funktion zum Hinzufügen eines Wortes zu einem Voci Set
    function addWordToVociSet() {
        const deutschesWort = deutschesWortInput.value.trim();
        const französischesWort = französischesWortInput.value.trim();

        if (!deutschesWort || !französischesWort) {
            alert('Bitte geben Sie sowohl ein deutsches als auch ein französisches Wort ein.');
            return;
        }
        if (currentVociSetId === null) {
             alert('Bitte wählen Sie zuerst ein Voci Set zum Bearbeiten aus (klicken Sie auf "Bearbeiten" in der Liste).');
             return;
        }

        // Korrekte Annahme basierend auf vorherigen Prompts: POST /api/vocabulary-sets/<int:vocabulary_set_id>/words/create
        const apiAddWordUrl = `/api/vocabulary-sets/${currentVociSetId}/words/create`;

        fetch(apiAddWordUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                word: deutschesWort, // Annahme: API erwartet 'word' für Deutsch
                translation: französischesWort  // Annahme: API erwartet 'translation' für Französisch
                 // TODO: Weitere Felder wie 'successiveCorrect', 'correct', 'incorrect' falls API sie beim Erstellen erwartet
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json(); // Annahme: API gibt das neu hinzugefügte Wort oder Bestätigung zurück
        })
        .then(data => {
            console.log('Wort erfolgreich hinzugefügt:', data);
            alert('Wort erfolgreich hinzugefügt!');
            deutschesWortInput.value = '';
            französischesWortInput.value = '';
            loadWordsForVociSet(currentVociSetId); // Wörterliste im Dropdown neu laden
            loadVociSets(); // Voci Sets Liste auf Hauptseite neu laden (Wörteranzahl aktualisieren)
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Wortes:', error);
            alert('Fehler beim Hinzufügen des Wortes: ' + error.message);
        });
    }


    // Funktion zum Löschen eines Wortes aus einem Voci Set
    function deleteWordFromVociSet(vocabularySetId, wordId) {
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
             return response.text().then(text => text ? JSON.parse(text) : {}); // Versucht JSON, akzeptiert leer
        })
         .then(data => {
            console.log(`Wort mit ID ${wordId} aus Voci Set ${vocabularySetId} gelöscht.`, data);
            alert('Wort erfolgreich gelöscht!');
            loadWordsForVociSet(vocabularySetId); // Wörterliste im Dropdown neu laden
            loadVociSets(); // Voci Sets Liste auf Hauptseite neu laden (Wörteranzahl aktualisieren)
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
            klassenContainer.innerHTML = ''; // Container leeren

            if (departments && Array.isArray(departments)) {
                departments.forEach(department => {
                    const klasseCardCol = document.createElement('div');
                    klasseCardCol.classList.add('col'); // Bootstrap Grid Spalte
                     // Department ID auf die Card für einfachen Zugriff setzen
                    klasseCardCol.dataset.departmentId = department.id; // ID auf dem äußeren Element speichern
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

    // NEUE Funktion: Eine neue Klasse erstellen
    function createNewClass(className) {
         // API zum Erstellen einer neuen Klasse
        const apiCreateClassUrl = `/api/departments/create`; // Basierend auf deiner letzten Angabe

        fetch(apiCreateClassUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                label: className // Annahme: API erwartet 'label' für den Klassennamen
                 // TODO: Eventuell weitere Felder je nach API (z.B. teacher_id)
            })
        })
        .then(response => {
            if (!response.ok) {
                 return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
             // Annahme: API gibt die neu erstellte Klasse zurück, inkl. ID
            return response.json();
        })
        .then(newClassData => {
            console.log('Klasse erfolgreich erstellt:', newClassData);
            alert(`Klasse "${newClassData.label}" erfolgreich erstellt!`);

            addClassModal.hide(); // Modal zum Erstellen der Klasse schließen

            // Direkt das Modal zum Hinzufügen von Schülern öffnen für die NEUE Klasse
             if (newClassData.id) {
                 loadKlassen(); // Klassenliste auf Hauptseite neu laden
                 // Warte kurz, falls die Klassenliste erst gerendert werden muss, bevor Modal geöffnet wird
                 setTimeout(() => {
                     // Klassendetails der NEUEN Klasse laden und dann Schüler-Modal öffnen
                     loadClassDetails(newClassData.id); // Öffnet Klassendetails Div UND speichert ID
                     // Optional: Modal direkt hier öffnen, anstatt in loadClassDetails
                     // showAddStudentModalForClass(newClassData.id);
                 }, 100); // Kleine Verzögerung, falls nötig
             } else {
                 console.error("Klasse erstellt, aber ID fehlt in der Antwort.");
                 alert("Klasse erstellt, aber Schüler können nicht sofort hinzugefügt werden (ID fehlt).");
                 loadKlassen(); // Klassenliste trotzdem neu laden
             }
        })
        .catch(error => {
            console.error('Fehler beim Erstellen der Klasse:', error);
            alert('Fehler beim Erstellen der Klasse: ' + error.message);
             // Modal nicht schließen, damit Benutzer Eingabe korrigieren kann
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
             return response.text().then(text => text ? JSON.parse(text) : {}); // Versucht JSON, akzeptiert leer
        })
         .then(data => {
            console.log(`Klasse (Department) mit ID ${departmentId} gelöscht.`, data);
            alert('Klasse erfolgreich gelöscht!');
            loadKlassen(); // Klassen neu laden nach dem Löschen
            hideClassDetailsSection(); // Klassendetails schließen, falls die gelöschte Klasse angezeigt wurde
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
                     // Klasse für den Bearbeiten Button hinzufügen
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


    // Funktion zum Anzeigen des "Voci Set hinzufügen" Bereichs für ein EXISTIERENDES Voci Set
    function showAddVociSetSectionForExisting(vocabularySetId, vocabularySetName) {
        hideClassDetailsSection(); // Anderen Detailbereich verstecken

        addVociSetSection.style.display = 'block'; // Bereich anzeigen
        currentVociSetId = vocabularySetId; // Voci Set ID speichern

        // Setze Namen und lade Wörter
        vociSetNameHeader.textContent = `Voci Set bearbeiten: ${vocabularySetName}`;
        vociSetNameButtonSpan.textContent = vocabularySetName;
        loadWordsForVociSet(vocabularySetId); // Lade Wörter für das gewählte Voci Set

        // TODO: Klasse des Voci Sets laden und anzeigen - vociSetClassSpan.textContent = ...; (API benötigt, um Voci Set mit Klasse zu verknüpfen?)
        vociSetClassSpan.textContent = 'Wird geladen...'; // Platzhalter
    }


    // Funktion: Klassendetails laden und anzeigen
    function loadClassDetails(departmentId) {
        currentDepartmentIdForClassDetails = departmentId; // Department ID speichern
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
            classStudentsListUl.innerHTML = ''; // Schülerliste leeren

            if (departmentData.students && Array.isArray(departmentData.students) && departmentData.students.length > 0) {
                departmentData.students.forEach(student => {
                    const studentItem = document.createElement('li');
                    // Bootstrap List Item Styling + Flexbox für Layout
                    studentItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    // data-department-id zum Button hinzufügen (für Event Delegation)
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

            hideAddVociSetSection(); // Anderen Detailbereich verstecken
            showClassDetailsSection(); // Klassendetails Section anzeigen

        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassendetails:', error);
            classDetailsNameSpan.textContent = 'Fehler beim Laden der Klassendetails';
            classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Fehler beim Laden der Schülerliste</li>';

            hideAddVociSetSection(); // Anderen Detailbereich verstecken, auch bei Fehler
            showClassDetailsSection(); // Zeige Section trotzdem an, aber mit Fehlermeldung
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
             return response.text().then(text => text ? JSON.parse(text) : {}); // Versucht JSON, akzeptiert leer
        })
        .then(data => {
            console.log(`Schüler mit ID ${studentId} aus Department ${departmentId} gelöscht.`, data);
            alert('Schüler erfolgreich gelöscht!');
            loadClassDetails(departmentId); // Klassendetails neu laden
            loadKlassen(); // Klassenliste auf Hauptseite neu laden (Schüleranzahl aktualisieren)
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Schülers:', error);
            alert('Fehler beim Löschen des Schülers: ' + error.message);
        });
    }

    // Funktion: Schüler hinzufügen
    function addStudentToClass(departmentId, studentUsername) {
        // Korrekte Annahme basierend auf vorherigen Prompts: POST /api/departments/<int:department_id>/students/create
        const apiAddStudentUrl = `/api/departments/${departmentId}/students/create`; // Korrigierte API URL

        fetch(apiAddStudentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                username: studentUsername // Annahme: API erwartet 'username'
                 // TODO: Eventuell weitere Felder je nach API (z.B. password - aber vorsicht!)
            })
        })
        .then(response => {
            if (!response.ok) {
                 return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json(); // Annahme: API gibt den neuen Schüler oder Bestätigung zurück
        })
        .then(data => {
            console.log(`Schüler ${studentUsername} erfolgreich zu Department ${departmentId} hinzugefügt.`, data);
            alert('Schüler erfolgreich hinzugefügt!');
            addStudentModal.hide(); // Modal schließen
            loadClassDetails(departmentId); // Klassendetails neu laden
            loadKlassen(); // Klassenliste auf Hauptseite neu laden (Schüleranzahl aktualisieren)
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Schülers:', error);
            alert('Fehler beim Hinzufügen des Schülers: ' + error.message);
             // Modal nicht schließen, damit Benutzer Eingabe korrigieren kann, falls API Fehlerdetails sendet
        });
    }


    // --- Initiales Laden der Daten ---
    loadKlassen();
    loadVociSets();
});