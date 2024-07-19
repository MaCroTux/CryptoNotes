let publicKey;
let privateKey;

async function getKeyMaterial(password) {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
}

async function getKey(password, salt) {
    const keyMaterial = await getKeyMaterial(password);
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

async function encryptRSAKey(key, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const aesKey = await getKey(password, salt);
    const exportedKey = await window.crypto.subtle.exportKey("jwk", key);
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedKey = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        enc.encode(JSON.stringify(exportedKey))
    );

    return {
        salt: Array.from(salt),
        iv: Array.from(iv),
        key: Array.from(new Uint8Array(encryptedKey))
    };
}

async function decryptRSAKey(encryptedKeyData, password) {
    const salt = new Uint8Array(encryptedKeyData.salt);
    const iv = new Uint8Array(encryptedKeyData.iv);
    const encryptedKey = new Uint8Array(encryptedKeyData.key);
    const aesKey = await getKey(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        encryptedKey
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
}

async function generateKeys(password) {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: { name: "SHA-256" },
        },
        true,
        ["encrypt", "decrypt"]
    );

    publicKey = keyPair.publicKey;
    privateKey = keyPair.privateKey;

    const encryptedPublicKey = await encryptRSAKey(publicKey, password);
    const encryptedPrivateKey = await encryptRSAKey(privateKey, password);

    localStorage.setItem('publicKey', JSON.stringify(encryptedPublicKey));
    localStorage.setItem('privateKey', JSON.stringify(encryptedPrivateKey));

    const publicKeyData = await window.crypto.subtle.exportKey("jwk", publicKey);
    const privateKeyData = await window.crypto.subtle.exportKey("jwk", privateKey);
    document.getElementById('publicKey').textContent = `alg: ${publicKeyData.alg}`;
    document.getElementById('privateKey').textContent = `alg: ${privateKeyData.alg}`;
}

async function loadKeys(password) {
    const encryptedPublicKey = JSON.parse(localStorage.getItem('publicKey'));
    const encryptedPrivateKey = JSON.parse(localStorage.getItem('privateKey'));

    if (encryptedPublicKey && encryptedPrivateKey) {
        const publicKeyData = await decryptRSAKey(encryptedPublicKey, password);
        const privateKeyData = await decryptRSAKey(encryptedPrivateKey, password);

        publicKey = await importKey(publicKeyData, "encrypt");
        privateKey = await importKey(privateKeyData, "decrypt");

        document.getElementById('publicKey').textContent = `alg: ${publicKeyData.alg}`;
        document.getElementById('privateKey').textContent = `alg: ${privateKeyData.alg}`;
    } else {
        await generateKeys(password);
    }
}

async function importKey(keyData, type) {
    return await window.crypto.subtle.importKey(
        "jwk",
        keyData,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        [type]
    );
}

function exportKeys() {
    const encryptedPublicKey = localStorage.getItem('publicKey');
    const encryptedPrivateKey = localStorage.getItem('privateKey');

    const keysData = {
        publicKey: encryptedPublicKey,
        privateKey: encryptedPrivateKey
    };

    const blob = new Blob([JSON.stringify(keysData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keys.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function importKeys(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const keysData = JSON.parse(event.target.result);

            localStorage.setItem('publicKey', keysData.publicKey);
            localStorage.setItem('privateKey', keysData.privateKey);

            const publicKeyData = await decryptRSAKey(JSON.parse(keysData.publicKey), prompt('Introduce tu contraseña para descifrar la clave pública:'));
            const privateKeyData = await decryptRSAKey(JSON.parse(keysData.privateKey), prompt('Introduce tu contraseña para descifrar la clave privada:'));

            document.getElementById('publicKey').textContent = `alg: ${publicKeyData.alg}`;
            document.getElementById('privateKey').textContent = `alg: ${privateKeyData.alg}`;
        } catch (error) {
            console.error('Error en importKeys:', error);
            alert('Error en importKeys: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function deleteKeys() {
    localStorage.removeItem('publicKey');
    localStorage.removeItem('privateKey');

    document.getElementById('publicKey').textContent = '';
    document.getElementById('privateKey').textContent = '';
    alert('Claves eliminadas del almacenamiento local.');
}

// Exponer las funciones necesarias al ámbito global
window.generateKeys = generateKeys;
window.loadKeys = loadKeys;
window.exportKeys = exportKeys;
window.importKeys = importKeys;
window.deleteKeys = deleteKeys;