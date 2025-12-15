# Dossin MCP Server

Este paquete es un servidor MCP (Model Context Protocol) diseñado para interactuar con la base de datos de Dossin a través de su backend.

## Instalación

Este servidor MCP se descarga directamente desde GitHub, no requiere instalación previa ni configuración de tokens.

## Uso en Claude Desktop

Para usar este servidor MCP en Claude Desktop, configura el archivo `claude_desktop_config.json` de la siguiente manera:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dossin": {
      "command": "npx",
      "args": ["-y", "github:moradelboca/dossin__mcp"],
      "env": {
        "BACKEND_URL": "http://localhost:3000/api"
      }
    }
  }
}
```

**Importante**: 
- Asegúrate de que el backend de Dossin esté corriendo en `http://localhost:3000`
- Reinicia completamente Claude Desktop después de agregar la configuración
- No necesitas configurar tokens ni `.npmrc`, funciona directamente desde GitHub

## Descripción

Este servidor MCP se descarga directamente desde GitHub usando `npx`. Actúa como puente entre Claude y el backend de Dossin, exponiendo tres herramientas principales:

1. **get_database_schema**: Obtiene el schema completo de la base de datos con metadatos (vía GET /api/database/schema)
2. **execute_query**: Ejecuta consultas SQL y retorna resultados (vía POST /api/database/query)
3. **compile_and_save_component**: Envía componentes React al backend para compilación remota (vía POST /api/archivos/compilar)

### Prerequisitos

1. El backend de Dossin debe estar corriendo en `http://localhost:3000` (o la URL que configures en Claude Desktop)
2. Los endpoints `/api/database/schema`, `/api/database/query` y `/api/archivos/compilar` deben estar disponibles
3. Node.js instalado (v18 o superior recomendado)

## Herramientas disponibles

### 1. get_database_schema

Obtiene el schema completo de la base de datos.

**Uso en Claude**:
```
Obtén el schema de la base de datos
```

**Respuesta**: JSON con todas las tablas, columnas, tipos, relaciones y metadatos.

### 2. execute_query

Ejecuta consultas SQL SELECT.

**Uso en Claude**:
```
Ejecuta la siguiente query: SELECT * FROM camiones LIMIT 10
```

**Respuesta**: JSON con columnas, filas y conteo.

### 3. compile_and_save_component ⭐ Compilación Remota

Envía componentes React al backend para compilación remota y obtiene una URL pública del componente compilado.

**Uso en Claude**:
```
Usuario: "Compila este componente React"
Usuario: "Sube el componente VolumenCargaProvincias al backend"
Usuario: "Exporta este componente a HTML"
```

**Autenticación (Producción)**:

En producción, este endpoint requiere autenticación. Puedes proporcionar tu token de dos formas:

**Opción 1 - Pasar el token en el chat**:
```
Usuario: "Compila este componente. Mi token es: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Claude automáticamente extraerá y usará el token para autenticarse con el backend.

**Opción 2 - Obtener tu token**:

Desde la consola del navegador en el frontend de Dossin:
```javascript
// Copia este resultado y pégalo en Claude
document.cookie
  .split('; ')
  .find(row => row.startsWith('accessToken='))
  ?.split('=')[1]
