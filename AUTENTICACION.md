# 🔐 Autenticación en Dossin MCP

## Resumen

El sistema ahora soporta **autenticación flexible** para permitir que Claude compile componentes con trazabilidad del usuario real.

---

## 🔄 Flujo de Autenticación

### Backend
El middleware `mdwUsuario` acepta tokens de **dos fuentes**:

1. **Cookie** `accessToken` (usuarios del frontend web)
2. **Header** `Authorization: Bearer {token}` (MCP desde Claude)

```javascript
// Middleware detecta automáticamente:
const accessToken = req.cookies?.accessToken;  // Intento 1: Cookie

if (!accessToken && req.headers.authorization) {
  // Intento 2: Header Authorization
  accessToken = authHeader.substring(7); // Remueve "Bearer "
}

// Valida el token con el servicio de autenticación
// req.user = { id: 123, email: "jose@dossin.com", ... }
```

### MCP
La tool `compile_and_save_component` acepta un parámetro opcional `userToken`:

```javascript
{
  reactCode: "export default function...",
  componentName: "TurnosDelDia",
  userToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // ← Opcional
}
```

Si el token está presente, el MCP lo mapea al header `Authorization: Bearer {token}`.

---

## 👤 Uso desde Claude

### Caso 1: Sin Token (Desarrollo)
```
Usuario: "Compila este componente de turnos"

Claude: [Llama a compile_and_save_component sin userToken]
        ↓
Backend: req.user = {} (sin autenticación)
        ↓
        ⚠️ Puede fallar en producción si requiere autenticación
```

### Caso 2: Con Token (Producción)
```
Usuario: "Compila este componente. Mi token es: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyM30..."

Claude: [Extrae el token del mensaje]
        [Llama a compile_and_save_component con userToken]
        ↓
MCP:    headers['Authorization'] = "Bearer eyJhbGci..."
        ↓
Backend: Valida token → req.user = { id: 123, email: "jose@dossin.com" }
        ↓
        ✅ Componente creado con trazabilidad del usuario
        ✅ Registro: "Creado por jose@dossin.com"
```

---

## 🎯 Cómo Obtener Tu Token

### Método 1: Consola del Navegador (Recomendado)

1. Abre el frontend de Dossin (estando logueado)
2. Abre DevTools (F12)
3. En la consola, ejecuta:

```javascript
document.cookie
  .split('; ')
  .find(row => row.startsWith('accessToken='))
  ?.split('=')[1]
```

4. Copia el resultado (el token JWT)
5. Pégalo en Claude cuando compiles un componente

### Método 2: Endpoint Dedicado (Futuro)

Se podría crear un endpoint `/api/auth/my-token` para facilitar esto:

```javascript
// GET /api/auth/my-token (requiere estar logueado)
{
  "token": "eyJhbGciOiJIUz...",
  "user": {
    "id": 123,
    "email": "jose@dossin.com"
  },
  "expiresAt": "2025-12-19T...",
  "instructions": "Copia este token y úsalo en Claude Desktop"
}
```

Y en el frontend, un botón "Copiar Token para Claude".

---

## 🔒 Seguridad

### Tokens JWT
- ✅ **Validados** por el microservicio de autenticación
- ✅ **Contienen** información del usuario (id, email, rol)
- ⚠️ **Expiran** después de cierto tiempo (configurado en el servicio de auth)
- ⚠️ **Deben renovarse** periódicamente

### Recomendaciones
1. **No compartas tu token** públicamente
2. **Renueva el token** si sospechas que fue comprometido (logout + login)
3. **Configúralo solo** en tu máquina local
4. El token en Claude Desktop se guarda en archivos locales (no viaja a servidores de Anthropic)

---

## 📊 Trazabilidad

Con el token de usuario, el backend puede:

1. **Identificar** quién creó cada componente
2. **Auditar** todas las compilaciones
3. **Aplicar permisos** específicos por usuario (futuro)
4. **Registrar logs** detallados con email del usuario

Ejemplo de log:
```
[2025-12-12 10:30:45] Compilación exitosa
  Usuario: jose@dossin.com (ID: 123)
  Componente: TurnosDelDia
  Método: Bearer token (desde MCP)
  URL: https://dev.dossin.com.ar/components/TurnosDelDia-123-1702382445.html
```

---

## ⚙️ Configuración de Ambientes

### Desarrollo
- Frontend usa cookies
- Backend acepta requests sin token (modo dev)
- MCP puede compilar sin token

### Producción
- Frontend usa cookies
- MCP debe recibir token del usuario
- Backend valida todos los tokens
- Componentes quedan asociados al usuario creador

---

## ❓ FAQ

**P: ¿El token expira?**  
R: Sí, según la configuración del servicio de autenticación. Cuando expire, obtén uno nuevo desde el frontend.

**P: ¿Puedo usar Claude sin token?**  
R: Sí, puedes hacer queries y obtener schemas. Solo la compilación requiere token en producción.

**P: ¿Dónde se guarda mi token en Claude Desktop?**  
R: No se guarda. Debes pegarlo cada vez que compiles, o Claude lo recordará durante la sesión actual.

**P: ¿Es seguro pegar mi token en el chat?**  
R: El token se procesa localmente en el MCP y no se envía a servidores externos. Solo viaja al backend de Dossin.

**P: ¿Puedo revocar un token?**  
R: Sí, haciendo logout en el frontend se invalida el token actual.

---

## 🚀 Próximas Mejoras

1. **Endpoint `/my-token`** en el backend para obtener el token fácilmente
2. **Botón en el frontend** "Copiar Token para Claude"
3. **Tokens de larga duración** específicos para MCP (sin expiración por sesión)
4. **Rotación automática** de tokens
5. **Dashboard de componentes** creados por cada usuario
