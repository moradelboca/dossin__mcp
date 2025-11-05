#!/usr/bin/env node

// Log inmediato para verificar que el script se está ejecutando
console.error("=== Dossin MCP Server Starting ===");
console.error("Node version:", process.version);
console.error("Working directory:", process.cwd());
console.error("Script path:", import.meta.url);

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

console.error("=== Modules imported successfully ===");

dotenv.config();

// URL del backend (lee desde variable de entorno o usa valor por defecto)
const BACKEND_URL = "https://api.dossin.com.ar/api";
console.error("Backend URL:", BACKEND_URL);

// Crear servidor MCP
const server = new Server(
  {
    name: "dossin-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Contexto del sistema Dossin para el LLM
const DOSSIN_CONTEXT = `
DOSSIN - Sistema de Gestión de Cargas y Agro

Dossin es un sistema integral de gestión diseñado para el sector agropecuario y logística de cargas. 
El sistema administra:

- **Turnos**: Programación y gestión de turnos para carga/descarga de productos agrícolas
- **Camiones**: Registro y seguimiento de vehículos de transporte (matrículas, choferes, capacidad)
- **Cargas**: Gestión de mercaderías, productos agrícolas, y operaciones de carga/descarga
- **Choferes**: Base de datos de conductores y sus documentaciones
- **Clientes**: Empresas y productores que utilizan el servicio
- **Productos**: Catálogo de productos agrícolas (cereales, oleaginosas, etc.)
- **Destinos**: Lugares de carga y descarga (puertos, acopios, plantas)

Cuando el usuario hable sobre:
- "turnos", "turnos de hoy/mañana" → Se refiere a turnos de carga programados
- "camiones" → Vehículos de transporte registrados
- "cargas" → Operaciones de carga/descarga de productos
- "choferes/conductores" → Personal de conducción
- "productos" → Productos agrícolas (maíz, soja, trigo, etc.)
- "clientes/productores" → Empresas o personas que utilizan el servicio

Base de datos MySQL que contiene todas las operaciones del sistema.

---

GENERACIÓN OBLIGATORIA DE COMPONENTES REACT INTERACTIVOS:

⚠️ IMPORTANTE: SIEMPRE que el usuario solicite consultar, visualizar o mostrar cualquier tipo de dato o estadística del sistema Dossin, DEBES GENERAR un componente React completo y funcional. No es opcional.

REQUISITOS OBLIGATORIOS DEL COMPONENTE:

1. **RELEVANCIA Y PRECISIÓN DE DATOS**:
   - El componente DEBE mostrar ÚNICAMENTE la información explícitamente solicitada por el usuario
   - NO incluir datos adicionales, sugerencias o información no solicitada
   - Si el usuario solicita múltiples estadísticas juntas, incluir todas ellas en el mismo componente
   - Si solicita una sola métrica, mostrar solo esa métrica
   - La estructura de datos debe reflejar exactamente lo solicitado

2. **CARGA AUTOMÁTICA DE DATOS EN TIEMPO REAL**:
   - Al montar el componente, DEBE ejecutar automáticamente las consultas necesarias
   - Utilizar useEffect con array de dependencias vacío para carga inicial
   - Implementar fetch para comunicarse con el backend de Dossin (URL: ${BACKEND_URL})
   - El endpoint a usar es: POST ${BACKEND_URL}/database/query
   - El body debe contener: { sql: "tu_query_aqui", params: [] }
   - Manejar correctamente las respuestas: result.rows contiene los datos
   - Implementar estados de carga (loading), error y datos
   - Las consultas SQL deben ser precisas y optimizadas según la solicitud del usuario

3. **EDITOR VISUAL INTEGRADO Y FUNCIONAL**:
   - DEBE incluir controles interactivos para modificar la apariencia del componente en tiempo real
   - Propiedades de estilo editables obligatorias:
     * Dimensiones: width, height, padding, margin
     * Colores: backgroundColor, color (texto), borderColor
     * Tipografía: fontSize, fontWeight, fontFamily, lineHeight
     * Bordes: borderWidth, borderRadius, borderStyle
     * Efectos visuales: boxShadow, opacity, transform
   - Tipo de controles recomendados:
     * Color pickers para propiedades de color
     * Number inputs o sliders para medidas numéricas
     * Select dropdowns para opciones predefinidas (font-family, border-style, etc.)
   - Los cambios DEBEN reflejarse INMEDIATAMENTE en el componente (sin necesidad de guardar)
   - Opcionalmente, puede incluir funcionalidad para persistir estilos (localStorage o fetch al backend)

4. **ARQUITECTURA Y ESTRUCTURA DEL COMPONENTE**:
   - Utilizar React Hooks modernos: useState, useEffect (y otros según necesidad)
   - Implementar manejo robusto de estados:
     * Estado de carga inicial (loading)
     * Estado de error con mensajes descriptivos
     * Estado de datos obtenidos
     * Estado de configuración visual (styles object)
   - Diseño responsive y adaptable a diferentes tamaños de pantalla
   - Interfaz de usuario limpia, intuitiva y profesional
   - Separación clara entre sección de visualización de datos y editor de estilos
   - Accesibilidad: labels apropiados, contraste de colores, navegación por teclado

5. **CALIDAD Y COMPLETITUD DEL CÓDIGO**:
   - El código DEBE ser completo, funcional y listo para ejecutar
   - Incluir TODOS los imports necesarios (React, hooks, etc.)
   - NO usar librerías externas para fetch (usar Fetch API nativa)
   - NO asumir que el usuario tiene otras dependencias instaladas más allá de React
   - Incluir comentarios descriptivos en secciones clave del código
   - Seguir mejores prácticas de React (naming conventions, component structure, etc.)
   - El componente debe ser copiable, pegable y ejecutable sin modificaciones

6. **ADAPTABILIDAD Y FLEXIBILIDAD**:
   - Adaptar la consulta SQL según la estadística o datos solicitados
   - La visualización de datos debe ser apropiada al tipo de información (tabla, lista, cards, métricas, etc.)
   - Permitir diferentes layouts según la cantidad y tipo de estadísticas
   - El editor de estilos puede ser colapsable o en panel lateral según el diseño
   - Considerar casos edge: datos vacíos, muchos registros, valores nulos, etc.

RECORDATORIOS CRÍTICOS:
- SIEMPRE genera el componente React completo, sin excepciones
- NO ofrecer alternativas sin componente (como solo mostrar datos en texto)
- El componente es la respuesta principal a cualquier consulta de datos
- Usa fetch (NO axios, NO otras librerías HTTP)
- La URL del backend es ${BACKEND_URL}
- Solo muestra información relevante a lo solicitado
- El editor visual es OBLIGATORIO, no opcional
- Los cambios visuales deben verse en tiempo real
`.trim();

// Función para obtener el schema de la base de datos desde el backend
async function getDatabaseSchema() {
  const response = await fetch(`${BACKEND_URL}/database/schema`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener schema: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Función para ejecutar queries a través del backend
async function executeQuery(query, params = []) {
  const response = await fetch(`${BACKEND_URL}/database/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: query,
      params,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Error al ejecutar query: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Handler para listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_database_schema",
        description:
          `${DOSSIN_CONTEXT}

Obtiene el schema completo de la base de datos MySQL de Dossin incluyendo todas las tablas, columnas, tipos de datos, relaciones (foreign keys), índices y metadatos. 

Usa esta herramienta PRIMERO para entender la estructura de la base de datos antes de realizar consultas.

La base de datos contiene información sobre: turnos, camiones, cargas, choferes, clientes, productos agrícolas, destinos, y todas las operaciones del sistema de gestión.`,
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "execute_query",
        description:
          `Ejecuta una consulta SQL en la base de datos de Dossin y retorna los resultados. 

Usa esta herramienta DESPUÉS de obtener el schema para ejecutar consultas SELECT y obtener datos específicos sobre:
- Turnos programados (hoy, mañana, por fecha)
- Camiones registrados (por matrícula, chofer, estado)
- Cargas activas o históricas
- Choferes y su información
- Clientes y productores
- Productos agrícolas disponibles
- Destinos de carga/descarga

IMPORTANTE: Solo ejecuta consultas SELECT. Usa parámetros (?) para valores dinámicos.`,
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "La consulta SQL a ejecutar (preferentemente SELECT). Ejemplo: SELECT * FROM turnos WHERE fecha = ? AND estado = 'pendiente'",
            },
            params: {
              type: "array",
              description:
                "Parámetros opcionales para la consulta (para usar con placeholders ?). Ejemplo: ['2025-10-22', 'activo']",
              items: {
                type: "string",
              },
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "get_database_schema") {
      const schema = await getDatabaseSchema();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    }

    if (request.params.name === "execute_query") {
      const { query, params = [] } = request.params.arguments;
      
      if (!query || typeof query !== "string") {
        throw new Error("Query is required and must be a string");
      }

      const result = await executeQuery(query, params);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error.message,
            stack: error.stack,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Exportar una función para inicializar el servidor MCP
export async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Dossin MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Iniciar el servidor automáticamente
console.error("=== Starting Dossin MCP Server ===");
startServer().catch((error) => {
  console.error("Server error:", error);
  console.error("Error stack:", error.stack);
  process.exit(1);
});

