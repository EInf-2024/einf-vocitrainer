async function loadClasses() {
    let response = await fetch('/api/departments');
    let classes = await response.json();
    let container = document.getElementById('classes-container');
    container.innerHTML = '';

    classes.forEach(department => {
        let button = document.createElement('button');
        button.className = 'class-button';
        button.textContent = department.name;

        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = 'Löschen';
        deleteBtn.onclick = () => deleteClass(department.id);

        button.appendChild(deleteBtn);
        container.appendChild(button);
    });
}

async function loadVociSets(departmentId) {
    let response = await fetch(`/api/departments/${departmentId}`);
    let vociSets = await response.json();
    let container = document.getElementById('voci-container');
    container.innerHTML = '';

    vociSets.forEach(set => {
        let button = document.createElement('button');
        button.className = 'voci-button';
        button.textContent = set.name;

        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = 'Löschen';
        deleteBtn.onclick = () => deleteVociSet(set.id);

        button.appendChild(deleteBtn);
        container.appendChild(button);
    });
}

function openAddUserDiv() {
    alert("Hier wird später das Nutzer-Hinzufügen-Formular erscheinen.");
}

function openAddVociDiv() {
    document.getElementById('add-voci-modal').classList.remove('hidden');
}

function closeAddVociDiv() {
    document.getElementById('add-voci-modal').classList.add('hidden');
}

async function addVociSet() {
    let name = document.getElementById('voci-name').value;
    if (!name) return;

    await fetch('/api/vocisets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    closeAddVociDiv();
    loadVociSets();
}

async function deleteClass(id) {
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    loadClasses();
}

async function deleteVociSet(id) {
    await fetch(`/api/vocisets/${id}`, { method: 'DELETE' });
    loadVociSets();
}

loadClasses();
