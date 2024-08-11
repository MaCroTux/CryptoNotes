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
    const password = prompt('Introduce tu contraseña para cifrar:');
    await loadKeys(password);

    const message = document.getElementById('message').value;
    const email = document.getElementById('email').value;
    if (!email) {
        alert("Por favor, introduce tu email.");
        return;
    }
    const enc = new TextEncoder();
    const encodedMessage = enc.encode(message);

    const aesKey = await generateAESKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Generación del IV

    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv // Uso del IV en el cifrado
        },
        aesKey,
        encodedMessage
    );

    const rawAESKey = await exportAESKey(aesKey);
    const encryptedAESKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        rawAESKey
    );

    const encryptedAESKeyBase64 = arrayBufferToBase64(encryptedAESKey);
    const ivBase64 = arrayBufferToBase64(iv);

    const encryptedData = {
        iv: ivBase64,
        encryptedAESKey: encryptedAESKeyBase64,
        texto: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))),
        email: email,
        clave_publica: JSON.stringify(await window.crypto.subtle.exportKey("jwk", publicKey))
    };

    document.getElementById('encryptedMessage').textContent = encryptedData.texto;
    document.getElementById('iv').textContent = encryptedData.iv;
    document.getElementById('encryptedAESKey').textContent = encryptedData.encryptedAESKey;

    // Enviar el mensaje cifrado a la API
    await storeMessage(encryptedData);

    // Recargar la lista de mensajes
    loadStoredMessages();
}

async function decryptMessage() {
    const password = prompt('Introduce tu contraseña para descifrar:');
    await loadKeys(password);

    try {
        const ivBase64 = document.getElementById('iv').textContent;
        const encryptedMessageString = document.getElementById('encryptedMessage').textContent;
        const encryptedAESKeyBase64 = document.getElementById('encryptedAESKey').textContent;

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

// Exponer las funciones necesarias al ámbito global
window.encryptMessage = encryptMessage;
window.decryptMessage = decryptMessage;