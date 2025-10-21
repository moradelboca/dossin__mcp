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

## Ejemplo de flujo de trabajo con Claude

1. **Primero, obtener el schema**:
   ```
   Usuario: ¿Qué tablas hay en la base de datos?
   Claude: [Usa get_database_schema y muestra las tablas]
   ```

2. **Luego, ejecutar consultas**:
   ```
   Usuario: Muestra los camiones con matrícula ABC
   Claude: [Usa execute_query con SELECT * FROM camiones WHERE matricula LIKE '%ABC%']
   ```

## Configuración para instrucciones del LLM

Para que Claude no explique todos los pasos detalladamente y solo dé la información pedida, puedes agregar en tus instrucciones personalizadas de Claude:

```
Cuando uses el servidor MCP de Dossin:
- Primero usa get_database_schema para entender la estructura
- Luego usa execute_query para obtener datos
- NO expliques los pasos técnicos, solo muestra los resultados de manera clara
- Presenta los datos en formato de tabla cuando sea apropiado
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

## Licencia

MIT
