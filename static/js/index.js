// Event Listener für das Absenden des Login-Formulars hinzufügen
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    // Verhindert das standardmäßige Neuladen der Seite beim Absenden des Formulars
    event.preventDefault();

    // Holt die eingegebenen Werte für Benutzername und Passwort
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    try {
        // Sendet eine POST-Anfrage an den Server-Endpunkt /api/login
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // Teilt dem Server mit, dass JSON-Daten gesendet werden
            },
            body: JSON.stringify({ username: name, password }) // Wandelt die Login-Daten in einen JSON-String um
        });

        // Überprüft, ob die Serverantwort erfolgreich war (HTTP-Status 2xx)
        if (response.ok) {
            // Wandelt die JSON-Antwort des Servers in ein JavaScript-Objekt um
            const data = await response.json();

            // Leitet den Benutzer basierend auf der vom Server zurückgegebenen Rolle weiter
            if (data.role === "student") {
                window.location.href = "/student"; // Zur Schüler-Ansicht
            } else if (data.role === "teacher") {
                window.location.href = "/teacher"; // Zur Lehrer-Ansicht
            }
            // Falls es weitere Rollen gäbe, müssten sie hier behandelt werden
        } else {
            // Zeigt eine Fehlermeldung an, wenn der Login serverseitig fehlschlägt (z.B. falsches Passwort)
            // Eine spezifischere Fehlermeldung vom Server wäre benutzerfreundlicher
            alert("Login fehlgeschlagen. Bitte überprüfen Sie Benutzername und Passwort.");
        }
    } catch (error) {
        // Fängt Netzwerkfehler oder andere Probleme während der Anfrage ab
        console.error("Fehler beim Login:", error);
        alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
});