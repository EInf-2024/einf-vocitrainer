document.addEventListener('DOMContentLoaded', function () {
    // --- HTML Elemente ---
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton'); // Klasse Hinzufügen Button (Hauptseite)
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton'); // Voci Set Hinzufügen Button (Hauptseite)

    // Voci Set Detail/Edit Elemente
    const addVociSetSection = document.getElementById('add-voci-set-section');
    const closeAddVociSetSectionButton = document.getElementById('closeAddVociSetSection'); // Schliessen Button im Voci Set Div
    const vociSetNameHeader = document.getElementById('voci-set-name-header');
    const vociSetClassSpan = document.getElementById('voci-set-class'); // Element für Voci Set Klasse
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton');
    const existingWordsDropdown = document.getElementById('existing-words-dropdown'); // UL für Wörter im Dropdown
    const deutschesWortInput = document.getElementById('deutschesWort');
    const französischesWortInput = document.getElementById('französischesWort');
    const addWordButton = document.getElementById('addWordButton'); // Wort hinzufügen Button
    const vociSetNameButtonSpan = document.getElementById('voci-set-name-button'); // Element für Voci Set Name im Dropdown Button

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

    // NEUE Klasse Hinzufügen Modal Elemente
    const addClassModalElement = document.getElementById('addClassModal');
    const addClassModal = new bootstrap.Modal(addClassModalElement); // Bootstrap Modal Instanz
    const classNameInput = document.getElementById('classNameInput');
    const saveNewClassButton = document.getElementById('saveNewClassButton');


    // --- Zustandsvariablen ---
    let currentVociSetId = null; // Speichert die ID des aktuell bearbeiteten Voci Sets
    let currentDepartmentIdForClassDetails = null; // Speichert die ID der Klasse, deren Details gerade angezeigt werden


    // --- Event Listeners (zentralisiert durch Delegation oder direkte IDs) ---

    // Logout Button
    logoutButton.addEventListener('click', function() {
        window.location.href = 'index.html'; // Weiterleitung zur Indexseite (Login)
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


    // Voci Set Hinzufügen Button (Hauptseite) - TODO Logik für NEU erstellen
    addVociSetButtonMainPage.addEventListener('click', function() {
        // TODO: Logik zum STARTEN des Hinzufügens eines NEUEN Voci Sets implementieren
        alert('Funktion zum Hinzufügen eines NEUEN Voci Sets wird später implementiert.');
        // Aktuell öffnet showAddVociSetSection nur den Bearbeitungsbereich mit Platzhaltern
        showAddVociSetSection(); // Zeigt den Bereich an, ist aber noch nicht die Logik zum Erstellen
    });

    // Schliessen Button im Voci Set Detail/Edit Bereich
    closeAddVociSetSectionButton.addEventListener('click', hideAddVociSetSection);

    // Schliessen Button im Klassen Detail Bereich
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection);

    // Wort Hinzufügen Button im Voci Set Detail Bereich
    addWordButton.addEventListener('click', addWordToVociSet);

    // Schüler Hinzufügen Button im Klassen Detail Bereich
    addClassStudentButton.addEventListener('click', function() {
        // Hier wird die Logik zum Anzeigen des Schüler-Modal gestartet
        if (currentDepartmentIdForClassDetails) {
             showAddStudentModalForClass(currentDepartmentIdForClassDetails);
        } else {
            // Dies sollte nicht passieren, wenn der Button nur in der Klassendetailansicht sichtbar ist
            console.error("Keine Klasse ausgewählt, um Schüler hinzuzufügen.");
            alert("Bitte wählen Sie zuerst eine Klasse aus.");
        }
    });

    // Speichern Button im Schüler Hinzufügen Modal
    saveNewStudentButton.addEventListener('click', function() {
        const studentUsername = studentUsernameInput.value.trim(); // Leerzeichen am Anfang/Ende entfernen

        if (!studentUsername) {
            alert('Bitte geben Sie einen Benutzernamen für den Schüler ein.');
            return; // Funktion beenden, wenn Eingabe leer ist
        }

        if (currentDepartmentIdForClassDetails) {
            // Rufe Funktion zum Hinzufügen des Schülers per API auf
            addStudentToClass(currentDepartmentIdForClassDetails, studentUsername);
        } else {
            console.error('Department ID nicht gesetzt beim Versuch, Schüler hinzuzufügen.');
            alert('Ein Fehler ist aufgetreten: Klasse nicht ausgewählt.');
        }
    });


    // Event Delegation für Klicks im Klassen Container (für Delete- und View-Buttons)
    // Ein einziger Listener, der Klicks auf Buttons innerhalb des Containers behandelt
    klassenContainer.addEventListener('click', function(event) {
        const target = event.target; // Das Element, das geklickt wurde
        const deleteButton = target.closest('.delete-button'); // Prüfen, ob es ein Lösch-Button ist oder ein Element darin
        const viewClassButton = target.closest('.view-class-button'); // Prüfen, ob es ein Anzeigen-Button ist oder ein Element darin

        if (deleteButton) {
            // Klick auf einen Lösch-Button in einer Klassenkarte
            const departmentIdToDelete = deleteButton.dataset.departmentId; // Holen der ID vom Button
            if (departmentIdToDelete && confirm('Möchtest du diese Klasse wirklich löschen?')) { // Bestätigung
                deleteKlasse(departmentIdToDelete); // Löschfunktion aufrufen
            }
        } else if (viewClassButton) {
             // Klick auf den 'Anzeigen' Button in einer Klassenkarte
            const departmentIdToView = viewClassButton.dataset.departmentId; // Holen der ID vom Button
            if (departmentIdToView) {
                loadClassDetails(departmentIdToView); // Funktion zum Anzeigen der Klassendetails aufrufen
            }
        }
        // Klicks auf andere Teile der Klassenkarte (außer diese Buttons) werden ignoriert
    });


    // Event Delegation für Delete-Word-Buttons im Voci Set Dropdown
    // Listener auf das übergeordnete ul-Element, behandelt Klicks auf die Lösch-Buttons darin
    existingWordsDropdown.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-word-button'); // Prüfen, ob es ein Lösch-Button ist
        if (deleteButton) {
            const wordIdToDelete = deleteButton.dataset.wordId; // Holen der Wort-ID vom Button
            const vocabularySetId = deleteButton.dataset.vocabularySetId; // Holen der Voci Set ID vom Button
            if (wordIdToDelete && vocabularySetId) {
                 if (confirm('Möchtest du dieses Wort wirklich löschen?')) { // Bestätigung
                     deleteWordFromVociSet(vocabularySetId, wordIdToDelete); // Löschfunktion aufrufen
                }
            }
        }
    });

    // Event Delegation für Delete-Student-Buttons in der Schülerliste
    // Listener auf das übergeordnete ul-Element, behandelt Klicks auf die Lösch-Buttons darin
    classStudentsListUl.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-student-button'); // Prüfen, ob es ein Lösch-Button ist
        if (deleteButton) {
            const studentIdToDelete = deleteButton.dataset.studentId; // Holen der Schüler-ID vom Button
            const departmentId = deleteButton.dataset.departmentId; // Holen der Department ID vom Button
            if (studentIdToDelete && departmentId) {
                 if (confirm('Möchtest du diesen Schüler wirklich löschen?')) { // Bestätigung
                     deleteStudent(departmentId, studentIdToDelete); // Löschfunktion aufrufen
                }
            }
        }
    });

     // Event Delegation für Klicks in der Voci Sets Liste auf der Hauptseite
     // Listener auf das übergeordnete ul-Element, behandelt Klicks auf die "Bearbeiten" Buttons darin
     vociSetsContainer.addEventListener('click', function(event) {
         const editButton = event.target.closest('.edit-vociset-button'); // Prüfen, ob es ein Bearbeiten-Button ist
         if (editButton) {
             const vocisetId = editButton.dataset.vocisetId; // Holen der Voci Set ID vom Button
             const vocisetLabel = editButton.dataset.vocisetLabel; // Holen des Labels vom Button
             if (vocisetId && vocisetLabel) {
                 // Ruft die Funktion auf, um den Bearbeitungsbereich zu zeigen und Daten zu laden
                 showAddVociSetSectionForExisting(vocisetId, vocisetLabel);
             }
         }
     });


    // --- Funktionen zum Anzeigen/Verstecken der Detail-Bereiche ---

    // Zeigt den Bereich zum Bearbeiten/Hinzufügen von Voci Sets an
    // Wird vom Hauptseiten "Voci Set hinzufügen" Button aufgerufen (initiiert neues Set)
    // ODER von showAddVociSetSectionForExisting (zum Bearbeiten eines existierenden)
    function showAddVociSetSection() {
        // Zuerst alle anderen Detailbereiche verstecken, um Überlappung zu vermeiden
        hideClassDetailsSection();
        // Falls es ein "Neues Set" ist, auch den Inhalt zurücksetzen, falls vorher ein Set bearbeitet wurde
         if (currentVociSetId === null) {
             vociSetNameHeader.textContent = 'Neues Voci Set erstellen';
             vociSetClassSpan.textContent = 'Nicht zugewiesen'; // TODO
             vociSetNameButtonSpan.textContent = 'Neues Voci Set';
             existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Noch keine Wörter</li>';
             deutschesWortInput.value = '';
             französischesWortInput.value = '';
         }
        addVociSetSection.style.display = 'block'; // Bereich anzeigen
    }

    // Versteckt den Bereich zum Bearbeiten/Hinzufügen von Voci Sets
    function hideAddVociSetSection() {
        addVociSetSection.style.display = 'none'; // Bereich verstecken
        // Zustand und Eingaben zurücksetzen
        deutschesWortInput.value = '';
        französischesWortInput.value = '';
        currentVociSetId = null; // Wichtig: ID zurücksetzen, da kein Set mehr bearbeitet wird
        existingWordsDropdown.innerHTML = ''; // Dropdown leeren
        vociSetNameHeader.textContent = ''; // Header leeren
        vociSetNameButtonSpan.textContent = ''; // Button Text leeren
        vociSetClassSpan.textContent = ''; // Klasse leeren
    }

    // Zeigt den Bereich für Klassendetails an
    function showClassDetailsSection() {
        // Zuerst alle anderen Detailbereiche verstecken
        hideAddVociSetSection();

        classDetailsSection.style.display = 'block'; // Bereich anzeigen
    }

    // Versteckt den Bereich für Klassendetails
    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none'; // Bereich verstecken
        // Zustand und Inhalte zurücksetzen
        currentDepartmentIdForClassDetails = null; // Department ID zurücksetzen
        classDetailsNameSpan.textContent = ''; // Name leeren
        classStudentsListUl.innerHTML = ''; // Liste leeren
    }

     // Zeigt das Modal zum Hinzufügen eines Schülers für eine spezifische Klasse an
     function showAddStudentModalForClass(departmentId) {
         // Speichern der Department ID ist hier nicht mehr nötig, da sie in addStudentToClass
         // aus currentDepartmentIdForClassDetails geholt wird, die loadClassDetails setzt.
         // Oder wir können die ID direkt hier übergeben, was sauberer wäre.
         // Lass uns die ID hier setzen, um sicherzugehen:
         currentDepartmentIdForClassDetails = departmentId; // Setzt die ID direkt vor dem Öffnen

         studentUsernameInput.value = ''; // Eingabefeld leeren
         addStudentModal.show(); // Modal öffnen
     }


     // Funktion zum Anzeigen des "Voci Set hinzufügen" Bereichs für ein EXISTIERENDES Voci Set
     // Wird von Event Delegation im vociSetsContainer aufgerufen
     function showAddVociSetSectionForExisting(vocabularySetId, vocabularySetName) {
         // Zuerst den Bereich anzeigen (setzt display: block und versteckt andere)
         showAddVociSetSection(); // Ruft die allgemeine show Funktion auf

         // Dann spezifische Daten für das existierende Set laden
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
        // Überprüfen, ob gerade ein Voci Set zum Bearbeiten ausgewählt ist
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
         // Zuerst den Bereich anzeigen (setzt display: block und versteckt andere)
         showAddVociSetSection(); // Ruft die allgemeine show Funktion auf

         // Dann spezifische Daten für das existierende Set laden
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

    // Funktion: Schüler hinzufügen (wird vom Modal aufgerufen)
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
                 // TODO: Eventuell weitere Felder je nach API (z.g. password - aber vorsicht!)
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