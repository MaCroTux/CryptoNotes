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