```

**Funcionalidad**:
- Envía el código JSX al backend vía POST /api/archivos/compilar
- Autenticación automática con el token del usuario
- El backend compila y bundlea el componente
- Retorna URL pública del componente compilado
- El componente queda registrado con el email del usuario que lo creó
- Disponible para usar en iframes, compartir, etc.

**Ventajas**:
- ✅ Compilación centralizada en el backend
- ✅ URL pública inmediata
- ✅ Trazabilidad completa (quién creó qué)
- ✅ Sin dependencias pesadas en el MCP
- ✅ Archivos listos para producción
- ✅ Fácil de embeber y compartir

**Ejemplo de respuesta**:
```json
{
  "success": true,
  "url": "https://dev.dossin.com.ar/components/VolumenCargaProvincias-2025-12-10.html",
  "htmlPath": "/components/VolumenCargaProvincias-2025-12-10.html",
  "message": "Componente compilado exitosamente en el backend. URL: https://..."
}
```

## Ejemplo de flujo de trabajo con Claude

### Consultas naturales que Claude puede interpretar:

**Turnos:**
```
Usuario: ¿Hay turnos mañana?
Usuario: ¿Cuántos turnos tengo hoy?
Usuario: Muéstrame los turnos pendientes de esta semana
Usuario: ¿Qué turnos tiene el camión ABC123?
```

**Camiones:**
```
Usuario: ¿Qué camiones están disponibles?
Usuario: Muestra los datos del camión con matrícula XYZ789
Usuario: ¿Cuántos camiones tenemos registrados?
```

**Cargas:**
```
Usuario: ¿Qué cargas están en proceso?
Usuario: Muestra las cargas de maíz del último mes
Usuario: ¿Cuántas toneladas se cargaron hoy?
```

**Choferes:**
```
Usuario: Lista todos los choferes activos
Usuario: ¿Qué chofer maneja el camión ABC123?
```

### Flujo técnico (lo que hace Claude internamente):

1. **Primero, obtener el schema** (si no lo tiene):
   ```
   Claude: [Usa get_database_schema internamente]
   ```

2. **Interpretar la pregunta y construir query**:
   ```
   Usuario: ¿Hay turnos mañana?
   Claude: [Construye: SELECT * FROM turnos WHERE fecha = '2025-10-22']
   Claude: [Usa execute_query]
   ```

3. **Presentar resultados de forma natural**:
   ```
   Claude: "Sí, hay 5 turnos programados para mañana:
   
   | Hora  | Camión  | Producto | Destino |
   |-------|---------|----------|---------|
   | 08:00 | ABC123  | Maíz     | Puerto  |
   | ..."
   ```

## Generación y Compilación de Componentes React

El servidor MCP de Dossin permite un flujo completo desde la generación hasta la compilación remota de componentes React:

### Flujo Completo:

1. **Generación**: Claude genera el componente React basado en tu solicitud
2. **Envío al Backend**: Claude envía el código al backend para compilación
3. **Compilación Remota**: El backend compila y bundlea el componente
4. **URL Pública**: Recibes una URL pública del componente compilado

### Ejemplo de Uso Completo:

```
Usuario: "Crea un componente con el volumen de carga por provincia de los últimos 6 meses"

Claude: 
1. [Genera componente React completo]
2. [Muestra el código al usuario]
3. "¿Quieres que lo compile en el backend?"

Usuario: "Sí, compílalo"

Claude:
[Usa compile_and_save_component]
"✅ Componente compilado en el backend.
URL: https://dev.dossin.com.ar/components/VolumenCargaProvincias-2025-12-10.html

Puedes:
- Abrirlo directamente en el navegador
- Embederlo en un iframe
- Compartir la URL"
```

## Generación de Componentes React Interactivos

Los componentes generados tienen las siguientes características:

### Características de los Componentes Generados:

1. **Componentes Atómicos y Relevantes**:
   - Solo muestran las estadísticas explícitamente solicitadas
   - No incluyen información adicional no solicitada
   - Pueden mostrar múltiples estadísticas si se solicitan juntas

2. **Carga de Datos en Tiempo Real**:
   - Los datos se cargan automáticamente al montar el componente
   - Usa `fetch` para consultar el backend de Dossin
   - Incluye manejo de estados de carga y errores

3. **Editor Visual Integrado**:
   - Controles para modificar estilos en tiempo real:
     * Colores (fondo, texto, bordes)
     * Tamaños (padding, margin, fuente)
     * Bordes (radio, grosor)
     * Sombras
   - Los cambios se reflejan inmediatamente
   - Opcional: guardar configuración visual en el backend

### Ejemplos de Uso:

```
Usuario: "Muéstrame los turnos de hoy en un componente React interactivo"
Claude: [Genera componente React con fetch, editor de estilos, y datos de turnos]

Usuario: "Necesito un dashboard con total de camiones y cargas activas"
Claude: [Genera componente con ambas estadísticas y editor visual]

Usuario: "Crea un widget para visualizar productos más cargados"
Claude: [Genera componente con query específico y estilos editables]
```

### Estructura del Componente:

Los componentes generados por Claude siguen esta estructura:

```jsx
import React, { useState, useEffect } from 'react';

function ComponenteDossin() {
  // Estados para datos y estilos
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [styles, setStyles] = useState({
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: '20px',
    fontSize: '16px',
    borderRadius: '8px'
  });

  // Carga de datos al montar
  useEffect(() => {
    fetch('http://localhost:3000/api/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sql: 'SELECT ... FROM ...',
        params: []
      })
    })
    .then(res => res.json())
    .then(result => {
      setData(result.rows);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  // Función para actualizar estilos
  const updateStyle = (property, value) => {
    setStyles(prev => ({ ...prev, [property]: value }));
  };

  // Renderizado con estados de carga/error
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Visualización de datos con estilos dinámicos */}
      <div style={styles}>
        {/* Contenido específico de la estadística */}
      </div>
      
      {/* Editor de estilos */}
      <div className="style-editor">
        <h3>Editor de Estilos</h3>
        {/* Controles de color, tamaño, etc. */}
      </div>
    </div>
  );
}

