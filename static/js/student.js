document.addEventListener("DOMContentLoaded", function () {

    const vocisetsSection = document.getElementById("vocisets-section");
    const learnPage = document.getElementById("learn-page");
    const contextLearnPage = document.getElementById("context-learn-page");
    const vocisetsContainer = document.getElementById("vocisets-container");
    const flashcardsLearningContainer = document.getElementById("flashcards-learning");
    const learnSetTitle = document.getElementById("learn-set-title"); // Span im h3
    const learnLoadingIndicator = document.getElementById("learn-loading-indicator");
    const logoutButton = document.getElementById("logoutButton");
    const startDirectLearnButton = document.getElementById("startDirectLearnButton");
    const startContextLearnButton = document.getElementById("startContextLearnButton");
    const selectedSetInfo = document.getElementById("selected-set-info");
    const checkAnswersButton = document.getElementById("checkAnswersButton");
    const backToSetsButton = document.getElementById("backToSetsButton");
    const backToSetsButtonContext = document.getElementById("backToSetsButtonContext");

    let currentSetDataForLearning = null;
    let selectedVociSetId = null;
    let selectedVociSetLabel = null;

    async function fetchData(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        options.headers = { ...defaultHeaders, ...options.headers };
        try {
            const response = await fetch(url, options);
            const responseBody = await response.text();
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${url}`;
                let userFriendlyError = "Ein unbekannter Fehler ist aufgetreten.";
                try {
                    const errorJson = JSON.parse(responseBody);
                    errorMsg += ` - ${JSON.stringify(errorJson)}`;
                     if (errorJson.error) { userFriendlyError = errorJson.error; }
                     else if (errorJson.message) { userFriendlyError = errorJson.message; }
                } catch (e) { errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`; }
                 console.error("Fetch Error Details:", errorMsg);
                throw new Error(userFriendlyError);
            }
            return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                 console.error(`Network Error: Failed to fetch ${url}. Server running?`);
                 throw new Error("Netzwerkfehler: Verbindung zur API fehlgeschlagen.");
            }
            console.error(`Fetch Exception (${options.method || 'GET'} ${url}):`, error);
            throw error;
        }
    }

    async function fetchVocabularySets() {
        vocisetsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Lade Vokabelsets...</p></div>';
        disableActionButtons();
        try {
            const data = await fetchData("/api/vocabulary-sets");
            vocisetsContainer.innerHTML = "";
            if (!data.sets || data.sets.length === 0) {
                vocisetsContainer.innerHTML = '<div class="col-12"><p class="text-muted text-center">Keine Vokabelsets für dich verfügbar.</p></div>';
                return;
            }
            data.sets.forEach(set => {
                const setCardCol = document.createElement("div");
                setCardCol.className = "col"; // Grid-Spalte
                // Card-Struktur wie bei Teacher-Klassen
                setCardCol.innerHTML = `
                    <div class="card vociset-card h-100" data-set-id="${set.id}" data-set-label="${escapeHtml(set.label)}">
                        <div class="card-body">
                            <h5 class="card-title">${escapeHtml(set.label)}</h5>
                            <p class="card-text">${set.wordsCount} Wörter</p>
                             <div class="mt-auto pt-2">
                                <div class="progress" style="height: 18px;" title="${set.progress}% gelernt">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: ${set.progress}%" aria-valuenow="${set.progress}" aria-valuemin="0" aria-valuemax="100">
                                        ${set.progress > 4 ? set.progress + '%' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                const cardElement = setCardCol.querySelector('.vociset-card');
                cardElement.onclick = () => selectVociSet(set.id, escapeHtml(set.label), cardElement);
                vocisetsContainer.appendChild(setCardCol);
            });
        } catch (error) {
            console.error("Fehler beim Abrufen der Vokabelsets:", error);
            vocisetsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Fehler beim Laden der Sets: ${error.message}</div></div>`;
            disableActionButtons();
        }
    }

    function selectVociSet(setId, setLabel, clickedCardElement) {
        const currentlyActive = vocisetsContainer.querySelector('.vociset-card.active');
        if (currentlyActive) {
            currentlyActive.classList.remove('active');
        }
        selectedVociSetId = setId;
        selectedVociSetLabel = setLabel;
        clickedCardElement.classList.add('active');
        enableActionButtons(setLabel);
    }

    function disableActionButtons() {
        startDirectLearnButton.disabled = true;
        startContextLearnButton.disabled = true;
        selectedSetInfo.textContent = "Kein Set ausgewählt";
        selectedSetInfo.classList.remove('alert-primary', 'border-primary'); // Aktiv-Styling entfernen
        selectedSetInfo.classList.add('alert-light');
    }

    function enableActionButtons(setLabel) {
        startDirectLearnButton.disabled = false;
        startContextLearnButton.disabled = false;
        selectedSetInfo.textContent = `Ausgewählt: ${setLabel}`;
        selectedSetInfo.classList.remove('alert-light');
        selectedSetInfo.classList.add('alert-primary','border-primary'); // Aktiv-Styling hinzufügen
    }

    async function loadSetForDirectLearning() {
        if (!selectedVociSetId) {
            alert("Bitte wähle zuerst ein Vokabelset aus.");
            return;
        }
        showSection(learnPage);
        flashcardsLearningContainer.innerHTML = "";
        learnLoadingIndicator.classList.remove('d-none');
        if(learnSetTitle) learnSetTitle.textContent = selectedVociSetLabel; // Setzt den Text im Span
        checkAnswersButton.disabled = true;

        try {
            currentSetDataForLearning = await fetchData(`/api/vocabulary-sets/${selectedVociSetId}`);
            learnLoadingIndicator.classList.add('d-none');

            if (!currentSetDataForLearning.words || currentSetDataForLearning.words.length === 0) {
                flashcardsLearningContainer.innerHTML = '<p class="list-group-item text-muted">Dieses Set enthält keine Vokabeln zum Lernen.</p>';
                 checkAnswersButton.disabled = true;
                return;
            }

            const shuffledWords = [...currentSetDataForLearning.words].sort(() => Math.random() - 0.5);

            shuffledWords.forEach((word) => {
                 // --- JS Anpassung: Nutze list-group-item Klasse ---
                const div = document.createElement("div");
                // Füge list-group-item hinzu und behalte learning-item für spezifische Styles/Logik
                div.className = "list-group-item learning-item";
                if (word.id === null || word.id === undefined) {
                    console.error("Wort vom Backend erhalten ohne gültige ID:", word);
                    // Fehlerhaftes Item mit Meldung anzeigen statt es zu überspringen
                    div.classList.add('is-incorrect'); // Markieren als fehlerhaft
                    div.innerHTML = `<span class="text-danger fw-bold">Fehler:</span> Ungültige Wortdaten vom Server (Keine ID).`;
                    flashcardsLearningContainer.appendChild(div);
                    return; // Nächstes Wort
                }
                div.dataset.wordId = word.id;
                div.dataset.correctTranslation = escapeHtml(word.translation);

                const uniqueId = `learn-${word.id}-${Date.now()}`;
                // Struktur bleibt gleich, aber Elternelement ist jetzt list-group
                div.innerHTML = `
                     <label for="${uniqueId}" class="form-label"><strong>${escapeHtml(word.word)}:</strong></label>
                     <input type="text" class="form-control translation-input" id="${uniqueId}" placeholder="Übersetzung eingeben">
                     <span class="check-indicator"></span>
                     <span class="correct-answer-display d-none"></span>
                `;
                flashcardsLearningContainer.appendChild(div);
            });
            checkAnswersButton.disabled = false;

        } catch (error) {
            console.error("Fehler beim Laden der Wörter für Lernseite:", error);
            learnLoadingIndicator.classList.add('d-none');
            flashcardsLearningContainer.innerHTML = `<div class="list-group-item list-group-item-danger">Fehler beim Laden der Wörter: ${error.message}</div>`;
            checkAnswersButton.disabled = true;
        }
    }

    async function checkAndLogAnswers() {
        const learningItems = flashcardsLearningContainer.querySelectorAll('.learning-item');
        if (learningItems.length === 0) return;

        learningItems.forEach(item => {
             const input = item.querySelector('.translation-input');
             if (input) input.disabled = false; // Alle reaktivieren
        });

        checkAnswersButton.disabled = true;
        checkAnswersButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Prüfe...';
        let promises = [];

        learningItems.forEach(item => {
            const input = item.querySelector('.translation-input');
            const indicator = item.querySelector('.check-indicator');
            const correctAnswerDisplay = item.querySelector('.correct-answer-display');
            const wordId = item.dataset.wordId;

            // Prüfe, ob das Item überhaupt einen Input hat (relevant für Items mit ID-Fehler)
            if (!input) {
                 console.warn("Überspringe Lern-Item ohne Input (wahrscheinlich ID-Fehler):", item);
                 return; // Nächstes Item
            }

            if (!wordId || wordId === 'null' || wordId === 'undefined') {
                // Dieser Fall sollte durch die Prüfung in loadSetForDirectLearning abgefangen sein,
                // aber zur Sicherheit nochmal hier behandeln.
                console.error("Ungültige oder fehlende wordId beim Prüfen:", item);
                item.classList.add('is-incorrect');
                input.classList.add('is-invalid');
                indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-danger"></i>';
                correctAnswerDisplay.textContent = 'Interner Fehler: Wort-ID fehlt!';
                correctAnswerDisplay.classList.remove('d-none');
                input.disabled = true;
                return;
            }

            const correctAnswer = item.dataset.correctTranslation;
            const userAnswer = input.value.trim();

            item.classList.remove('is-correct', 'is-incorrect');
            input.classList.remove('is-valid', 'is-invalid');
            indicator.innerHTML = '';
            correctAnswerDisplay.classList.add('d-none');
            correctAnswerDisplay.textContent = '';

            if (!userAnswer) {
                 item.classList.add('is-incorrect');
                 input.classList.add('is-invalid'); // Markieren, aber kein Icon
                 // Input bleibt editierbar
            } else {
                 const promise = logAnswer(wordId, userAnswer)
                     .then(result => {
                         if (result.isCorrect) {
                             item.classList.add('is-correct');
                             input.classList.add('is-valid');
                             indicator.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                             input.disabled = false;
                         } else {
                             item.classList.add('is-incorrect');
                             input.classList.add('is-invalid');
                             indicator.innerHTML = '<i class="fas fa-times-circle text-danger"></i>';
                             correctAnswerDisplay.innerHTML = `Richtig: <strong>${escapeHtml(result.correctAnswer || correctAnswer)}</strong>`;
                             correctAnswerDisplay.classList.remove('d-none');
                             input.disabled = true;
                         }
                     })
                     .catch(error => {
                         console.error(`Fehler beim Loggen für Wort ${wordId}:`, error);
                         item.classList.add('is-incorrect');
                         input.classList.add('is-invalid');
                         indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i>';
                         correctAnswerDisplay.textContent = `Fehler: ${error.message}`;
                         correctAnswerDisplay.classList.remove('d-none');
                         input.disabled = true;
                     });
                 promises.push(promise);
            }
        });

        try {
             await Promise.all(promises);
             console.log("Alle gültigen Antworten verarbeitet.");
             fetchVocabularySets();
        } catch (error) {
             console.error("Ein Fehler trat beim Warten auf die Antwort-Logs auf:", error);
        } finally {
             checkAnswersButton.disabled = false;
             checkAnswersButton.innerHTML = '<i class="fas fa-check-double"></i> Korrigieren & Speichern';
        }
    }

    async function logAnswer(wordId, userAnswer) {
        if (!selectedVociSetId) throw new Error("Kein VociSet ausgewählt für API Call.");
        const numericWordId = parseInt(wordId, 10);
        if (isNaN(numericWordId)) throw new Error(`Ungültige Wort-ID: ${wordId}`);
        const url = `/api/vocabulary-sets/${selectedVociSetId}/words/${numericWordId}/log`;
        const payload = { answer: userAnswer };
        try { return await fetchData(url, { method: 'PATCH', body: JSON.stringify(payload) }); }
        catch (error) { throw error; }
    }

    function showSection(sectionToShow) {
        document.querySelectorAll('main.container > section').forEach(sec => sec.classList.add('d-none'));
        sectionToShow.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    function backToVocisetOverview() {
        showSection(vocisetsSection);
        flashcardsLearningContainer.innerHTML = "";
        const currentlyActive = vocisetsContainer.querySelector('.vociset-card.active');
        if (currentlyActive) currentlyActive.classList.remove('active');
        selectedVociSetId = null;
        selectedVociSetLabel = null;
        disableActionButtons();
        currentSetDataForLearning = null;
    }

    function showContextLearning() {
         if (!selectedVociSetId) { alert("Bitte wähle zuerst ein Vokabelset aus."); return; }
         const contextTitle = document.getElementById('context-learn-set-title');
         if(contextTitle) contextTitle.textContent = selectedVociSetLabel;
         showSection(contextLearnPage);
         console.log("Kontext lernen für Set:", selectedVociSetId);
    }

    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\\\"").replace(/'/g, "'");
     }

    // Event Listeners
    if(logoutButton) logoutButton.onclick = () => { window.location.href = '/'; }; // Wie Teacher
    if(startDirectLearnButton) startDirectLearnButton.onclick = loadSetForDirectLearning;
    if(startContextLearnButton) startContextLearnButton.onclick = showContextLearning;
    if(checkAnswersButton) checkAnswersButton.onclick = checkAndLogAnswers;
    if(backToSetsButton) backToSetsButton.onclick = backToVocisetOverview;
    if(backToSetsButtonContext) backToSetsButtonContext.onclick = backToVocisetOverview;

    // Initiales Laden
    fetchVocabularySets();
});