const translations = {
    es: {
        title: "Cifrado Híbrido",
        registerUser: "Registro de Usuario",
        emailPlaceholder: "Introduce tu email",
        registerButton: "Registrarse",
        loginUser: "Inicio de Sesión",
        loginButton: "Iniciar Sesión",
        keysTitle: "Claves",
        publicKeyLabel: "Clave Pública",
        privateKeyLabel: "Clave Privada",
        exportKeysButton: "Exportar Claves",
        importKeysButton: "Importar Claves",
        deleteKeysButton: "Eliminar Claves",
        encryptionTitle: "Cifrado",
        recipientEmailPlaceholder: "Email del destinatario (opcional)",
        messageDescriptionPlaceholder: "Descripción del mensaje (no cifrada)",
        messagePlaceholder: "Escribe tu mensaje aquí",
        encryptButton: "Cifrar Mensaje",
        encryptedMessageLabel: "Mensaje Cifrado",
        ivLabel: "IV",
        encryptedAESKeyLabel: "Clave AES Cifrada",
        decryptionTitle: "Descifrado",
        decryptButton: "Descifrar Mensaje",
        decryptedMessageLabel: "Mensaje Descifrado",
        storedMessagesTitle: "Mensajes almacenados",
        refreshButton: "Refrescar Notas",
        logoutButton: "Cerrar Sesión",
        languageLabel: "Idioma",
    },
    en: {
        title: "Hybrid Encryption",
        registerUser: "User Registration",
        emailPlaceholder: "Enter your email",
        registerButton: "Register",
        loginUser: "Login",
        loginButton: "Log In",
        keysTitle: "Keys",
        publicKeyLabel: "Public Key",
        privateKeyLabel: "Private Key",
        exportKeysButton: "Export Keys",
        importKeysButton: "Import Keys",
        deleteKeysButton: "Delete Keys",
        encryptionTitle: "Encryption",
        recipientEmailPlaceholder: "Recipient's email (optional)",
        messageDescriptionPlaceholder: "Message description (not encrypted)",
        messagePlaceholder: "Write your message here",
        encryptButton: "Encrypt Message",
        encryptedMessageLabel: "Encrypted Message",
        ivLabel: "IV",
        encryptedAESKeyLabel: "Encrypted AES Key",
        decryptionTitle: "Decryption",
        decryptButton: "Decrypt Message",
        decryptedMessageLabel: "Decrypted Message",
        storedMessagesTitle: "Stored Messages",
        refreshButton: "Refresh Notes",
        logoutButton: "Log Out",
        languageLabel: "Language",
    }
};

function translatePage() {
    const language = document.getElementById('language-selector').value;
    document.getElementById('page-title').textContent = translations[language].title;
    document.getElementById('registration-section').querySelector('h3').textContent = translations[language].registerUser;
    document.getElementById('register-email').placeholder = translations[language].emailPlaceholder;
    document.getElementById('register-button').textContent = translations[language].registerButton;
    document.getElementById('login-section').querySelector('h3').textContent = translations[language].loginUser;
    document.getElementById('login-email').placeholder = translations[language].emailPlaceholder;
    document.getElementById('login-button').textContent = translations[language].loginButton;
    document.getElementById('keys-section-title').textContent = translations[language].keysTitle;
    document.getElementById('public-key-label').textContent = translations[language].publicKeyLabel;
    document.getElementById('private-key-label').textContent = translations[language].privateKeyLabel;
    document.getElementById('export-keys-button').textContent = translations[language].exportKeysButton;
    document.getElementById('import-keys-button').textContent = translations[language].importKeysButton;
    document.getElementById('delete-keys-button').textContent = translations[language].deleteKeysButton;
    document.getElementById('encryption-section-title').textContent = translations[language].encryptionTitle;
    document.getElementById('recipient-email').placeholder = translations[language].recipientEmailPlaceholder;
    document.getElementById('message-description').placeholder = translations[language].messageDescriptionPlaceholder;
    document.getElementById('message').placeholder = translations[language].messagePlaceholder;
    document.getElementById('encrypt-message-button').textContent = translations[language].encryptButton;
    document.getElementById('encrypted-message-label').textContent = translations[language].encryptedMessageLabel;
    document.getElementById('iv-label').textContent = translations[language].ivLabel;
    document.getElementById('encrypted-aes-key-label').textContent = translations[language].encryptedAESKeyLabel;
    document.getElementById('decryption-section-title').textContent = translations[language].decryptionTitle;
    document.getElementById('decrypt-message-button').textContent = translations[language].decryptButton;
    document.getElementById('decrypted-message-label').textContent = translations[language].decryptedMessageLabel;
    document.getElementById('messages-section-title').textContent = translations[language].storedMessagesTitle;
    document.getElementById('refresh-button').textContent = translations[language].refreshButton;
    document.getElementById('logout-button').textContent = translations[language].logoutButton;
    document.querySelector('.language-selector label').textContent = translations[language].languageLabel;
}

document.getElementById('language-selector').addEventListener('change', translatePage);
window.addEventListener('load', translatePage);