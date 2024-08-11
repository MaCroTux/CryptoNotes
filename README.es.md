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