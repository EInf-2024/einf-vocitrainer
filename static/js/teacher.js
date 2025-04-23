document.addEventListener('DOMContentLoaded', function () {
    // --- HTML Elemente ---
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton');
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton');

    // Voci Set Detail/Edit Elemente
    const vocisetDetailSection = document.getElementById('vociset-detail-section');
    const closeVocisetDetailSectionButton = document.getElementById('closeVocisetDetailSection');
    const vocisetDetailNameHeader = document.getElementById('vociset-detail-name-header');
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton');
    const existingWordsDropdown = document.getElementById('existing-words-dropdown');
    const deutschesWortInput = document.getElementById('deutschesWort');
    const französischesWortInput = document.getElementById('französischesWort');
    const addWordButton = document.getElementById('addWordButton');
    const vocisetDetailNameButtonSpan = document.getElementById('vociset-detail-name-button');

    // Klassen Detail Elemente
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsNameSpan = document.getElementById('class-details-name');
    const classStudentsListUl = document.getElementById('class-students-list');
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection');
    const addClassStudentButton = document.getElementById('addClassStudentButton');

    // Schüler Hinzufügen Modal Elemente
    const addStudentModalElement = document.getElementById('addStudentModal');
    const addStudentModal = new bootstrap.Modal(addStudentModalElement);
    const studentUsernameInput = document.getElementById('studentUsername');
    const saveNewStudentButton = document.getElementById('saveNewStudentButton');

    // Voci Set Hinzufügen Modal Elemente (Zum ERSTELLEN)
    const createVocisetModalElement = document.getElementById('createVocisetModal');
    const createVocisetModal = new bootstrap.Modal(createVocisetModalElement);
    const vocisetNameInput = document.getElementById('vocisetNameInput');
    const saveNewVocisetButton = document.getElementById('saveNewVocisetButton');

    // Klasse Hinzufügen Modal Elemente
    const addClassModalElement = document.getElementById('addClassModal');
    const addClassModal = new bootstrap.Modal(addClassModalElement);
    const classNameInput = document.getElementById('classNameInput');
    const saveNewClassButton = document.getElementById('saveNewClassButton');

    // Elemente für Klassenzuweisung im Voci Set Detail
    const vocisetAssignedClassesList = document.getElementById('vociset-assigned-classes-list');
    const assignClassSelect = document.getElementById('assign-class-select');
    const assignClassButton = document.getElementById('assign-class-button');
    const noAssignedClassesMessage = document.getElementById('no-assigned-classes-message');

    // CSV Upload Elemente
    const csvFileInput = document.getElementById('csvFileInput');
    const uploadCsvButton = document.getElementById('uploadCsvButton');
    const csvUploadFeedback = document.getElementById('csvUploadFeedback');


    // --- Zustandsvariablen ---
    let currentVociSetId = null;
    let currentDepartmentIdForClassDetails = null;


    // --- Hilfsfunktion für Fetch mit Fehlerbehandlung ---
    async function fetchData(url, options = {}) {
        options.headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        };
        const fullUrl = url.startsWith('http') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;

        try {
            console.log(`Fetching: ${options.method || 'GET'} ${fullUrl}`);
             if(options.body) { console.log(`Request Body: ${options.body}`); }

            const response = await fetch(fullUrl, options);
            const responseBody = await response.text();

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${fullUrl}`;
                 try {
                    const errorJson = JSON.parse(responseBody);
                    errorMsg += ` - ${JSON.stringify(errorJson)}`;
                 } catch (e) {
                    errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`;
                 }
                 console.error("Fetch Error Details:", errorMsg);
                 throw new Error(errorMsg);
            }
            return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                 const networkErrorMsg = `Network Error: Failed to fetch ${fullUrl}. Is the backend server running and accessible?`;
                 console.error(networkErrorMsg);
                 throw new Error(`Network Error: Failed to fetch API endpoint. Please ensure the backend server is running.`);
            }
            console.error(`Fetch Exception (${options.method || 'GET'} ${fullUrl}):`, error);
            throw error;
        }
    }


    // --- Event Listeners ---

    logoutButton.addEventListener('click', () => { window.location.href = '/'; });
    addKlasseButton.addEventListener('click', () => { classNameInput.value = ''; addClassModal.show(); });
    addVociSetButtonMainPage.addEventListener('click', () => { vocisetNameInput.value = ''; createVocisetModal.show(); });

    saveNewClassButton.addEventListener('click', () => {
        const className = classNameInput.value.trim();
        if (className) createNewKlasse(className); else alert('Bitte Klassennamen eingeben.');
    });

    saveNewVocisetButton.addEventListener('click', () => {
        const vocisetName = vocisetNameInput.value.trim();
        if (vocisetName) createNewVociset(vocisetName); else alert('Bitte Voci Set Namen eingeben.');
    });

    closeVocisetDetailSectionButton.addEventListener('click', hideVocisetDetailSection);
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection);
    addWordButton.addEventListener('click', addWordToVociset); // Für manuelles Hinzufügen

    // CSV Upload Button Listener
    uploadCsvButton.addEventListener('click', handleCsvUpload);

    addClassStudentButton.addEventListener('click', () => {
        if (currentDepartmentIdForClassDetails) showAddStudentModalForClass(currentDepartmentIdForClassDetails);
        else alert("Bitte zuerst eine Klasse auswählen.");
    });

    saveNewStudentButton.addEventListener('click', () => {
        const studentUsername = studentUsernameInput.value.trim();
        if (!studentUsername) alert('Bitte Benutzernamen eingeben.');
        else if (currentDepartmentIdForClassDetails) addStudentToClass(currentDepartmentIdForClassDetails, studentUsername);
        else alert('Fehler: Klasse nicht ausgewählt.');
    });

    // --- Event Delegation Listeners ---
    klassenContainer.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-button');
        const viewClassButton = event.target.closest('.view-class-button');
        if (deleteButton) {
            const id = deleteButton.dataset.departmentId;
            if (id && confirm('Klasse wirklich löschen?')) deleteKlasse(id);
        } else if (viewClassButton) {
            const id = viewClassButton.dataset.departmentId;
            if (id) loadClassDetails(id);
        }
    });

    existingWordsDropdown.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-word-button');
        if (deleteButton) {
            const wordId = deleteButton.dataset.wordId;
            const setId = deleteButton.dataset.vocabularySetId;
            if (wordId && setId && confirm('Wort wirklich löschen?')) deleteWordFromVociset(setId, wordId);
        }
    });

    classStudentsListUl.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-student-button');
        if (deleteButton) {
            const studentId = deleteButton.dataset.studentId;
            const departmentId = deleteButton.dataset.departmentId;
            if (studentId && departmentId && confirm('Schüler wirklich löschen?')) deleteStudent(departmentId, studentId);
        }
    });

     vociSetsContainer.addEventListener('click', (event) => {
         const editButton = event.target.closest('.edit-vociset-button');
         if (editButton) {
             const id = editButton.dataset.vocisetId;
             const label = editButton.dataset.vocisetLabel;
             if (id && label) showVocisetDetailSection(id, label);
         }
     });

    assignClassButton.addEventListener('click', () => {
        const selectedDepartmentId = assignClassSelect.value;
        if (currentVociSetId && selectedDepartmentId) assignClassToVociset(currentVociSetId, selectedDepartmentId);
        else if (!selectedDepartmentId) alert("Bitte Klasse auswählen.");
        else alert("Fehler: Kein Voci Set aktiv.");
    });

    vocisetAssignedClassesList.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-class-assignment-button');
        if (removeButton && currentVociSetId) {
            const departmentIdToRemove = removeButton.dataset.departmentId;
            if (departmentIdToRemove) removeClassAssignment(currentVociSetId, departmentIdToRemove);
        }
    });


    // --- UI Funktionen (Anzeigen/Verstecken) ---

    function showVocisetDetailSection(vocabularySetId, vocabularySetName) {
        hideClassDetailsSection();
        vocisetDetailSection.style.display = 'block';
        assignClassSelect.value = "";
        assignClassSelect.disabled = true;
        assignClassButton.disabled = true;
        csvFileInput.value = ''; // CSV Input zurücksetzen
        csvUploadFeedback.textContent = ''; // CSV Feedback zurücksetzen
        csvUploadFeedback.className = 'mt-2';

        currentVociSetId = vocabularySetId;
        vocisetDetailNameHeader.textContent = `Voci Set: ${vocabularySetName}`;
        vocisetDetailNameButtonSpan.textContent = vocabularySetName;

        loadWordsForVociset(vocabularySetId);
        loadAssignedClassesForVociset(vocabularySetId);
        populateClassAssignmentDropdown();
    }

    function hideVocisetDetailSection() {
        vocisetDetailSection.style.display = 'none';
        deutschesWortInput.value = '';
        französischesWortInput.value = '';
        currentVociSetId = null;
        existingWordsDropdown.innerHTML = '';
        vocisetDetailNameHeader.textContent = '';
        vocisetDetailNameButtonSpan.textContent = '';
        vocisetAssignedClassesList.innerHTML = '';
        assignClassSelect.innerHTML = '<option selected disabled value="">-- Klasse auswählen --</option>';
        noAssignedClassesMessage.style.display = 'none';
         csvFileInput.value = ''; // Sicherstellen, dass File Input leer ist
         csvUploadFeedback.textContent = '';
         csvUploadFeedback.className = 'mt-2';

    }

    function showClassDetailsSection() {
        hideVocisetDetailSection();
        classDetailsSection.style.display = 'block';
    }

    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none';
        currentDepartmentIdForClassDetails = null;
        classDetailsNameSpan.textContent = '';
        classStudentsListUl.innerHTML = '';
    }

    function showAddStudentModalForClass(departmentId) {
        currentDepartmentIdForClassDetails = departmentId;
        studentUsernameInput.value = '';
        addStudentModal.show();
    }


    // --- API Interaktionen & Daten Laden ---

    async function createNewKlasse(className) {
        const url = `/departments/create`;
        try {
            await fetchData(url, { method: 'POST', body: JSON.stringify({ label: className }) });
            alert(`Klasse "${className}" erstellt!`);
            addClassModal.hide();
            loadKlassen();
        } catch (error) { alert('Fehler beim Erstellen der Klasse: ' + error.message); }
    }

    async function createNewVociset(vocisetName) {
        const url = `/vocabulary-sets/create`;
        try {
            const newVocisetData = await fetchData(url, { method: 'POST', body: JSON.stringify({ label: vocisetName }) });
            alert(`Voci Set "${newVocisetData.label}" erstellt!`);
            createVocisetModal.hide();
            loadVociSets();
            if (newVocisetData?.id) {
                 setTimeout(() => showVocisetDetailSection(newVocisetData.id, newVocisetData.label), 100);
            } else { console.warn("Voci Set erstellt, aber ID fehlt."); }
        } catch (error) { alert('Fehler beim Erstellen des Voci Sets: ' + error.message); }
    }

    async function loadWordsForVociset(vocabularySetId) {
        const url = `/vocabulary-sets/${vocabularySetId}`;
        try {
            const vocisetData = await fetchData(url);
            const words = vocisetData.words;
            existingWordsDropdown.innerHTML = ''; // Clear previous words
            if (words?.length > 0) {
                words.forEach(word => {
                    const li = document.createElement('li');
                    li.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        <span title="ID: ${word.id}">${word.word} - ${word.translation}</span>
                         <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${word.id}" data-vocabulary-set-id="${vocabularySetId}" title="Wort löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    existingWordsDropdown.appendChild(li);
                });
            } else {
                existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter vorhanden</li>';
            }
        } catch (error) {
            existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled text-danger">Fehler beim Laden der Wörter</li>';
            console.error('Fehler loadWordsForVociset:', error); // Weniger Alerts
        }
    }

    async function loadAssignedClassesForVociset(vocabularySetId) {
        const url = `/vocabulary-sets/${vocabularySetId}`;
        vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Lade Klassen...</li>';
        noAssignedClassesMessage.style.display = 'none';
        try {
            const data = await fetchData(url);
            const departments = data.departments; // Annahme: API liefert 'departments' Array
            vocisetAssignedClassesList.innerHTML = ''; // Clear

            if (departments?.length > 0) {
                departments.forEach(dept => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        <span>${dept.label}</span>
                        <button class="btn btn-warning btn-sm remove-class-assignment-button" data-department-id="${dept.id}" title="Zuweisung entfernen">
                            <i class="fas fa-unlink"></i> Entfernen
                        </button>
                    `;
                    vocisetAssignedClassesList.appendChild(li);
                });
                noAssignedClassesMessage.style.display = 'none';
            } else if (departments === undefined) {
                 console.warn(`Antwort von GET ${url} enthält kein 'departments' Array.`);
                 vocisetAssignedClassesList.innerHTML = `<li class="list-group-item list-group-item-warning">Info: Klassen konnten nicht geladen werden (Daten fehlen).</li>`;
            } else { // departments ist leeres Array
                noAssignedClassesMessage.style.display = 'block';
            }
        } catch (error) {
             vocisetAssignedClassesList.innerHTML = `<li class="list-group-item list-group-item-danger">Fehler beim Laden der Klassen.</li>`;
             noAssignedClassesMessage.style.display = 'none';
             console.error('Fehler loadAssignedClassesForVociset:', error);
        }
    }

    async function populateClassAssignmentDropdown() {
        const url = '/departments';
        assignClassSelect.innerHTML = '<option selected disabled value="">Lade Klassen...</option>';
        assignClassSelect.disabled = true;
        assignClassButton.disabled = true;
        try {
            const data = await fetchData(url);
            const departments = data.departments;
            assignClassSelect.innerHTML = ''; // Clear

            const defaultOption = document.createElement('option');
            defaultOption.value = ""; defaultOption.textContent = "-- Klasse auswählen --";
            defaultOption.selected = true; defaultOption.disabled = true;
            assignClassSelect.appendChild(defaultOption);

            if (departments?.length > 0) {
                departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id; option.textContent = dept.label;
                    assignClassSelect.appendChild(option);
                });
                assignClassSelect.disabled = false; assignClassButton.disabled = false;
            } else {
                assignClassSelect.innerHTML = '<option selected disabled value="">Keine Klassen gefunden</option>';
                assignClassButton.disabled = true;
            }
        } catch (error) {
            assignClassSelect.innerHTML = '<option selected disabled value="">Fehler beim Laden</option>';
            assignClassButton.disabled = true;
            console.error('Fehler populateClassAssignmentDropdown:', error);
        }
    }

    async function assignClassToVociset(vocisetId, departmentId) {
        const url = `/vocabulary-sets/${vocisetId}/departments/add`;
        const departmentIdInt = parseInt(departmentId);
        assignClassButton.disabled = true; assignClassButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Zuweisen...';
        try {
            await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: departmentIdInt }) }); // Key ist "id"
            alert('Klasse zugewiesen!');
            loadAssignedClassesForVociset(vocisetId);
            assignClassSelect.value = "";
        } catch (error) { alert('Fehler beim Zuweisen: ' + error.message); }
        finally { assignClassButton.disabled = false; assignClassButton.innerHTML = 'Zuweisen'; }
    }

    async function removeClassAssignment(vocisetId, departmentId) {
        if (!confirm(`Zuweisung dieser Klasse wirklich entfernen?`)) return;
        const url = `/vocabulary-sets/${vocisetId}/departments/remove`;
        const departmentIdInt = parseInt(departmentId);
        try {
            // Optional: Ladezustand für den geklickten Button (komplexer)
            await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: departmentIdInt }) }); // Key ist "id"
            alert('Zuweisung entfernt!');
            loadAssignedClassesForVociset(vocisetId);
        } catch (error) { alert('Fehler beim Entfernen: ' + error.message); }
    }

    // Interne Funktion für den API-Aufruf zum Wort hinzufügen
    async function _addWordApiCall(vocisetId, germanWord, frenchWord) {
        const url = `/vocabulary-sets/${vocisetId}/words/create`;
        return fetchData(url, { method: 'POST', body: JSON.stringify({ word: germanWord, translation: frenchWord }) });
    }

    // Funktion für manuelles Wort hinzufügen (nutzt _addWordApiCall)
    async function addWordToVociset() {
        const germanWord = deutschesWortInput.value.trim();
        const frenchWord = französischesWortInput.value.trim();
        if (!germanWord || !frenchWord) { alert('Bitte beide Wortfelder ausfüllen.'); return; }
        if (!currentVociSetId) { alert('Fehler: Kein Voci Set ausgewählt.'); return; }

        try {
            await _addWordApiCall(currentVociSetId, germanWord, frenchWord);
            alert('Wort hinzugefügt!');
            deutschesWortInput.value = ''; französischesWortInput.value = '';
            loadWordsForVociset(currentVociSetId);
            loadVociSets(); // Aktualisiere Hauptliste
        } catch (error) { alert('Fehler beim Hinzufügen: ' + error.message); }
    }

    // Funktion zur Verarbeitung des CSV-Uploads
    async function handleCsvUpload() {
        if (!currentVociSetId) {
            csvUploadFeedback.textContent = 'Fehler: Kein Voci Set ausgewählt.'; csvUploadFeedback.className = 'mt-2 text-danger'; return;
        }
        const file = csvFileInput.files[0];
        if (!file) {
            csvUploadFeedback.textContent = 'Bitte CSV-Datei auswählen.'; csvUploadFeedback.className = 'mt-2 text-warning'; return;
        }

        uploadCsvButton.disabled = true; uploadCsvButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verarbeite...';
        csvUploadFeedback.textContent = 'Lese CSV...'; csvUploadFeedback.className = 'mt-2 text-info';

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvContent = event.target.result;
            const lines = csvContent.split(/\r?\n/);
            let addedCount = 0, errorCount = 0, skippedCount = 0, headerSkipped = false;
            const totalLines = lines.length > 0 && lines[lines.length-1] === '' ? lines.length - 1 : lines.length; // Letzte Leerzeile ignorieren für Zählung

            csvUploadFeedback.textContent = `Verarbeite ${totalLines} Zeilen...`;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) { continue; } // Leere Zeilen überspringen

                // Kopfzeile prüfen (nur bei erster nicht-leerer Zeile)
                if (i === 0 || (i === 1 && !lines[0].trim())) { // Wenn erste Zeile oder zweite (falls erste leer war)
                     const lowerLine = line.toLowerCase();
                     if (lowerLine.includes('deutsch') || lowerLine.includes('französisch') || lowerLine.includes('german') || lowerLine.includes('french') || lowerLine.includes('wort') || lowerLine.includes('translation')) {
                        console.log("CSV Kopfzeile erkannt & übersprungen:", line);
                        headerSkipped = true;
                        continue;
                     }
                }

                const parts = line.split(','); // Einfaches Komma-Splitting
                if (parts.length === 2) {
                    const germanWord = parts[0].trim();
                    const frenchWord = parts[1].trim();
                    if (germanWord && frenchWord) {
                        try {
                            await _addWordApiCall(currentVociSetId, germanWord, frenchWord);
                            addedCount++;
                        } catch (error) {
                            console.error(`Fehler beim Hinzufügen (Zeile ${i + 1}): "${germanWord} - ${frenchWord}"`, error);
                            errorCount++;
                        }
                    } else { skippedCount++; console.warn(`Zeile ${i + 1} übersprungen (leeres Wort): "${line}"`); }
                } else { skippedCount++; console.warn(`Zeile ${i + 1} übersprungen (Format): "${line}"`); }
            } // end for loop

            let feedbackMsg = `CSV Import: ${addedCount} Wörter hinzugefügt.`;
            let feedbackClass = addedCount > 0 ? 'mt-2 text-success' : 'mt-2 text-info';
            if (errorCount > 0) { feedbackMsg += ` ${errorCount} Fehler.`; feedbackClass = 'mt-2 text-warning'; }
            if (skippedCount > 0) { feedbackMsg += ` ${skippedCount} Zeilen übersprungen.`; feedbackClass = 'mt-2 text-warning'; }
             if (headerSkipped && skippedCount === 0 && errorCount === 0) { // Nur Kopfzeile übersprungen
                 feedbackMsg += ` (Kopfzeile ignoriert).`;
             } else if (errorCount > 0 || skippedCount > 0) {
                 feedbackMsg += ` (Details in Konsole).`;
             }

            csvUploadFeedback.textContent = feedbackMsg;
            csvUploadFeedback.className = feedbackClass;

            if (addedCount > 0) { loadWordsForVociset(currentVociSetId); loadVociSets(); }

            uploadCsvButton.disabled = false; uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen';
            csvFileInput.value = '';
        }; // end reader.onload

        reader.onerror = () => {
            console.error("Fehler beim Lesen der Datei:", reader.error);
            csvUploadFeedback.textContent = 'Fehler beim Lesen der Datei.'; csvUploadFeedback.className = 'mt-2 text-danger';
            uploadCsvButton.disabled = false; uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen';
            csvFileInput.value = '';
        };
        reader.readAsText(file);
    } // end handleCsvUpload

    async function deleteWordFromVociset(vocabularySetId, wordId) {
        const url = `/vocabulary-sets/${vocabularySetId}/words/${wordId}/delete`;
        try {
            await fetchData(url, { method: 'DELETE' });
            alert('Wort gelöscht!');
            loadWordsForVociset(vocabularySetId);
            loadVociSets();
        } catch (error) { alert('Fehler beim Löschen: ' + error.message); }
    }

    async function loadKlassen() {
        const url = '/departments';
        try {
            const data = await fetchData(url);
            const departments = data.departments;
            klassenContainer.innerHTML = ''; // Clear
            if (departments?.length > 0) {
                departments.forEach(dept => {
                    const col = document.createElement('div'); col.classList.add('col'); col.dataset.departmentId = dept.id;
                    col.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div><h5 class="card-title">${dept.label}</h5><p class="card-text">${dept.studentsCount} Schüler</p></div>
                                <div class="d-flex flex-column align-items-end">
                                     <button class="btn btn-info btn-sm mb-1 view-class-button" data-department-id="${dept.id}"><i class="fas fa-eye"></i> Anzeigen</button>
                                     <button class="btn btn-danger btn-sm delete-button" data-department-id="${dept.id}"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>`;
                    klassenContainer.appendChild(col);
                });
            } else { klassenContainer.innerHTML = '<p>Keine Klassen gefunden.</p>'; }
        } catch (error) { klassenContainer.innerHTML = '<p class="text-danger">Fehler beim Laden der Klassen.</p>'; console.error('Fehler loadKlassen:', error); }
    }

    async function deleteKlasse(departmentId) {
        const url = `/departments/${departmentId}/delete`;
        try {
            await fetchData(url, { method: 'DELETE' });
            alert('Klasse gelöscht!');
            loadKlassen();
            hideClassDetailsSection();
        } catch (error) { alert('Fehler beim Löschen der Klasse: ' + error.message); }
    }

    async function loadVociSets() {
        const url = '/vocabulary-sets';
        try {
            const data = await fetchData(url);
            const vociSets = data.sets;
            vociSetsContainer.innerHTML = ''; // Clear
            if (vociSets?.length > 0) {
                vociSets.forEach(vSet => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        <span>${vSet.label} (Wörter: ${vSet.wordsCount}, Gelernt: ${vSet.learnedCount})</span>
                        <button class="btn btn-success btn-sm edit-vociset-button" data-vociset-id="${vSet.id}" data-vociset-label="${vSet.label}">Bearbeiten</button>`;
                    vociSetsContainer.appendChild(li);
                });
            } else { vociSetsContainer.innerHTML = '<p>Keine Voci Sets gefunden.</p>'; }
        } catch (error) { vociSetsContainer.innerHTML = '<p class="text-danger">Fehler beim Laden der Voci Sets.</p>'; console.error('Fehler loadVociSets:', error); }
    }

    async function loadClassDetails(departmentId) {
        currentDepartmentIdForClassDetails = departmentId;
        const url = `/departments/${departmentId}`;
        try {
            const deptData = await fetchData(url);
            classDetailsNameSpan.textContent = deptData.label;
            classStudentsListUl.innerHTML = ''; // Clear
            if (deptData.students?.length > 0) {
                deptData.students.forEach(student => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        <span>${student.username}</span>
                        <button class="btn btn-danger btn-sm delete-student-button" data-student-id="${student.id}" data-department-id="${deptData.id}"><i class="fas fa-trash"></i></button>`;
                    classStudentsListUl.appendChild(li);
                });
            } else { classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler in dieser Klasse</li>'; }
            hideVocisetDetailSection(); showClassDetailsSection();
        } catch (error) {
            classDetailsNameSpan.textContent = 'Fehler'; classStudentsListUl.innerHTML = '<li class="list-group-item disabled text-danger">Fehler beim Laden</li>';
            hideVocisetDetailSection(); showClassDetailsSection();
            alert('Fehler beim Laden der Klassendetails: ' + error.message);
        }
    }

    async function deleteStudent(departmentId, studentId) {
        const url = `/departments/${departmentId}/students/${studentId}/delete`;
        try {
            await fetchData(url, { method: 'DELETE' });
            alert('Schüler gelöscht!');
            loadClassDetails(departmentId); loadKlassen();
        } catch (error) { alert('Fehler beim Löschen des Schülers: ' + error.message); }
    }

    async function addStudentToClass(departmentId, studentUsername) {
        const url = `/departments/${departmentId}/students/create`;
        try {
            await fetchData(url, { method: 'POST', body: JSON.stringify({ username: studentUsername }) });
            alert('Schüler hinzugefügt!');
            addStudentModal.hide();
            loadClassDetails(departmentId); loadKlassen();
        } catch (error) { alert('Fehler beim Hinzufügen des Schülers: ' + error.message); }
    }

    // --- Initiales Laden der Daten ---
    loadKlassen();
    loadVociSets();
});