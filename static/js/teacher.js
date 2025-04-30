document.addEventListener('DOMContentLoaded', function () {
    // --- HTML Elemente ---
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton');
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton');
    // Voci Set Details
    const vocisetDetailSection = document.getElementById('vociset-detail-section');
    const closeVocisetDetailSectionButton = document.getElementById('closeVocisetDetailSection');
    const vocisetDetailNameHeader = document.getElementById('vociset-detail-name-header');
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton');
    const existingWordsDropdown = document.getElementById('existing-words-dropdown');
    const deutschesWortInput = document.getElementById('deutschesWort');
    const französischesWortInput = document.getElementById('französischesWort');
    const addWordButton = document.getElementById('addWordButton');
    const vocisetDetailNameButtonSpan = document.getElementById('vociset-detail-name-button');
    const vocisetAssignedClassesList = document.getElementById('vociset-assigned-classes-list');
    const assignClassSelect = document.getElementById('assign-class-select');
    const assignClassButton = document.getElementById('assign-class-button');
    const noAssignedClassesMessage = document.getElementById('no-assigned-classes-message');
    const assignClassFeedback = document.getElementById('assign-class-feedback');
    const csvFileInput = document.getElementById('csvFileInput');
    const uploadCsvButton = document.getElementById('uploadCsvButton');
    const csvUploadFeedback = document.getElementById('csvUploadFeedback');
    // Klassen Details
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsNameSpan = document.getElementById('class-details-name');
    const classStudentsListUl = document.getElementById('class-students-list');
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection');
    const addClassStudentButton = document.getElementById('addClassStudentButton');
    const generatePasswordsButton = document.getElementById('generatePasswordsButton');
    // Modals
    const addStudentModalElement = document.getElementById('addStudentModal');
    const addStudentModal = new bootstrap.Modal(addStudentModalElement);
    const studentUsernameInput = document.getElementById('studentUsername');
    const saveNewStudentButton = document.getElementById('saveNewStudentButton');
    const createVocisetModalElement = document.getElementById('createVocisetModal');
    const createVocisetModal = new bootstrap.Modal(createVocisetModalElement);
    const vocisetNameInput = document.getElementById('vocisetNameInput');
    const saveNewVocisetButton = document.getElementById('saveNewVocisetButton');
    const addClassModalElement = document.getElementById('addClassModal');
    const addClassModal = new bootstrap.Modal(addClassModalElement);
    const classNameInput = document.getElementById('classNameInput');
    const saveNewClassButton = document.getElementById('saveNewClassButton');
    // Statistik Elemente
    const vocisetStatisticsSection = document.getElementById('vociset-statistics-section');
    const statsSetNameSpan = document.getElementById('stats-set-name');
    const statsGlobalInfoDiv = document.getElementById('stats-global-info');
    const statsDepartmentsContainer = document.getElementById('stats-departments-container');
    const closeStatisticsSectionButton = document.getElementById('closeStatisticsSection');
    const statsLoadingIndicator = document.getElementById('stats-loading-indicator');


    // --- Zustandsvariablen ---
    let currentVociSetId = null;
    let currentDepartmentIdForClassDetails = null;

    // --- Hilfsfunktion für Fetch ---
    async function fetchData(url, options = {}) {
        options.headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...options.headers };
        const fullUrl = url.startsWith('http') ? url : url; // Assume URLs are correct relative/absolute
        try {
            console.log(`Fetching: ${options.method || 'GET'} ${fullUrl}`);
            if(options.body) console.log(`Request Body: ${options.body}`);
            const response = await fetch(fullUrl, options);
            const responseBody = await response.text();
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${fullUrl}`;
                try { errorMsg += ` - ${JSON.stringify(JSON.parse(responseBody))}`; } catch (e) { errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`; }
                console.error("Fetch Error Details:", errorMsg); throw new Error(errorMsg);
            }
            return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) { const netErr = `Network Error: Failed to fetch ${fullUrl}. Server running?`; console.error(netErr); throw new Error(`Network Error: Cannot connect to API.`); }
            console.error(`Fetch Exception (${options.method || 'GET'} ${fullUrl}):`, error); throw error;
        }
    }

    // --- Event Listeners ---
    logoutButton.addEventListener('click', () => { window.location.href = '/'; });
    addKlasseButton.addEventListener('click', () => { classNameInput.value = ''; addClassModal.show(); });
    addVociSetButtonMainPage.addEventListener('click', () => { vocisetNameInput.value = ''; createVocisetModal.show(); });
    saveNewClassButton.addEventListener('click', () => { const name = classNameInput.value.trim(); if (name) createNewKlasse(name); else alert('Klassennamen eingeben.'); });
    saveNewVocisetButton.addEventListener('click', () => { const name = vocisetNameInput.value.trim(); if (name) createNewVociset(name); else alert('Voci Set Namen eingeben.'); });
    closeVocisetDetailSectionButton.addEventListener('click', hideVocisetDetailSection);
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection);
    closeStatisticsSectionButton.addEventListener('click', hideStatisticsSection); // NEU
    addWordButton.addEventListener('click', addWordToVociset);
    uploadCsvButton.addEventListener('click', handleCsvUpload);
    addClassStudentButton.addEventListener('click', () => { if (currentDepartmentIdForClassDetails) showAddStudentModalForClass(currentDepartmentIdForClassDetails); else alert("Klasse auswählen."); });
    saveNewStudentButton.addEventListener('click', () => { const username = studentUsernameInput.value.trim(); if (!username) alert('Benutzernamen eingeben.'); else if (currentDepartmentIdForClassDetails) addStudentToClass(currentDepartmentIdForClassDetails, username); else alert('Fehler: Klasse nicht ausgewählt.'); });
    generatePasswordsButton.addEventListener('click', generateAndDownloadPasswords);

    // --- Event Delegation Listeners ---
    klassenContainer.addEventListener('click', (e) => { const del = e.target.closest('.delete-button'); const view = e.target.closest('.view-class-button'); if (del) { const id = del.dataset.departmentId; if (id && confirm('Klasse löschen?')) deleteKlasse(id); } else if (view) { const id = view.dataset.departmentId; if (id) loadClassDetails(id); } });
    existingWordsDropdown.addEventListener('click', (e) => { const del = e.target.closest('.delete-word-button'); if (del) { const wId = del.dataset.wordId; const sId = del.dataset.vocabularySetId; if (wId && sId && confirm('Wort löschen?')) deleteWordFromVociset(sId, wId); } });
    classStudentsListUl.addEventListener('click', (e) => { const del = e.target.closest('.delete-student-button'); if (del) { const studId = del.dataset.studentId; const depId = del.dataset.departmentId; if (studId && depId && confirm('Schüler löschen?')) deleteStudent(depId, studId); } });
    vociSetsContainer.addEventListener('click', (e) => {
         const editButton = e.target.closest('.edit-vociset-button');
         const statsButton = e.target.closest('.view-stats-button'); // NEU
         if (editButton) { const id = editButton.dataset.vocisetId; const label = editButton.dataset.vocisetLabel; if (id && label) showVocisetDetailSection(id, label); }
         else if (statsButton) { const id = statsButton.dataset.vocisetId; const label = statsButton.dataset.vocisetLabel; if (id && label) showStatisticsSection(id, label); } // NEU
     });
    assignClassButton.addEventListener('click', () => { const depId = assignClassSelect.value; if (currentVociSetId && depId) assignClassToVociset(currentVociSetId, depId); else if (!depId) alert("Klasse auswählen."); else alert("Fehler: Kein Voci Set aktiv."); });
    vocisetAssignedClassesList.addEventListener('click', (e) => { const rem = e.target.closest('.remove-class-assignment-button'); if (rem && currentVociSetId) { const depId = rem.dataset.departmentId; if (depId) removeClassAssignment(currentVociSetId, depId); } });

    // --- UI Funktionen ---
    async function showVocisetDetailSection(vocabularySetId, vocabularySetName) {
        hideClassDetailsSection(); hideStatisticsSection(); vocisetDetailSection.style.display = 'block';
        assignClassSelect.innerHTML = '<option selected disabled value="">Lade...</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; assignClassFeedback.textContent = '';
        csvFileInput.value = ''; csvUploadFeedback.textContent = ''; csvUploadFeedback.className = 'mt-2'; existingWordsDropdown.innerHTML = '';
        currentVociSetId = vocabularySetId; vocisetDetailNameHeader.textContent = `Voci Set: ${vocabularySetName}`; vocisetDetailNameButtonSpan.textContent = vocabularySetName;
        loadWordsForVociset(vocabularySetId);
        try { const assignedIds = await loadAssignedClassesForVociset(vocabularySetId); populateClassAssignmentDropdown(assignedIds); }
        catch (error) { console.error("Fehler Init Klassenzuweisung:", error); assignClassSelect.innerHTML = '<option selected disabled value="">Fehler</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if (assignClassFeedback) { assignClassFeedback.textContent = 'Klasseninfo Fehler.'; assignClassFeedback.className = 'form-text text-danger mt-1'; } }
    }
    function hideVocisetDetailSection() { vocisetDetailSection.style.display = 'none'; deutschesWortInput.value = ''; französischesWortInput.value = ''; /* currentVociSetId not reset here, might be needed */ existingWordsDropdown.innerHTML = ''; vocisetDetailNameHeader.textContent = ''; vocisetDetailNameButtonSpan.textContent = ''; vocisetAssignedClassesList.innerHTML = ''; assignClassSelect.innerHTML = '<option selected disabled value="">--</option>'; noAssignedClassesMessage.style.display = 'none'; if (assignClassFeedback) assignClassFeedback.textContent = ''; csvFileInput.value = ''; csvUploadFeedback.textContent = ''; csvUploadFeedback.className = 'mt-2'; }
    function showClassDetailsSection() { hideVocisetDetailSection(); hideStatisticsSection(); classDetailsSection.style.display = 'block'; }
    function hideClassDetailsSection() { classDetailsSection.style.display = 'none'; currentDepartmentIdForClassDetails = null; classDetailsNameSpan.textContent = ''; classStudentsListUl.innerHTML = ''; }
    function showAddStudentModalForClass(departmentId) { currentDepartmentIdForClassDetails = departmentId; studentUsernameInput.value = ''; addStudentModal.show(); }
    function showStatisticsSection(vocisetId, vocisetName) {
        hideClassDetailsSection(); hideVocisetDetailSection();
        vocisetStatisticsSection.style.display = 'block';
        statsSetNameSpan.textContent = vocisetName;
        statsDepartmentsContainer.innerHTML = ''; statsGlobalInfoDiv.innerHTML = ''; statsLoadingIndicator.style.display = 'block';
        currentVociSetId = vocisetId; // Set current ID for potential future actions in this view
        loadVocisetStatistics(vocisetId);
    }
    function hideStatisticsSection() { vocisetStatisticsSection.style.display = 'none'; statsSetNameSpan.textContent = ''; statsDepartmentsContainer.innerHTML = ''; statsGlobalInfoDiv.innerHTML = ''; statsLoadingIndicator.style.display = 'none'; /* currentVociSetId not reset */ }

    // --- API & Logik ---
    async function createNewKlasse(className) { const url = '/api/departments/create'; try { await fetchData(url, { method: 'POST', body: JSON.stringify({ label: className }) }); alert(`Klasse "${className}" erstellt!`); addClassModal.hide(); loadKlassen(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function createNewVociset(name) { const url = '/api/vocabulary-sets/create'; try { const data = await fetchData(url, { method: 'POST', body: JSON.stringify({ label: name }) }); alert(`Set "${data.label}" erstellt!`); createVocisetModal.hide(); loadVociSets(); if (data?.id) setTimeout(() => showVocisetDetailSection(data.id, data.label), 100); } catch (e) { alert('Fehler: ' + e.message); } }
    async function loadWordsForVociset(setId) { const url = `api/vocabulary-sets/${setId}`; try { const data = await fetchData(url); const words = data.words; existingWordsDropdown.innerHTML = ''; if (words?.length > 0) { words.forEach(w => { const li = document.createElement('li'); li.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span title="ID: ${w.id}">${w.word} - ${w.translation}</span> <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${w.id}" data-vocabulary-set-id="${setId}" title="Wort löschen"><i class="fas fa-trash"></i></button>`; existingWordsDropdown.appendChild(li); }); } else { existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter</li>'; } } catch (e) { existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled text-danger">Fehler</li>'; console.error('Fehler loadWords:', e); } }
    async function loadAssignedClassesForVociset(vocabularySetId) { const url = `api/vocabulary-sets/${vocabularySetId}/departments`; vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Lade...</li>'; noAssignedClassesMessage.style.display = 'none'; let assignedIds = []; try { const data = await fetchData(url); const depts = data.departments; vocisetAssignedClassesList.innerHTML = ''; if (depts?.length > 0) { depts.forEach(d => { assignedIds.push(d.id); const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span>${d.label}</span> <button class="btn btn-warning btn-sm remove-class-assignment-button" data-department-id="${d.id}" title="Entfernen"><i class="fas fa-unlink"></i> Entfernen</button>`; vocisetAssignedClassesList.appendChild(li); }); noAssignedClassesMessage.style.display = 'none'; } else { if(depts===undefined){console.warn(`GET ${url} no 'departments'`); vocisetAssignedClassesList.innerHTML=`<li class="list-group-item list-group-item-warning">Info fehlt.</li>`;} else {noAssignedClassesMessage.style.display = 'block';} } } catch (e) { vocisetAssignedClassesList.innerHTML = `<li class="list-group-item list-group-item-danger">Fehler.</li>`; noAssignedClassesMessage.style.display = 'none'; console.error('Fehler loadAssignedClasses:', e); throw e; } return assignedIds; }
    async function populateClassAssignmentDropdown(assignedIds = []) { const url = '/api/departments'; assignClassSelect.innerHTML = '<option selected disabled value="">Lade...</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if(assignClassFeedback) assignClassFeedback.textContent = ''; try { const data = await fetchData(url); const allDepts = data.departments; assignClassSelect.innerHTML = ''; const defaultOpt = document.createElement('option'); defaultOpt.value = ""; defaultOpt.textContent = "-- Klasse auswählen --"; defaultOpt.selected = true; defaultOpt.disabled = true; assignClassSelect.appendChild(defaultOpt); let optionsAdded = 0; if (allDepts?.length > 0) { allDepts.forEach(d => { if (!assignedIds.includes(d.id)) { const opt = document.createElement('option'); opt.value = d.id; opt.textContent = d.label; assignClassSelect.appendChild(opt); optionsAdded++; } }); } if (optionsAdded > 0) { assignClassSelect.disabled = false; assignClassButton.disabled = false; if(assignClassFeedback) assignClassFeedback.textContent = ''; } else if (allDepts?.length > 0) { assignClassSelect.innerHTML = '<option selected disabled value="">Alle zugewiesen</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if(assignClassFeedback) assignClassFeedback.textContent = 'Alle Klassen zugewiesen.'; } else { assignClassSelect.innerHTML = '<option selected disabled value="">Keine Klassen</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if(assignClassFeedback) assignClassFeedback.textContent = 'Keine Klassen vorhanden.'; } } catch (e) { assignClassSelect.innerHTML = '<option selected disabled value="">Fehler</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if (assignClassFeedback) { assignClassFeedback.textContent = 'Fehler beim Laden.'; assignClassFeedback.className = 'form-text text-danger mt-1'; } console.error('Fehler populateDropdown:', e); throw e; } }
    async function assignClassToVociset(setId, depId) { const url = `api/vocabulary-sets/${setId}/departments/add`; const idInt = parseInt(depId); assignClassButton.disabled = true; assignClassButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>...'; try { await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: idInt }) }); alert('Klasse zugewiesen!'); const assigned = await loadAssignedClassesForVociset(setId); populateClassAssignmentDropdown(assigned); } catch (e) { alert('Fehler: ' + e.message); } finally { assignClassButton.disabled = false; assignClassButton.innerHTML = 'Zuweisen'; } }
    async function removeClassAssignment(setId, depId) { if (!confirm(`Zuweisung entfernen?`)) return; const url = `api/vocabulary-sets/${setId}/departments/remove`; const idInt = parseInt(depId); try { await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: idInt }) }); alert('Zuweisung entfernt!'); const assigned = await loadAssignedClassesForVociset(setId); populateClassAssignmentDropdown(assigned); } catch (e) { alert('Fehler: ' + e.message); } }
    async function _addWordApiCall(setId, ger, fr) { const url = `api/vocabulary-sets/${setId}/words/create`; return fetchData(url, { method: 'POST', body: JSON.stringify({ word: ger, translation: fr }) }); }
    async function addWordToVociset() { const ger = deutschesWortInput.value.trim(); const fr = französischesWortInput.value.trim(); if (!ger || !fr) { alert('Beide Felder ausfüllen.'); return; } if (!currentVociSetId) { alert('Kein Set ausgewählt.'); return; } try { await _addWordApiCall(currentVociSetId, ger, fr); alert('Wort hinzugefügt!'); deutschesWortInput.value = ''; französischesWortInput.value = ''; loadWordsForVociset(currentVociSetId); loadVociSets(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function handleCsvUpload() { if (!currentVociSetId) { csvUploadFeedback.textContent = 'Fehler: Kein Set ausgewählt.'; csvUploadFeedback.className = 'mt-2 text-danger'; return; } const file = csvFileInput.files[0]; if (!file) { csvUploadFeedback.textContent = 'CSV-Datei auswählen.'; csvUploadFeedback.className = 'mt-2 text-warning'; return; } uploadCsvButton.disabled = true; uploadCsvButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>...'; csvUploadFeedback.textContent = 'Lese CSV...'; csvUploadFeedback.className = 'mt-2 text-info'; const reader = new FileReader(); reader.onload = async (e) => { const lines = e.target.result.split(/\r?\n/); let added = 0, errors = 0, skipped = 0, header = false; const total = lines.length > 0 && lines[lines.length-1] === '' ? lines.length - 1 : lines.length; csvUploadFeedback.textContent = `Verarbeite ${total} Zeilen...`; for (let i = 0; i < lines.length; i++) { const line = lines[i].trim(); if (!line) continue; if (i === 0 || (i === 1 && !lines[0].trim())) { const lower = line.toLowerCase(); if (lower.includes('deutsch') || lower.includes('französisch') || lower.includes('german') || lower.includes('french') || lower.includes('wort') || lower.includes('translation')) { console.log("CSV Kopfzeile:", line); header = true; continue; } } const parts = line.split(';'); if (parts.length === 2) { const ger = parts[0].trim(); const fr = parts[1].trim(); if (ger && fr) { try { await _addWordApiCall(currentVociSetId, ger, fr); added++; } catch (err) { console.error(`Fehler Zeile ${i + 1}: "${ger} - ${fr}"`, err); errors++; } } else { skipped++; console.warn(`Leer Zeile ${i + 1}: "${line}"`); } } else { skipped++; console.warn(`Formatfehler Zeile ${i + 1}: "${line}"`); } } let msg = `CSV: ${added} Wörter hinzu.`; let cls = added > 0 ? 'mt-2 text-success' : 'mt-2 text-info'; if (errors > 0) { msg += ` ${errors} Fehler.`; cls = 'mt-2 text-warning'; } if (skipped > 0) { msg += ` ${skipped} übersprungen.`; cls = 'mt-2 text-warning'; } if (header && skipped === 0 && errors === 0) { msg += ` (Kopfzeile ignoriert).`; } else if (errors > 0 || skipped > 0) { msg += ` (Details Konsole).`; } csvUploadFeedback.textContent = msg; csvUploadFeedback.className = cls; if (added > 0) { loadWordsForVociset(currentVociSetId); loadVociSets(); } uploadCsvButton.disabled = false; uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen'; csvFileInput.value = ''; }; reader.onerror = () => { console.error("Fehler:", reader.error); csvUploadFeedback.textContent = 'Fehler beim Lesen.'; csvUploadFeedback.className = 'mt-2 text-danger'; uploadCsvButton.disabled = false; uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen'; csvFileInput.value = ''; }; reader.readAsText(file); }
    async function deleteWordFromVociset(setId, wordId) { const url = `api/vocabulary-sets/${setId}/words/${wordId}/delete`; try { await fetchData(url, { method: 'DELETE' }); alert('Wort gelöscht!'); loadWordsForVociset(setId); loadVociSets(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function loadKlassen() { const url = '/api/departments'; try { const data = await fetchData(url); const depts = data.departments; klassenContainer.innerHTML = ''; if (depts?.length > 0) { depts.forEach(d => { const col = document.createElement('div'); col.classList.add('col'); col.dataset.departmentId = d.id; col.innerHTML = `<div class="card h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><h5 class="card-title">${d.label}</h5><p class="card-text">${d.studentsCount} Schüler</p></div><div class="d-flex flex-column align-items-end"><button class="btn btn-info btn-sm mb-1 view-class-button" data-department-id="${d.id}"><i class="fas fa-eye"></i> Anzeigen</button><button class="btn btn-danger btn-sm delete-button" data-department-id="${d.id}"><i class="fas fa-trash"></i></button></div></div></div>`; klassenContainer.appendChild(col); }); } else { klassenContainer.innerHTML = '<p>Keine Klassen.</p>'; } } catch (e) { klassenContainer.innerHTML = '<p class="text-danger">Fehler.</p>'; console.error('Fehler loadKlassen:', e); } }
    async function deleteKlasse(id) { const url = `api/departments/${id}/delete`; try { await fetchData(url, { method: 'DELETE' }); alert('Klasse gelöscht!'); loadKlassen(); hideClassDetailsSection(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function loadVociSets() { const url = '/api/vocabulary-sets'; try { const data = await fetchData(url); const sets = data.sets; vociSetsContainer.innerHTML = ''; if (sets?.length > 0) { sets.forEach(s => { const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span>${s.label} (Wörter: ${s.wordsCount}, Gelernt: ${s.learnedCount})</span> <div class="btn-group btn-group-sm"> <button class="btn btn-info view-stats-button" data-vociset-id="${s.id}" data-vociset-label="${s.label}" title="Statistik"><i class="fas fa-chart-line"></i> Statistik</button> <button class="btn btn-success edit-vociset-button" data-vociset-id="${s.id}" data-vociset-label="${s.label}" title="Bearbeiten"><i class="fas fa-edit"></i> Bearbeiten</button> </div>`; vociSetsContainer.appendChild(li); }); } else { vociSetsContainer.innerHTML = '<p>Keine Sets.</p>'; } } catch (e) { vociSetsContainer.innerHTML = '<p class="text-danger">Fehler.</p>'; console.error('Fehler loadVociSets:', e); } }
    async function loadClassDetails(id) { currentDepartmentIdForClassDetails = id; const url = `api/departments/${id}`; try { const data = await fetchData(url); classDetailsNameSpan.textContent = data.label; classStudentsListUl.innerHTML = ''; if (data.students?.length > 0) { data.students.forEach(s => { const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span>${s.username}</span><button class="btn btn-danger btn-sm delete-student-button" data-student-id="${s.id}" data-department-id="${data.id}"><i class="fas fa-trash"></i></button>`; classStudentsListUl.appendChild(li); }); } else { classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler</li>'; } hideVocisetDetailSection(); hideStatisticsSection(); showClassDetailsSection(); } catch (e) { classDetailsNameSpan.textContent = 'Fehler'; classStudentsListUl.innerHTML = '<li class="list-group-item disabled text-danger">Fehler</li>'; hideVocisetDetailSection(); hideStatisticsSection(); showClassDetailsSection(); alert('Fehler: ' + e.message); } }
    async function deleteStudent(depId, studId) { const url = `api/departments/${depId}/students/${studId}/delete`; try { await fetchData(url, { method: 'DELETE' }); alert('Schüler gelöscht!'); loadClassDetails(depId); loadKlassen(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function addStudentToClass(depId, username) { const url = `api/departments/${depId}/students/create`; try { await fetchData(url, { method: 'POST', body: JSON.stringify({ username: username }) }); alert('Schüler hinzugefügt!'); addStudentModal.hide(); loadClassDetails(depId); loadKlassen(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function generateAndDownloadPasswords() { if (!currentDepartmentIdForClassDetails) { alert("Fehler: Klasse auswählen."); return; } const depId = currentDepartmentIdForClassDetails; const btnHtml = generatePasswordsButton.innerHTML; generatePasswordsButton.disabled = true; generatePasswordsButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span>...`; const url = `api/departments/${depId}/students/generate-passwords`; try { const data = await fetchData(url, { method: 'POST' }); if (data?.students?.length > 0) { const className = classDetailsNameSpan.textContent || 'klasse'; const safeName = className.replace(/[^a-z0-9]/gi, '_').toLowerCase(); const filename = `passwoerter_${safeName}_${new Date().toISOString().slice(0,10)}.csv`; downloadPasswordCsv(data.students, filename); alert(`${data.students.length} Passwörter generiert & heruntergeladen.`); } else if (data?.students) { alert("Keine Schüler gefunden."); } else { console.error("Unerwartete Antwort:", data); alert("Fehler: Unerwartete Antwort."); } } catch (e) { alert(`Fehler: ${e.message}`); } finally { generatePasswordsButton.disabled = false; generatePasswordsButton.innerHTML = btnHtml; } }
    function downloadPasswordCsv(students, filename) { const header = "Username,Password\n"; const escape = (f) => { const s = String(f ?? ''); return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s; }; const rows = students.map(s => `${escape(s.username)},${escape(s.password)}`).join("\n"); const content = header + rows; const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", filename); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); } else { alert("Download nicht direkt unterstützt."); window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(content)); } }

    // --- Statistik Funktion ---
    async function loadVocisetStatistics(vocisetId) {
        statsLoadingIndicator.style.display = 'block'; statsDepartmentsContainer.innerHTML = ''; statsGlobalInfoDiv.innerHTML = '';
        const url = `api/vocabulary-sets/${vocisetId}/statistics`;
        try {
            const statsData = await fetchData(url);
            const totalWords = statsData.wordsCount !== undefined ? statsData.wordsCount : 0;
            statsGlobalInfoDiv.innerHTML = `Gesamtzahl Wörter im Set: <strong>${totalWords}</strong>`;

            if (!statsData.departments || statsData.departments.length === 0) {
                statsDepartmentsContainer.innerHTML = '<p class="text-muted">Keine Klassen oder Schülerdaten für dieses Set.</p>';
                return;
            }

            statsData.departments.forEach(dept => {
                const departmentElement = document.createElement('div'); departmentElement.className = 'mb-4 p-3 border rounded';
                let totalLearnedInDept = 0; let studentCount = dept.students?.length || 0;
                const studentListElement = document.createElement('ul'); studentListElement.className = 'list-group list-group-flush mt-2';

                 if (studentCount > 0) {
                    dept.students.sort((a,b) => a.username.localeCompare(b.username)); // Sortiere Schüler alphabetisch
                    dept.students.forEach(student => {
                        const learned = student.learnedCount !== undefined ? student.learnedCount : 0;
                        totalLearnedInDept += learned;
                        const incorrect = totalWords > 0 ? totalWords - learned : 0;
                        const percentage = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0;
                        const studentItem = document.createElement('li'); studentItem.className = 'list-group-item';
                        studentItem.innerHTML = `
                            <div class="fw-bold">${student.username || 'Unbekannt'} <span class="badge bg-secondary float-end" title="Schüler ID">ID: ${student.id}</span></div>
                            <div class="d-flex align-items-center mt-1">
                               <span class="stats-label me-2" title="Anzahl richtig beantworteter Wörter">Richtig: ${learned}</span>
                               <div class="progress flex-grow-1" title="${percentage}% gelernt">
                                   <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage > 4 ? percentage+'%' : ''}</div>
                               </div>
                               <span class="stats-label ms-2" title="Anzahl noch nicht oder falsch beantworteter Wörter">Falsch: ${incorrect < 0 ? 0 : incorrect}</span>
                            </div>`;
                        studentListElement.appendChild(studentItem);
                    });
                 } else { studentListElement.innerHTML = '<li class="list-group-item text-muted">Keine Schülerdaten.</li>'; }

                const avgLearned = studentCount > 0 ? (totalLearnedInDept / studentCount) : 0;
                const avgIncorrect = totalWords > 0 ? totalWords - avgLearned : 0;
                const avgPercentage = totalWords > 0 ? Math.round((avgLearned / totalWords) * 100) : 0;
                const displayAvgLearned = avgLearned.toFixed(1); const displayAvgIncorrect = (avgIncorrect < 0 ? 0 : avgIncorrect).toFixed(1);

                departmentElement.innerHTML = `<h4>Klasse: ${dept.label || 'Unbekannt'} <span class="badge bg-secondary float-end" title="Klassen ID">ID: ${dept.id}</span></h4> <div class="mb-3"> <h5>Klassendurchschnitt (${studentCount} Schüler)</h5> ${studentCount > 0 ? `<div class="d-flex align-items-center mb-1"> <span class="stats-label me-2" title="Durchschnittlich richtig beantwortet">Richtig: Ø ${displayAvgLearned}</span> <div class="progress flex-grow-1" title="${avgPercentage}% durchschnittlich gelernt"> <div class="progress-bar bg-primary" role="progressbar" style="width: ${avgPercentage}%;" aria-valuenow="${avgPercentage}" aria-valuemin="0" aria-valuemax="100">${avgPercentage > 4 ? avgPercentage+'%' : ''}</div> </div> <span class="stats-label ms-2" title="Durchschnittlich falsch/nicht beantwortet">Falsch: Ø ${displayAvgIncorrect}</span> </div>` : `<p class="text-muted">Kein Durchschnitt berechenbar.</p>`} </div> <h5>Einzelauswertung Schüler</h5>`;
                departmentElement.appendChild(studentListElement);
                statsDepartmentsContainer.appendChild(departmentElement);
            });
        } catch (error) { console.error("Fehler Statistikdaten:", error); statsDepartmentsContainer.innerHTML = `<div class="alert alert-danger">Fehler Statistik: ${error.message}</div>`; }
        finally { statsLoadingIndicator.style.display = 'none'; }
    }
document.addEventListener('DOMContentLoaded', function () {
    // --- HTML Elemente ---
    const logoutButton = document.getElementById('logoutButton');
    const klassenContainer = document.getElementById('klassen-container');
    const vociSetsContainer = document.getElementById('voci-sets-container');
    const addKlasseButton = document.getElementById('addKlasseButton');
    const addVociSetButtonMainPage = document.getElementById('addVociSetButton');
    // Voci Set Details
    const vocisetDetailSection = document.getElementById('vociset-detail-section');
    const closeVocisetDetailSectionButton = document.getElementById('closeVocisetDetailSection');
    const vocisetDetailNameHeader = document.getElementById('vociset-detail-name-header');
    const dropdownExistingWordsButton = document.getElementById('dropdownExistingWordsButton');
    const existingWordsDropdown = document.getElementById('existing-words-dropdown');
    const deutschesWortInput = document.getElementById('deutschesWort');
    const französischesWortInput = document.getElementById('französischesWort');
    const addWordButton = document.getElementById('addWordButton');
    const vocisetDetailNameButtonSpan = document.getElementById('vociset-detail-name-button');
    const vocisetAssignedClassesList = document.getElementById('vociset-assigned-classes-list');
    const assignClassSelect = document.getElementById('assign-class-select');
    const assignClassButton = document.getElementById('assign-class-button');
    const noAssignedClassesMessage = document.getElementById('no-assigned-classes-message');
    const assignClassFeedback = document.getElementById('assign-class-feedback');
    const csvFileInput = document.getElementById('csvFileInput');
    const uploadCsvButton = document.getElementById('uploadCsvButton');
    const csvUploadFeedback = document.getElementById('csvUploadFeedback');
    // Klassen Details
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsNameSpan = document.getElementById('class-details-name');
    const classStudentsListUl = document.getElementById('class-students-list');
    const closeClassDetailsSectionButton = document.getElementById('closeClassDetailsSection');
    const addClassStudentButton = document.getElementById('addClassStudentButton');
    const generatePasswordsButton = document.getElementById('generatePasswordsButton');
    // Modals
    const addStudentModalElement = document.getElementById('addStudentModal');
    const addStudentModal = new bootstrap.Modal(addStudentModalElement);
    const studentUsernameInput = document.getElementById('studentUsername');
    const saveNewStudentButton = document.getElementById('saveNewStudentButton');
    const createVocisetModalElement = document.getElementById('createVocisetModal');
    const createVocisetModal = new bootstrap.Modal(createVocisetModalElement);
    const vocisetNameInput = document.getElementById('vocisetNameInput');
    const saveNewVocisetButton = document.getElementById('saveNewVocisetButton');
    const addClassModalElement = document.getElementById('addClassModal');
    const addClassModal = new bootstrap.Modal(addClassModalElement);
    const classNameInput = document.getElementById('classNameInput');
    const saveNewClassButton = document.getElementById('saveNewClassButton');
    // Statistik Elemente
    const vocisetStatisticsSection = document.getElementById('vociset-statistics-section');
    const statsSetNameSpan = document.getElementById('stats-set-name');
    const statsGlobalInfoDiv = document.getElementById('stats-global-info');
    const statsDepartmentsContainer = document.getElementById('stats-departments-container');
    const closeStatisticsSectionButton = document.getElementById('closeStatisticsSection');
    const statsLoadingIndicator = document.getElementById('stats-loading-indicator');


    // --- Zustandsvariablen ---
    let currentVociSetId = null;
    let currentDepartmentIdForClassDetails = null;

    // --- Hilfsfunktion für Fetch ---
    async function fetchData(url, options = {}) {
        options.headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...options.headers };
        const fullUrl = url.startsWith('http') ? url : url; // Assume URLs are correct relative/absolute
        try {
            console.log(`Fetching: ${options.method || 'GET'} ${fullUrl}`);
            if(options.body) console.log(`Request Body: ${options.body}`);
            const response = await fetch(fullUrl, options);
            const responseBody = await response.text();
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${fullUrl}`;
                try { errorMsg += ` - ${JSON.stringify(JSON.parse(responseBody))}`; } catch (e) { errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`; }
                console.error("Fetch Error Details:", errorMsg); throw new Error(errorMsg);
            }
            return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) { const netErr = `Network Error: Failed to fetch ${fullUrl}. Server running?`; console.error(netErr); throw new Error(`Network Error: Cannot connect to API.`); }
            console.error(`Fetch Exception (${options.method || 'GET'} ${fullUrl}):`, error); throw error;
        }
    }

    // --- Event Listeners ---
    logoutButton.addEventListener('click', () => { window.location.href = '/'; });
    addKlasseButton.addEventListener('click', () => { classNameInput.value = ''; addClassModal.show(); });
    addVociSetButtonMainPage.addEventListener('click', () => { vocisetNameInput.value = ''; createVocisetModal.show(); });
    saveNewClassButton.addEventListener('click', () => { const name = classNameInput.value.trim(); if (name) createNewKlasse(name); else alert('Klassennamen eingeben.'); });
    saveNewVocisetButton.addEventListener('click', () => { const name = vocisetNameInput.value.trim(); if (name) createNewVociset(name); else alert('Voci Set Namen eingeben.'); });
    closeVocisetDetailSectionButton.addEventListener('click', hideVocisetDetailSection);
    closeClassDetailsSectionButton.addEventListener('click', hideClassDetailsSection);
    closeStatisticsSectionButton.addEventListener('click', hideStatisticsSection); // NEU
    addWordButton.addEventListener('click', addWordToVociset);
    uploadCsvButton.addEventListener('click', handleCsvUpload);
    addClassStudentButton.addEventListener('click', () => { if (currentDepartmentIdForClassDetails) showAddStudentModalForClass(currentDepartmentIdForClassDetails); else alert("Klasse auswählen."); });
    saveNewStudentButton.addEventListener('click', () => { const username = studentUsernameInput.value.trim(); if (!username) alert('Benutzernamen eingeben.'); else if (currentDepartmentIdForClassDetails) addStudentToClass(currentDepartmentIdForClassDetails, username); else alert('Fehler: Klasse nicht ausgewählt.'); });
    generatePasswordsButton.addEventListener('click', generateAndDownloadPasswords);

    // --- Event Delegation Listeners ---
    klassenContainer.addEventListener('click', (e) => { const del = e.target.closest('.delete-button'); const view = e.target.closest('.view-class-button'); if (del) { const id = del.dataset.departmentId; if (id && confirm('Klasse löschen?')) deleteKlasse(id); } else if (view) { const id = view.dataset.departmentId; if (id) loadClassDetails(id); } });
    existingWordsDropdown.addEventListener('click', (e) => { const del = e.target.closest('.delete-word-button'); if (del) { const wId = del.dataset.wordId; const sId = del.dataset.vocabularySetId; if (wId && sId && confirm('Wort löschen?')) deleteWordFromVociset(sId, wId); } });
    classStudentsListUl.addEventListener('click', (e) => { const del = e.target.closest('.delete-student-button'); if (del) { const studId = del.dataset.studentId; const depId = del.dataset.departmentId; if (studId && depId && confirm('Schüler löschen?')) deleteStudent(depId, studId); } });
    vociSetsContainer.addEventListener('click', (e) => {
         const editButton = e.target.closest('.edit-vociset-button');
         const statsButton = e.target.closest('.view-stats-button'); // NEU
         if (editButton) { const id = editButton.dataset.vocisetId; const label = editButton.dataset.vocisetLabel; if (id && label) showVocisetDetailSection(id, label); }
         else if (statsButton) { const id = statsButton.dataset.vocisetId; const label = statsButton.dataset.vocisetLabel; if (id && label) showStatisticsSection(id, label); } // NEU
     });
    assignClassButton.addEventListener('click', () => { const depId = assignClassSelect.value; if (currentVociSetId && depId) assignClassToVociset(currentVociSetId, depId); else if (!depId) alert("Klasse auswählen."); else alert("Fehler: Kein Voci Set aktiv."); });
    vocisetAssignedClassesList.addEventListener('click', (e) => { const rem = e.target.closest('.remove-class-assignment-button'); if (rem && currentVociSetId) { const depId = rem.dataset.departmentId; if (depId) removeClassAssignment(currentVociSetId, depId); } });

    // --- UI Funktionen ---
    async function showVocisetDetailSection(vocabularySetId, vocabularySetName) {
        hideClassDetailsSection(); hideStatisticsSection(); vocisetDetailSection.style.display = 'block';
        assignClassSelect.innerHTML = '<option selected disabled value="">Lade...</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; assignClassFeedback.textContent = '';
        csvFileInput.value = ''; csvUploadFeedback.textContent = ''; csvUploadFeedback.className = 'mt-2'; existingWordsDropdown.innerHTML = '';
        currentVociSetId = vocabularySetId; vocisetDetailNameHeader.textContent = `Voci Set: ${vocabularySetName}`; vocisetDetailNameButtonSpan.textContent = vocabularySetName;
        loadWordsForVociset(vocabularySetId);
        try { const assignedIds = await loadAssignedClassesForVociset(vocabularySetId); populateClassAssignmentDropdown(assignedIds); }
        catch (error) { console.error("Fehler Init Klassenzuweisung:", error); assignClassSelect.innerHTML = '<option selected disabled value="">Fehler</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if (assignClassFeedback) { assignClassFeedback.textContent = 'Klasseninfo Fehler.'; assignClassFeedback.className = 'form-text text-danger mt-1'; } }
    }
    function hideVocisetDetailSection() { vocisetDetailSection.style.display = 'none'; deutschesWortInput.value = ''; französischesWortInput.value = ''; /* currentVociSetId not reset here, might be needed */ existingWordsDropdown.innerHTML = ''; vocisetDetailNameHeader.textContent = ''; vocisetDetailNameButtonSpan.textContent = ''; vocisetAssignedClassesList.innerHTML = ''; assignClassSelect.innerHTML = '<option selected disabled value="">--</option>'; noAssignedClassesMessage.style.display = 'none'; if (assignClassFeedback) assignClassFeedback.textContent = ''; csvFileInput.value = ''; csvUploadFeedback.textContent = ''; csvUploadFeedback.className = 'mt-2'; }
    function showClassDetailsSection() { hideVocisetDetailSection(); hideStatisticsSection(); classDetailsSection.style.display = 'block'; }
    function hideClassDetailsSection() { classDetailsSection.style.display = 'none'; currentDepartmentIdForClassDetails = null; classDetailsNameSpan.textContent = ''; classStudentsListUl.innerHTML = ''; }
    function showAddStudentModalForClass(departmentId) { currentDepartmentIdForClassDetails = departmentId; studentUsernameInput.value = ''; addStudentModal.show(); }
    function showStatisticsSection(vocisetId, vocisetName) {
        hideClassDetailsSection(); hideVocisetDetailSection();
        vocisetStatisticsSection.style.display = 'block';
        statsSetNameSpan.textContent = vocisetName;
        statsDepartmentsContainer.innerHTML = ''; statsGlobalInfoDiv.innerHTML = ''; statsLoadingIndicator.style.display = 'block';
        currentVociSetId = vocisetId; // Set current ID for potential future actions in this view
        loadVocisetStatistics(vocisetId);
    }
    function hideStatisticsSection() { vocisetStatisticsSection.style.display = 'none'; statsSetNameSpan.textContent = ''; statsDepartmentsContainer.innerHTML = ''; statsGlobalInfoDiv.innerHTML = ''; statsLoadingIndicator.style.display = 'none'; /* currentVociSetId not reset */ }

    // --- API & Logik ---
    async function createNewKlasse(className) { const url = '/api/departments/create'; try { await fetchData(url, { method: 'POST', body: JSON.stringify({ label: className }) }); alert(`Klasse "${className}" erstellt!`); addClassModal.hide(); loadKlassen(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function createNewVociset(name) { const url = '/api/vocabulary-sets/create'; try { const data = await fetchData(url, { method: 'POST', body: JSON.stringify({ label: name }) }); alert(`Set "${data.label}" erstellt!`); createVocisetModal.hide(); loadVociSets(); if (data?.id) setTimeout(() => showVocisetDetailSection(data.id, data.label), 100); } catch (e) { alert('Fehler: ' + e.message); } }
    async function loadWordsForVociset(setId) { const url = `api/vocabulary-sets/${setId}`; try { const data = await fetchData(url); const words = data.words; existingWordsDropdown.innerHTML = ''; if (words?.length > 0) { words.forEach(w => { const li = document.createElement('li'); li.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span title="ID: ${w.id}">${w.word} - ${w.translation}</span> <button class="btn btn-danger btn-sm delete-word-button" data-word-id="${w.id}" data-vocabulary-set-id="${setId}" title="Wort löschen"><i class="fas fa-trash"></i></button>`; existingWordsDropdown.appendChild(li); }); } else { existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled">Keine Wörter</li>'; } } catch (e) { existingWordsDropdown.innerHTML = '<li class="dropdown-item disabled text-danger">Fehler</li>'; console.error('Fehler loadWords:', e); } }
    async function loadAssignedClassesForVociset(vocabularySetId) { const url = `api/vocabulary-sets/${vocabularySetId}/departments`; vocisetAssignedClassesList.innerHTML = '<li class="list-group-item disabled">Lade...</li>'; noAssignedClassesMessage.style.display = 'none'; let assignedIds = []; try { const data = await fetchData(url); const depts = data.departments; vocisetAssignedClassesList.innerHTML = ''; if (depts?.length > 0) { depts.forEach(d => { assignedIds.push(d.id); const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span>${d.label}</span> <button class="btn btn-warning btn-sm remove-class-assignment-button" data-department-id="${d.id}" title="Entfernen"><i class="fas fa-unlink"></i> Entfernen</button>`; vocisetAssignedClassesList.appendChild(li); }); noAssignedClassesMessage.style.display = 'none'; } else { if(depts===undefined){console.warn(`GET ${url} no 'departments'`); vocisetAssignedClassesList.innerHTML=`<li class="list-group-item list-group-item-warning">Info fehlt.</li>`;} else {noAssignedClassesMessage.style.display = 'block';} } } catch (e) { vocisetAssignedClassesList.innerHTML = `<li class="list-group-item list-group-item-danger">Fehler.</li>`; noAssignedClassesMessage.style.display = 'none'; console.error('Fehler loadAssignedClasses:', e); throw e; } return assignedIds; }
    async function populateClassAssignmentDropdown(assignedIds = []) { const url = '/api/departments'; assignClassSelect.innerHTML = '<option selected disabled value="">Lade...</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if(assignClassFeedback) assignClassFeedback.textContent = ''; try { const data = await fetchData(url); const allDepts = data.departments; assignClassSelect.innerHTML = ''; const defaultOpt = document.createElement('option'); defaultOpt.value = ""; defaultOpt.textContent = "-- Klasse auswählen --"; defaultOpt.selected = true; defaultOpt.disabled = true; assignClassSelect.appendChild(defaultOpt); let optionsAdded = 0; if (allDepts?.length > 0) { allDepts.forEach(d => { if (!assignedIds.includes(d.id)) { const opt = document.createElement('option'); opt.value = d.id; opt.textContent = d.label; assignClassSelect.appendChild(opt); optionsAdded++; } }); } if (optionsAdded > 0) { assignClassSelect.disabled = false; assignClassButton.disabled = false; if(assignClassFeedback) assignClassFeedback.textContent = ''; } else if (allDepts?.length > 0) { assignClassSelect.innerHTML = '<option selected disabled value="">Alle zugewiesen</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if(assignClassFeedback) assignClassFeedback.textContent = 'Alle Klassen zugewiesen.'; } else { assignClassSelect.innerHTML = '<option selected disabled value="">Keine Klassen</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if(assignClassFeedback) assignClassFeedback.textContent = 'Keine Klassen vorhanden.'; } } catch (e) { assignClassSelect.innerHTML = '<option selected disabled value="">Fehler</option>'; assignClassSelect.disabled = true; assignClassButton.disabled = true; if (assignClassFeedback) { assignClassFeedback.textContent = 'Fehler beim Laden.'; assignClassFeedback.className = 'form-text text-danger mt-1'; } console.error('Fehler populateDropdown:', e); throw e; } }
    async function assignClassToVociset(setId, depId) { const url = `api/vocabulary-sets/${setId}/departments/add`; const idInt = parseInt(depId); assignClassButton.disabled = true; assignClassButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>...'; try { await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: idInt }) }); alert('Klasse zugewiesen!'); const assigned = await loadAssignedClassesForVociset(setId); populateClassAssignmentDropdown(assigned); } catch (e) { alert('Fehler: ' + e.message); } finally { assignClassButton.disabled = false; assignClassButton.innerHTML = 'Zuweisen'; } }
    async function removeClassAssignment(setId, depId) { if (!confirm(`Zuweisung entfernen?`)) return; const url = `api/vocabulary-sets/${setId}/departments/remove`; const idInt = parseInt(depId); try { await fetchData(url, { method: 'PATCH', body: JSON.stringify({ id: idInt }) }); alert('Zuweisung entfernt!'); const assigned = await loadAssignedClassesForVociset(setId); populateClassAssignmentDropdown(assigned); } catch (e) { alert('Fehler: ' + e.message); } }
    async function _addWordApiCall(setId, ger, fr) { const url = `api/vocabulary-sets/${setId}/words/create`; return fetchData(url, { method: 'POST', body: JSON.stringify({ word: ger, translation: fr }) }); }
    async function addWordToVociset() { const ger = deutschesWortInput.value.trim(); const fr = französischesWortInput.value.trim(); if (!ger || !fr) { alert('Beide Felder ausfüllen.'); return; } if (!currentVociSetId) { alert('Kein Set ausgewählt.'); return; } try { await _addWordApiCall(currentVociSetId, ger, fr); alert('Wort hinzugefügt!'); deutschesWortInput.value = ''; französischesWortInput.value = ''; loadWordsForVociset(currentVociSetId); loadVociSets(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function handleCsvUpload() { if (!currentVociSetId) { csvUploadFeedback.textContent = 'Fehler: Kein Set ausgewählt.'; csvUploadFeedback.className = 'mt-2 text-danger'; return; } const file = csvFileInput.files[0]; if (!file) { csvUploadFeedback.textContent = 'CSV-Datei auswählen.'; csvUploadFeedback.className = 'mt-2 text-warning'; return; } uploadCsvButton.disabled = true; uploadCsvButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>...'; csvUploadFeedback.textContent = 'Lese CSV...'; csvUploadFeedback.className = 'mt-2 text-info'; const reader = new FileReader(); reader.onload = async (e) => { const lines = e.target.result.split(/\r?\n/); let added = 0, errors = 0, skipped = 0, header = false; const total = lines.length > 0 && lines[lines.length-1] === '' ? lines.length - 1 : lines.length; csvUploadFeedback.textContent = `Verarbeite ${total} Zeilen...`; for (let i = 0; i < lines.length; i++) { const line = lines[i].trim(); if (!line) continue; if (i === 0 || (i === 1 && !lines[0].trim())) { const lower = line.toLowerCase(); if (lower.includes('deutsch') || lower.includes('französisch') || lower.includes('german') || lower.includes('french') || lower.includes('wort') || lower.includes('translation')) { console.log("CSV Kopfzeile:", line); header = true; continue; } } const parts = line.split(';'); if (parts.length === 2) { const ger = parts[0].trim(); const fr = parts[1].trim(); if (ger && fr) { try { await _addWordApiCall(currentVociSetId, ger, fr); added++; } catch (err) { console.error(`Fehler Zeile ${i + 1}: "${ger} - ${fr}"`, err); errors++; } } else { skipped++; console.warn(`Leer Zeile ${i + 1}: "${line}"`); } } else { skipped++; console.warn(`Formatfehler Zeile ${i + 1}: "${line}"`); } } let msg = `CSV: ${added} Wörter hinzu.`; let cls = added > 0 ? 'mt-2 text-success' : 'mt-2 text-info'; if (errors > 0) { msg += ` ${errors} Fehler.`; cls = 'mt-2 text-warning'; } if (skipped > 0) { msg += ` ${skipped} übersprungen.`; cls = 'mt-2 text-warning'; } if (header && skipped === 0 && errors === 0) { msg += ` (Kopfzeile ignoriert).`; } else if (errors > 0 || skipped > 0) { msg += ` (Details Konsole).`; } csvUploadFeedback.textContent = msg; csvUploadFeedback.className = cls; if (added > 0) { loadWordsForVociset(currentVociSetId); loadVociSets(); } uploadCsvButton.disabled = false; uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen'; csvFileInput.value = ''; }; reader.onerror = () => { console.error("Fehler:", reader.error); csvUploadFeedback.textContent = 'Fehler beim Lesen.'; csvUploadFeedback.className = 'mt-2 text-danger'; uploadCsvButton.disabled = false; uploadCsvButton.innerHTML = '<i class="fas fa-upload"></i> Hochladen & Hinzufügen'; csvFileInput.value = ''; }; reader.readAsText(file); }
    async function deleteWordFromVociset(setId, wordId) { const url = `api/vocabulary-sets/${setId}/words/${wordId}/delete`; try { await fetchData(url, { method: 'DELETE' }); alert('Wort gelöscht!'); loadWordsForVociset(setId); loadVociSets(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function loadKlassen() { const url = '/api/departments'; try { const data = await fetchData(url); const depts = data.departments; klassenContainer.innerHTML = ''; if (depts?.length > 0) { depts.forEach(d => { const col = document.createElement('div'); col.classList.add('col'); col.dataset.departmentId = d.id; col.innerHTML = `<div class="card h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><h5 class="card-title">${d.label}</h5><p class="card-text">${d.studentsCount} Schüler</p></div><div class="d-flex flex-column align-items-end"><button class="btn btn-info btn-sm mb-1 view-class-button" data-department-id="${d.id}"><i class="fas fa-eye"></i> Anzeigen</button><button class="btn btn-danger btn-sm delete-button" data-department-id="${d.id}"><i class="fas fa-trash"></i></button></div></div></div>`; klassenContainer.appendChild(col); }); } else { klassenContainer.innerHTML = '<p>Keine Klassen.</p>'; } } catch (e) { klassenContainer.innerHTML = '<p class="text-danger">Fehler.</p>'; console.error('Fehler loadKlassen:', e); } }
    async function deleteKlasse(id) { const url = `api/departments/${id}/delete`; try { await fetchData(url, { method: 'DELETE' }); alert('Klasse gelöscht!'); loadKlassen(); hideClassDetailsSection(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function loadVociSets() { const url = '/api/vocabulary-sets'; try { const data = await fetchData(url); const sets = data.sets; vociSetsContainer.innerHTML = ''; if (sets?.length > 0) { sets.forEach(s => { const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span>${s.label} (Wörter: ${s.wordsCount}, Gelernt: ${s.learnedCount})</span> <div class="btn-group btn-group-sm"> <button class="btn btn-info view-stats-button" data-vociset-id="${s.id}" data-vociset-label="${s.label}" title="Statistik"><i class="fas fa-chart-line"></i> Statistik</button> <button class="btn btn-success edit-vociset-button" data-vociset-id="${s.id}" data-vociset-label="${s.label}" title="Bearbeiten"><i class="fas fa-edit"></i> Bearbeiten</button> </div>`; vociSetsContainer.appendChild(li); }); } else { vociSetsContainer.innerHTML = '<p>Keine Sets.</p>'; } } catch (e) { vociSetsContainer.innerHTML = '<p class="text-danger">Fehler.</p>'; console.error('Fehler loadVociSets:', e); } }
    async function loadClassDetails(id) { currentDepartmentIdForClassDetails = id; const url = `api/departments/${id}`; try { const data = await fetchData(url); classDetailsNameSpan.textContent = data.label; classStudentsListUl.innerHTML = ''; if (data.students?.length > 0) { data.students.forEach(s => { const li = document.createElement('li'); li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); li.innerHTML = `<span>${s.username}</span><button class="btn btn-danger btn-sm delete-student-button" data-student-id="${s.id}" data-department-id="${data.id}"><i class="fas fa-trash"></i></button>`; classStudentsListUl.appendChild(li); }); } else { classStudentsListUl.innerHTML = '<li class="list-group-item disabled">Keine Schüler</li>'; } hideVocisetDetailSection(); hideStatisticsSection(); showClassDetailsSection(); } catch (e) { classDetailsNameSpan.textContent = 'Fehler'; classStudentsListUl.innerHTML = '<li class="list-group-item disabled text-danger">Fehler</li>'; hideVocisetDetailSection(); hideStatisticsSection(); showClassDetailsSection(); alert('Fehler: ' + e.message); } }
    async function deleteStudent(depId, studId) { const url = `api/departments/${depId}/students/${studId}/delete`; try { await fetchData(url, { method: 'DELETE' }); alert('Schüler gelöscht!'); loadClassDetails(depId); loadKlassen(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function addStudentToClass(depId, username) { const url = `api/departments/${depId}/students/create`; try { await fetchData(url, { method: 'POST', body: JSON.stringify({ username: username }) }); alert('Schüler hinzugefügt!'); addStudentModal.hide(); loadClassDetails(depId); loadKlassen(); } catch (e) { alert('Fehler: ' + e.message); } }
    async function generateAndDownloadPasswords() { if (!currentDepartmentIdForClassDetails) { alert("Fehler: Klasse auswählen."); return; } const depId = currentDepartmentIdForClassDetails; const btnHtml = generatePasswordsButton.innerHTML; generatePasswordsButton.disabled = true; generatePasswordsButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span>...`; const url = `api/departments/${depId}/students/generate-passwords`; try { const data = await fetchData(url, { method: 'POST' }); if (data?.students?.length > 0) { const className = classDetailsNameSpan.textContent || 'klasse'; const safeName = className.replace(/[^a-z0-9]/gi, '_').toLowerCase(); const filename = `passwoerter_${safeName}_${new Date().toISOString().slice(0,10)}.csv`; downloadPasswordCsv(data.students, filename); alert(`${data.students.length} Passwörter generiert & heruntergeladen.`); } else if (data?.students) { alert("Keine Schüler gefunden."); } else { console.error("Unerwartete Antwort:", data); alert("Fehler: Unerwartete Antwort."); } } catch (e) { alert(`Fehler: ${e.message}`); } finally { generatePasswordsButton.disabled = false; generatePasswordsButton.innerHTML = btnHtml; } }
    function downloadPasswordCsv(students, filename) { const header = "Username,Password\n"; const escape = (f) => { const s = String(f ?? ''); return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s; }; const rows = students.map(s => `${escape(s.username)},${escape(s.password)}`).join("\n"); const content = header + rows; const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", filename); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); } else { alert("Download nicht direkt unterstützt."); window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(content)); } }

    // --- Statistik Funktion ---
    async function loadVocisetStatistics(vocisetId) {
        statsLoadingIndicator.style.display = 'block'; statsDepartmentsContainer.innerHTML = ''; statsGlobalInfoDiv.innerHTML = '';
        const url = `api/vocabulary-sets/${vocisetId}/statistics`;
        try {
            const statsData = await fetchData(url);
            const totalWords = statsData.wordsCount !== undefined ? statsData.wordsCount : 0;
            statsGlobalInfoDiv.innerHTML = `Gesamtzahl Wörter im Set: <strong>${totalWords}</strong>`;

            if (!statsData.departments || statsData.departments.length === 0) {
                statsDepartmentsContainer.innerHTML = '<p class="text-muted">Keine Klassen oder Schülerdaten für dieses Set.</p>';
                return;
            }

            statsData.departments.forEach(dept => {
                const departmentElement = document.createElement('div'); departmentElement.className = 'mb-4 p-3 border rounded';
                let totalLearnedInDept = 0; let studentCount = dept.students?.length || 0;
                const studentListElement = document.createElement('ul'); studentListElement.className = 'list-group list-group-flush mt-2';

                 if (studentCount > 0) {
                    dept.students.sort((a,b) => a.username.localeCompare(b.username)); // Sortiere Schüler alphabetisch
                    dept.students.forEach(student => {
                        const learned = student.learnedCount !== undefined ? student.learnedCount : 0;
                        totalLearnedInDept += learned;
                        const incorrect = totalWords > 0 ? totalWords - learned : 0;
                        const percentage = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0;
                        const studentItem = document.createElement('li'); studentItem.className = 'list-group-item';
                        studentItem.innerHTML = `
                            <div class="fw-bold">${student.username || 'Unbekannt'} <span class="badge bg-secondary float-end" title="Schüler ID">ID: ${student.id}</span></div>
                            <div class="d-flex align-items-center mt-1">
                               <span class="stats-label me-2" title="Anzahl richtig beantworteter Wörter">Richtig: ${learned}</span>
                               <div class="progress flex-grow-1" title="${percentage}% gelernt">
                                   <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage > 4 ? percentage+'%' : ''}</div>
                               </div>
                               <span class="stats-label ms-2" title="Anzahl noch nicht oder falsch beantworteter Wörter">Falsch: ${incorrect < 0 ? 0 : incorrect}</span>
                            </div>`;
                        studentListElement.appendChild(studentItem);
                    });
                 } else { studentListElement.innerHTML = '<li class="list-group-item text-muted">Keine Schülerdaten.</li>'; }

                const avgLearned = studentCount > 0 ? (totalLearnedInDept / studentCount) : 0;
                const avgIncorrect = totalWords > 0 ? totalWords - avgLearned : 0;
                const avgPercentage = totalWords > 0 ? Math.round((avgLearned / totalWords) * 100) : 0;
                const displayAvgLearned = avgLearned.toFixed(1); const displayAvgIncorrect = (avgIncorrect < 0 ? 0 : avgIncorrect).toFixed(1);

                departmentElement.innerHTML = `<h4>Klasse: ${dept.label || 'Unbekannt'} <span class="badge bg-secondary float-end" title="Klassen ID">ID: ${dept.id}</span></h4> <div class="mb-3"> <h5>Klassendurchschnitt (${studentCount} Schüler)</h5> ${studentCount > 0 ? `<div class="d-flex align-items-center mb-1"> <span class="stats-label me-2" title="Durchschnittlich richtig beantwortet">Richtig: Ø ${displayAvgLearned}</span> <div class="progress flex-grow-1" title="${avgPercentage}% durchschnittlich gelernt"> <div class="progress-bar bg-primary" role="progressbar" style="width: ${avgPercentage}%;" aria-valuenow="${avgPercentage}" aria-valuemin="0" aria-valuemax="100">${avgPercentage > 4 ? avgPercentage+'%' : ''}</div> </div> <span class="stats-label ms-2" title="Durchschnittlich falsch/nicht beantwortet">Falsch: Ø ${displayAvgIncorrect}</span> </div>` : `<p class="text-muted">Kein Durchschnitt berechenbar.</p>`} </div> <h5>Einzelauswertung Schüler</h5>`;
                departmentElement.appendChild(studentListElement);
                statsDepartmentsContainer.appendChild(departmentElement);
            });
        } catch (error) { console.error("Fehler Statistikdaten:", error); statsDepartmentsContainer.innerHTML = `<div class="alert alert-danger">Fehler Statistik: ${error.message}</div>`; }
        finally { statsLoadingIndicator.style.display = 'none'; }
    }

    // --- Initiales Laden ---
    loadKlassen(); loadVociSets();
});
    // --- Initiales Laden ---
    loadKlassen(); loadVociSets();
});