export default ComponenteDossin;
```

### Requisitos:

- **React**: Los componentes usan Hooks (useState, useEffect)
- **Fetch API**: No requiere librerías adicionales
- **Backend activo**: El backend de Dossin debe estar corriendo
- **CORS configurado**: El backend debe permitir peticiones desde el frontend

## Configuración para instrucciones del LLM

Para que Claude entienda mejor el contexto de Dossin y responda de manera más natural, agrega estas instrucciones personalizadas en la configuración de Claude Desktop:

```
Estás conectado al sistema Dossin, un sistema de gestión de cargas y agro.

Contexto del negocio:
- Dossin gestiona turnos de carga/descarga de productos agrícolas
- Administra camiones, choferes, cargas, clientes y destinos
- La base de datos contiene información operativa del día a día

Cuando el usuario hable de:
- "turnos" o "turnos de mañana/hoy" → Consulta la tabla de turnos con fechas
- "camiones" → Busca en vehículos/camiones registrados
- "cargas" → Operaciones de carga activas o históricas
- "choferes/conductores" → Personal de conducción
- "productos" → Productos agrícolas (cereales, oleaginosas)
- "clientes" → Empresas o productores que usan el servicio

Comportamiento esperado:
1. Usa get_database_schema PRIMERO para entender la estructura
2. Construye queries SQL apropiadas basadas en el schema
3. NO expliques los pasos técnicos en detalle, solo responde directamente
4. Presenta datos en tablas cuando sea apropiado
5. Interpreta preguntas naturales y tradúcelas a consultas SQL relevantes
6. CUANDO SE SOLICITEN COMPONENTES REACT: Genera código completo, funcional, con fetch y editor de estilos

Ejemplo de consulta simple:
Usuario: "¿Hay turnos mañana?"
→ Obtén schema si no lo tienes
→ Ejecuta: SELECT * FROM turnos WHERE fecha = '2025-10-22'
→ Responde: "Sí, hay X turnos programados para mañana: [lista]"

Ejemplo de componente React:
Usuario: "Muéstrame los turnos de hoy en un componente React"
→ Genera componente completo con:
  - useEffect para fetch de datos
  - Editor de estilos (colores, tamaños, etc.)
  - Manejo de estados de carga/error
  - Solo información solicitada (turnos de hoy)
```

## Desarrollo

Para ejecutar el servidor en modo desarrollo con auto-reload:

```bash
npm run dev
```

## Testing manual

Para probar el servidor manualmente:

```bash
node index.js
```

El servidor se comunicará a través de stdio (stdin/stdout) usando el protocolo MCP.

## Estructura del proyecto

```
mcp/
├── index.js           # Servidor MCP principal
├── package.json       # Dependencias (solo MCP SDK y dotenv)
├── src/
│   ├── config.js      # Configuración del servidor
│   ├── database.js    # Funciones para interactuar con la BD
│   ├── handlers.js    # Handlers de las herramientas MCP
│   └── tools.js       # Definición de herramientas MCP
├── .env              # Variables de entorno (no incluido en git)
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore        # Archivos a ignorar
└── README.md         # Esta documentación
```

## Notas importantes

- El servidor se comunica con el backend vía HTTP, no se conecta directamente a la base de datos
- El servidor NO tiene autenticación. La autenticación (si la hay) la maneja el backend
- Las consultas SQL no están restringidas por ahora (depende de la lógica del backend)
- La compilación de componentes React se realiza en el backend, no localmente
- El MCP solo envía el código JSX al backend y recibe la URL del componente compilado
- Asegúrate de que el backend esté corriendo antes de usar este MCP server

## Solución de problemas

### Error de conexión al backend

Verifica que:
- El backend de Dossin esté corriendo (`npm start` en la carpeta backend)
- La URL en `BACKEND_URL` sea correcta (por defecto `http://localhost:3000/api`)
- Los endpoints `/api/database/schema` y `/api/database/query` estén disponibles

### Claude no detecta el servidor

- Verifica que la ruta en `claude_desktop_config.json` sea absoluta y correcta
- Reinicia completamente Claude Desktop
- Revisa los logs de Claude Desktop para ver errores

### El servidor no responde

- Asegúrate de que todas las dependencias estén instaladas (`npm install`)
- Verifica que Node.js esté en la versión correcta (v18 o superior recomendado)

## Ejemplos Prácticos de Componentes React

### Ejemplo 1: Componente Simple - Total de Turnos

**Solicitud del usuario:**
```
"Crea un componente React que muestre el total de turnos de hoy"
```

**Claude generará:**
- Componente que hace fetch a `/api/database/query` con SQL: `SELECT COUNT(*) as total FROM turnos WHERE fecha = CURDATE()`
- Editor con controles para: backgroundColor, color, fontSize, padding, borderRadius
- Visualización del número con estilos aplicables en tiempo real

