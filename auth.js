// Verificar si el usuario ya está logueado al cargar la página
window.addEventListener('load', function() {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        document.getElementById('email').value = loggedInUser;

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
    }
});

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

        // Almacenar el email en localStorage para recordar la sesión
        localStorage.setItem('loggedInUser', email);

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

function logout() {
    // Eliminar el usuario de localStorage
    localStorage.removeItem('loggedInUser');

    // Recargar la página para volver a la pantalla de inicio de sesión
    location.reload();
}