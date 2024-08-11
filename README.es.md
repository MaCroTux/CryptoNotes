# CryptoNotes 1.0

Esta es un proyecto que tiene como objetivo poder proporcionar una herramienta de cifrado de notas seguras en un servidor remoto.

## Objetivos
* El código ha sido desarrollado en JavaScript de la manera más sencilla posible
* Ser lo más segura posible, todo el cifrado sucede en local
* Las claves de cifrado se guardan en el navegador
* Podemos exportar e importar nuestras claves, incluso eliminar del navegador si detectamos una intrusión
* Los textos viajan cifrado hasta la API de almacenamiento
* Las claves que se almacenan en nuestro navegador se almacenan cifradas:
  * Para realizar operaciones de cifrado/descifrado se pide dicha clave 
  * Tolas las operaciones se ejecutan al vuelo con la clave de cifrado
  * Las claves que se almacenan en nuestro navegador son 100% seguras

## Puesta en marcha

Tan solo tenemos que iniciar index.js para poder ver la interfaz gráfica.

Para poder usar la API de almacenamiento podemos usar `php -S localhost:8000 index.php` para realizar nuestras primeras pruebas.

## Como funciona

### Contexto del Cifrado Híbrido

El cifrado híbrido combina tanto el cifrado simétrico como el asimétrico para aprovechar los beneficios de ambos. En este caso, usamos AES (Advanced Encryption Standard) para cifrar los datos y RSA (Rivest-Shamir-Adleman) para cifrar la clave AES.

1. Cifrado Simétrico (AES):
* AES es un algoritmo de cifrado simétrico, lo que significa que utiliza la misma clave para cifrar y descifrar los datos.
* Es rápido y eficiente para cifrar grandes cantidades de datos.
2. Cifrado Asimétrico (RSA):
* RSA es un algoritmo de cifrado asimétrico que utiliza un par de claves: una clave pública para cifrar y una clave privada para descifrar.
* Es más lento y se utiliza típicamente para cifrar pequeñas cantidades de datos, como claves de cifrado.

### Proceso de Cifrado Híbrido

1. Generación de la Clave AES:
* Se genera una clave AES aleatoria que se usará para cifrar los datos.
2. Cifrado del Mensaje con AES:
* El mensaje se cifra utilizando la clave AES generada.
* Esto produce el “Mensaje Cifrado”.
3. Cifrado de la Clave AES con RSA:
* La clave AES se cifra usando la clave pública RSA.
* Esto produce la “Encrypted AES Key”.

### Campos en la Aplicación

* Mensaje Cifrado: Es el texto del mensaje original cifrado usando AES.
* IV (Initialization Vector): Es un valor aleatorio que se utiliza junto con la clave AES para garantizar que el cifrado sea único cada vez, incluso si el mismo mensaje se cifra múltiples veces.
* Encrypted AES Key: Es la clave AES cifrada con la clave pública RSA. Esta clave cifrada se puede almacenar y transmitir de manera segura porque solo se puede descifrar con la clave privada RSA correspondiente.

### Descripción del Proceso en la Aplicación

1. Cifrado:
* Se genera una clave AES.
* El mensaje se cifra con la clave AES.
* La clave AES se cifra con la clave pública RSA.
* El “Mensaje Cifrado”, el “IV” y la “Encrypted AES Key” se almacenan y/o se transmiten.
2. Descifrado:
* La “Encrypted AES Key” se descifra usando la clave privada RSA para recuperar la clave AES original.
* El “Mensaje Cifrado” se descifra usando la clave AES recuperada y el “IV” para obtener el mensaje original.