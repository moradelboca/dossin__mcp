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

Este servidor MCP se descarga directamente desde GitHub usando `npx`. Actúa como puente entre Claude y el backend de Dossin, exponiendo dos herramientas principales:

1. **get_database_schema**: Obtiene el schema completo de la base de datos con metadatos (vía GET /api/database/schema)
2. **execute_query**: Ejecuta consultas SQL y retorna resultados (vía POST /api/database/query)

## Instalación

Este servidor MCP se descarga directamente desde GitHub, no requiere instalación previa ni configuración de tokens.

### Prerequisitos

1. El backend de Dossin debe estar corriendo en `http://localhost:3000` (o la URL que configures en Claude Desktop)
2. Los endpoints `/api/database/schema` y `/api/database/query` deben estar disponibles
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

### 3. compile_and_save_component ⭐ NUEVO

Compila componentes React a archivos HTML standalone y los guarda en `~/Downloads/dossin-components/`.

**Uso en Claude**:
```
Usuario: "Compila este componente React y guárdalo"
Usuario: "Guarda el componente VolumenCargaProvincias"
Usuario: "Exporta este componente a HTML"
```

**Funcionalidad**:
- Compila JSX a JavaScript usando esbuild
- Genera archivo HTML standalone con React incluido desde CDN
- Guarda en `~/Downloads/dossin-components/`
- Retorna: ruta del archivo, tamaño, hash MD5
- Listo para servir directamente desde el backend (sin compilación adicional)

**Ejemplo de respuesta**:
```json
{
  "success": true,
  "localPath": "/Users/usuario/Downloads/dossin-components/VolumenCargaProvincias-2025-11-07-143022.html",
  "fileName": "VolumenCargaProvincias-2025-11-07-143022.html",
  "fileSize": 12456,
  "hash": "a1b2c3d4e5f6...",
  "timestamp": "2025-11-07T14:30:22.123Z",
  "message": "Componente compilado y guardado exitosamente..."
}
```

**Ventajas**:
- ✅ Archivos listos para producción
- ✅ No requiere compilación en el backend (optimiza recursos)
- ✅ HTML standalone: funciona en cualquier servidor
- ✅ React desde CDN: mejor performance y caché
- ✅ Fácil de compartir y deployar

**Fase 2 (Próximamente)**:
- Parámetro `uploadToBackend: true` para subir automáticamente al backend
- Endpoint: `POST /api/components/upload`
- Retorna URL pública del componente

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

El servidor MCP de Dossin permite un flujo completo desde la generación hasta la compilación de componentes React:

### Flujo Completo:

1. **Generación**: Claude genera el componente React basado en tu solicitud
2. **Compilación**: Claude compila automáticamente el componente a HTML
3. **Guardado**: El archivo se guarda en `~/Downloads/dossin-components/`
4. **Deployment**: Puedes servir el archivo directamente desde tu backend

### Ejemplo de Uso Completo:

```
Usuario: "Crea un componente con el volumen de carga por provincia de los últimos 6 meses"

Claude: 
1. [Genera componente React completo]
2. [Muestra el código al usuario]
3. "¿Quieres que compile y guarde este componente?"

Usuario: "Sí, compílalo"

Claude:
[Usa compile_and_save_component]
"✅ Componente compilado y guardado en:
/Users/usuario/Downloads/dossin-components/VolumenCargaProvincias-2025-11-07-143022.html

Puedes:
- Abrirlo directamente en el navegador
- Servirlo desde tu backend en /public/components/
- Compartirlo como archivo standalone"
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
├── package.json       # Dependencias y scripts
├── .env              # Variables de entorno (no incluido en git)
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore        # Archivos a ignorar
└── README.md         # Esta documentación
```

## Notas importantes

- El servidor se comunica con el backend vía HTTP, no se conecta directamente a la base de datos
- El servidor NO tiene autenticación. La autenticación (si la hay) la maneja el backend
- Las consultas SQL no están restringidas por ahora (depende de la lógica del backend)
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

## Licencia

MIT
