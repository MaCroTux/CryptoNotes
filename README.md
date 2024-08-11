# CryptoNotes 1.0

This is a project aimed at providing a tool for encrypting secure notes on a remote server.

[Documentación en español](README.es.md)

## Objectives
* The code has been developed in JavaScript in the simplest way possible.
* To be as secure as possible, all encryption happens locally.
* The encryption keys are stored in the browser.
* We can export and import our keys, and even delete them from the browser if an intrusion is detected.
* Texts are transmitted encrypted to the storage API.
* The keys stored in our browser are encrypted:
    * To perform encryption/decryption operations, this key is required.
    * All operations are executed on the fly with the encryption key.
    * The keys stored in our browser are 100% secure.

## Getting Started

We just need to launch `index.js` to see the graphical interface.

To use the storage API, we can use `php -S localhost:8000 index.php` to perform our initial tests.

## How It Works

### Hybrid Encryption Context

Hybrid encryption combines both symmetric and asymmetric encryption to leverage the benefits of each. In this case, we use AES (Advanced Encryption Standard) to encrypt the data and RSA (Rivest-Shamir-Adleman) to encrypt the AES key.

1. Symmetric Encryption (AES):
  * AES is a symmetric encryption algorithm, meaning it uses the same key to encrypt and decrypt data.
  * It is fast and efficient for encrypting large amounts of data.
2. Asymmetric Encryption (RSA):
  * RSA is an asymmetric encryption algorithm that uses a pair of keys: a public key for encryption and a private key for decryption.
  * It is slower and is typically used to encrypt small amounts of data, such as encryption keys.

### Hybrid Encryption Process

1. AES Key Generation:
  * A random AES key is generated that will be used to encrypt the data.
2. Encrypting the Message with AES:
  * The message is encrypted using the generated AES key.
  * This produces the "Encrypted Message."
3. Encrypting the AES Key with RSA:
  * The AES key is encrypted using the RSA public key.
  * This produces the "Encrypted AES Key."

### Application Fields

* Encrypted Message: This is the original message text encrypted using AES.
* IV (Initialization Vector): This is a random value used along with the AES key to ensure the encryption is unique each time, even if the same message is encrypted multiple times.
* Encrypted AES Key: This is the AES key encrypted with the RSA public key. This encrypted key can be stored and transmitted securely because it can only be decrypted with the corresponding RSA private key.

### Application Process Description

1. Encryption:
  * An AES key is generated.
  * The message is encrypted with the AES key.
  * The AES key is encrypted with the RSA public key.
  * The "Encrypted Message," the "IV," and the "Encrypted AES Key" are stored and/or transmitted.
2. Decryption:
  * The "Encrypted AES Key" is decrypted using the RSA private key to recover the original AES key.
  * The "Encrypted Message" is decrypted using the recovered AES key and the "IV" to obtain the original message.