# 🛡️ Reporte de Seguridad — Refinería GoldTrack

**Fecha:** Julio 2026  
**Auditoría:** Backend (NestJS + Prisma + Vercel PostgreSQL)  
**Estado General:** 🟢 Seguro  

---

## 1. La Tecnología que nos Protege

### 🔐 Vercel PostgreSQL — Nuestra Caja Fuerte en la Nube

Imagina que tus datos no están guardados en una computadora común, sino en una **bóveda bancaria con vigilancia 24/7**. Vercel PostgreSQL es exactamente eso: una base de datos alojada en los servidores de Vercel (la misma empresa que hostea la página web), con:

- **Cifrado en tránsito (SSL/TLS):** Todos los datos viajan encriptados, como si fueran mensajes en un código secreto que nadie puede leer aunque los intercepte.
- **Backups automáticos:** Si algo sale mal, tenemos copias de seguridad.
- **Acceso controlado:** Solo el backend (a través de Prisma) puede hablar con la base de datos.

### 🛡️ Prisma — Nuestro Guardia de Seguridad Digital

Prisma es nuestro **traductor oficial** entre el código del sistema y la base de datos. No permitimos que nadie hable directamente con la bóveda. Todo pasa por Prisma, quien:

1. **Recibe la orden** del sistema (ej: "dame todas las barras de oro del proveedor X").
2. **Verifica que la orden sea válida** y no tenga instrucciones ocultas.
3. **Traduce la orden a SQL** (el idioma de la base de datos) de forma segura.
4. **Entrega el resultado** de vuelta al sistema.

---

## 2. ¿Qué es una Inyección SQL?

### Analogía: El Cheque en Blanco

Imagina que tienes un **formulario de retiro de oro** en la bóveda. El formulario tiene un espacio para escribir tu **firma**. Una inyección SQL sería como si alguien, en lugar de escribir su firma, escribiera:

> *"Y además de mi firma, retira todo el oro del proveedor Pérez y ponlo en mi cuenta personal"*

Si el guardia (Prisma) no está entrenado para detectar esto, obedecería la orden completa. **Eso es una inyección SQL**: un comando malicioso disfrazado de dato legítimo.

### ¿Cómo lo evitamos?

- ✅ **No escribimos SQL a mano.** Todo pasa por Prisma, que automáticamente separa los comandos de los datos.
- ✅ **Validamos cada dato antes de enviarlo** (peso, pureza, código de barra, etc.).
- ✅ **No encontramos ni una sola línea de SQL raw en todo el código.** Esto es excelente.

---

## 3. Estado de la Bóveda Digital

| Componente | Semáforo | ¿Qué significa? |
|---|---|---|
| **Conexión a base de datos** | 🟢 Seguro | Usa SSL/TLS (`sslmode=verify-full`). Los datos viajan encriptados. |
| **SQL Injection** | 🟢 Seguro | 0 riesgos detectados. Todo pasa por Prisma. |
| **Validación de datos (DTOs)** | 🟢 Seguro | Los 22 puntos de entrada validan tipo, formato y valores. |
| **Rechazo de datos extraños** | 🟢 Seguro | Activamos el filtro que rechaza campos no autorizados. |
| **Credenciales en el código** | 🟢 Seguro | No hay contraseñas ni tokens en el código fuente. |
| **Contraseñas de usuarios** | 🟢 Seguro | Encriptadas con bcrypt (10 rondas). |
| **Autenticación (JWT)** | 🟢 Seguro | Tokens firmados con clave secreta, con expiración de 7 días. |
| **Headers de seguridad web** | 🟢 Seguro | Configurada protección HSTS, clickjacking y MIME sniffing. |
| **CORS (acceso cruzado)** | 🟢 Seguro | Solo orígenes autorizados (frontend y localhost). |

---

## 4. Hallazgos y Soluciones Aplicadas

### 🔴 Hallazgo 1: Fallback con credenciales en el código

