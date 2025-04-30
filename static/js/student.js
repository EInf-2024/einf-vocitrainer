document.addEventListener("DOMContentLoaded", function () {

    // --- HTML Elemente ---
    const vocisetsSection = document.getElementById("vocisets-section");
    const learnPage = document.getElementById("learn-page");
    const contextLearnPage = document.getElementById("context-learn-page");
    const vocisetsContainer = document.getElementById("vocisets-container");
    const flashcardsLearningContainer = document.getElementById("flashcards-learning");
    const learnSetTitle = document.getElementById("learn-set-title");
    const learnLoadingIndicator = document.getElementById("learn-loading-indicator");
    const logoutButton = document.getElementById("logoutButton");
    const startDirectLearnButton = document.getElementById("startDirectLearnButton");
    const startContextLearnButton = document.getElementById("startContextLearnButton");
    const checkAnswersButton = document.getElementById("checkAnswersButton");
    const backToSetsButton = document.getElementById("backToSetsButton");
    // Kontext Lern Elemente
    const contextLearnSetTitle = document.getElementById("context-learn-set-title");
    const contextLoadingIndicator = document.getElementById("context-loading-indicator");
    const contextContentArea = document.getElementById("context-content-area");
    const contextSentenceContainer = document.getElementById("context-sentence-container");
    const contextSentenceDisplay = document.getElementById("context-sentence-display");
    const contextAnswerInput = document.getElementById("context-answer-input");
    const checkContextAnswerButton = document.getElementById("checkContextAnswerButton");
    const contextFeedbackArea = document.getElementById("context-feedback-area");
    const nextContextSentenceButton = document.getElementById("nextContextSentenceButton");
    const contextNoSentences = document.getElementById("context-no-sentences");
    const backToSetsButtonContext = document.getElementById("backToSetsButtonContext");

    // --- Zustandsvariablen ---
    let currentSetDataForLearning = null;
    let selectedVociSetId = null;
    let selectedVociSetLabel = null;
    let contextSentences = [];
    let currentSentenceIndex = -1;
    let currentContextWordId = null;

    // --- Hilfsfunktion für Fetch ---
    async function fetchData(url, options = {}) {
        const defaultHeaders = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
        options.headers = { ...defaultHeaders, ...options.headers };
        try {
            const response = await fetch(url, options);
            const responseBody = await response.text();
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${url}`;
                let userFriendlyError = "Ein unbekannter Fehler ist aufgetreten.";
                try {
                    const errorJson = JSON.parse(responseBody); errorMsg += ` - ${JSON.stringify(errorJson)}`;
                     if (errorJson.error) userFriendlyError = errorJson.error; else if (errorJson.message) userFriendlyError = errorJson.message;
                } catch (e) { errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`; }
                 console.error("Fetch Error Details:", errorMsg); throw new Error(userFriendlyError);
            } return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) { console.error(`Network Error: Failed to fetch ${url}. Server running?`); throw new Error("Netzwerkfehler: Verbindung zur API fehlgeschlagen."); }
            console.error(`Fetch Exception (${options.method || 'GET'} ${url}):`, error); throw error;
        }
    }

    // --- VociSet Auswahl & Button Steuerung ---
    async function fetchVocabularySets() {
        vocisetsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Lade Vokabelsets...</p></div>';
        disableActionButtons();
        try {
            const data = await fetchData("api/vocabulary-sets");
            vocisetsContainer.innerHTML = "";
            if (!data.sets || data.sets.length === 0) { vocisetsContainer.innerHTML = '<div class="col-12"><p class="text-muted text-center">Keine Vokabelsets verfügbar.</p></div>'; return; }

            data.sets.forEach(set => {
                const setCardCol = document.createElement("div"); setCardCol.className = "col";

                // --- NEUE BERECHNUNG basierend auf learnedCount ---
                const totalWords = set.wordsCount || 0;
                // Nimm learnedCount direkt aus der API, default 0
                const correctCount = typeof set.learnedCount === 'number' ? set.learnedCount : 0;
                // Stelle sicher, dass incorrectCount nicht negativ wird
                const incorrectCount = Math.max(0, totalWords - correctCount);
                // Berechne den Prozentwert für die Progressbar
                const progressPercent = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
                // --- ENDE NEUE BERECHNUNG ---

                setCardCol.innerHTML = `
                    <div class="card vociset-card h-100" data-set-id="${set.id}" data-set-label="${escapeHtml(set.label)}">
                        <div class="card-body">
                            <h5 class="card-title">${escapeHtml(set.label)}</h5>
                            <p class="card-text">${totalWords} Wörter</p>
                             <div class="progress-section">
                                <div class="count-display">
                                    <span class="correct-count" title="Anzahl als 'gelernt' markiert">
                                        <i class="fas fa-check-circle"></i> ${correctCount} Gelernt
                                    </span>
                                    <span class="incorrect-count" title="Anzahl noch nicht gelernt/falsch">
                                        <i class="fas fa-times-circle"></i> ${incorrectCount} Offen
                                    </span>
                                </div>
                                <div class="progress" style="height: 18px;" title="${progressPercent}% gelernt">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercent}%" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                        ${progressPercent > 4 ? progressPercent + '%' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                const cardElement = setCardCol.querySelector('.vociset-card'); cardElement.onclick = () => selectVociSet(set.id, escapeHtml(set.label), cardElement);
                vocisetsContainer.appendChild(setCardCol);
            });
        } catch (error) { console.error("Fehler VociSets:", error); vocisetsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Fehler: ${error.message}</div></div>`; disableActionButtons(); }
    }

    function selectVociSet(setId, setLabel, clickedCardElement) {
        const currentlyActive = vocisetsContainer.querySelector('.vociset-card.active');
        if (currentlyActive) currentlyActive.classList.remove('active');
        selectedVociSetId = setId; selectedVociSetLabel = setLabel;
        clickedCardElement.classList.add('active'); enableActionButtons();
    }
    function disableActionButtons() { startDirectLearnButton.disabled = true; startContextLearnButton.disabled = true; }
    function enableActionButtons() { startDirectLearnButton.disabled = false; startContextLearnButton.disabled = false; }

    // --- Direktes Lernen ---
    async function loadSetForDirectLearning() {
        if (!selectedVociSetId) { alert("Wähle Set."); return; }
        showSection(learnPage); flashcardsLearningContainer.innerHTML = ""; learnLoadingIndicator.classList.remove('d-none');
        if(learnSetTitle) learnSetTitle.textContent = selectedVociSetLabel; checkAnswersButton.disabled = true;
        try {
            currentSetDataForLearning = await fetchData(`api/vocabulary-sets/${selectedVociSetId}`); learnLoadingIndicator.classList.add('d-none');
            if (!currentSetDataForLearning.words || currentSetDataForLearning.words.length === 0) { flashcardsLearningContainer.innerHTML = '<p class="list-group-item text-muted">Keine Vokabeln.</p>'; checkAnswersButton.disabled = true; return; }
            const shuffledWords = [...currentSetDataForLearning.words].sort(() => Math.random() - 0.5);
            shuffledWords.forEach((word) => {
                const div = document.createElement("div"); div.className = "list-group-item learning-item";
                if (word.id === null || word.id === undefined) { console.error("Ungültige ID:", word); div.classList.add('is-incorrect', 'border-danger'); div.innerHTML = `<span class="text-danger fw-bold">Fehler:</span> Daten ungültig.`; flashcardsLearningContainer.appendChild(div); return; }
                div.dataset.wordId = word.id; div.dataset.correctTranslation = escapeHtml(word.translation); const uniqueId = `learn-${word.id}-${Date.now()}`;
                div.innerHTML = `<label for="${uniqueId}" class="form-label"><strong>${escapeHtml(word.word)}:</strong></label><input type="text" class="form-control translation-input" id="${uniqueId}" placeholder="Übersetzung"><span class="check-indicator"></span><span class="correct-answer-display d-none"></span>`;
                flashcardsLearningContainer.appendChild(div);
            });
            checkAnswersButton.disabled = false;
        } catch (error) { console.error("Fehler Wörterladen:", error); learnLoadingIndicator.classList.add('d-none'); flashcardsLearningContainer.innerHTML = `<div class="list-group-item list-group-item-danger">Fehler: ${error.message}</div>`; checkAnswersButton.disabled = true; }
    }
    async function checkAndLogAnswers() {
        const learningItems = flashcardsLearningContainer.querySelectorAll('.learning-item'); if (learningItems.length === 0) return;
        checkAnswersButton.disabled = true; checkAnswersButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Prüfe...'; let promises = [];
        learningItems.forEach(item => {
            const input = item.querySelector('.translation-input'); const indicator = item.querySelector('.check-indicator'); const correctAnswerDisplay = item.querySelector('.correct-answer-display'); const wordId = item.dataset.wordId;
            if (!input || input.disabled) { console.log(`Wort ${wordId || '?'} übersprungen.`); return; }
            if (!wordId || wordId === 'null' || wordId === 'undefined') { console.error("Ungültige ID:", item); item.classList.add('is-incorrect'); input.classList.add('is-invalid'); indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-danger"></i>'; correctAnswerDisplay.textContent = 'Interner Fehler: ID!'; correctAnswerDisplay.classList.remove('d-none'); input.disabled = true; return; }
            const correctAnswer = item.dataset.correctTranslation; const userAnswer = input.value.trim();
            item.classList.remove('is-correct', 'is-incorrect'); input.classList.remove('is-valid', 'is-invalid'); indicator.innerHTML = ''; correctAnswerDisplay.classList.add('d-none'); correctAnswerDisplay.textContent = '';
            if (!userAnswer) {/* Leer ignorieren */} else {
                const numericWordId = parseInt(wordId, 10); if (isNaN(numericWordId)) { console.error(`ID ${wordId} ungültig`); return; }
                const url = `api/vocabulary-sets/${selectedVociSetId}/words/${numericWordId}/log`; const payload = { answer: userAnswer };
                const promise = fetchData(url, { method: 'PATCH', body: JSON.stringify(payload) })
                    .then(result => {
                        if (result.isCorrect) { item.classList.add('is-correct'); input.classList.add('is-valid'); indicator.innerHTML = '<i class="fas fa-check-circle text-success"></i>'; input.disabled = true; correctAnswerDisplay.classList.add('d-none'); }
                        else { item.classList.add('is-incorrect'); input.classList.add('is-invalid'); indicator.innerHTML = '<i class="fas fa-times-circle text-danger"></i>'; correctAnswerDisplay.innerHTML = `Richtig: <strong>${escapeHtml(result.correctAnswer || correctAnswer)}</strong>`; correctAnswerDisplay.classList.remove('d-none'); input.disabled = true; }
                    })
                    .catch(error => { console.error(`Log Fehler ${wordId}:`, error); item.classList.add('is-incorrect'); input.classList.add('is-invalid'); indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i>'; correctAnswerDisplay.textContent = `Fehler: ${error.message}`; correctAnswerDisplay.classList.remove('d-none'); input.disabled = true; });
                promises.push(promise);
            }
        });
        try { await Promise.all(promises); console.log("Direkt-Lernen fertig."); fetchVocabularySets(); } catch (error) { console.error("Promise.all Fehler (Direkt):", error); }
        finally { checkAnswersButton.disabled = false; checkAnswersButton.innerHTML = '<i class="fas fa-check-double"></i> Korrigieren & Speichern'; }
    }

    // --- Kontext Lernen ---
    async function loadSetForContextLearning() {
        if (!selectedVociSetId) { alert("Wähle Set."); return; }
        showSection(contextLearnPage); contextContentArea.classList.add('d-none'); contextLoadingIndicator.classList.remove('d-none');
        if(contextLearnSetTitle) contextLearnSetTitle.textContent = selectedVociSetLabel; contextNoSentences.classList.add('d-none'); resetContextUI();
        try {
            const data = await fetchData(`api/vocabulary-sets/${selectedVociSetId}/generate-context-sentences`); contextLoadingIndicator.classList.add('d-none');
            if (!data.contextSentences || data.contextSentences.length === 0) { contextNoSentences.classList.remove('d-none'); contextContentArea.classList.remove('d-none'); contextSentenceContainer.classList.add('d-none'); nextContextSentenceButton.disabled = true; return; }
            contextSentences = data.contextSentences; currentSentenceIndex = 0; displayCurrentContextSentence(); contextContentArea.classList.remove('d-none');
        } catch (error) { console.error("Fehler Kontextladen:", error); contextLoadingIndicator.classList.add('d-none'); contextContentArea.classList.remove('d-none'); contextNoSentences.textContent = `Fehler: ${error.message}`; contextNoSentences.classList.remove('d-none', 'text-muted'); contextNoSentences.classList.add('text-danger'); contextSentenceContainer.classList.add('d-none'); }
    }
    function displayCurrentContextSentence() {
        if (currentSentenceIndex < 0 || currentSentenceIndex >= contextSentences.length) { console.log("Keine Kontextsätze mehr."); contextSentenceContainer.classList.add('d-none'); nextContextSentenceButton.disabled = true; checkContextAnswerButton.disabled = true; return; }
        const sentenceData = contextSentences[currentSentenceIndex]; currentContextWordId = sentenceData.wordId;
        const sentenceHtml = escapeHtml(sentenceData.sentence).replace(/\{\}/g, '<span class="context-blank">_______</span>'); contextSentenceDisplay.innerHTML = sentenceHtml;
        resetContextUI(); contextSentenceContainer.dataset.correctAnswer = escapeHtml(sentenceData.correct);
        contextSentenceContainer.classList.remove('d-none'); checkContextAnswerButton.disabled = false; nextContextSentenceButton.disabled = true;
    }
    function resetContextUI() { contextAnswerInput.value = ""; contextAnswerInput.disabled = false; contextAnswerInput.classList.remove('is-valid', 'is-invalid'); contextFeedbackArea.innerHTML = ""; contextFeedbackArea.className = 'mt-2'; }
    function showNextContextSentence() { currentSentenceIndex++; displayCurrentContextSentence(); }
    async function checkContextAnswer() {
        const userAnswer = contextAnswerInput.value.trim(); const correctAnswer = contextSentenceContainer.dataset.correctAnswer;
        if (!userAnswer) { contextFeedbackArea.textContent = "Gib das Wort ein."; contextFeedbackArea.className = 'mt-2 text-warning'; contextAnswerInput.classList.add('is-invalid'); return; }
        checkContextAnswerButton.disabled = true; contextAnswerInput.disabled = true; const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        if (isCorrect) { contextAnswerInput.classList.add('is-valid'); contextFeedbackArea.textContent = "Richtig!"; contextFeedbackArea.className = 'mt-2 text-success'; }
        else { contextAnswerInput.classList.add('is-invalid'); contextFeedbackArea.innerHTML = `Falsch. Richtig: <strong class="correct-answer">${correctAnswer}</strong>`; contextFeedbackArea.className = 'mt-2 text-danger'; }
        if (currentContextWordId !== null && currentContextWordId !== undefined) {
            const numericWordId = parseInt(currentContextWordId, 10); if (isNaN(numericWordId)) { console.error(`Ungültige Kontext ID ${currentContextWordId}`); return; }
            const url = `api/vocabulary-sets/${selectedVociSetId}/words/${numericWordId}/log`; const payload = { answer: userAnswer };
            try { const result = await fetchData(url, { method: 'PATCH', body: JSON.stringify(payload) }); console.log(`Kontext geloggt ${currentContextWordId}. API: ${result.isCorrect}`); fetchVocabularySets(); }
            catch (error) { console.error(`Log Fehler Kontext ${currentContextWordId}:`, error); contextFeedbackArea.innerHTML += `<br><small class="text-muted">(Fehler: ${error.message})</small>`; }
        } else { console.error("Keine ID zum Loggen Kontext."); contextFeedbackArea.innerHTML += `<br><small class="text-muted">(Fehler intern.)</small>`; }
        if (currentSentenceIndex < contextSentences.length - 1) { nextContextSentenceButton.disabled = false; }
        else { nextContextSentenceButton.disabled = true; contextFeedbackArea.innerHTML += `<br><small class="text-muted">Letzter Satz.</small>`; }
    }

    // --- Navigation & Util ---
    function showSection(sectionToShow) {
        const sections = document.querySelectorAll('#vocisets-section, #learn-page, #context-learn-page, #start-action-section');
        sections.forEach(sec => { sec.classList.remove('active-section'); sec.classList.add('d-none'); });
        if (sectionToShow) { sectionToShow.classList.remove('d-none'); sectionToShow.classList.add('active-section'); }
        else { vocisetsSection.classList.remove('d-none'); vocisetsSection.classList.add('active-section'); document.getElementById('start-action-section').classList.remove('d-none'); document.getElementById('start-action-section').classList.add('active-section'); }
        window.scrollTo(0, 0);
    }
    function backToVocisetOverview() {
        showSection(null); flashcardsLearningContainer.innerHTML = ""; contextSentences = []; currentSentenceIndex = -1;
        const currentlyActive = vocisetsContainer.querySelector('.vociset-card.active'); if (currentlyActive) currentlyActive.classList.remove('active');
        selectedVociSetId = null; selectedVociSetLabel = null; disableActionButtons(); currentSetDataForLearning = null; currentContextWordId = null;
    }
    function escapeHtml(unsafe) { if (typeof unsafe !== 'string') return unsafe; return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\\\"").replace(/'/g, "'"); }

    // --- Event Listeners ---
    if(logoutButton) logoutButton.onclick = () => { window.location.href = '/'; };
    if(startDirectLearnButton) startDirectLearnButton.onclick = loadSetForDirectLearning;
    if(startContextLearnButton) startContextLearnButton.onclick = loadSetForContextLearning;
    if(checkAnswersButton) checkAnswersButton.onclick = checkAndLogAnswers;
    if(backToSetsButton) backToSetsButton.onclick = backToVocisetOverview;
    if(checkContextAnswerButton) checkContextAnswerButton.onclick = checkContextAnswer;
    if(nextContextSentenceButton) nextContextSentenceButton.onclick = showNextContextSentence;
    if(backToSetsButtonContext) backToSetsButtonContext.onclick = backToVocisetOverview;

    // Initiales Laden
    fetchVocabularySets();
    showSection(null);
});