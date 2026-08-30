# ADR-003: Session Authentication

## Status
Accepted

## Date
2026-08-30

## Context
El prototipo confiaba en un `studentId` enviado por el navegador. Esto permite consultar o modificar el progreso de otro estudiante y no es aceptable para una prueba multiusuario.

## Decision
Las contraseñas se derivan con `scrypt` y una sal aleatoria. La autenticación crea un token aleatorio, almacena únicamente su hash SHA-256 y entrega el token mediante cookie `HttpOnly`, `SameSite=Lax`. Los casos de uso obtienen el estudiante desde la sesión autenticada y nunca desde el cuerpo o query string.

## Consequences
- Las sesiones son revocables y expiran en siete días.
- Un acceso a la base de datos no revela los tokens activos ni contraseñas en texto plano.
- Producción deberá habilitar HTTPS para utilizar la marca `Secure` de la cookie.
- Rate limiting, recuperación de contraseña y verificación de correo quedan para el endurecimiento previo al despliegue público.
