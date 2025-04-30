document.addEventListener("DOMContentLoaded", function () {
    // Stellt sicher, dass das Skript erst ausgeführt wird, nachdem das gesamte HTML-Dokument geladen und geparst wurde.

    // Referenzen auf HTML-Elemente holen, die im Skript verwendet werden.
    const vocisetsSection = document.getElementById("vocisets-section"); // Bereich zur Anzeige der Vokabelsets
    const learnPage = document.getElementById("learn-page"); // Bereich für das direkte Karteikartenlernen
    const contextLearnPage = document.getElementById("context-learn-page"); // Bereich für das kontextbasierte Lernen
    const vocisetsContainer = document.getElementById("vocisets-container"); // Container, in dem die Vokabelset-Karten angezeigt werden
    const flashcardsLearningContainer = document.getElementById("flashcards-learning"); // Container für einzelne Karteikarten beim direkten Lernen
    const learnSetTitle = document.getElementById("learn-set-title"); // Zeigt den Titel des Sets an, das direkt gelernt wird
    const learnLoadingIndicator = document.getElementById("learn-loading-indicator"); // Ladeanzeige (Spinner), die beim Laden der Wörter für das direkte Lernen angezeigt wird
    const logoutButton = document.getElementById("logoutButton"); // Button für den Benutzer-Logout
    const startDirectLearnButton = document.getElementById("startDirectLearnButton"); // Button zum Starten des direkten Lernmodus
    const startContextLearnButton = document.getElementById("startContextLearnButton"); // Button zum Starten des Kontext-Lernmodus
    const checkAnswersButton = document.getElementById("checkAnswersButton"); // Button zum Überprüfen der Antworten im direkten Lernmodus
    const backToSetsButton = document.getElementById("backToSetsButton"); // Button, um vom direkten Lernen zur Set-Auswahl zurückzukehren

    // --- Kontext-Lern-Elemente ---
    // Referenzen auf Elemente speziell für die Kontext-Lern-Oberfläche holen.
    const contextLearnSetTitle = document.getElementById("context-learn-set-title"); // Zeigt den Titel des Sets an, das im Kontext gelernt wird
    const contextLoadingIndicator = document.getElementById("context-loading-indicator"); // Ladeanzeige (Spinner), die beim Laden der Kontextsätze angezeigt wird
    const contextContentArea = document.getElementById("context-content-area"); // Hauptinhaltsbereich für das Kontextlernen (enthält Satz oder Nachrichten)
    const contextSentenceContainer = document.getElementById("context-sentence-container"); // Container für Satzanzeige, Eingabe und Feedback
    const contextSentenceDisplay = document.getElementById("context-sentence-display"); // Hier wird der Satz mit einer Lücke angezeigt
    const contextAnswerInput = document.getElementById("context-answer-input"); // Eingabefeld für die Benutzerantwort im Kontextmodus
    const checkContextAnswerButton = document.getElementById("checkContextAnswerButton"); // Button zum Überprüfen der Kontextantwort
    const contextFeedbackArea = document.getElementById("context-feedback-area"); // Bereich zur Anzeige von Feedback (richtig/falsch) für die Kontextantwort
    const nextContextSentenceButton = document.getElementById("nextContextSentenceButton"); // Button zum Laden des nächsten Kontextsatzes
    const contextNoSentences = document.getElementById("context-no-sentences"); // Meldung, die angezeigt wird, wenn keine Kontextsätze verfügbar/generiert sind
    const backToSetsButtonContext = document.getElementById("backToSetsButtonContext"); // Button, um vom Kontextlernen zur Set-Auswahl zurückzukehren

    // --- Zustandsvariablen ---
    // Variablen, um den aktuellen Zustand der Anwendung zu verfolgen.
    let currentSetDataForLearning = null; // Enthält die vollständigen Daten (Wörter) für das Set, das gerade direkt gelernt wird
    let selectedVociSetId = null;         // ID des vom Benutzer ausgewählten Vokabelsets
    let selectedVociSetLabel = null;      // Bezeichnung (Name) des vom Benutzer ausgewählten Vokabelsets
    let contextSentences = [];            // Array zum Speichern der für das Kontextlernen abgerufenen Sätze
    let currentSentenceIndex = -1;        // Index des aktuell angezeigten Satzes im contextSentences-Array
    let currentContextWordId = null;      // Die ID des Wortes, das im aktuellen Kontextsatz getestet wird

    // --- Hilfsfunktion für Fetch ---
    // Wiederverwendbare asynchrone Funktion zum Stellen von API-Anfragen.
    async function fetchData(url, options = {}) {
        // Standard-Header, die JSON-Inhaltstyp sicherstellen und die Anfrage als AJAX identifizieren.
        const defaultHeaders = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
        // Standard-Header mit benutzerdefinierten Headern aus den Optionen zusammenführen.
        options.headers = { ...defaultHeaders, ...options.headers };
        try {
            // Die Fetch-Anfrage durchführen.
            const response = await fetch(url, options);
            // Den Antwortkörper zuerst als Text lesen, um potenzielle Nicht-JSON-Fehlerantworten zu behandeln.
            const responseBody = await response.text();
            // Prüfen, ob der HTTP-Antwortstatus Erfolg anzeigt (z.B. 200 OK).
            if (!response.ok) {
                // Wenn nicht OK, eine detaillierte Fehlermeldung erstellen.
                let errorMsg = `HTTP error! status: ${response.status} (${response.statusText}) for ${url}`;
                let userFriendlyError = "Ein unbekannter Fehler ist aufgetreten."; // Standardmäßige benutzerfreundliche Fehlermeldung
                try {
                    // Versuchen, den Antwortkörper als JSON zu parsen, um eine spezifische Fehlermeldung von der API zu erhalten.
                    const errorJson = JSON.parse(responseBody);
                    errorMsg += ` - ${JSON.stringify(errorJson)}`;
                    // Das Fehler- oder Nachrichtenfeld aus dem JSON verwenden, falls verfügbar.
                    if (errorJson.error) userFriendlyError = errorJson.error;
                    else if (errorJson.message) userFriendlyError = errorJson.message;
                } catch (e) {
                    // Wenn das Parsen fehlschlägt, den Anfang des rohen Antwortkörpers in die detaillierte Fehlermeldung aufnehmen.
                    errorMsg += ` - ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`;
                }
                // Den detaillierten Fehler zur Fehlerbehebung in der Konsole protokollieren.
                console.error("Fetch Error Details:", errorMsg);
                // Einen Fehler mit der benutzerfreundlichen Meldung werfen, der von der aufrufenden Funktion abgefangen wird.
                throw new Error(userFriendlyError);
            }
            // Wenn die Antwort erfolgreich war, den Körper als JSON parsen (falls er nicht leer ist).
            // Die geparsten Daten oder ein leeres Objekt zurückgeben, wenn der Körper leer war.
            return responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
            // Netzwerkfehler abfangen (z.B. Server nicht erreichbar, DNS-Probleme).
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error(`Network Error: Failed to fetch ${url}. Server running?`);
                throw new Error("Netzwerkfehler: Verbindung zur API fehlgeschlagen.");
            }
            // Oben geworfene Fehler (wie nicht-OK-Antworten) oder andere unerwartete Fehler während des Fetches abfangen.
            console.error(`Fetch Exception (${options.method || 'GET'} ${url}):`, error);
            // Den Fehler erneut werfen, damit die aufrufende Funktion weiß, dass etwas schiefgegangen ist.
            throw error;
        }
    }

    // --- VociSet Auswahl & Button Steuerung ---
    // Ruft die Liste der verfügbaren Vokabelsets von der API ab und zeigt sie an.
    async function fetchVocabularySets() {
        // Eine Ladeanzeige anzeigen, während die Daten abgerufen werden.
        vocisetsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Lade Vokabelsets...</p></div>';
        // Aktionsbuttons (Lernen direkt/Kontext) deaktivieren, bis ein Set ausgewählt ist.
        disableActionButtons();
        try {
            // Die Liste der Sets vom API-Endpunkt abrufen.
            const data = await fetchData("api/vocabulary-sets");
            // Die Ladeanzeige entfernen.
            vocisetsContainer.innerHTML = "";
            // Prüfen, ob Sets zurückgegeben wurden.
            if (!data.sets || data.sets.length === 0) {
                // Eine Meldung anzeigen, wenn keine Sets verfügbar sind.
                vocisetsContainer.innerHTML = '<div class="col-12"><p class="text-muted text-center">Keine Vokabelsets verfügbar.</p></div>';
                return; // Die Funktion vorzeitig beenden.
            }

            // Jedes von der API empfangene Set durchlaufen.
            data.sets.forEach(set => {
                // Ein Spaltenelement für die Set-Karte erstellen (Bootstrap-Grid).
                const setCardCol = document.createElement("div");
                setCardCol.className = "col";

                // --- Fortschritt basierend auf learnedCount berechnen ---
                const totalWords = set.wordsCount || 0; // Gesamtanzahl der Wörter im Set.
                // Anzahl der gelernten Wörter direkt aus den API-Daten holen, Standardwert 0, falls fehlt.
                const correctCount = typeof set.learnedCount === 'number' ? set.learnedCount : 0;
                // Anzahl der falschen/verbleibenden Wörter berechnen, sicherstellen, dass sie nicht negativ ist.
                const incorrectCount = Math.max(0, totalWords - correctCount);
                // Den Prozentsatz der gelernten Wörter für die Fortschrittsanzeige berechnen.
                const progressPercent = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
                // --- Ende Berechnung ---

                // Die HTML-Struktur für die Vokabelset-Karte mithilfe von Template-Literalen erstellen.
                // Enthält Titel, Wortanzahl, Fortschrittsanzeige (Zahlen und Balken).
                // Verwendet escapeHtml, um XSS-Schwachstellen durch Set-Bezeichnungen zu verhindern.
                // data-Attribute speichern die Set-ID und -Bezeichnung zur späteren Verwendung.
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
                // Das gerade erstellte Kartenelement holen.
                const cardElement = setCardCol.querySelector('.vociset-card');
                // Einen Klick-Event-Listener zum Kartenelement hinzufügen, um die Auswahl zu handhaben.
                cardElement.onclick = () => selectVociSet(set.id, escapeHtml(set.label), cardElement);
                // Die neue Kartenspalte zum Container hinzufügen.
                vocisetsContainer.appendChild(setCardCol);
            });
        } catch (error) {
            // Fehler beim Abrufen oder Verarbeiten der Sets behandeln.
            console.error("Fehler VociSets:", error);
            // Eine Fehlermeldung im Container anzeigen.
            vocisetsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Fehler: ${error.message}</div></div>`;
            // Sicherstellen, dass die Aktionsbuttons bei einem Fehler deaktiviert bleiben.
            disableActionButtons();
        }
    }

    // Behandelt die Auswahl einer Vokabelset-Karte.
    function selectVociSet(setId, setLabel, clickedCardElement) {
        // Eine eventuell aktuell ausgewählte Karte finden (mit der Klasse 'active').
        const currentlyActive = vocisetsContainer.querySelector('.vociset-card.active');
        // Wenn zuvor eine Karte ausgewählt war, die Klasse 'active' entfernen.
        if (currentlyActive) {
            currentlyActive.classList.remove('active');
        }
        // Die globalen Zustandsvariablen mit der ID und Bezeichnung des ausgewählten Sets aktualisieren.
        selectedVociSetId = setId;
        selectedVociSetLabel = setLabel;
        // Die Klasse 'active' zur neu angeklickten Karte hinzufügen für visuelles Feedback.
        clickedCardElement.classList.add('active');
        // Die Aktionsbuttons aktivieren (Direktes Lernen starten, Kontextlernen starten).
        enableActionButtons();
    }

    // Deaktiviert die Hauptaktionsbuttons (Lernen direkt/Kontext).
    function disableActionButtons() {
        startDirectLearnButton.disabled = true;
        startContextLearnButton.disabled = true;
    }

    // Aktiviert die Hauptaktionsbuttons.
    function enableActionButtons() {
        startDirectLearnButton.disabled = false;
        startContextLearnButton.disabled = false;
    }

    // --- Direktes Lernen ---
    // Lädt das ausgewählte Vokabelset für den direkten Lernmodus (Karteikarten).
    async function loadSetForDirectLearning() {
        // Sicherstellen, dass ein Set ausgewählt wurde.
        if (!selectedVociSetId) {
            alert("Wähle bitte zuerst ein Set aus."); // Benutzerfreundliche Meldung
            return;
        }
        // Die Ansicht zur Seite für direktes Lernen wechseln.
        showSection(learnPage);
        // Vorherige Karteikarten löschen.
        flashcardsLearningContainer.innerHTML = "";
        // Die Ladeanzeige anzeigen.
        learnLoadingIndicator.classList.remove('d-none');
        // Den Titel der Lernseite auf die Bezeichnung des ausgewählten Sets setzen.
        if(learnSetTitle) learnSetTitle.textContent = selectedVociSetLabel;
        // Den "Antworten prüfen"-Button initial deaktivieren.
        checkAnswersButton.disabled = true;
        try {
            // Die vollständige Wortliste für das ausgewählte Set von der API abrufen.
            currentSetDataForLearning = await fetchData(`api/vocabulary-sets/${selectedVociSetId}`);
            // Die Ladeanzeige ausblenden.
            learnLoadingIndicator.classList.add('d-none');
            // Prüfen, ob das Set Wörter enthält.
            if (!currentSetDataForLearning.words || currentSetDataForLearning.words.length === 0) {
                // Eine Meldung anzeigen, wenn das Set leer ist.
                flashcardsLearningContainer.innerHTML = '<p class="list-group-item text-muted">Dieses Set enthält keine Vokabeln.</p>';
                checkAnswersButton.disabled = true; // Button deaktiviert lassen
                return; // Funktion beenden
            }
            // Die Wörter für das Lernen zufällig mischen. Erstellt eine flache Kopie vor dem Sortieren.
            const shuffledWords = [...currentSetDataForLearning.words].sort(() => Math.random() - 0.5);
            // Die gemischten Wörter durchlaufen und für jedes ein Karteikartenelement erstellen.
            shuffledWords.forEach((word) => {
                const div = document.createElement("div");
                div.className = "list-group-item learning-item"; // Grundlegendes Styling und Identifikationsklasse
                // Grundlegende Validierung: Prüfen, ob das Wortobjekt eine gültige ID hat.
                if (word.id === null || word.id === undefined) {
                    console.error("Ungültige Wort-ID empfangen:", word);
                    // Einen Fehlerzustand visuell auf dem Element anzeigen.
                    div.classList.add('is-incorrect', 'border-danger');
                    div.innerHTML = `<span class="text-danger fw-bold">Fehler:</span> Wortdaten sind ungültig.`;
                    flashcardsLearningContainer.appendChild(div);
                    return; // Dieses Wort überspringen
                }
                // Die Wort-ID und die korrekte Übersetzung in data-Attributen für die spätere Überprüfung speichern.
                div.dataset.wordId = word.id;
                div.dataset.correctTranslation = escapeHtml(word.translation);
                // Eine eindeutige ID für das Eingabeelement erstellen für Barrierefreiheit (Verknüpfung von Label und Input).
                const uniqueId = `learn-${word.id}-${Date.now()}`;
                // Den inneren HTML-Code für das Karteikartenelement festlegen: Label, Eingabefeld, Feedback-Indikatoren.
                div.innerHTML = `
                    <label for="${uniqueId}" class="form-label"><strong>${escapeHtml(word.word)}:</strong></label>
                    <input type="text" class="form-control translation-input" id="${uniqueId}" placeholder="Übersetzung eingeben">
                    <span class="check-indicator"></span> <!-- Platzhalter für Häkchen/Kreuz-Symbol -->
                    <span class="correct-answer-display d-none"></span> <!-- Platzhalter zur Anzeige der richtigen Antwort bei Fehler -->
                `;
                // Das erstellte Karteikartenelement zum Container hinzufügen.
                flashcardsLearningContainer.appendChild(div);
            });
            // Den "Antworten prüfen"-Button aktivieren, da die Wörter jetzt geladen sind.
            checkAnswersButton.disabled = false;
        } catch (error) {
            // Fehler beim Laden der Wörter behandeln.
            console.error("Fehler beim Laden der Wörter für direktes Lernen:", error);
            learnLoadingIndicator.classList.add('d-none'); // Ladeanzeige ausblenden
            // Eine Fehlermeldung im Lerncontainer anzeigen.
            flashcardsLearningContainer.innerHTML = `<div class="list-group-item list-group-item-danger">Fehler beim Laden: ${error.message}</div>`;
            checkAnswersButton.disabled = true; // Button deaktiviert lassen
        }
    }

    // Überprüft die Antworten des Benutzers im direkten Lernmodus, gibt Feedback und protokolliert die Ergebnisse an die API.
    async function checkAndLogAnswers() {
        // Alle aktuell angezeigten Karteikartenelemente holen.
        const learningItems = flashcardsLearningContainer.querySelectorAll('.learning-item');
        // Wenn keine Elemente vorhanden sind, nichts tun.
        if (learningItems.length === 0) return;

        // Den Button deaktivieren und einen temporären Ladezustand anzeigen, um Mehrfachklicks zu verhindern.
        checkAnswersButton.disabled = true;
        checkAnswersButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Prüfe Antworten...';
        // Array zum Speichern aller Promises für die Protokollierung der Ergebnisse an die API.
        let promises = [];

        // Jedes Karteikartenelement durchlaufen.
        learningItems.forEach(item => {
            // Referenzen auf die Elemente innerhalb des Elements holen.
            const input = item.querySelector('.translation-input');
            const indicator = item.querySelector('.check-indicator'); // Span für ✓- oder ✗-Symbol
            const correctAnswerDisplay = item.querySelector('.correct-answer-display'); // Span zur Anzeige der richtigen Antwort
            const wordId = item.dataset.wordId; // Die zuvor gespeicherte Wort-ID holen

            // Elemente überspringen, bei denen die Eingabe fehlt oder bereits deaktiviert ist (z.B. zuvor geprüft oder fehlerhaft).
            if (!input || input.disabled) {
                console.log(`Wort ${wordId || '(unbekannte ID)'} wird übersprungen (Eingabe fehlt oder ist deaktiviert).`);
                return; // Zum nächsten Element gehen
            }

            // Die Wort-ID erneut validieren (doppelt hält besser).
            if (!wordId || wordId === 'null' || wordId === 'undefined') {
                console.error("Ungültige Wort-ID beim Überprüfen:", item);
                // Element mit Fehlerzustand markieren.
                item.classList.add('is-incorrect');
                input.classList.add('is-invalid');
                indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-danger"></i>';
                correctAnswerDisplay.textContent = 'Interner Fehler: Wort-ID fehlt!';
                correctAnswerDisplay.classList.remove('d-none');
                input.disabled = true; // Weitere Interaktion verhindern
                return; // Zum nächsten Element gehen
            }

            // Die richtige Antwort und die Antwort des Benutzers holen.
            const correctAnswer = item.dataset.correctTranslation;
            const userAnswer = input.value.trim(); // Leerzeichen am Anfang/Ende entfernen

            // Jegliches vorheriges Feedback-Styling zurücksetzen.
            item.classList.remove('is-correct', 'is-incorrect');
            input.classList.remove('is-valid', 'is-invalid');
            indicator.innerHTML = '';
            correctAnswerDisplay.classList.add('d-none');
            correctAnswerDisplay.textContent = '';

            // Nur verarbeiten, wenn der Benutzer tatsächlich etwas eingegeben hat.
            if (!userAnswer) {
                // Optional hier Feedback für leere Antworten geben oder sie einfach ignorieren.
                // Aktuell ignoriert.
            } else {
                // Sicherstellen, dass wordId eine gültige Zahl ist, bevor sie im API-Aufruf verwendet wird.
                const numericWordId = parseInt(wordId, 10);
                if (isNaN(numericWordId)) {
                    console.error(`Ungültige numerische Wort-ID: ${wordId}`);
                    // Element mit Fehlerzustand markieren.
                    item.classList.add('is-incorrect'); input.classList.add('is-invalid'); indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-danger"></i>'; correctAnswerDisplay.textContent = 'Interner Fehler: ID!'; correctAnswerDisplay.classList.remove('d-none'); input.disabled = true;
                    return; // API-Aufruf für dieses ungültige Element überspringen
                }

                // Die API-Endpunkt-URL für die Protokollierung der Antwort für dieses spezifische Wort konstruieren.
                const url = `api/vocabulary-sets/${selectedVociSetId}/words/${numericWordId}/log`;
                // Den Daten-Payload vorbereiten (die Antwort des Benutzers).
                const payload = { answer: userAnswer };

                // Ein Promise für den API-Aufruf (fetchData) erstellen.
                const promise = fetchData(url, { method: 'PATCH', body: JSON.stringify(payload) })
                    .then(result => {
                        // Die API-Antwort verarbeiten. Die API sollte { isCorrect: boolean, correctAnswer?: string } zurückgeben.
                        if (result.isCorrect) {
                            // Als korrekt markieren.
                            item.classList.add('is-correct');
                            input.classList.add('is-valid');
                            indicator.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                            input.disabled = true; // Eingabe nach der Überprüfung deaktivieren.
                            correctAnswerDisplay.classList.add('d-none'); // Richtige Antwort muss nicht angezeigt werden
                        } else {
                            // Als falsch markieren.
                            item.classList.add('is-incorrect');
                            input.classList.add('is-invalid');
                            indicator.innerHTML = '<i class="fas fa-times-circle text-danger"></i>';
                            // Die von der API bereitgestellte richtige Antwort anzeigen oder auf die im Dataset gespeicherte zurückgreifen.
                            correctAnswerDisplay.innerHTML = `Richtig wäre: <strong>${escapeHtml(result.correctAnswer || correctAnswer)}</strong>`;
                            correctAnswerDisplay.classList.remove('d-none');
                            input.disabled = true; // Eingabe nach der Überprüfung deaktivieren.
                        }
                    })
                    .catch(error => {
                        // Fehler während des API-Aufrufs für dieses spezifische Wort behandeln.
                        console.error(`Fehler beim Loggen für Wort ${wordId}:`, error);
                        // Element mit Fehlerzustand markieren.
                        item.classList.add('is-incorrect');
                        input.classList.add('is-invalid');
                        indicator.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i>'; // Warnsymbol für Protokollierungsfehler
                        correctAnswerDisplay.textContent = `Fehler beim Speichern: ${error.message}`;
                        correctAnswerDisplay.classList.remove('d-none');
                        input.disabled = true; // Eingabe auch bei Fehler deaktivieren
                    });
                // Das Promise für den API-Aufruf dieses Elements zum Array hinzufügen.
                promises.push(promise);
            }
        }); // Ende von learningItems.forEach

        try {
            // Warten, bis alle API-Protokollierungsaufrufe abgeschlossen sind.
            await Promise.all(promises);
            console.log("Alle Antworten im Direkt-Lernen wurden verarbeitet und geloggt.");
            // Nachdem alle Antworten verarbeitet wurden, die Vokabelset-Liste aktualisieren, um den aktualisierten Fortschritt anzuzeigen.
            fetchVocabularySets();
        } catch (error) {
            // Mögliche Fehler von Promise.all selbst abfangen (obwohl einzelne Fehler oben abgefangen werden).
            console.error("Fehler während Promise.all beim Antworten prüfen (Direkt-Lernen):", error);
            // Optional hier eine allgemeine Fehlermeldung für den Benutzer anzeigen.
        }
        finally {
            // Den Button immer wieder aktivieren und seinen Text wiederherstellen, unabhängig von Erfolg oder Misserfolg.
            checkAnswersButton.disabled = false;
            checkAnswersButton.innerHTML = '<i class="fas fa-check-double"></i> Korrigieren & Speichern';
        }
    }


    // --- Kontext Lernen ---
    // Lädt Kontextsätze für das ausgewählte Vokabelset.
    async function loadSetForContextLearning() {
        // Sicherstellen, dass ein Set ausgewählt ist.
        if (!selectedVociSetId) {
            alert("Wähle bitte zuerst ein Set aus.");
            return;
        }
        // Ansicht zur Kontext-Lernseite wechseln.
        showSection(contextLearnPage);
        // Hauptinhaltsbereich ausblenden und Ladeanzeige anzeigen.
        contextContentArea.classList.add('d-none');
        contextLoadingIndicator.classList.remove('d-none');
        // Den Titel setzen.
        if(contextLearnSetTitle) contextLearnSetTitle.textContent = selectedVociSetLabel;
        // Die Meldung "keine Sätze" initial ausblenden.
        contextNoSentences.classList.add('d-none');
        // UI-Elemente von einer vorherigen Sitzung zurücksetzen.
        resetContextUI();

        try {
            // Kontextsätze vom spezifischen API-Endpunkt abrufen.
            // Dieser Endpunkt könnte Sätze spontan generieren oder vorgenerierte abrufen.
            const data = await fetchData(`api/vocabulary-sets/${selectedVociSetId}/generate-context-sentences`);
            // Ladeanzeige ausblenden.
            contextLoadingIndicator.classList.add('d-none');
            // Prüfen, ob Sätze zurückgegeben wurden.
            if (!data.contextSentences || data.contextSentences.length === 0) {
                // Die Meldung "keine Sätze" anzeigen und sicherstellen, dass der Hauptinhaltsbereich sichtbar ist.
                contextNoSentences.textContent = "Für dieses Set konnten keine Kontextsätze generiert werden."; // Klarere Meldung
                contextNoSentences.classList.remove('d-none', 'text-danger', 'text-success'); // Sichtbar machen, Styling zurücksetzen
                contextNoSentences.classList.add('text-muted'); // Standard-Styling
                contextContentArea.classList.remove('d-none');
                // Den Satzcontainer selbst ausblenden und den Weiter-Button deaktivieren.
                contextSentenceContainer.classList.add('d-none');
                nextContextSentenceButton.disabled = true;
                checkContextAnswerButton.disabled = true; // Auch Check-Button deaktivieren
                return; // Beenden
            }
            // Die empfangenen Sätze speichern und den Index zurücksetzen.
            contextSentences = data.contextSentences;
            currentSentenceIndex = 0;
            // Den ersten Satz anzeigen.
            displayCurrentContextSentence();
            // Den Hauptinhaltsbereich anzeigen (der jetzt den ersten Satz enthält).
            contextContentArea.classList.remove('d-none');
        } catch (error) {
            // Fehler beim Laden der Kontextsätze behandeln.
            console.error("Fehler beim Laden der Kontextsätze:", error);
            contextLoadingIndicator.classList.add('d-none'); // Ladeanzeige ausblenden
            contextContentArea.classList.remove('d-none'); // Inhaltsbereich anzeigen, um Fehler anzuzeigen
            // Die Fehlermeldung im dafür vorgesehenen Bereich anzeigen.
            contextNoSentences.textContent = `Fehler beim Laden der Sätze: ${error.message}`;
            contextNoSentences.classList.remove('d-none', 'text-muted'); // Sichtbar machen
            contextNoSentences.classList.add('text-danger'); // Als Fehler stylen
            contextSentenceContainer.classList.add('d-none'); // Satzcontainer ausblenden
        }
    }

    // Zeigt den Kontextsatz an, der dem currentSentenceIndex entspricht.
    function displayCurrentContextSentence() {
        // Prüfen, ob der Index gültig ist.
        if (currentSentenceIndex < 0 || currentSentenceIndex >= contextSentences.length) {
            console.log("Keine weiteren Kontextsätze verfügbar.");
            // Satzanzeigebereich ausblenden und Steuerelemente deaktivieren, wenn keine Sätze mehr vorhanden sind.
            contextSentenceContainer.classList.add('d-none');
            nextContextSentenceButton.disabled = true;
            checkContextAnswerButton.disabled = true;
            // Optional: Eine "Fertig"-Meldung anzeigen.
            if (contextSentences.length > 0) { // Nur anzeigen, wenn ursprünglich Sätze vorhanden waren
                 contextNoSentences.textContent = "Alle Sätze für dieses Set bearbeitet!";
                 contextNoSentences.classList.remove('d-none', 'text-danger', 'text-muted'); // Sichtbar machen, Styling anpassen
                 contextNoSentences.classList.add('text-success'); // Als Erfolg/Abschluss stylen
            }
            return;
        }
        // Die Satzdaten für den aktuellen Index holen.
        const sentenceData = contextSentences[currentSentenceIndex];
        // Die ID des Wortes speichern, das in diesem Satz getestet wird.
        currentContextWordId = sentenceData.wordId;

        // Das Satz-HTML vorbereiten: Sonderzeichen escapen und den Platzhalter '{}' durch ein leeres Span ersetzen.
        const sentenceHtml = escapeHtml(sentenceData.sentence).replace(/\{\}/g, '<span class="context-blank">_______</span>');
        // Den vorbereiteten Satz anzeigen.
        contextSentenceDisplay.innerHTML = sentenceHtml;

        // Eingabefeld, Feedbackbereich und Button-Zustände für den neuen Satz zurücksetzen.
        resetContextUI();
        // Die richtige Antwort in einem data-Attribut im Container speichern für einfachen Zugriff beim Überprüfen.
        contextSentenceContainer.dataset.correctAnswer = escapeHtml(sentenceData.correct);

        // Den Satzcontainer sichtbar machen und den Prüf-Button aktivieren. Den Weiter-Button deaktivieren, bis geprüft wurde.
        contextSentenceContainer.classList.remove('d-none');
        checkContextAnswerButton.disabled = false;
        nextContextSentenceButton.disabled = true;
        // Sicherstellen, dass das Eingabefeld den Fokus erhält zur Benutzerfreundlichkeit.
        contextAnswerInput.focus();
        // Sicherstellen, dass die "keine Sätze" Meldung ausgeblendet ist
        contextNoSentences.classList.add('d-none');
    }

    // Setzt die UI-Elemente im Kontext-Lern-Satzcontainer zurück.
    function resetContextUI() {
        contextAnswerInput.value = ""; // Eingabefeld leeren
        contextAnswerInput.disabled = false; // Eingabefeld aktivieren
        contextAnswerInput.classList.remove('is-valid', 'is-invalid'); // Validierungsstyling entfernen
        contextFeedbackArea.innerHTML = ""; // Feedbacknachricht löschen
        contextFeedbackArea.className = 'mt-2'; // Klassen des Feedbackbereichs zurücksetzen
    }

    // Erhöht den Satzindex und zeigt den nächsten Kontextsatz an.
    function showNextContextSentence() {
        currentSentenceIndex++;
        displayCurrentContextSentence();
    }

    // Überprüft die Antwort des Benutzers im Kontext-Lernmodus.
    async function checkContextAnswer() {
        // Die Eingabe des Benutzers und die richtige Antwort (im data-Attribut gespeichert) holen.
        const userAnswer = contextAnswerInput.value.trim();
        const correctAnswer = contextSentenceContainer.dataset.correctAnswer;

        // Grundlegende Validierung: Sicherstellen, dass der Benutzer etwas eingegeben hat.
        if (!userAnswer) {
            contextFeedbackArea.textContent = "Bitte gib das fehlende Wort ein.";
            contextFeedbackArea.className = 'mt-2 text-warning'; // Als Warnung stylen
            contextAnswerInput.classList.add('is-invalid'); // Eingabe als ungültig markieren
            contextAnswerInput.focus(); // Fokus zurück auf Eingabe
            return; // Verarbeitung stoppen
        }

        // Prüf-Button und Eingabefeld während der Verarbeitung deaktivieren.
        checkContextAnswerButton.disabled = true;
        contextAnswerInput.disabled = true;

        // Antworten vergleichen (Groß-/Kleinschreibung ignorieren).
        const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

        // Visuelles Feedback basierend auf der Korrektheit geben.
        if (isCorrect) {
            contextAnswerInput.classList.add('is-valid');
            contextFeedbackArea.textContent = "Richtig!";
            contextFeedbackArea.className = 'mt-2 text-success'; // Als Erfolg stylen
        } else {
            contextAnswerInput.classList.add('is-invalid');
            // Die richtige Antwort anzeigen, wenn falsch.
            contextFeedbackArea.innerHTML = `Leider falsch. Die richtige Antwort ist: <strong class="correct-answer">${correctAnswer}</strong>`;
            contextFeedbackArea.className = 'mt-2 text-danger'; // Als Gefahr/Fehler stylen
        }

        // Das Ergebnis an die API protokollieren, ähnlich wie beim direkten Lernen.
        // Prüfen, ob eine gültige Wort-ID mit diesem Satz verknüpft ist.
        if (currentContextWordId !== null && currentContextWordId !== undefined) {
            const numericWordId = parseInt(currentContextWordId, 10);
            // Die numerische ID validieren.
            if (isNaN(numericWordId)) {
                 console.error(`Ungültige numerische Kontext-Wort-ID: ${currentContextWordId}`);
                 contextFeedbackArea.innerHTML += `<br><small class="text-muted">(Interner Fehler: Ungültige ID ${currentContextWordId})</small>`; // Fehlerinfo anhängen
            } else {
                // Details für den API-Aufruf vorbereiten.
                const url = `api/vocabulary-sets/${selectedVociSetId}/words/${numericWordId}/log`;
                const payload = { answer: userAnswer }; // Die tatsächliche Antwort des Benutzers protokollieren
                try {
                    // Den API-Aufruf zur Protokollierung des Versuchs durchführen.
                    const result = await fetchData(url, { method: 'PATCH', body: JSON.stringify(payload) });
                    console.log(`Kontext-Antwort für Wort ${currentContextWordId} geloggt. API Meldung: ${result.isCorrect}`);
                    // Die Set-Liste im Hintergrund aktualisieren, um den Fortschritt nach der Protokollierung zu aktualisieren.
                    fetchVocabularySets();
                } catch (error) {
                    // Protokollierungsfehler behandeln.
                    console.error(`Fehler beim Loggen der Kontext-Antwort für Wort ${currentContextWordId}:`, error);
                    // Fehlerinformationen an den Feedbackbereich anhängen, ohne die Richtig/Falsch-Nachricht zu überschreiben.
                    contextFeedbackArea.innerHTML += `<br><small class="text-muted">(Fehler beim Speichern des Ergebnisses: ${error.message})</small>`;
                }
            }
        } else {
            // Fälle behandeln, in denen die Wort-ID fehlen könnte (sollte normalerweise nicht passieren).
            console.error("Keine Wort-ID zum Loggen für den aktuellen Kontextsatz vorhanden.");
            contextFeedbackArea.innerHTML += `<br><small class="text-muted">(Interner Fehler: Keine Wort-ID für Logging.)</small>`;
        }

        // Den "Weiter"-Button aktivieren, wenn noch weitere Sätze vorhanden sind.
        if (currentSentenceIndex < contextSentences.length - 1) {
            nextContextSentenceButton.disabled = false;
            // Den Fokus auf den Weiter-Button setzen für einfachere Navigation
             nextContextSentenceButton.focus();
        } else {
            // Wenn dies der letzte Satz war, "Weiter" deaktiviert lassen und eine Notiz hinzufügen.
            nextContextSentenceButton.disabled = true;
            contextFeedbackArea.innerHTML += `<br><small class="text-muted">Das war der letzte Satz in diesem Set.</small>`;
        }
    }


    // --- Navigation & Hilfsfunktionen ---

    // Steuert, welcher Hauptbereich der Anwendung sichtbar ist.
    function showSection(sectionToShow) {
        // Alle potenziellen Hauptbereiche auswählen. Geht von spezifischen IDs aus.
        const sections = document.querySelectorAll('#vocisets-section, #learn-page, #context-learn-page, #start-action-section');
        // Zuerst alle Bereiche ausblenden.
        sections.forEach(sec => {
            sec.classList.remove('active-section'); // Aktive Markierungsklasse entfernen
            sec.classList.add('d-none'); // Bootstrap-Klasse zum Ausblenden hinzufügen
        });

        // Wenn ein spezifischer Bereich angefordert wird, diesen anzeigen.
        if (sectionToShow) {
            sectionToShow.classList.remove('d-none');
            sectionToShow.classList.add('active-section'); // Aktive Markierungsklasse hinzufügen
        } else {
            // Wenn kein spezifischer Bereich angegeben ist (null), standardmäßig die Vokabelset-Übersicht
            // und den zugehörigen Aktionsbutton-Bereich anzeigen.
            vocisetsSection.classList.remove('d-none');
            vocisetsSection.classList.add('active-section');
            // Sicherstellen, dass auch der Bereich mit den 'Lernen starten'-Buttons sichtbar ist
            const startActionSection = document.getElementById('start-action-section');
            if (startActionSection) {
                 startActionSection.classList.remove('d-none');
                 startActionSection.classList.add('active-section');
            }
        }
        // Zum Seitenanfang scrollen, wenn der Bereich wechselt, für bessere Benutzererfahrung.
        window.scrollTo(0, 0);
    }

    // Setzt den Anwendungszustand zurück und kehrt zur Vokabelset-Übersichtsseite zurück.
    function backToVocisetOverview() {
        // Die Standardansicht anzeigen (Set-Liste und Aktionsbuttons).
        showSection(null);
        // Dynamischen Inhalt von Lernseiten löschen.
        flashcardsLearningContainer.innerHTML = "";
        contextSentences = []; // Kontext-Satzarray leeren
        currentSentenceIndex = -1; // Kontextindex zurücksetzen

        // Die Klasse 'active' von einer eventuell ausgewählten Set-Karte entfernen.
        const currentlyActive = vocisetsContainer.querySelector('.vociset-card.active');
        if (currentlyActive) {
            currentlyActive.classList.remove('active');
        }

        // Zustandsvariablen bezüglich Auswahl und geladenen Daten zurücksetzen.
        selectedVociSetId = null;
        selectedVociSetLabel = null;
        disableActionButtons(); // Aktionen deaktivieren, da jetzt kein Set ausgewählt ist
        currentSetDataForLearning = null;
        currentContextWordId = null; // Kontext-Wort-ID zurücksetzen

        // Optional: Die Set-Liste aktualisieren, um sicherzustellen, dass sie aktuell ist,
        // obwohl dies möglicherweise implizit geschieht, wenn fetchVocabularySets() anderswo aufgerufen wurde.
        // fetchVocabularySets(); // Auskommentiert lassen, wenn hier keine explizite Aktualisierung erforderlich ist.
    }

    // Grundlegende HTML-Escaping-Funktion zur Verhinderung von Cross-Site Scripting (XSS)-Schwachstellen.
    // Ersetzt potenziell schädliche Zeichen durch ihre HTML-Entitäten-Äquivalente.
    function escapeHtml(unsafe) {
        // Nur Strings verarbeiten. Andere Typen unverändert zurückgeben.
        if (typeof unsafe !== 'string') return unsafe;
        // Ersetzungen durchführen. Reihenfolge ist wichtig für das &-Zeichen.
        return unsafe
             .replace(/&/g, "&") // Muss zuerst erfolgen
             .replace(/</g, "<")
             .replace(/>/g, ">")
             .replace(/"/g, "\"")
             .replace(/'/g, "'"); // Numerische Entität für einfaches Anführungszeichen verwenden
    }

    // --- Event Listeners ---
    // Event-Handler an die verschiedenen Buttons anhängen.
    // Prüft, ob das Element existiert, bevor der Listener angehängt wird, um Fehler zu vermeiden, falls sich das HTML ändert.

    // Logout-Button leitet zur Startseite (oder zum Logout-Endpunkt) weiter.
    if(logoutButton) logoutButton.onclick = () => { window.location.pathname = window.location.pathname.split('/').slice(0, -1).join('/'); };
    // Button "Direktes Lernen starten" löst das Laden des Sets für direktes Lernen aus.
    if(startDirectLearnButton) startDirectLearnButton.onclick = loadSetForDirectLearning;
    // Button "Kontextlernen starten" löst das Laden der Kontextsätze aus.
    if(startContextLearnButton) startContextLearnButton.onclick = loadSetForContextLearning;
    // Button "Antworten prüfen" (direktes Lernen) löst den Prozess zur Überprüfung und Protokollierung der Antworten aus.
    if(checkAnswersButton) checkAnswersButton.onclick = checkAndLogAnswers;
    // Zurück-Button auf der Seite für direktes Lernen kehrt zur Set-Übersicht zurück.
    if(backToSetsButton) backToSetsButton.onclick = backToVocisetOverview;
    // Button "Antwort prüfen" (Kontextlernen) löst die Überprüfung der aktuellen Kontextantwort aus.
    if(checkContextAnswerButton) checkContextAnswerButton.onclick = checkContextAnswer;
    // Button "Nächster Satz" (Kontextlernen) zeigt den nächsten Satz an.
    if(nextContextSentenceButton) nextContextSentenceButton.onclick = showNextContextSentence;
    // Zurück-Button auf der Kontext-Lernseite kehrt zur Set-Übersicht zurück.
    if(backToSetsButtonContext) backToSetsButtonContext.onclick = backToVocisetOverview;
    // Listener für die Enter-Taste im Kontext-Eingabefeld hinzufügen
    if (contextAnswerInput) {
        contextAnswerInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                // Standard-Formularübermittlung verhindern, falls zutreffend
                e.preventDefault();
                // Die Funktion zur Antwortprüfung nur auslösen, wenn der Prüf-Button aktiviert ist
                if (!checkContextAnswerButton.disabled) {
                    checkContextAnswer();
                }
            }
        });
    }


    // --- Initiales Laden der Anwendung ---
    // Die Vokabelsets sofort abrufen, wenn die Seite bereit ist.
    fetchVocabularySets();
    // Die initiale Ansicht anzeigen (Vokabelset-Liste).
    showSection(null);

}); // Ende des DOMContentLoaded Listeners