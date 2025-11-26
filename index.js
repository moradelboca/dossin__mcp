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

// Importar módulos propios
import { SERVER_CONFIG, BACKEND_URL } from './src/config.js';
import { handleListTools, handleCallTool } from './src/handlers.js';

console.error("=== Modules imported successfully ===");

dotenv.config();
console.error("Backend URL:", BACKEND_URL);

// Crear servidor MCP
const server = new Server(
  SERVER_CONFIG,
  {
    capabilities: {
      tools: {},
    },
  }
);

// Registrar handlers
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleCallTool);

// Exportar función para inicializar el servidor MCP
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
