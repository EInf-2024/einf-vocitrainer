 document.addEventListener("DOMContentLoaded", function () {

    // Funktion zum Laden aller Vokabelsets
    async function fetchVocabularySets() {
        try {
            const response = await fetch("/api/vocabulary-sets");

            if (response.ok) {
                const data = await response.json();
                const container = document.getElementById("vocisets-container");

                // Wenn keine Vokabelsets vorhanden sind
                if (data.length === 0) {
                    container.innerHTML = "<p>Keine Vokabelsets gefunden.</p>";
                    return;
                }

                // Wenn Vokabelsets vorhanden sind, sie anzeigen
                container.innerHTML = "";
                data.forEach(set => {
                    const div = document.createElement("div");
                    div.innerHTML = `
                        <h3>${set.name}</h3>
                        <div>
                            <div style="width: ${set.progress}%; background-color: green; color: white; text-align: center;">
                                ${set.progress}%
                            </div>
                        </div>
                    `;
                    div.onclick = () => loadVocabularySet(set.id);
                    container.appendChild(div);
                });
            } else {
                alert("Fehler beim Laden der Vokabelsets");
            }
        } catch (error) {
            console.error("Fehler beim Abrufen der Vokabelsets:", error);
            alert("Es gab ein Problem beim Laden der Vokabelsets.");
        }
    }

    // Funktion zum Laden eines einzelnen Vokabelsets
    async function loadVocabularySet(setId) {
        try {
            const response = await fetch(`/api/vocabulary-sets/${setId}`);
            if (response.ok) {
                const data = await response.json();
                const flashcardsContainer = document.getElementById("flashcards");
                flashcardsContainer.innerHTML = "";

                data.words.forEach(word => {
                    let card = document.createElement("div");
                    card.textContent = word.word;
                    card.style.border = "1px solid black";
                    card.style.padding = "10px";
                    card.style.margin = "5px";
                    card.style.display = "inline-block";
                    card.style.cursor = "pointer";

                    // Klick auf die Karte zeigt die Übersetzung
                    card.onclick = function () {
                        card.textContent = (card.textContent === word.word) ? word.translation : word.word;
                    };

                    flashcardsContainer.appendChild(card);
                });

                // Wechsel zur Lernseite
                document.getElementById("vocisets-container").style.display = "none";
                document.getElementById("learn-page").style.display = "block";
            } else {
                alert("Fehler beim Laden des Vokabelsets");
            }
        } catch (error) {
            console.error("Fehler beim Abrufen des Vokabelsets:", error);
            alert("Es gab ein Problem beim Laden des Vokabelsets.");
        }
    }

    // Zurück zu den Vocisets-Seiten
    function backToVocisets() {
        document.getElementById("vocisets-container").style.display = "block";
        document.getElementById("learn-page").style.display = "none";
    }

    // Logout-Funktion
    function logout() {
        document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    }

    // API-Aufruf ausführen, um die Vokabelsets zu laden
    fetchVocabularySets();

    // Logout zur Verfügung stellen
    window.logout = logout;
    window.backToVocisets = backToVocisets;
});
