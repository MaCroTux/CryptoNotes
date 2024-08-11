
async function loadStoredMessages() {
    const email = document.getElementById('email').value;
    if (!email) {
        return;  // No hacer nada si no hay un email definido
    }

    const response = await fetch(`http://localhost:8000/api/list?email=${email}`);
    const storedMessages = await response.json();
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    storedMessages.forEach((message, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Descripción: ${message.description} - Mensaje ${index + 1}`;
        listItem.addEventListener('click', () => {
            document.getElementById('encryptedMessage').textContent = message.texto;

            const ivBase64 = message.iv;
            const encryptedAESKeyBase64 = message.encryptedAESKey;
            const shortenedKey = message.shortenedAESKey || shortenKey(encryptedAESKeyBase64);

            document.getElementById('iv').textContent = ivBase64;
            document.getElementById('encryptedAESKey').textContent = shortenedKey;
            document.getElementById('fullEncryptedAESKey').textContent = encryptedAESKeyBase64; // Oculto
        });
        messagesList.appendChild(listItem);
    });
}

async function storeMessage(encryptedData) {
    await fetch('http://localhost:8000/api/store', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(encryptedData)
    });
}

async function registerUser() {
    const email = document.getElementById('register-email').value;
    if (!email) {
        alert('Por favor, introduce tu email.');
        return;
    }

    // Generar las claves
    const password = prompt('Introduce una contraseña para proteger tus claves:');
    await generateKeys(password);

    // Exportar la clave pública
    const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', publicKey);

    // Enviar los datos a la API
    const userData = {
        email: email,
        publicKey: publicKeyJwk
    };

    const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (response.ok) {
        alert('Usuario registrado con éxito.');
    } else {
        alert('Hubo un error al registrar el usuario.');
    }
}

// Exponer las funciones necesarias al ámbito global
window.exportKeys = exportKeys;
window.importKeys = importKeys;
window.deleteKeys = deleteKeys;
window.registerUser = registerUser;