**Detectamos:** En el archivo de conexión a la base de datos había una **clave de respaldo** escrita directamente en el código (`postgresql://postgres:postgres@localhost:5432/goldtrack`). Si por algún fallo la variable de entorno no se cargaba, el sistema usaría estas credenciales locales.

**Solución aplicada:** Eliminamos esa clave de respaldo. Ahora, si la variable de entorno `DATABASE_URL` no está configurada, el sistema se **detiene inmediatamente** y muestra un error claro. Así evitamos conexiones inseguras por accidente.

### 🟡 Hallazgo 2: Campos extra no eran rechazados

**Detectamos:** El sistema aceptaba peticiones con datos adicionales no esperados. Aunque los ignoraba, la práctica recomendada es **rechazarlos activamente** para evitar que un atacante intente colar información maliciosa.

**Solución aplicada:** Activamos el modo `forbidNonWhitelisted`. Ahora, si alguien envía un campo que no está definido en el formulario (DTO), el sistema responde con un error. Es como si la puerta de la bóveda no solo revisara la llave, sino que además rechazara cualquier objeto extraño que intenten meter junto con la llave.

### 🟡 Hallazgo 3: Esquema de base de datos sin referencia explícita

**Detectamos:** El archivo de configuración de Prisma (`schema.prisma`) no declaraba de dónde obtener la URL de conexión. Esto podía causar comportamientos impredecibles en migraciones.

**Solución aplicada:** Agregamos la referencia explícita `url = env("DATABASE_URL")` para que Prisma sepa siempre que debe leer la conexión desde las variables de entorno.

### 🟡 Hallazgo 4: Sin headers de seguridad en Vercel

**Detectamos:** El archivo de configuración de Vercel no incluía cabeceras de seguridad HTTP, que protegen contra ataques comunes como clickjacking o sniffing de contenido.

**Solución aplicada:** Configuramos:
- **`X-Content-Type-Options: nosniff`** — Evita que el navegador malinterprete el tipo de archivo.
- **`X-Frame-Options: DENY`** — Evita que nuestra página sea incrustada en sitios maliciosos (protección contra clickjacking).
- **`Strict-Transport-Security`** — Fuerza conexiones HTTPS siempre.

---

## 5. Buenas Prácticas ya Implementadas (que no tocamos)

| Práctica | Estado | Detalle |
|---|---|---|
| `.env` en `.gitignore` | ✅ | Las credenciales reales nunca se suben a Git. |
| Contraseñas hasheadas | ✅ | bcrypt con 10 rondas de salting. |
| JWT con expiración | ✅ | Tokens expiran a los 7 días. |
| CORS con lista blanca | ✅ | Solo frontend autorizado puede hacer peticiones. |
| Filtro global de excepciones | ✅ | Errores se manejan sin exponer detalles internos. |
| Telegram vía environment | ✅ | Token del bot no está hardcodeado. |

---

## 6. Conclusión de Confianza

El sistema **GoldTrack Refinería** está ahora en una posición sólida de seguridad. Al estar hosteado en **Vercel**, nos beneficiamos de su infraestructura empresarial con cifrado SSL/TLS, redes de distribución global y protección DDoS automática.

**Lo que hemos hecho en esta auditoría:**

- 🛡️ **Eliminamos** un riesgo de fuga de credenciales locales.
- 🛡️ **Fortalecemos** la validación de datos para rechazar información maliciosa.
- 🛡️ **Aseguramos** la configuración de Prisma para que siempre use las credenciales correctas.
- 🛡️ **Agregamos** capas de protección HTTP en el edge de Vercel.

**Tu inversión tecnológica está protegida.** Los datos de inventario de oro, los saldos de proveedores y la información del personal están resguardados bajo múltiples capas de seguridad:

```
🔐 Vercel Edge (WAF + HTTPS)
  → 🔐 NestJS (Validación + Autenticación JWT)
    → 🔐 Prisma (ORM type-safe, sin SQL Injection)
      → 🔐 Vercel PostgreSQL (SSL/TLS + Backups)
```

La bóveda está cerrada, el guardia está entrenado y las llaves están seguras.

---

