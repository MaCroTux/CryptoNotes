function shortenKey(keyBase64, length = 32) {
    if (keyBase64.length <= length) return keyBase64;
    const halfLength = Math.floor(length / 2);
    return keyBase64.slice(0, halfLength) + '...' + keyBase64.slice(-halfLength);
}

async function generateAESKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

async function exportAESKey(key) {
    return await window.crypto.subtle.exportKey("raw", key);
}

async function importAESKey(rawKey) {
    return await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        {
            name: "AES-GCM",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function encryptMessage() {
    const encryptButton = document.getElementById('encrypt-message-button');
    encryptButton.disabled = true;

    try {
        const senderEmail = document.getElementById('email').value;
        const recipientEmail = document.getElementById('recipient-email').value;
        const message = document.getElementById('message').value;
        const description = document.getElementById('message-description').value;

        if (!senderEmail || !message || !description) {
            alert('Por favor, introduce tu email, descripción y mensaje.');
            encryptButton.disabled = false;
            return;
        }

        let recipientPublicKey;
        if (recipientEmail) {
            const response = await fetch(`http://localhost:8000/api/getPublicKey?email=${recipientEmail}`);
            const result = await response.json();

            if (result.publicKey) {
                recipientPublicKey = await window.crypto.subtle.importKey(
                    'jwk',
                    result.publicKey,
                    {
                        name: "RSA-OAEP",
                        hash: { name: "SHA-256" }
                    },
                    true,
                    ["encrypt"]
                );
            } else {
                alert('El destinatario no está registrado.');
                encryptButton.disabled = false;
                return;
            }
        } else {
            recipientPublicKey = publicKey; // Usar la clave pública del usuario si no hay destinatario
        }

        const aesKey = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encryptedMessage = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            new TextEncoder().encode(message)
        );

        const rawAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
        const encryptedAESKey = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            recipientPublicKey,
            rawAESKey
        );

        const encryptedData = {
            iv: arrayBufferToBase64(iv),
            encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
            texto: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))),
            email: recipientEmail || senderEmail,
            clave_publica: JSON.stringify(await window.crypto.subtle.exportKey("jwk", recipientPublicKey)),
            description: description
        };

        await storeMessage(encryptedData);
        loadStoredMessages();
        alert('Mensaje cifrado y almacenado exitosamente.');
    } catch (error) {
        console.error('Error al cifrar el mensaje:', error);
        alert('Hubo un error al cifrar el mensaje.');
    } finally {
        encryptButton.disabled = false;
    }
}

async function decryptMessage() {
    const password = prompt('Introduce tu contraseña para descifrar:');
    await loadKeys(password);

    try {
        const ivBase64 = document.getElementById('iv').textContent;
        const encryptedMessageString = document.getElementById('encryptedMessage').textContent;
        const encryptedAESKeyBase64 = document.getElementById('fullEncryptedAESKey').textContent; // Usar la clave completa para el descifrado

        if (!ivBase64 || !encryptedMessageString || !encryptedAESKeyBase64) {
            throw new Error('Faltan datos necesarios para el descifrado');
        }

        const encryptedData = {
            iv: base64ToArrayBuffer(ivBase64),
            texto: encryptedMessageString,
            encryptedAESKey: base64ToArrayBuffer(encryptedAESKeyBase64)
        };

        const iv = new Uint8Array(encryptedData.iv);
        const encryptedAESKey = new Uint8Array(encryptedData.encryptedAESKey);
        const encryptedMessage = Uint8Array.from(atob(encryptedData.texto), c => c.charCodeAt(0));

        // Descifrar la clave AES con la clave privada RSA
        console.log('Descifrando la clave AES con la clave privada RSA...');
        const rawAESKey = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            encryptedAESKey
        );
        console.log('Clave AES descifrada:', rawAESKey);

        const aesKey = await importAESKey(rawAESKey);

        // Descifrar el mensaje con la clave AES
        console.log('Descifrando el mensaje con la clave AES...');
        const decryptedMessage = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv // Uso del IV en el descifrado
            },
            aesKey,
            encryptedMessage
        );

        const dec = new TextDecoder();
        document.getElementById('decryptedMessage').textContent = dec.decode(decryptedMessage);
        console.log('Mensaje descifrado:', dec.decode(decryptedMessage));
    } catch (error) {
        console.error('Error en decryptMessage:', error);
        alert('Error en decryptMessage: ' + error.message);
    }
}

function isBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}

// Exponer las funciones necesarias al ámbito global
window.encryptMessage = encryptMessage;
window.decryptMessage = decryptMessage;