### Ejemplo 2: Componente con Múltiples Estadísticas

**Solicitud del usuario:**
```
"Dame un dashboard con total de camiones, cargas activas y turnos pendientes"
```

**Claude generará:**
- Componente con 3 fetch diferentes (o un fetch con JOIN)
- Una card para cada estadística solicitada
- Editor de estilos que afecta a todo el dashboard o cards individuales
- Solo muestra esas 3 estadísticas (nada más)

### Ejemplo 3: Componente con Lista

**Solicitud del usuario:**
```
"Muéstrame los 5 productos más cargados este mes en un componente visual"
```

**Claude generará:**
- Query con GROUP BY y ORDER BY LIMIT 5
- Lista/tabla ordenada con los productos
- Editor para personalizar colores, tamaños de fuente, espaciado
- Gráfico o visualización si es apropiado

### Ejemplo 4: Componente con Filtros

**Solicitud del usuario:**
```
"Necesito ver turnos por fecha con selector de fecha"
```

**Claude generará:**
- Input de fecha que actualiza el estado
- useEffect que re-fetch cuando cambia la fecha
- Editor de estilos visual
- Lista de turnos filtrados por fecha seleccionada

## Integración con Proyectos React

Para usar los componentes generados en tu proyecto React:

1. **Copia el código** generado por Claude
2. **Instala dependencias** (si no las tienes):
   ```bash
   npm install react
   ```
3. **Ajusta la URL del backend** si es necesario (variable de entorno recomendada)
4. **Configura CORS** en el backend de Dossin para aceptar peticiones desde tu frontend
5. **Importa y usa** el componente en tu app

Ejemplo de uso:
```jsx
import EstadisticaTurnos from './components/EstadisticaTurnos';

function App() {
  return (
    <div className="App">
      <h1>Dashboard Dossin</h1>
      <EstadisticaTurnos />
    </div>
  );
}
```

## Personalización Avanzada

Los componentes generados son puntos de partida. Puedes extenderlos:

- **Agregar más controles de estilo**: shadows, transforms, animations
- **Guardar configuración**: Persistir estilos en localStorage o backend
- **Añadir gráficos**: Integrar Chart.js, Recharts, etc.
- **Exportar estilos**: Generar CSS/Tailwind classes desde la configuración
- **Temas**: Crear presets de estilos (oscuro, claro, corporativo)

## Notas de Seguridad

⚠️ **Importante**: Los componentes generados hacen peticiones al backend sin autenticación por defecto. Para producción:

1. **Implementa autenticación** (JWT, OAuth, etc.)
2. **Valida permisos** en el backend
3. **Sanitiza queries SQL** (el backend ya debe hacer esto)
4. **Usa HTTPS** en producción
5. **Configura CORS** apropiadamente (no usar wildcard `*` en producción)

## Compilación Remota de Componentes

### ¿Cómo funciona?

El servidor MCP envía el código del componente al backend de Dossin, que se encarga de:

- **Compilación**: El backend usa esbuild para compilar JSX a JavaScript
- **Bundling**: Incluye todas las dependencias necesarias (React, librerías, etc.)
- **Optimización**: Minifica y optimiza el código
- **Hosting**: Sirve el HTML compilado desde una URL pública

### Ventajas de la Compilación Remota

- ✅ **MCP ligero**: Sin dependencias pesadas (esbuild, babel, react)
- ✅ **Centralizado**: Todas las compilaciones en un solo lugar
- ✅ **URL pública**: Acceso inmediato desde cualquier lugar
- ✅ **Gestión**: El backend puede versionar y administrar los componentes
- ✅ **Escalable**: Fácil agregar caché, CDN, etc.

### Flujo de Compilación

```
┌─────────┐                 ┌──────────┐                 ┌─────────┐
│  Claude │ ─── código ───▶ │   MCP    │ ── POST req ──▶ │ Backend │
└─────────┘                 └──────────┘                 └─────────┘
                                  │                            │
                                  │        ┌───────────────────┘
                                  │        │ Compila con esbuild
                                  │        │ Bundlea dependencias
                                  │        │ Guarda HTML
                                  │        ▼
                                  │   ┌─────────┐
                                  └───│   URL   │
                                      └─────────┘
```

## Documentación Adicional

- **MIGRATION_TO_ESM.md**: Guía completa de migración de UMD a ESM
- **CLAUDE_INSTRUCTIONS.md**: Instrucciones detalladas para Claude sobre cómo usar el sistema ESM
- **IMPLEMENTATION_SUMMARY.md**: Resumen técnico de la implementación
- **CHANGELOG.md**: Historial de cambios del proyecto

## Licencia

MIT
