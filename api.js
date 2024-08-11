
async function loadStoredMessages() {
    const email = document.getElementById('email').value;
    if (!email) {
        alert('Por favor, inicia sesión para ver tus notas.');
        return;
    }

    const response = await fetch(`http://localhost:8000/api/list?email=${email}`);
    const storedMessages = await response.json();
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    storedMessages.forEach((message, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Mensaje ${index + 1}: ${message.texto}`;
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

async function login() {
    const email = document.getElementById('login-email').value;
    if (!email) {
        alert('Por favor, introduce tu email.');
        return;
    }

    // Obtener la clave pública desde el servidor
    const response = await fetch(`http://localhost:8000/api/getPublicKey?email=${email}`);
    const result = await response.json();

    if (!result.publicKey) {
        alert('El usuario no está registrado.');
        return;
    }

    const serverPublicKeyJwk = result.publicKey;

    // Solicitar la contraseña para desbloquear la clave privada local
    const password = prompt('Introduce tu contraseña para desbloquear la clave privada:');
    await loadKeys(password);

    // Exportar la clave pública local
    const localPublicKeyJwk = await window.crypto.subtle.exportKey('jwk', publicKey);

    // Comparar las claves públicas
    if (JSON.stringify(serverPublicKeyJwk) === JSON.stringify(localPublicKeyJwk)) {
        alert('Inicio de sesión exitoso.');
        document.getElementById('email').value = email;

        // Ocultar los formularios de login y registro
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('registration-section').style.display = 'none';

        // Mostrar las secciones protegidas
        document.getElementById('keys-section').style.display = 'block';
        document.getElementById('encryption-section').style.display = 'block';
        document.getElementById('decryption-section').style.display = 'block';
        document.getElementById('messages-section').style.display = 'block';

        // Cargar las notas del usuario
        loadStoredMessages();
    } else {
        alert('Las claves no coinciden. Verifica que usaste la contraseña correcta.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadStoredMessages();
});

// Exponer las funciones necesarias al ámbito global
window.exportKeys = exportKeys;
window.importKeys = importKeys;
window.deleteKeys = deleteKeys;
window.registerUser = registerUser;
window.login = login;