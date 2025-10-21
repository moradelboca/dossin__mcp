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

Ejemplo:
Usuario: "¿Hay turnos mañana?"
→ Obtén schema si no lo tienes
→ Ejecuta: SELECT * FROM turnos WHERE fecha = '2025-10-22'
→ Responde: "Sí, hay X turnos programados para mañana: [lista]"
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
