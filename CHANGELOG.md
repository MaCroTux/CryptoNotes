# CHANGELOG

## [2.0] - 2024-07-19
### Added
- Sistema de registro de usuarios con claves públicas.
- Funcionalidad de inicio de sesión con verificación de claves públicas.
- Capacidad de compartir notas cifradas con otros usuarios usando sus claves públicas.
- Botón de "Refrescar Notas" para actualizar manualmente el listado de notas cifradas.
- Alerta de éxito al cifrar un mensaje para evitar múltiples pulsaciones del botón.

### Fixed
- Control de acceso a las notas para asegurar que solo usuarios logueados puedan ver sus notas.
- Interfaz de usuario mejorada para facilitar la navegación y uso.

### Updated
- Mejora en la gestión de claves y en la seguridad de la aplicación.

## [1.1] - 2024-07-19
### Added
- Sistema de traducción para la interfaz (Español e Inglés).
- Implementación de un campo oculto para manejar la "Clave AES Cifrada" completa para el descifrado.
- Mejora en la visualización de la "Clave AES Cifrada" usando una versión abreviada.

### Fixed
- Corrección de errores en la recuperación y asignación de la "Clave AES Cifrada" al hacer clic en el listado de mensajes cifrados.

### Updated
- Mejora en la interfaz de usuario para manejar claves y mensajes cifrados.