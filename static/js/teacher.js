document.addEventListener('DOMContentLoaded', function () {
    // Stellt sicher, dass das Skript erst ausgeführt wird, wenn das HTML-Dokument vollständig geladen ist.

    // --- HTML Elemente ---
    // Referenzen auf die benötigten HTML-Elemente holen.
    const logoutButton = document.getElementById('logoutButton'); // Button zum Ausloggen
    const klassenContainer = document.getElementById('klassen-container'); // Container für die Anzeige der Klassen
    const vociSetsContainer = document.getElementById('voci-sets-container'); // Container für die Anzeige der Vokabelsets
    const addKlasseButton = document.getElementById('addKlasseButton'); // Button zum Öffnen des Modals für neue Klassen
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton'); // Button zum Öffnen des Modals für neue Vokabelsets

    // --- Voci Set Details Elemente ---
    // Elemente für den Detailbereich eines Vokabelsets.
    const vocisetDetailSection = document.getElementById('vociset-detail-section'); // Der gesamte Detailbereich für ein Vokabelset
    const closeVocisetDetailSectionButton = document.getElementById('closeVocisetDetailSection'); // Button zum Schließen des Detailbereichs
    const vocisetDetailNameHeader = document.getElementById('vociset-detail-name-header'); // Überschrift, die den Namen des Sets anzeigt
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton'); // Button, der das Dropdown mit vorhandenen Wörtern öffnet
    const existingWordsDropdown = document.getElementById('existing-words-dropdown'); // Das Dropdown-Menü/Liste der vorhandenen Wörter
    const deutschesWortInput = document.getElementById('deutschesWort'); // Eingabefeld für das deutsche Wort
    const französischesWortInput = document.getElementById('französischesWort'); // Eingabefeld für das französische Wort
    const addWordButton = document.getElementById('addWordButton'); // Button zum Hinzufügen eines neuen Wortes zum Set
    const vocisetDetailNameButtonSpan = document.getElementById('vociset-detail-name-button'); // Span (oft in einem Button), der den Set-Namen anzeigt
    const vocisetAssignedClassesList = document.getElementById('vociset-assigned-classes-list'); // Liste der dem Set zugewiesenen Klassen
    const assignClassSelect = document.getElementById('assign-class-select'); // Dropdown zur Auswahl einer Klasse zur Zuweisung
    const assignClassButton = document.getElementById('assign-class-button'); // Button zum Zuweisen der ausgewählten Klasse
    const noAssignedClassesMessage = document.getElementById('no-assigned-classes-message'); // Meldung, falls keine Klassen zugewiesen sind
    const assignClassFeedback = document.getElementById('assign-class-feedback'); // Bereich für Feedback zur Klassenzuweisung
    const csvFileInput = document.getElementById('csvFileInput'); // Dateiauswahlfeld für CSV-Upload
    const uploadCsvButton = document.getElementById('uploadCsvButton'); // Button zum Starten des CSV-Uploads
    const csvUploadFeedback = document.getElementById('csvUploadFeedback'); // Bereich für Feedback zum CSV-Upload

    // --- Klassen Details Elemente ---
    // Elemente für den Detailbereich einer Klasse.
    const classDetailsSection = document.getElementById('class-details-section'); // Der gesamte Detailbereich für eine Klasse
    const classDetailsNameSpan = document.getElementById('class-details-name'); // Span zur Anzeige des Klassennamens
    const classStudentsListUl = document.getElementById('class-students-list'); // Ungeordnete Liste zur Anzeige der Schüler der Klasse
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection'); // Button zum Schließen des Klassendetailbereichs
    const addClassStudentButton = document.getElementById('addClassStudentButton'); // Button zum Öffnen des Modals zum Hinzufügen eines Schülers
    const generatePasswordsButton = document.getElementById('generatePasswordsButton'); // Button zum Generieren und Herunterladen von Passwörtern

    // --- Modals (Bootstrap Modale Fenster) ---
    // Referenzen und Initialisierung der Modalfenster.
    const addStudentModalElement = document.getElementById('addStudentModal'); // Das Modal-Element zum Hinzufügen eines Schülers
    const addStudentModal = new bootstrap.Modal(addStudentModalElement); // Das Bootstrap Modal-Objekt
    const studentUsernameInput = document.getElementById('studentUsername'); // Eingabefeld für den Schülernamen im Modal
    const saveNewStudentButton = document.getElementById('saveNewStudentButton'); // Button zum Speichern des neuen Schülers im Modal
    const createVocisetModalElement = document.getElementById('createVocisetModal'); // Das Modal-Element zum Erstellen eines Vokabelsets
    const createVocisetModal = new bootstrap.Modal(createVocisetModalElement); // Das Bootstrap Modal-Objekt
    const vocisetNameInput = document.getElementById('vocisetNameInput'); // Eingabefeld für den Vokabelset-Namen im Modal
    const saveNewVocisetButton = document.getElementById('saveNewVocisetButton'); // Button zum Speichern des neuen Vokabelsets im Modal
    const addClassModalElement = document.getElementById('addClassModal'); // Das Modal-Element zum Erstellen einer Klasse
    const addClassModal = new bootstrap.Modal(addClassModalElement); // Das Bootstrap Modal-Objekt
    const classNameInput = document.getElementById('classNameInput'); // Eingabefeld für den Klassennamen im Modal
    const saveNewClassButton = document.getElementById('saveNewClassButton'); // Button zum Speichern der neuen Klasse im Modal

    // --- Statistik Elemente ---
    // Elemente für den Statistikbereich eines Vokabelsets.
    const vocisetStatisticsSection = document.getElementById('vociset-statistics-section'); // Der gesamte Statistikbereich
    const statsSetNameSpan = document.getElementById('stats-set-name'); // Span zur Anzeige des Set-Namens im Statistikbereich
    const statsGlobalInfoDiv = document.getElementById('stats-global-info'); // Div für globale Informationen zum Set (z.B. Wortanzahl)
    const statsDepartmentsContainer = document.getElementById('stats-departments-container'); // Container für die Statistiken pro Klasse
    const closeStatisticsSectionButton = document.getElementById('closeStatisticsSection'); // Button zum Schließen des Statistikbereichs
    const statsLoadingIndicator = document.getElementById('stats-loading-indicator'); // Ladeanzeige für den Statistikbereich

    // --- Zustandsvariablen ---
    // Variablen zum Speichern des aktuellen Zustands der Anwendung.
    let currentVociSetId = null; // Speichert die ID des aktuell bearbeiteten oder angezeigten Vokabelsets
    let currentDepartmentIdForClassDetails = null; // Speichert die ID der aktuell angezeigten Klasse

    // --- Hilfsfunktion für Fetch ---
    // Standardisierte Funktion zum Senden von Anfragen an die API.
    async function fetchData(url, options = {}) {
        // Standard-Header setzen (JSON, AJAX-Kennung) und mit übergebenen Optionen zusammenführen.
        options.headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...options.headers };
        // Nimmt an, dass relative URLs korrekt sind.
        const fullUrl = url.startsWith('http') ? url : url;
        try {
            // Logging der Anfrage für Debugging-Zwecke.
            console.log(`Fetching: ${options.method || 'GET'} ${fullUrl}`);
            if(options.body) console.log(`Request Body: ${options.body}`); // Loggt den Request-Body, falls vorhanden.
            // Führt die Fetch-Anfrage aus.
            const response = await fetch(fullUrl, options);
            // Liest die Antwort als Text, um auch Fehler-Antworten verarbeiten zu können.
            const responseBody = await response.text();
            // Prüft, ob die Anfrage erfolgreich war (Status-Code 2xx).
            if (!response.ok) {
                // Erstellt eine detaillierte Fehlermeldung.
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${fullUrl}`;
                try {
                    // Versucht, die Fehlerantwort als JSON zu parsen.
                    errorMsg += ` - ${JSON.stringify(JSON.parse(responseBody))}`;
                } catch (e) {
                    // Falls kein JSON, den Anfang des Textes anhängen.
                    errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`;
                }
                console.error("Fetch Error Details:", errorMsg); // Loggt den detaillierten Fehler.
                throw new Error(errorMsg); // Wirft einen Fehler, der oben abgefangen wird.
            }
            // Gibt die geparste JSON-Antwort zurück, oder ein leeres Objekt bei leerer Antwort.
            return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            // Fängt Netzwerkfehler ab (z.B. Server nicht erreichbar).
            if (error instanceof TypeError && error.message.includes('fetch')) {
                const netErr = `Network Error: Failed to fetch ${fullUrl}. Server running?`;
                console.error(netErr);
                throw new Error(`Network Error: Cannot connect to API.`); // Benutzerfreundlicherer Netzwerkfehler.
            }
            // Fängt andere Fehler (z.B. oben geworfene HTTP-Fehler) ab.
            console.error(`Fetch Exception (${options.method || 'GET'} ${fullUrl}):`, error);
            throw error; // Wirft den Fehler weiter.
        }
    }

    // --- Event Listeners (Direkt) ---
    // Event-Handler direkt an spezifische Elemente binden.
    logoutButton.addEventListener('click', () => { window.location.pathname = window.location.pathname.split('/').slice(0, -1).join('/'); }); // Logout leitet zur Startseite um.
    addKlasseButton.addEventListener('click', () => { classNameInput.value = ''; addClassModal.show(); }); // Öffnet das Modal zum Hinzufügen einer Klasse.
    addVociSetButtonMainPage.addEventListener('click', () => { vocisetNameInput.value = ''; createVocisetModal.show(); }); // Öffnet das Modal zum Erstellen eines Vokabelsets.
    saveNewClassButton.addEventListener('click', () => { // Speichert die neue Klasse.
        const name = classNameInput.value.trim();
        if (name) createNewKlasse(name);
        else alert('Bitte geben Sie einen Klassennamen ein.');
    });
    saveNewVocisetButton.addEventListener('click', () => { // Speichert das neue Vokabelset.
        const name = vocisetNameInput.value.trim();
        if (name) createNewVociset(name);
        else alert('Bitte geben Sie einen Namen für das Voci Set ein.');
    });
    closeVocisetDetailSectionButton.addEventListener('click', hideVocisetDetailSection); // Schließt den Vokabelset-Detailbereich.
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection); // Schließt den Klassen-Detailbereich.
    closeStatisticsSectionButton.addEventListener('click', hideStatisticsSection); // Schließt den Statistikbereich.
    addWordButton.addEventListener('click', addWordToVociset); // Fügt ein neues Wort zum aktuellen Vokabelset hinzu.
    uploadCsvButton.addEventListener('click', handleCsvUpload); // Startet den CSV-Upload-Prozess.
    addClassStudentButton.addEventListener('click', () => { // Öffnet das Modal zum Hinzufügen eines Schülers zur aktuellen Klasse.
        if (currentDepartmentIdForClassDetails) showAddStudentModalForClass(currentDepartmentIdForClassDetails);
        else alert("Bitte wählen Sie zuerst eine Klasse aus.");
    });
    saveNewStudentButton.addEventListener('click', () => { // Speichert den neuen Schüler in der aktuellen Klasse.
        const username = studentUsernameInput.value.trim();
        if (!username) alert('Bitte geben Sie einen Benutzernamen ein.');
        else if (currentDepartmentIdForClassDetails) addStudentToClass(currentDepartmentIdForClassDetails, username);
        else alert('Fehler: Keine Klasse ausgewählt.');
    });
    generatePasswordsButton.addEventListener('click', generateAndDownloadPasswords); // Generiert Passwörter für die aktuelle Klasse.

    // --- Event Delegation Listeners ---
    // Event Listener an übergeordnete Container binden, um Events von dynamisch hinzugefügten Elementen zu behandeln.

    // Klick-Events im Klassen-Container (Löschen, Anzeigen).
    klassenContainer.addEventListener('click', (e) => {
        const delButton = e.target.closest('.delete-button'); // Sucht den nächsten '.delete-button' Vorfahren.
        const viewButton = e.target.closest('.view-class-button'); // Sucht den nächsten '.view-class-button' Vorfahren.
        if (delButton) { // Wenn der Löschen-Button geklickt wurde.
            const id = delButton.dataset.departmentId;
            if (id && confirm('Sind Sie sicher, dass Sie diese Klasse löschen möchten?')) deleteKlasse(id);
        } else if (viewButton) { // Wenn der Anzeigen-Button geklickt wurde.
            const id = viewButton.dataset.departmentId;
            if (id) loadClassDetails(id);
        }
    });

    // Klick-Events im Dropdown der vorhandenen Wörter (Wort löschen).
    existingWordsDropdown.addEventListener('click', (e) => {
        const delWordButton = e.target.closest('.delete-word-button');
        if (delWordButton) {
            const wordId = delWordButton.dataset.wordId;
            const setId = delWordButton.dataset.vocabularySetId;
            if (wordId && setId && confirm('Sind Sie sicher, dass Sie dieses Wort löschen möchten?')) deleteWordFromVociset(setId, wordId);
        }
    });

    // Klick-Events in der Schülerliste (Schüler löschen).
    classStudentsListUl.addEventListener('click', (e) => {
        const delStudentButton = e.target.closest('.delete-student-button');
        if (delStudentButton) {
            const studentId = delStudentButton.dataset.studentId;
            const departmentId = delStudentButton.dataset.departmentId;
            if (studentId && departmentId && confirm('Sind Sie sicher, dass Sie diesen Schüler löschen möchten?')) deleteStudent(departmentId, studentId);
        }
    });

    // Klick-Events im Vokabelset-Container (Bearbeiten, Statistik anzeigen).
    vociSetsContainer.addEventListener('click', (e) => {
         const editButton = e.target.closest('.edit-vociset-button');
         const statsButton = e.target.closest('.view-stats-button'); // Button für Statistikansicht
         if (editButton) { // Wenn der Bearbeiten-Button geklickt wurde.
             const id = editButton.dataset.vocisetId;
             const label = editButton.dataset.vocisetLabel;
             if (id && label) showVocisetDetailSection(id, label); // Detailansicht zeigen
         }
         else if (statsButton) { // Wenn der Statistik-Button geklickt wurde.
             const id = statsButton.dataset.vocisetId;
             const label = statsButton.dataset.vocisetLabel;
             if (id && label) showStatisticsSection(id, label); // Statistikansicht zeigen
         }
     });

    // Klick-Event für den Button "Klasse zuweisen".
    assignClassButton.addEventListener('click', () => {
        const departmentId = assignClassSelect.value; // ID der ausgewählten Klasse.
        if (currentVociSetId && departmentId) {
            assignClassToVociset(currentVociSetId, departmentId);
        } else if (!departmentId) {
            alert("Bitte wählen Sie eine Klasse aus der Liste aus.");
        } else {
            alert("Fehler: Kein aktives Voci Set ausgewählt.");
        }
    });

    // Klick-Events in der Liste der zugewiesenen Klassen (Zuweisung entfernen).
    vocisetAssignedClassesList.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-class-assignment-button');
        if (removeButton && currentVociSetId) {
            const departmentId = removeButton.dataset.departmentId;
            if (departmentId) removeClassAssignment(currentVociSetId, departmentId);
        }
    });

    // --- UI Funktionen ---
    // Funktionen zur Steuerung der Sichtbarkeit und des Inhalts von UI-Bereichen.

    // Zeigt den Detailbereich für ein Vokabelset an und lädt die benötigten Daten.
    async function showVocisetDetailSection(vocabularySetId, vocabularySetName) {
        // Andere Detailbereiche ausblenden.
        hideClassDetailsSection();
        hideStatisticsSection();
        // Detailbereich sichtbar machen.
        vocisetDetailSection.style.display = 'block';
        // UI-Elemente zurücksetzen und Ladezustände anzeigen.
        assignClassSelect.innerHTML = '<option selected disabled value="">Lade Klassen...</option>';
        assignClassSelect.disabled = true;
        assignClassButton.disabled = true;
        assignClassFeedback.textContent = '';
        csvFileInput.value = ''; // CSV-Input leeren
        csvUploadFeedback.textContent = ''; // CSV-Feedback leeren
        csvUploadFeedback.className = 'mt-2';
        existingWordsDropdown.innerHTML = ''; // Wortliste leeren
        // Aktuelle Set-ID und Namen speichern und anzeigen.
        currentVociSetId = vocabularySetId;
        vocisetDetailNameHeader.textContent = `Voci Set: ${vocabularySetName}`;
        vocisetDetailNameButtonSpan.textContent = vocabularySetName;
        // Wörter und zugewiesene Klassen für das Set laden.
        loadWordsForVociset(vocabularySetId);
        try {
            const assignedIds = await loadAssignedClassesForVociset(vocabularySetId);
            populateClassAssignmentDropdown(assignedIds); // Dropdown mit nicht zugewiesenen Klassen füllen.
        } catch (error) {
            console.error("Fehler beim Initialisieren der Klassenzuweisung:", error);
            assignClassSelect.innerHTML = '<option selected disabled value="">Fehler beim Laden</option>';
            assignClassSelect.disabled = true;
            assignClassButton.disabled = true;
            if (assignClassFeedback) {
                assignClassFeedback.textContent = 'Fehler beim Laden der Klasseninformationen.';
                assignClassFeedback.className = 'form-text text-danger mt-1';
            }
        }
    }

    // Versteckt den Detailbereich für Vokabelsets und setzt zugehörige Felder zurück.
    function hideVocisetDetailSection() {
        vocisetDetailSection.style.display = 'none';
        deutschesWortInput.value = ''; // Eingabefelder leeren
        französischesWortInput.value = '';
        // currentVociSetId wird hier bewusst NICHT zurückgesetzt, könnte noch benötigt werden.
        existingWordsDropdown.innerHTML = ''; // Wortliste leeren
        vocisetDetailNameHeader.textContent = ''; // Header leeren
        vocisetDetailNameButtonSpan.textContent = '';
        vocisetAssignedClassesList.innerHTML = ''; // Liste zugewiesener Klassen leeren
        assignClassSelect.innerHTML = '<option selected disabled value="">--</option>'; // Dropdown zurücksetzen
        noAssignedClassesMessage.style.display = 'none'; // Meldung ausblenden
        if (assignClassFeedback) assignClassFeedback.textContent = ''; // Feedback leeren
        csvFileInput.value = ''; // CSV-Input leeren
        csvUploadFeedback.textContent = ''; // CSV-Feedback leeren
        csvUploadFeedback.className = 'mt-2';
    }

    // Zeigt den Detailbereich für Klassen an.
    function showClassDetailsSection() {
        hideVocisetDetailSection(); // Andere Detailbereiche ausblenden.
        hideStatisticsSection();
        classDetailsSection.style.display = 'block'; // Bereich sichtbar machen.
    }

    // Versteckt den Detailbereich für Klassen und setzt zugehörige Zustände/Felder zurück.
    function hideClassDetailsSection() {
        classDetailsSection.style.display = 'none';
        currentDepartmentIdForClassDetails = null; // Aktuelle Klassen-ID zurücksetzen.
        classDetailsNameSpan.textContent = ''; // Klassennamen leeren.
        classStudentsListUl.innerHTML = ''; // Schülerliste leeren.
    }

    // Zeigt das Modal zum Hinzufügen eines Schülers für eine bestimmte Klasse an.
    function showAddStudentModalForClass(departmentId) {
        currentDepartmentIdForClassDetails = departmentId; // Klassen-ID speichern, für die der Schüler hinzugefügt wird.
        studentUsernameInput.value = ''; // Eingabefeld leeren.
        addStudentModal.show(); // Modal anzeigen.
    }

    // Zeigt den Statistikbereich für ein Vokabelset an.
    function showStatisticsSection(vocisetId, vocisetName) {
        // Andere Detailbereiche ausblenden.
        hideClassDetailsSection();
        hideVocisetDetailSection();
        // Statistikbereich sichtbar machen.
        vocisetStatisticsSection.style.display = 'block';
        // Set-Namen anzeigen und Container leeren/Ladeanzeige zeigen.
        statsSetNameSpan.textContent = vocisetName;
        statsDepartmentsContainer.innerHTML = '';
        statsGlobalInfoDiv.innerHTML = '';
        statsLoadingIndicator.style.display = 'block';
        // Aktuelle Set-ID speichern (könnte für zukünftige Aktionen in dieser Ansicht nützlich sein).
        currentVociSetId = vocisetId;
        // Statistikdaten laden.
        loadVocisetStatistics(vocisetId);
    }

    // Versteckt den Statistikbereich.
    function hideStatisticsSection() {
        vocisetStatisticsSection.style.display = 'none';
        statsSetNameSpan.textContent = ''; // Elemente leeren.
        statsDepartmentsContainer.innerHTML = '';
        statsGlobalInfoDiv.innerHTML = '';
        statsLoadingIndicator.style.display = 'none'; // Ladeanzeige ausblenden.
        // currentVociSetId wird hier nicht zurückgesetzt.
    }


    // --- API & Logik ---
    // Funktionen, die mit der API interagieren und die Anwendungslogik implementieren.

    // Erstellt eine neue Klasse über die API.
    async function createNewKlasse(className) {
        const url = 'api/departments/create';
        try {
            await fetchData(url, { method: 'POST', body: JSON.stringify({ label: className }) });
            alert(`Klasse "${className}" erfolgreich erstellt!`);
            addClassModal.hide(); // Modal schließen.
            loadKlassen(); // Klassenliste neu laden, um die neue Klasse anzuzeigen.
        } catch (e) {
            alert('Fehler beim Erstellen der Klasse: ' + e.message);
        }
    }

    // Erstellt ein neues Vokabelset über die API.
    async function createNewVociset(name) {
        const url = 'api/vocabulary-sets/create';
        try {
            const data = await fetchData(url, { method: 'POST', body: JSON.stringify({ label: name }) });
            alert(`Vokabelset "${data.label}" erfolgreich erstellt!`);
            createVocisetModal.hide(); // Modal schließen.
            loadVociSets(); // Vokabelset-Liste neu laden.
            // Optional: Direkt zur Detailansicht des neuen Sets wechseln (mit kleiner Verzögerung).
            if (data?.id) setTimeout(() => showVocisetDetailSection(data.id, data.label), 100);
        } catch (e) {
            alert('Fehler beim Erstellen des Vokabelsets: ' + e.message);
        }
    }

    // Lädt die Wörter für ein bestimmtes Vokabelset und zeigt sie im Dropdown an.
    async function loadWordsForVociset(setId) {
        const url = `api/vocabulary-sets/${setId}`;
        try {
            const data = await fetchData(url);
            const words = data.words;
            existingWordsDropdown.innerHTML = ''; // Dropdown leeren.
            if (words?.length > 0) { // Wenn Wörter vorhanden sind.
                words.forEach(w => {
                    const li = document.createElement('li');
                    li.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    // Zeigt Wort, Übersetzung und einen Löschbutton an. Speichert IDs in data-Attributen.
                    li.innerHTML = `<span title="ID: ${w.id}">${w.word} - ${w.translation}</span> <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${w.id}" data-vocabulary-set-id="${setId}" title="Wort löschen"><i class="fas fa-trash"></i></button>`;
                    existingWordsDropdown.appendChild(li);
                });
            } else { // Wenn keine Wörter vorhanden sind.
                existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter in diesem Set vorhanden.</li>';
            }
        } catch (e) { // Bei Fehler.
            existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled text-danger">Fehler beim Laden der Wörter.</li>';
            console.error('Fehler beim Laden der Wörter:', e);
        }
    }

    // Lädt die Klassen, die einem Vokabelset zugewiesen sind, und zeigt sie an.
    async function loadAssignedClassesForVociset(vocabularySetId) {
        const url = `api/vocabulary-sets/${vocabularySetId}/departments`;
        vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Lade zugewiesene Klassen...</li>'; // Ladezustand anzeigen.
        noAssignedClassesMessage.style.display = 'none'; // Meldung "keine zugewiesen" ausblenden.
        let assignedIds = []; // Array zum Sammeln der IDs der zugewiesenen Klassen.
        try {
            const data = await fetchData(url);
            const depts = data.departments;
            vocisetAssignedClassesList.innerHTML = ''; // Liste leeren.
            if (depts?.length > 0) { // Wenn Klassen zugewiesen sind.
                depts.forEach(d => {
                    assignedIds.push(d.id); // ID speichern.
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    // Zeigt Klassennamen und Button zum Entfernen der Zuweisung an.
                    li.innerHTML = `<span>${d.label}</span> <button class="btn btn-warning btn-sm remove-class-assignment-button" data-department-id="${d.id}" title="Zuweisung entfernen"><i class="fas fa-unlink"></i> Entfernen</button>`;
                    vocisetAssignedClassesList.appendChild(li);
                });
                noAssignedClassesMessage.style.display = 'none'; // Sicherstellen, dass die Meldung ausgeblendet ist.
            } else { // Wenn keine Klassen zugewiesen sind.
                // Prüfen, ob das 'departments'-Array überhaupt in der Antwort existierte.
                if(depts === undefined){
                    console.warn(`GET ${url} hat kein 'departments'-Array zurückgegeben.`);
                    vocisetAssignedClassesList.innerHTML=`<li class="list-group-item list-group-item-warning">Information fehlt in der Serverantwort.</li>`;
                } else {
                    // Das Array war vorhanden, aber leer.
                    noAssignedClassesMessage.style.display = 'block'; // Meldung "keine zugewiesen" anzeigen.
                }
            }
        } catch (e) { // Bei Fehler.
            vocisetAssignedClassesList.innerHTML = `<li class="list-group-item list-group-item-danger">Fehler beim Laden der zugewiesenen Klassen.</li>`;
            noAssignedClassesMessage.style.display = 'none';
            console.error('Fehler beim Laden der zugewiesenen Klassen:', e);
            throw e; // Fehler weiterwerfen, damit er in showVocisetDetailSection behandelt werden kann.
        }
        return assignedIds; // Gibt die IDs der zugewiesenen Klassen zurück.
    }

    // Füllt das Dropdown-Menü zur Klassenzuweisung mit Klassen, die noch nicht zugewiesen sind.
    async function populateClassAssignmentDropdown(assignedIds = []) {
        const url = 'api/departments'; // Endpunkt zum Abrufen aller Klassen.
        assignClassSelect.innerHTML = '<option selected disabled value="">Lade Klassen...</option>'; // Ladezustand anzeigen.
        assignClassSelect.disabled = true;
        assignClassButton.disabled = true;
        if(assignClassFeedback) assignClassFeedback.textContent = ''; // Feedback zurücksetzen.
        try {
            const data = await fetchData(url);
            const allDepts = data.departments; // Alle verfügbaren Klassen.
            assignClassSelect.innerHTML = ''; // Dropdown leeren.
            // Standard-Option hinzufügen.
            const defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.textContent = "-- Klasse zum Zuweisen auswählen --";
            defaultOpt.selected = true;
            defaultOpt.disabled = true;
            assignClassSelect.appendChild(defaultOpt);

            let optionsAdded = 0; // Zähler für hinzugefügte Optionen.
            if (allDepts?.length > 0) { // Wenn Klassen vorhanden sind.
                allDepts.forEach(d => {
                    // Nur Klassen hinzufügen, die nicht bereits zugewiesen sind.
                    if (!assignedIds.includes(d.id)) {
                        const opt = document.createElement('option');
                        opt.value = d.id;
                        opt.textContent = d.label;
                        assignClassSelect.appendChild(opt);
                        optionsAdded++;
                    }
                });
            }

            // Zustand des Dropdowns und Buttons basierend auf den Ergebnissen setzen.
            if (optionsAdded > 0) { // Wenn zuweisbare Klassen gefunden wurden.
                assignClassSelect.disabled = false;
                assignClassButton.disabled = false;
                if(assignClassFeedback) assignClassFeedback.textContent = ''; // Feedback ggf. löschen
            } else if (allDepts?.length > 0) { // Wenn Klassen existieren, aber alle schon zugewiesen sind.
                assignClassSelect.innerHTML = '<option selected disabled value="">Alle verfügbaren Klassen sind bereits zugewiesen</option>';
                assignClassSelect.disabled = true;
                assignClassButton.disabled = true;
                if(assignClassFeedback) assignClassFeedback.textContent = 'Alle Klassen sind diesem Set bereits zugewiesen.';
            } else { // Wenn überhaupt keine Klassen vorhanden sind.
                assignClassSelect.innerHTML = '<option selected disabled value="">Keine Klassen vorhanden</option>';
                assignClassSelect.disabled = true;
                assignClassButton.disabled = true;
                if(assignClassFeedback) assignClassFeedback.textContent = 'Es wurden noch keine Klassen erstellt.';
            }
        } catch (e) { // Bei Fehler beim Laden der Klassen.
            assignClassSelect.innerHTML = '<option selected disabled value="">Fehler beim Laden</option>';
            assignClassSelect.disabled = true;
            assignClassButton.disabled = true;
            if (assignClassFeedback) {
                assignClassFeedback.textContent = 'Fehler beim Laden der Klassenliste.';
                assignClassFeedback.className = 'form-text text-danger mt-1';
            }
            console.error('Fehler beim Füllen des Zuweisungs-Dropdowns:', e);
            throw e; // Fehler weiterwerfen.
        }
    }

    // Weist eine Klasse einem Vokabelset über die API zu.
    async function assignClassToVociset(setId, depId) {
        const url = `api/vocabulary-sets/${setId}/departments/add`;
        const idInt = parseInt(depId); // Sicherstellen, dass die ID eine Zahl ist.
        // Button deaktivieren und Ladeanzeige zeigen.
        assignClassButton.disabled = true;
        assignClassButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Zuweisen...';
        try {
            await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: idInt }) });
            alert('Klasse erfolgreich zugewiesen!');
            // Nach erfolgreicher Zuweisung die Listen neu laden.
            const assigned = await loadAssignedClassesForVociset(setId);
            populateClassAssignmentDropdown(assigned); // Dropdown aktualisieren (Klasse sollte verschwinden).
        } catch (e) {
            alert('Fehler bei der Zuweisung: ' + e.message);
        } finally {
            // Button wieder aktivieren und Text zurücksetzen.
            assignClassButton.disabled = false;
            assignClassButton.innerHTML = 'Zuweisen';
        }
    }

    // Entfernt die Zuweisung einer Klasse von einem Vokabelset über die API.
    async function removeClassAssignment(setId, depId) {
        if (!confirm(`Sind Sie sicher, dass Sie die Zuweisung dieser Klasse entfernen möchten?`)) return; // Bestätigungsdialog.
        const url = `api/vocabulary-sets/${setId}/departments/remove`;
        const idInt = parseInt(depId); // Sicherstellen, dass die ID eine Zahl ist.
        try {
            await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: idInt }) });
            alert('Zuweisung erfolgreich entfernt!');
            // Nach erfolgreicher Entfernung die Listen neu laden.
            const assigned = await loadAssignedClassesForVociset(setId);
            populateClassAssignmentDropdown(assigned); // Dropdown aktualisieren (Klasse sollte wieder erscheinen).
        } catch (e) {
            alert('Fehler beim Entfernen der Zuweisung: ' + e.message);
        }
    }

    // Interne Hilfsfunktion für den API-Aufruf zum Hinzufügen eines Wortes.
    async function _addWordApiCall(setId, ger, fr) {
        const url = `api/vocabulary-sets/${setId}/words/create`;
        return fetchData(url, { method: 'POST', body: JSON.stringify({ word: ger, translation: fr }) });
    }

    // Fügt ein Wort (Deutsch/Französisch) zum aktuell ausgewählten Vokabelset hinzu.
    async function addWordToVociset() {
        const ger = deutschesWortInput.value.trim();
        const fr = französischesWortInput.value.trim();
        // Validierung der Eingaben.
        if (!ger || !fr) {
            alert('Bitte füllen Sie beide Felder (Deutsch und Französisch) aus.');
            return;
        }
        if (!currentVociSetId) {
            alert('Fehler: Kein Vokabelset ausgewählt.');
            return;
        }
        try {
            await _addWordApiCall(currentVociSetId, ger, fr); // API-Aufruf über Hilfsfunktion.
            alert('Wort erfolgreich hinzugefügt!');
            deutschesWortInput.value = ''; // Felder leeren.
            französischesWortInput.value = '';
            loadWordsForVociset(currentVociSetId); // Wortliste im Detailbereich aktualisieren.
            loadVociSets(); // Hauptliste der Vokabelsets aktualisieren (Wortanzahl).
        } catch (e) {
            alert('Fehler beim Hinzufügen des Wortes: ' + e.message);
        }
    }

    // Verarbeitet den Upload einer CSV-Datei mit Vokabeln.
    async function handleCsvUpload() {
        if (!currentVociSetId) { // Prüfen, ob ein Set ausgewählt ist.
            csvUploadFeedback.textContent = 'Fehler: Kein Vokabelset ausgewählt, zu dem hinzugefügt werden soll.';
            csvUploadFeedback.className = 'mt-2 text-danger';
            return;
        }
        const file = csvFileInput.files[0]; // Die ausgewählte Datei holen.
        if (!file) { // Prüfen, ob eine Datei ausgewählt wurde.
            csvUploadFeedback.textContent = 'Bitte wählen Sie zuerst eine CSV-Datei aus.';
            csvUploadFeedback.className = 'mt-2 text-warning';
            return;
        }
        // Button deaktivieren und Ladezustand anzeigen.
        uploadCsvButton.disabled = true;
        uploadCsvButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verarbeite...';
        csvUploadFeedback.textContent = 'Lese CSV-Datei...';
        csvUploadFeedback.className = 'mt-2 text-info';

        const reader = new FileReader(); // FileReader zum Lesen der Datei.
        reader.onload = async (e) => { // Wird ausgeführt, wenn die Datei gelesen wurde.
            const lines = e.target.result.split(/\r?\n/); // Dateiinhalt in Zeilen aufteilen.
            let added = 0, errors = 0, skipped = 0, header = false;
            // Gesamtzahl der Zeilen für die Fortschrittsanzeige (ignoriert leere letzte Zeile).
            const total = lines.length > 0 && lines[lines.length-1] === '' ? lines.length - 1 : lines.length;
            csvUploadFeedback.textContent = `Verarbeite ${total} Zeilen...`;

            // Jede Zeile durchgehen.
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue; // Leere Zeilen überspringen.

                // Versuch, eine Kopfzeile zu erkennen und zu überspringen.
                // Prüft die erste Zeile (oder die zweite, falls die erste leer war).
                if (!header && (i === 0 || (i === 1 && !lines[0].trim()))) {
                    const lower = line.toLowerCase();
                    if (lower.includes('deutsch') || lower.includes('französisch') || lower.includes('german') || lower.includes('french') || lower.includes('wort') || lower.includes('translation')) {
                        console.log("CSV Kopfzeile erkannt und ignoriert:", line);
                        header = true; // Markieren, dass eine Kopfzeile gefunden wurde.
                        continue; // Kopfzeile überspringen.
                    }
                }

                // Zeile am Semikolon aufteilen.
                const parts = line.split(';');
                if (parts.length === 2) { // Wenn genau zwei Teile vorhanden sind.
                    const ger = parts[0].trim();
                    const fr = parts[1].trim();
                    if (ger && fr) { // Wenn beide Teile nicht leer sind.
                        try {
                            await _addWordApiCall(currentVociSetId, ger, fr); // Wort über API hinzufügen.
                            added++;
                        } catch (err) { // Fehler beim Hinzufügen.
                            console.error(`Fehler in CSV-Zeile ${i + 1}: "${ger} - ${fr}"`, err);
                            errors++;
                        }
                    } else { // Wenn ein Teil leer ist.
                        skipped++;
                        console.warn(`Leere Spalte in CSV-Zeile ${i + 1}: "${line}"`);
                    }
                } else { // Wenn nicht genau zwei Teile vorhanden sind (Formatfehler).
                    skipped++;
                    console.warn(`Formatfehler (erwartet: 'Deutsch;Französisch') in CSV-Zeile ${i + 1}: "${line}"`);
                }
            } // Ende der Schleife über Zeilen.

            // Feedback-Nachricht zusammenstellen.
            let msg = `CSV-Import abgeschlossen: ${added} Wörter hinzugefügt.`;
            let cls = added > 0 ? 'mt-2 text-success' : 'mt-2 text-info'; // Standard-CSS-Klasse.
            if (errors > 0) { // Fehler hinzufügen.
                msg += ` ${errors} Fehler aufgetreten.`;
                cls = 'mt-2 text-warning';
            }
            if (skipped > 0) { // Übersprungene Zeilen hinzufügen.
                msg += ` ${skipped} Zeilen übersprungen (Formatfehler oder leer).`;
                cls = 'mt-2 text-warning';
            }
            if (header && skipped === 0 && errors === 0) { // Hinweis auf ignorierte Kopfzeile.
                msg += ` (Kopfzeile wurde ignoriert).`;
            } else if (errors > 0 || skipped > 0) { // Hinweis auf Konsolendetails.
                msg += ` (Details siehe Browser-Konsole).`;
            }

            // Feedback anzeigen.
            csvUploadFeedback.textContent = msg;
            csvUploadFeedback.className = cls;

            // Wenn Wörter hinzugefügt wurden, die Listen aktualisieren.
            if (added > 0) {
                loadWordsForVociset(currentVociSetId);
                loadVociSets();
            }
            // Button wieder aktivieren und Dateiauswahl zurücksetzen.
            uploadCsvButton.disabled = false;
            uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen';
            csvFileInput.value = '';
        };
        reader.onerror = () => { // Fehler beim Lesen der Datei.
            console.error("Fehler beim Lesen der CSV-Datei:", reader.error);
            csvUploadFeedback.textContent = 'Fehler beim Lesen der Datei.';
            csvUploadFeedback.className = 'mt-2 text-danger';
            uploadCsvButton.disabled = false; // Button wieder aktivieren.
            uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen';
            csvFileInput.value = '';
        };
        reader.readAsText(file); // Datei als Text lesen.
    }

    // Löscht ein Wort aus einem Vokabelset über die API.
    async function deleteWordFromVociset(setId, wordId) {
        const url = `api/vocabulary-sets/${setId}/words/${wordId}/delete`;
        try {
            await fetchData(url, { method: 'DELETE' });
            alert('Wort erfolgreich gelöscht!');
            loadWordsForVociset(setId); // Wortliste im Detailbereich aktualisieren.
            loadVociSets(); // Hauptliste der Vokabelsets aktualisieren (Wortanzahl).
        } catch (e) {
            alert('Fehler beim Löschen des Wortes: ' + e.message);
        }
    }

    // Lädt die Liste aller Klassen und zeigt sie an.
    async function loadKlassen() {
        const url = 'api/departments';
        try {
            const data = await fetchData(url);
            const depts = data.departments;
            klassenContainer.innerHTML = ''; // Container leeren.
            if (depts?.length > 0) { // Wenn Klassen vorhanden sind.
                depts.forEach(d => {
                    const col = document.createElement('div');
                    col.classList.add('col'); // Bootstrap Grid-Spalte.
                    col.dataset.departmentId = d.id; // Klassen-ID speichern.
                    // HTML für die Klassenkarte erstellen (Name, Schülerzahl, Buttons).
                    col.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="card-title">${d.label}</h5>
                                    <p class="card-text">${d.studentsCount} Schüler</p>
                                </div>
                                <div class="d-flex flex-column align-items-end">
                                    <button class="btn btn-info btn-sm mb-1 view-class-button" data-department-id="${d.id}" title="Klassendetails anzeigen"><i class="fas fa-eye"></i> Anzeigen</button>
                                    <button class="btn btn-danger btn-sm delete-button" data-department-id="${d.id}" title="Klasse löschen"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>`;
                    klassenContainer.appendChild(col);
                });
            } else { // Wenn keine Klassen vorhanden sind.
                klassenContainer.innerHTML = '<p>Es wurden noch keine Klassen erstellt.</p>';
            }
        } catch (e) { // Bei Fehler.
            klassenContainer.innerHTML = '<p class="text-danger">Fehler beim Laden der Klassen.</p>';
            console.error('Fehler beim Laden der Klassen:', e);
        }
    }

    // Löscht eine Klasse über die API.
    async function deleteKlasse(id) {
        const url = `api/departments/${id}/delete`;
        try {
            await fetchData(url, { method: 'DELETE' });
            alert('Klasse erfolgreich gelöscht!');
            loadKlassen(); // Klassenliste neu laden.
            hideClassDetailsSection(); // Eventuell offenen Detailbereich dieser Klasse schließen.
        } catch (e) {
            alert('Fehler beim Löschen der Klasse: ' + e.message);
        }
    }

    // Lädt die Liste aller Vokabelsets und zeigt sie an.
    async function loadVociSets() {
        const url = 'api/vocabulary-sets';
        try {
            const data = await fetchData(url);
            const sets = data.sets;
            vociSetsContainer.innerHTML = ''; // Container leeren.
            if (sets?.length > 0) { // Wenn Sets vorhanden sind.
                sets.forEach(s => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    // Zeigt Set-Namen, Wort-/Gelernt-Anzahl und Buttons an.
                    li.innerHTML = `
                        <span>${s.label} (Wörter: ${s.wordsCount}, Gelernt: ${s.learnedCount})</span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-info view-stats-button" data-vociset-id="${s.id}" data-vociset-label="${s.label}" title="Statistik anzeigen"><i class="fas fa-chart-line"></i> Statistik</button>
                            <button class="btn btn-success edit-vociset-button" data-vociset-id="${s.id}" data-vociset-label="${s.label}" title="Set bearbeiten"><i class="fas fa-edit"></i> Bearbeiten</button>
                        </div>`;
                    vociSetsContainer.appendChild(li);
                });
            } else { // Wenn keine Sets vorhanden sind.
                vociSetsContainer.innerHTML = '<p>Es wurden noch keine Vokabelsets erstellt.</p>';
            }
        } catch (e) { // Bei Fehler.
            vociSetsContainer.innerHTML = '<p class="text-danger">Fehler beim Laden der Vokabelsets.</p>';
            console.error('Fehler beim Laden der Vokabelsets:', e);
        }
    }

    // Lädt die Details einer Klasse (inkl. Schülerliste) und zeigt sie an.
    async function loadClassDetails(id) {
        currentDepartmentIdForClassDetails = id; // Aktuelle Klassen-ID speichern.
        const url = `api/departments/${id}`;
        try {
            const data = await fetchData(url);
            classDetailsNameSpan.textContent = data.label; // Klassennamen anzeigen.
            classStudentsListUl.innerHTML = ''; // Schülerliste leeren.
            if (data.students?.length > 0) { // Wenn Schüler vorhanden sind.
                data.students.forEach(s => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    // Zeigt Schülernamen und Löschbutton an.
                    li.innerHTML = `<span>${s.username}</span><button class="btn btn-danger btn-sm delete-student-button" data-student-id="${s.id}" data-department-id="${data.id}" title="Schüler entfernen"><i class="fas fa-trash"></i></button>`;
                    classStudentsListUl.appendChild(li);
                });
            } else { // Wenn keine Schüler vorhanden sind.
                classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler in dieser Klasse vorhanden.</li>';
            }
            // Andere Detailbereiche ausblenden und diesen anzeigen.
            hideVocisetDetailSection();
            hideStatisticsSection();
            showClassDetailsSection();
        } catch (e) { // Bei Fehler.
            classDetailsNameSpan.textContent = 'Fehler';
            classStudentsListUl.innerHTML = '<li class="list-group-item disabled text-danger">Fehler beim Laden der Klassendetails.</li>';
            hideVocisetDetailSection();
            hideStatisticsSection();
            showClassDetailsSection(); // Trotzdem anzeigen, um den Fehler anzuzeigen.
            alert('Fehler beim Laden der Klassendetails: ' + e.message);
        }
    }

    // Löscht einen Schüler aus einer Klasse über die API.
    async function deleteStudent(depId, studId) {
        const url = `api/departments/${depId}/students/${studId}/delete`;
        try {
            await fetchData(url, { method: 'DELETE' });
            alert('Schüler erfolgreich gelöscht!');
            loadClassDetails(depId); // Klassendetails neu laden, um die Liste zu aktualisieren.
            loadKlassen(); // Haupt-Klassenliste neu laden (Schülerzahl).
        } catch (e) {
            alert('Fehler beim Löschen des Schülers: ' + e.message);
        }
    }

    // Fügt einen Schüler zu einer Klasse über die API hinzu.
    async function addStudentToClass(depId, username) {
        const url = `api/departments/${depId}/students/create`;
        try {
            await fetchData(url, { method: 'POST', body: JSON.stringify({ username: username }) });
            alert('Schüler erfolgreich hinzugefügt!');
            addStudentModal.hide(); // Modal schließen.
            loadClassDetails(depId); // Klassendetails neu laden.
            loadKlassen(); // Haupt-Klassenliste neu laden.
        } catch (e) {
            alert('Fehler beim Hinzufügen des Schülers: ' + e.message);
        }
    }

    // Generiert neue Passwörter für alle Schüler der aktuell ausgewählten Klasse und löst den Download einer CSV-Datei aus.
    async function generateAndDownloadPasswords() {
        if (!currentDepartmentIdForClassDetails) { // Prüfen, ob eine Klasse ausgewählt ist.
            alert("Fehler: Bitte wählen Sie zuerst eine Klasse aus, für die Passwörter generiert werden sollen.");
            return;
        }
        const depId = currentDepartmentIdForClassDetails;
        const btnHtml = generatePasswordsButton.innerHTML; // Originalen Button-Inhalt speichern.
        // Button deaktivieren und Ladezustand anzeigen.
        generatePasswordsButton.disabled = true;
        generatePasswordsButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Generiere...`;
        const url = `api/departments/${depId}/students/generate-passwords`;
        try {
            const data = await fetchData(url, { method: 'POST' }); // API-Aufruf zum Generieren.
            if (data?.students?.length > 0) { // Wenn Passwörter generiert wurden.
                const className = classDetailsNameSpan.textContent || 'klasse'; // Klassennamen holen.
                // Sicheren Dateinamen erstellen.
                const safeName = className.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `passwoerter_${safeName}_${new Date().toISOString().slice(0,10)}.csv`;
                // CSV-Download auslösen.
                downloadPasswordCsv(data.students, filename);
                alert(`${data.students.length} Passwörter wurden generiert und die CSV-Datei wird heruntergeladen.`);
            } else if (data?.students) { // Wenn keine Schüler in der Klasse waren.
                alert("Keine Schüler in dieser Klasse gefunden, für die Passwörter generiert werden könnten.");
            } else { // Unerwartete Antwort.
                console.error("Unerwartete Antwort vom Passwort-Generierungs-Endpunkt:", data);
                alert("Fehler: Unerwartete Antwort vom Server erhalten.");
            }
        } catch (e) { // Fehler beim API-Aufruf.
            alert(`Fehler beim Generieren der Passwörter: ${e.message}`);
        } finally {
            // Button wieder aktivieren und Originalinhalt wiederherstellen.
            generatePasswordsButton.disabled = false;
            generatePasswordsButton.innerHTML = btnHtml;
        }
    }

    // Hilfsfunktion zum Erstellen und Auslösen des Downloads einer CSV-Datei.
    function downloadPasswordCsv(students, filename) {
        const header = "Username,Password\n"; // CSV-Kopfzeile.
        // Hilfsfunktion zum Escapen von Feldern für CSV (falls Komma, Anführungszeichen oder Zeilenumbruch enthalten).
        const escape = (field) => {
            const str = String(field ?? ''); // Sicherstellen, dass es ein String ist.
            return (str.includes(',') || str.includes('"') || str.includes('\n'))
                   ? `"${str.replace(/"/g, '""')}"` // In Anführungszeichen setzen und interne verdoppeln.
                   : str;
        };
        // Datenzeilen erstellen.
        const rows = students.map(s => `${escape(s.username)},${escape(s.password)}`).join("\n");
        const content = header + rows; // Gesamtinhalt der CSV.
        // Blob (Binary Large Object) aus dem Inhalt erstellen.
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        // Download-Link erstellen und klicken.
        const link = document.createElement("a");
        if (link.download !== undefined) { // Moderner Browser-Support für Download-Attribut.
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Speicher freigeben.
        } else { // Fallback für ältere Browser.
            alert("Ihr Browser unterstützt den direkten Download möglicherweise nicht. Die Datei wird in einem neuen Tab geöffnet.");
            window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(content));
        }
    }

    // --- Statistik Funktion ---
    // Lädt und zeigt die Lernstatistiken für ein Vokabelset an, aufgeschlüsselt nach Klassen und Schülern.
    async function loadVocisetStatistics(vocisetId) {
        // Ladeanzeige anzeigen und Container leeren.
        statsLoadingIndicator.style.display = 'block';
        statsDepartmentsContainer.innerHTML = '';
        statsGlobalInfoDiv.innerHTML = '';
        const url = `api/vocabulary-sets/${vocisetId}/statistics`; // API-Endpunkt für Statistiken.

        try {
            const statsData = await fetchData(url); // Statistikdaten abrufen.
            // Globale Info: Gesamtzahl der Wörter im Set anzeigen.
            const totalWords = statsData.wordsCount !== undefined ? statsData.wordsCount : 0;
            statsGlobalInfoDiv.innerHTML = `Gesamtzahl Wörter in diesem Set: <strong>${totalWords}</strong>`;

            // Prüfen, ob Klassen-/Schülerdaten vorhanden sind.
            if (!statsData.departments || statsData.departments.length === 0) {
                statsDepartmentsContainer.innerHTML = '<p class="text-muted">Für dieses Vokabelset liegen keine Klassenzuweisungen oder Schüler-Statistiken vor.</p>';
                return; // Funktion beenden, wenn keine Daten vorhanden sind.
            }

            // Jede Klasse (Department) durchgehen, für die Statistiken vorhanden sind.
            statsData.departments.forEach(dept => {
                const departmentElement = document.createElement('div'); // Container für die Klasse.
                departmentElement.className = 'mb-4 p-3 border rounded';
                let totalLearnedInDept = 0; // Zähler für gesamt gelernte Wörter in der Klasse.
                let studentCount = dept.students?.length || 0; // Anzahl der Schüler in der Klasse mit Daten.
                const studentListElement = document.createElement('ul'); // Liste für die Schüler dieser Klasse.
                studentListElement.className = 'list-group list-group-flush mt-2';

                 if (studentCount > 0) { // Wenn Schülerdaten vorhanden sind.
                    // Schüler alphabetisch nach Benutzernamen sortieren.
                    dept.students.sort((a,b) => a.username.localeCompare(b.username));
                    // Jeden Schüler durchgehen.
                    dept.students.forEach(student => {
                        const learned = student.learnedCount !== undefined ? student.learnedCount : 0; // Anzahl gelernter Wörter.
                        totalLearnedInDept += learned; // Zum Klassentotal hinzufügen.
                        // Anzahl falscher/nicht gelernter Wörter berechnen.
                        const incorrect = totalWords > 0 ? totalWords - learned : 0;
                        // Lernfortschritt als Prozentsatz berechnen.
                        const percentage = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0;

                        const studentItem = document.createElement('li'); // Listenelement für den Schüler.
                        studentItem.className = 'list-group-item';
                        // HTML für die Schülerstatistik erstellen (Name, ID, Richtig/Falsch, Fortschrittsbalken).
                        studentItem.innerHTML = `
                            <div class="fw-bold">${student.username || 'Unbekannter Schüler'} <span class="badge bg-secondary float-end" title="Schüler ID">ID: ${student.id}</span></div>
                            <div class="d-flex align-items-center mt-1">
                               <span class="stats-label me-2" title="Anzahl richtig beantworteter Wörter">Richtig: ${learned}</span>
                               <div class="progress flex-grow-1" title="${percentage}% gelernt">
                                   <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage > 4 ? percentage+'%' : ''}</div>
                               </div>
                               <span class="stats-label ms-2" title="Anzahl noch nicht oder falsch beantworteter Wörter">Falsch: ${incorrect < 0 ? 0 : incorrect}</span>
                            </div>`;
                        studentListElement.appendChild(studentItem); // Schüler zur Liste hinzufügen.
                    });
                 } else { // Wenn keine Schülerdaten für diese Klasse vorhanden sind.
                     studentListElement.innerHTML = '<li class="list-group-item text-muted">Keine Schülerdaten für diese Klasse verfügbar.</li>';
                 }

                // Durchschnittswerte für die Klasse berechnen.
                const avgLearned = studentCount > 0 ? (totalLearnedInDept / studentCount) : 0;
                const avgIncorrect = totalWords > 0 ? totalWords - avgLearned : 0;
                const avgPercentage = totalWords > 0 ? Math.round((avgLearned / totalWords) * 100) : 0;
                // Formatierte Durchschnittswerte für die Anzeige.
                const displayAvgLearned = avgLearned.toFixed(1);
                const displayAvgIncorrect = (avgIncorrect < 0 ? 0 : avgIncorrect).toFixed(1);

                // HTML für den Klassenkopf (Name, ID) und den Klassendurchschnitt erstellen.
                departmentElement.innerHTML = `
                    <h4>Klasse: ${dept.label || 'Unbekannte Klasse'} <span class="badge bg-secondary float-end" title="Klassen ID">ID: ${dept.id}</span></h4>
                    <div class="mb-3">
                        <h5>Klassendurchschnitt (${studentCount} Schüler)</h5>
                        ${studentCount > 0 ? `
                        <div class="d-flex align-items-center mb-1">
                            <span class="stats-label me-2" title="Durchschnittlich richtig beantwortet">Richtig: Ø ${displayAvgLearned}</span>
                            <div class="progress flex-grow-1" title="${avgPercentage}% durchschnittlich gelernt">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: ${avgPercentage}%;" aria-valuenow="${avgPercentage}" aria-valuemin="0" aria-valuemax="100">${avgPercentage > 4 ? avgPercentage+'%' : ''}</div>
                            </div>
                            <span class="stats-label ms-2" title="Durchschnittlich falsch/nicht beantwortet">Falsch: Ø ${displayAvgIncorrect}</span>
                        </div>`
                        : `<p class="text-muted">Kein Durchschnitt berechenbar (keine Schülerdaten).</p>`}
                    </div>
                    <h5>Einzelauswertung der Schüler</h5>`;
                // Die Schülerliste an das Klassenelement anhängen.
                departmentElement.appendChild(studentListElement);
                // Das komplette Klassenelement zum Hauptcontainer hinzufügen.
                statsDepartmentsContainer.appendChild(departmentElement);
            });
        } catch (error) { // Bei Fehlern beim Laden der Statistikdaten.
            console.error("Fehler beim Laden der Statistikdaten:", error);
            statsDepartmentsContainer.innerHTML = `<div class="alert alert-danger">Fehler beim Laden der Statistik: ${error.message}</div>`;
        }
        finally {
            // Ladeanzeige in jedem Fall ausblenden.
            statsLoadingIndicator.style.display = 'none';
        }
    }

    // --- Initiales Laden ---
    // Funktionen, die beim Start der Seite aufgerufen werden, um die Grunddaten zu laden.
    loadKlassen(); // Lädt die Liste der Klassen.
    loadVociSets(); // Lädt die Liste der Vokabelsets.
}); // Ende DOMContentLoaded