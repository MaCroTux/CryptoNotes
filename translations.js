let translations = {};

async function loadTranslations(language) {
    const response = await fetch(`translations/${language}.json`);
    translations = await response.json();
    applyTranslations();
}

function applyTranslations() {
    // Actualizar el título de la página
    document.title = translations.title;
    // Actualizar el título visible en la página
    document.getElementById('page-title').textContent = translations.title;
    document.getElementById('keys-section-title').textContent = translations.keys_section;
    document.getElementById('public-key-label').textContent = translations.public_key;
    document.getElementById('private-key-label').textContent = translations.private_key;
    document.getElementById('export-keys-button').textContent = translations.export_keys;
    document.getElementById('import-keys-button').textContent = translations.import_keys;
    document.getElementById('delete-keys-button').textContent = translations.delete_keys;
    document.getElementById('encryption-section-title').textContent = translations.encryption_section;
    document.getElementById('email').placeholder = translations.email_placeholder;
    document.getElementById('message').placeholder = translations.message_placeholder;
    document.getElementById('encrypt-message-button').textContent = translations.encrypt_message;
    document.getElementById('encrypted-message-label').textContent = translations.encrypted_message;
    document.getElementById('iv-label').textContent = translations.iv;
    document.getElementById('encrypted-aes-key-label').textContent = translations.encrypted_aes_key;
    document.getElementById('decryption-section-title').textContent = translations.decryption_section;
    document.getElementById('decrypt-message-button').textContent = translations.decrypt_message;
    document.getElementById('decrypted-message-label').textContent = translations.decrypted_message;
    document.getElementById('messages-section-title').textContent = translations.messages_section;
}

document.getElementById('language-selector').addEventListener('change', (event) => {
    loadTranslations(event.target.value);
});

// Inicializar con el idioma predeterminado (español)
loadTranslations('es');