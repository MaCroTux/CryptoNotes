
async function loadStoredMessages() {
    const response = await fetch('http://localhost:8000/api/list');
    const storedMessages = await response.json();
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    storedMessages.forEach((message, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Mensaje ${index + 1}: ${message.texto}`;
        listItem.addEventListener('click', () => {
            document.getElementById('encryptedMessage').textContent = message.texto;

            // Verificamos que IV y la Clave AES Cifrada están presentes
            if (message.iv && message.encryptedAESKey) {
                const ivBase64 = message.iv;
                const encryptedAESKeyBase64 = message.encryptedAESKey;
                const shortenedKey = message.shortenedAESKey || shortenKey(encryptedAESKeyBase64);

                // Asignamos los valores a los elementos correspondientes
                document.getElementById('iv').textContent = ivBase64;
                document.getElementById('encryptedAESKey').textContent = shortenedKey;
                document.getElementById('fullEncryptedAESKey').textContent = encryptedAESKeyBase64; // Oculto
            } else {
                console.error('El mensaje no tiene IV o Clave AES Cifrada');
            }
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

document.addEventListener('DOMContentLoaded', () => {
    loadStoredMessages();
});

// Exponer las funciones necesarias al ámbito global
window.exportKeys = exportKeys;
window.importKeys = importKeys;
window.deleteKeys = deleteKeys;