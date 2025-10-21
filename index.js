#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

dotenv.config();

// URL del backend (puedes cambiar esta variable directamente para configurar el backend)
const BACKEND_URL = "http://localhost:3000/api";

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
          "Obtiene el schema completo de la base de datos MySQL incluyendo todas las tablas, columnas, tipos de datos, relaciones (foreign keys), índices y metadatos. Usa esta herramienta PRIMERO para entender la estructura de la base de datos antes de realizar consultas.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "execute_query",
        description:
          "Ejecuta una consulta SQL en la base de datos y retorna los resultados. Usa esta herramienta DESPUÉS de obtener el schema para ejecutar consultas SELECT y obtener datos específicos.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "La consulta SQL a ejecutar (preferentemente SELECT)",
            },
            params: {
              type: "array",
              description:
                "Parámetros opcionales para la consulta (para usar con placeholders ?)",
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dossin MCP Server running on stdio");
}

// Si el archivo se ejecuta directamente, iniciar el servidor
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
