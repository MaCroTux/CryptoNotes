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

async function encryptMessage() {
    const password = prompt('Introduce tu contraseña para cifrar:');
    await loadKeys(password);

    const message = document.getElementById('message').value;
    const email = document.getElementById('email').value; // Obtener el email desde el campo de entrada
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

    const encryptedData = {
        iv: Array.from(iv), // Almacenamiento del IV
        encryptedAESKey: Array.from(new Uint8Array(encryptedAESKey)),
        texto: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))),
        email: email,
        clave_publica: JSON.stringify(await window.crypto.subtle.exportKey("jwk", publicKey))
    };

    document.getElementById('encryptedMessage').textContent = encryptedData.texto;
    document.getElementById('iv').textContent = JSON.stringify(encryptedData.iv); // Mostrar el IV
    document.getElementById('encryptedAESKey').textContent = JSON.stringify(encryptedData.encryptedAESKey); // Mostrar la clave AES cifrada

    // Enviar el mensaje cifrado a la API
    await storeMessage(encryptedData);

    // Recargar la lista de mensajes
    loadStoredMessages();
}

async function decryptMessage() {
    const password = prompt('Introduce tu contraseña para descifrar:');
    await loadKeys(password);

    try {
        const ivString = document.getElementById('iv').textContent;
        const encryptedMessageString = document.getElementById('encryptedMessage').textContent;
        const encryptedAESKeyString = document.getElementById('encryptedAESKey').textContent;

        if (!ivString || !encryptedMessageString || !encryptedAESKeyString) {
            throw new Error('Faltan datos necesarios para el descifrado');
        }

        const encryptedData = {
            iv: JSON.parse(ivString),
            texto: encryptedMessageString,
            encryptedAESKey: JSON.parse(encryptedAESKeyString)
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