document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton');
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton');
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

    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsNameSpan = document.getElementById('class-details-name');
    const classStudentsListUl = document.getElementById('class-students-list');
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection');
    const addClassStudentButton = document.getElementById('addClassStudentButton');

    // NEUE Modal Elemente
    const addStudentModal = new bootstrap.Modal(document.getElementById('addStudentModal')); // Bootstrap Modal Instanz
    const studentUsernameInput = document.getElementById('studentUsername');
    const saveNewStudentButton = document.getElementById('saveNewStudentButton');


    let currentVociSetId = null;
    let currentDepartmentIdForClassDetails = null;


    logoutButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    addKlasseButton.addEventListener('click', function() {
        // TODO: Hier später die Logik für das Hinzufügen einer Klasse (Div einblenden)
        alert('Funktion zum Hinzufügen einer Klasse wird später implementiert (Div einblenden)');
    });

    addVociSetButtonMainPage.addEventListener('click', function() {
        showAddVociSetSection();
    });

    closeAddVociSetSectionButton.addEventListener('click', function() {
        hideAddVociSetSection();
    });

    addWordButton.addEventListener('click', function() {
        addWordToVociSet();
    });

    closeClassDetailsSectionButton.addEventListener('click', function() {
        hideClassDetailsSection();
    });

    addClassStudentButton.addEventListener('click', function() { // Event Listener für "Schüler hinzufügen" Button
        // Öffne das Modal
        studentUsernameInput.value = ''; // Eingabefeld leeren
        addStudentModal.show();
    });

    saveNewStudentButton.addEventListener('click', function() { // Event Listener für "Speichern" Button im Modal
        const studentUsername = studentUsernameInput.value;
        if (studentUsername && currentDepartmentIdForClassDetails) {
            addStudentToClass(currentDepartmentIdForClassDetails, studentUsername);
        } else if (!studentUsername) {
            alert('Bitte geben Sie einen Benutzernamen ein.');
        } else {
             // Dies sollte nicht passieren, wenn der Code korrekt aufgerufen wird
            console.error('Department ID nicht gesetzt beim Versuch, Schüler hinzuzufügen.');
            alert('Fehler: Klasse nicht ausgewählt.');
        }
    });


    // *** Funktionen zum Anzeigen/Verstecken der Bereiche ***

    // Zeigt den Bereich zum Bearbeiten/Hinzufügen von Voci Sets
    window.showAddVociSetSection = function() {
        // Zuerst andere Bereiche verstecken
        hideClassDetailsSection();

        addVociSetSection.style.display = 'block';
        vociSetNameHeader.textContent = 'Neues Voci Set';
        vociSetClassSpan.textContent = 'Nicht zugewiesen'; // TODO: Klasse ermitteln?
        vociSetNameButtonSpan.textContent = 'Neues Voci Set';
        existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter vorhanden</li>';
        currentVociSetId = null;
        deutschesWortInput.value = '';
        französischesWortInput.value = '';

         // TODO: Logik zum Erstellen eines NEUEN Voci Sets hier starten,
         // falls der "Voci Set hinzufügen" Button (derzeit "Bearbeiten")
         // tatsächlich ein neues Set erstellen soll. Aktuell öffnet er nur
         // einen Bearbeitungsbereich, der ein existierendes Set lädt.
         // Die API /api/vocabulary-sets/create ist nur für das Erstellen des Sets selbst, nicht für Wörter!
    };

    // Versteckt den Bereich zum Bearbeiten/Hinzufügen von Voci Sets
    window.hideAddVociSetSection = function() {
        addVociSetSection.style.display = 'none';
        deutschesWortInput.value = '';
        französischesWortInput.value = '';
         currentVociSetId = null; // Voci Set ID zurücksetzen
    };

     // Zeigt den Bereich für Klassendetails
    function showClassDetailsSection() {
        // Zuerst andere Bereiche verstecken
        hideAddVociSetSection();

        classDetailsSection.style.display = 'block';
    }

     // Versteckt den Bereich für Klassendetails
    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none';
        currentDepartmentIdForClassDetails = null; // Department ID zurücksetzen
        classDetailsNameSpan.textContent = ''; // Namen leeren
        classStudentsListUl.innerHTML = ''; // Liste leeren
    }


    // *** Funktion zum Laden der Wörter eines Voci Sets und Anzeigen im Dropdown (unverändert) ***
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
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json();
        })
        .then(vociSetData => {
            const words = vociSetData.words;
            vociSetNameHeader.textContent = vociSetData.label;
            vociSetNameButtonSpan.textContent = vociSetData.label;
            // TODO: Klasse des Voci Sets anzeigen (falls API das liefert oder wir es anders wissen) - vociSetClassSpan.textContent = ...;


            existingWordsDropdown.innerHTML = ''; // Dropdown leeren

            if (words && Array.isArray(words) && words.length > 0) {
                words.forEach(word => {
                    const wordItem = document.createElement('li');
                    // Bootstrap Dropdown Item Styling + Flexbox für Layout
                    wordItem.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    wordItem.innerHTML = `
                        <span>${word.word} - ${word.translation}</span>
                         <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${word.id}" data-vocabulary-set-id="${vocabularySetId}" onclick="event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    existingWordsDropdown.appendChild(wordItem);
                });
            } else {
                existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter vorhanden</li>';
            }

            // NEU: Event Delegation für Delete-Word-Buttons im Dropdown
             // Wir fügen den Listener einmal auf das übergeordnete ul-Element hinzu
            existingWordsDropdown.removeEventListener('click', handleWordDeleteClick); // Vorherigen Listener entfernen, falls vorhanden
            existingWordsDropdown.addEventListener('click', handleWordDeleteClick);

        })
        .catch(error => {
            console.error('Fehler beim Laden der Wörter für Voci Set:', error);
            existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Fehler beim Laden der Wörter</li>';
             alert('Fehler beim Laden der Wörter für Voci Set: ' + error.message);
        });
    }

    // NEUE Event Handler Funktion für Word Delete Click (für Event Delegation)
    function handleWordDeleteClick(event) {
        const deleteButton = event.target.closest('.delete-word-button');
        if (deleteButton) {
            const wordIdToDelete = deleteButton.dataset.wordId;
            const vocabularySetId = deleteButton.dataset.vocabularySetId; // Holen der Voci Set ID
            if (wordIdToDelete && vocabularySetId) {
                 // Bestätigungsfrage hinzufügen
                if (confirm('Möchtest du dieses Wort wirklich löschen?')) {
                     deleteWordFromVociSet(vocabularySetId, wordIdToDelete);
                }
            }
        }
    }


    // *** Funktion zum Hinzufügen eines Wortes zu einem Voci Set ***
    function addWordToVociSet() {
        const deutschesWort = deutschesWortInput.value;
        const französischesWort = französischesWortInput.value;

        if (!deutschesWort || !französischesWort) {
            alert('Bitte geben Sie sowohl ein deutsches als auch ein französisches Wort ein.');
            return;
        }
        if (currentVociSetId === null) {
             alert('Bitte wählen Sie zuerst ein Voci Set zum Bearbeiten aus.');
             return;
        }

        // **WICHTIG: API `/api/vocabulary-sets/create` ist FALSCH für Hinzufügen von Wörtern!**
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
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status} - ${text}`); });
            }
            return response.json(); // Oder response.text(), falls API keinen JSON Response sendet
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


    // *** Funktion zum Löschen eines Wortes aus einem Voci Set ***
    function deleteWordFromVociSet(vocabularySetId, wordId) {
         // Bestätigungsfrage hinzufügen
        if (!confirm('Möchtest du dieses Wort wirklich löschen?')) {
            return; // Löschen abbrechen, wenn der Benutzer "Abbrechen" wählt
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
            loadWordsForVociSet(vocabularySetId); // Wörterliste im Dropdown neu laden
            loadVociSets(); // Voci Sets Liste auf Hauptseite neu laden (Wörteranzahl aktualisieren)
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Wortes:', error);
            alert('Fehler beim Löschen des Wortes: ' + error.message);
        });
    }


    // *** Klassen (Departments) laden ***
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
                     // Department ID auf die Card für einfachen Zugriff setzen
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
                                    <button class="btn btn-danger btn-sm delete-button" data-department-id="${department.id}" onclick="event.stopPropagation();">
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

            // Event Listener für Klassen-Container (für Delete- und View-Buttons)
             // Event Delegation für Klicks auf den Container
            klassenContainer.removeEventListener('click', handleKlassenContainerClick); // Alten Listener entfernen
            klassenContainer.addEventListener('click', handleKlassenContainerClick); // Neuen Listener hinzufügen


        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassen:', error);
            klassenContainer.innerHTML = '<p>Fehler beim Laden der Klassen.</p>';
             alert('Fehler beim Laden der Klassen: ' + error.message);
        });
    }

     // NEUE Event Handler Funktion für Klassen Container Klick (für Event Delegation)
    function handleKlassenContainerClick(event) {
        const target = event.target;
        const deleteButton = target.closest('.delete-button');
        const viewClassButton = target.closest('.view-class-button'); // NEU: Den View Class Button finden

        if (deleteButton) {
            const departmentIdToDelete = deleteButton.dataset.departmentId;
             if (departmentIdToDelete && confirm('Möchtest du diese Klasse wirklich löschen?')) {
                deleteKlasse(departmentIdToDelete);
            }
        } else if (viewClassButton) { // Wenn der View Class Button geklickt wurde
            const departmentIdToView = viewClassButton.dataset.departmentId;
             if (departmentIdToView) {
                loadClassDetails(departmentIdToView);
            }
        }
        // Wenn etwas anderes in der Card geklickt wird (z.B. Titel, Absatz), passiert nichts mehr durch diese Logik,
        // da wir jetzt auf den spezifischen 'view-class-button' hören.
    }


     // Funktion zum Löschen einer Klasse
    function deleteKlasse(departmentId) {
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
            console.log(`Klasse (Department) mit ID ${departmentId} gelöscht.`, data);
            alert('Klasse erfolgreich gelöscht!');
            loadKlassen();
            hideClassDetailsSection(); // Klassendetails schließen, falls die gelöschte Klasse angezeigt wurde
        })
        .catch(error => {
            console.error('Fehler beim Löschen der Klasse (Department):', error);
            alert('Fehler beim Löschen der Klasse: ' + error.message);
        });
    }


    // *** Voci Sets laden (unverändert) ***
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
                        <button class="btn btn-success btn-sm" onclick="showAddVociSetSectionForExisting(${vociSet.id}, '${vociSet.label}')">Bearbeiten</button>
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
             alert('Fehler beim Laden der Voci Sets: ' + error.message);
        });
    }

    // *** Funktion zum Anzeigen des "Voci Set hinzufügen" Bereichs für ein EXISTIERENDES Voci Set ***
    window.showAddVociSetSectionForExisting = function(vocabularySetId, vocabularySetName) {
        addVociSetSection.style.display = 'block';
        currentVociSetId = vocabularySetId;
        vociSetNameHeader.textContent = `Voci Set bearbeiten: ${vocabularySetName}`;
        vociSetNameButtonSpan.textContent = vocabularySetName;
        loadWordsForVociSet(vocabularySetId);

        hideClassDetailsSection(); // Andere Bereiche verstecken
    };


    // *** Funktion: Klassendetails laden und anzeigen ***
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
            classStudentsListUl.innerHTML = '';

            if (departmentData.students && Array.isArray(departmentData.students) && departmentData.students.length > 0) {
                departmentData.students.forEach(student => {
                    const studentItem = document.createElement('li');
                    studentItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    studentItem.innerHTML = `
                        <span>${student.username}</span>
                        <button class="btn btn-danger btn-sm delete-student-button" data-student-id="${student.id}" data-department-id="${departmentData.id}" onclick="event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    classStudentsListUl.appendChild(studentItem);
                });
            } else {
                classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler in dieser Klasse</li>';
            }

            // NEU: Event Delegation für Delete-Student-Buttons in der Schülerliste
             // Wir fügen den Listener einmal auf das übergeordnete ul-Element hinzu
            classStudentsListUl.removeEventListener('click', handleStudentDeleteClick); // Vorherigen Listener entfernen, falls vorhanden
            classStudentsListUl.addEventListener('click', handleStudentDeleteClick);

            hideAddVociSetSection(); // Andere Bereiche verstecken
            showClassDetailsSection(); // Klassendetails Section anzeigen

        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassendetails:', error);
            classDetailsNameSpan.textContent = 'Fehler beim Laden der Klassendetails';
            classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Fehler beim Laden der Schülerliste</li>';

            hideAddVociSetSection(); // Andere Bereiche verstecken, auch bei Fehler
            showClassDetailsSection(); // Zeige Section trotzdem an, aber mit Fehlermeldung
             alert('Fehler beim Laden der Klassendetails: ' + error.message);
        });
    }

     // NEUE Event Handler Funktion für Student Delete Click (für Event Delegation)
    function handleStudentDeleteClick(event) {
        const deleteButton = event.target.closest('.delete-student-button');
        if (deleteButton) {
            const studentIdToDelete = deleteButton.dataset.studentId;
            const departmentId = deleteButton.dataset.departmentId; // Holen der Department ID
            if (studentIdToDelete && departmentId) {
                 // Bestätigungsfrage hinzufügen
                if (confirm('Möchtest du diesen Schüler wirklich löschen?')) {
                     deleteStudent(departmentId, studentIdToDelete);
                }
            }
        }
    }


    // *** Funktion: Schüler löschen ***
    function deleteStudent(departmentId, studentId) {
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
            console.log(`Schüler mit ID ${studentId} aus Department ${departmentId} gelöscht.`, data);
            alert('Schüler erfolgreich gelöscht!');
            loadClassDetails(departmentId); // Klassendetails neu laden
            loadKlassen(); // Klassenliste auf Hauptseite neu laden
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Schülers:', error);
            alert('Fehler beim Löschen des Schülers: ' + error.message);
        });
    }

    // *** NEUE Funktion: Schüler hinzufügen ***
    function addStudentToClass(departmentId, studentUsername) {
        // **WICHTIG: API `/api/departments/create` ist FALSCH für Hinzufügen von Schülern!**
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
                 // Eventuell weitere Felder je nach API (z.B. password - aber vorsicht!)
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
             // Modal nicht schließen, damit Benutzer Eingabe korrigieren kann, oder neue Instanz öffnen
        });
    }


    // Initiales Laden der Daten
    loadKlassen();
    loadVociSets();
});