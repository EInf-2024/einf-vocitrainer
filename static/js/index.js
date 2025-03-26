 document.getElementById("loginForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: name, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.role === "student") {
                window.location.href = "/student";
            } else if (data.role === "teacher") {
                window.location.href = "/teacher";
            }
        } else {
            alert("Login fehlgeschlagen");
        }
    });