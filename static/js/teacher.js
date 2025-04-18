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
    const addClassStudentButton = document.getElementById('addClassStudentButton'); // NEU: Add Student Button


    let currentVociSetId = null;
    let currentDepartmentIdForClassDetails = null; // NEU: Speichert aktuelle Department ID für Klassendetails


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

    addClassStudentButton.addEventListener('click', function() { // NEU: Event Listener für "Schüler hinzufügen" Button
        // TODO: Hier später die Logik für das Hinzufügen eines Schülers (Modal/Formular)
        alert('Funktion zum Hinzufügen von Schülern wird später implementiert (Modal/Formular)');
        // Nach dem Hinzufügen: loadClassDetails(currentDepartmentIdForClassDetails); // Neu laden, falls Schüler hinzugefügt
    });


    // *** Funktionen zum Anzeigen/Verstecken des "Voci Set hinzufügen" Bereichs ***
    window.showAddVociSetSection = function() {
        addVociSetSection.style.display = 'block';
        vociSetNameHeader.textContent = 'Neues Voci Set';
        vociSetClassSpan.textContent = 'Nicht zugewiesen';
        vociSetNameButtonSpan.textContent = 'Neues Voci Set';
        existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter vorhanden</li>';
        currentVociSetId = null;
    };

    window.hideAddVociSetSection = function() {
        addVociSetSection.style.display = 'none';
        deutschesWortInput.value = '';
        französischesWortInput.value = '';
    };


    // *** Funktion zum Laden der Wörter eines Voci Sets und Anzeigen im Dropdown ***
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(vociSetData => {
            const words = vociSetData.words;
            vociSetNameHeader.textContent = vociSetData.label;
            vociSetNameButtonSpan.textContent = vociSetData.label;

            existingWordsDropdown.innerHTML = '';

            if (words && Array.isArray(words) && words.length > 0) {
                words.forEach(word => {
                    const wordItem = document.createElement('li');
                    wordItem.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    wordItem.innerHTML = `
                        <span>${word.word} - ${word.translation}</span>
                        <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${word.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    existingWordsDropdown.appendChild(wordItem);
                });
            } else {
                existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter vorhanden</li>';
            }

            existingWordsDropdown.addEventListener('click', function(event) {
                if (event.target.classList.contains('fa-trash')) {
                    const deleteButton = event.target.closest('.delete-word-button');
                    const wordIdToDelete = deleteButton.dataset.wordId;
                    if (wordIdToDelete) {
                        deleteWordFromVociSet(vocabularySetId, wordIdToDelete);
                    }
                }
            });


        })
        .catch(error => {
            console.error('Fehler beim Laden der Wörter für Voci Set:', error);
            existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Fehler beim Laden der Wörter</li>';
        });
    }


    // *** Funktion zum Hinzufügen eines Wortes zu einem Voci Set ***
    function addWordToVociSet() {
        const deutschesWort = deutschesWortInput.value;
        const französischesWort = französischesWortInput.value;

        if (!deutschesWort || !französischesWort) {
            alert('Bitte geben Sie sowohl ein deutsches als auch ein französisches Wort ein.');
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
                word_de: deutschesWort,
                word_fr: französischesWort
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Wort erfolgreich hinzugefügt:', data);
            alert('Wort erfolgreich hinzugefügt!');
            deutschesWortInput.value = '';
            französischesWortInput.value = '';
            loadWordsForVociSet(currentVociSetId);
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Wortes:', error);
            alert('Fehler beim Hinzufügen des Wortes.');
        });
    }


    // *** Funktion zum Löschen eines Wortes aus einem Voci Set ***
    function deleteWordFromVociSet(vocabularySetId, wordId) {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`Wort mit ID ${wordId} aus Voci Set ${vocabularySetId} gelöscht.`);
            loadWordsForVociSet(vocabularySetId);
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Wortes:', error);
            alert('Fehler beim Löschen des Wortes.');
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const departments = data.departments;
            klassenContainer.innerHTML = '';

            if (departments && Array.isArray(departments)) {
                departments.forEach(department => {
                    const klasseCard = document.createElement('div');
                    klasseCard.classList.add('col');
                    klasseCard.innerHTML = `
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
                    klassenContainer.appendChild(klasseCard);
                });
            } else {
                klassenContainer.innerHTML = '<p>Keine Klassen gefunden.</p>';
            }

            klassenContainer.addEventListener('click', function(event) {
                if (event.target.classList.contains('delete-button')) {
                    const deleteButton = event.target.closest('.delete-button');
                    const departmentIdToDelete = deleteButton.dataset.departmentId;
                    if (departmentIdToDelete) {
                        deleteKlasse(departmentIdToDelete);
                    }
                } else if (event.target.classList.contains('view-class-button')) {
                    const viewClassButton = event.target.closest('.view-class-button');
                    const departmentIdToView = viewClassButton.dataset.departmentId;
                    if (departmentIdToView) {
                        loadClassDetails(departmentIdToView);
                    }
                }
            });


        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassen:', error);
            klassenContainer.innerHTML = '<p>Keine Klassen gefunden.</p>';
        });
    }

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`Klasse (Department) mit ID ${departmentId} gelöscht.`);
            loadKlassen();
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
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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
        });
    }

    // *** Funktion zum Anzeigen des "Voci Set hinzufügen" Bereichs für ein EXISTIERENDES Voci Set ***
    window.showAddVociSetSectionForExisting = function(vocabularySetId, vocabularySetName) {
        addVociSetSection.style.display = 'block';
        currentVociSetId = vocabularySetId;
        vociSetNameHeader.textContent = `Voci Set bearbeiten: ${vocabularySetName}`;
        vociSetNameButtonSpan.textContent = vocabularySetName;
        loadWordsForVociSet(vocabularySetId);
    };


    // *** NEUE Funktion: Klassendetails laden und anzeigen ***
    function loadClassDetails(departmentId) {
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
                throw new Error(`HTTP error! status: ${response.status}`);
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
                        <button class="btn btn-danger btn-sm delete-student-button" data-student-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    classStudentsListUl.appendChild(studentItem);
                });
            } else {
                classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler in dieser Klasse</li>';
            }

            // Event Listener für Delete-Student-Buttons (MUSS nach dem Erstellen der Buttons hinzugefügt werden)
            classStudentsListUl.addEventListener('click', function(event) {
                if (event.target.classList.contains('fa-trash')) {
                    const deleteButton = event.target.closest('.delete-student-button');
                    const studentIdToDelete = deleteButton.dataset.studentId;
                    if (studentIdToDelete) {
                        deleteStudent(departmentId, studentIdToDelete);
                    }
                }
            });


            showClassDetailsSection();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Klassendetails:', error);
            classDetailsNameSpan.textContent = 'Fehler beim Laden der Klassendetails';
            classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Fehler beim Laden der Schülerliste</li>';
            showClassDetailsSection();
        });
    }

    // *** NEUE Funktion: Schüler löschen ***
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`Schüler mit ID ${studentId} aus Department ${departmentId} gelöscht.`);
            loadClassDetails(departmentId);
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Schülers:', error);
            alert('Fehler beim Löschen des Schülers.');
        });
    }


    // *** Funktionen zum Anzeigen/Verstecken des "Klassendetails" Bereichs ***
    function showClassDetailsSection() {
        classDetailsSection.style.display = 'block';
    }

    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none';
    }


    loadKlassen();
    loadVociSets();
});