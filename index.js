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
import * as esbuild from "esbuild";
import { promises as fs } from "fs";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import os from "os";
import { tmpdir } from "os";

console.error("=== Modules imported successfully ===");

dotenv.config();

// URL del backend (lee desde variable de entorno o usa valor por defecto)
const BACKEND_URL = "https://dev.dossin.com.ar/api";
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

GENERACIÓN OBLIGATORIA DE COMPONENTES REACT FUNCIONALES:

⚠️ IMPORTANTE: SIEMPRE que el usuario solicite consultar, visualizar o mostrar cualquier tipo de dato o estadística del sistema Dossin, DEBES GENERAR un componente React completo y funcional. No es opcional.

REQUISITOS OBLIGATORIOS DEL COMPONENTE:

1. **COMPONENTES ATÓMICOS - RELEVANCIA Y PRECISIÓN DE DATOS**:
   - El componente DEBE mostrar ÚNICAMENTE la información explícitamente solicitada por el usuario
   - NO incluir datos adicionales, sugerencias o información no solicitada
   - Si el usuario solicita múltiples estadísticas juntas, incluir todas ellas en el mismo componente
   - Si solicita una sola métrica, mostrar solo esa métrica
   - La estructura de datos debe reflejar exactamente lo solicitado
   - Principio atómico: cada componente tiene un propósito único y claro

2. **CARGA AUTOMÁTICA DE DATOS EN TIEMPO REAL**:
   - Al montar el componente, DEBE ejecutar automáticamente las consultas necesarias
   - Utilizar useEffect con array de dependencias vacío para carga inicial
   - Implementar fetch para comunicarse con el backend de Dossin (URL: ${BACKEND_URL})
   - El endpoint a usar es: POST ${BACKEND_URL}/database/query
   - El body debe contener: { sql: "tu_query_aqui", params: [] }
   - Manejar correctamente las respuestas: result.rows contiene los datos
   - Implementar estados de carga (loading), error y datos
   - Las consultas SQL deben ser precisas y optimizadas según la solicitud del usuario
   - Los datos deben actualizarse automáticamente al montar el componente

3. **ARQUITECTURA Y ESTRUCTURA DEL COMPONENTE**:
   - Utilizar React Hooks modernos: useState, useEffect (y otros según necesidad)
   - Implementar manejo robusto de estados:
     * Estado de carga inicial (loading)
     * Estado de error con mensajes descriptivos
     * Estado de datos obtenidos
   - Diseño responsive y adaptable a diferentes tamaños de pantalla
   - Interfaz de usuario limpia, intuitiva y profesional
   - Accesibilidad: labels apropiados, contraste de colores, navegación por teclado
   - Componentes reutilizables y modulares

4. **CALIDAD Y COMPLETITUD DEL CÓDIGO**:
   - El código DEBE ser completo, funcional y listo para ejecutar
   - Incluir TODOS los imports necesarios (React, hooks, etc.)
   - NO usar librerías externas para fetch (usar Fetch API nativa)
   - NO asumir que el usuario tiene otras dependencias instaladas más allá de React
   - Incluir comentarios descriptivos en secciones clave del código
   - Seguir mejores prácticas de React (naming conventions, component structure, etc.)
   - El componente debe ser copiable, pegable y ejecutable sin modificaciones
   - Código limpio, legible y mantenible

5. **ADAPTABILIDAD Y FLEXIBILIDAD**:
   - Adaptar la consulta SQL según la estadística o datos solicitados
   - La visualización de datos debe ser apropiada al tipo de información (tabla, lista, cards, métricas, gráficos, etc.)
   - Permitir diferentes layouts según la cantidad y tipo de estadísticas
   - Considerar casos edge: datos vacíos, muchos registros, valores nulos, etc.
   - El diseño debe ser funcional y adaptarse al contenido

6. **DEPENDENCIAS Y LIBRERÍAS EXTERNAS**:
   - Cuando uses librerías externas (lucide-react, chart.js, etc.), DEBES especificarlas al compilar
   - Al llamar a compile_and_save_component, incluir el parámetro "dependencies" con la lista completa
   - Formato de cada dependencia: { name: "nombre-paquete", globalName: "VariableGlobal", cdnUrl: "URL-del-CDN" }
   - Librerías comunes disponibles:
     * React: { name: "react", globalName: "React", cdnUrl: "https://unpkg.com/react@18/umd/react.production.min.js" }
     * ReactDOM: { name: "react-dom", globalName: "ReactDOM", cdnUrl: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" }
     * Lucide Icons: { name: "lucide-react", globalName: "lucide", cdnUrl: "https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js" }
     * Chart.js: { name: "chart.js", globalName: "Chart", cdnUrl: "https://cdn.jsdelivr.net/npm/chart.js" }
   - Si no especificas dependencias, solo React y ReactDOM se incluirán por defecto

RECORDATORIOS CRÍTICOS:
- SIEMPRE genera el componente React completo, sin excepciones
- NO ofrecer alternativas sin componente (como solo mostrar datos en texto)
- El componente es la respuesta principal a cualquier consulta de datos
- Usa fetch (NO axios, NO otras librerías HTTP)
- La URL del backend es ${BACKEND_URL}
- Solo muestra información relevante a lo solicitado
- Los componentes deben ser atómicos: una responsabilidad clara y específica
- Los datos se cargan automáticamente en tiempo real al montar el componente
- SIEMPRE especifica las dependencias correctamente al compilar
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

// Función para compilar componente React usando esbuild
async function compileReactComponent(componentCode, dependencies = []) {
  const tempInputFile = path.join(tmpdir(), `dossin-component-${Date.now()}.jsx`);
  const tempOutputFile = path.join(tmpdir(), `dossin-compiled-${Date.now()}.js`);
  
  try {
    // Escribir código del componente en archivo temporal
    await writeFile(tempInputFile, componentCode, 'utf-8');
    
    // Extraer nombres de paquetes para marcar como external
    const externalPackages = dependencies.map(dep => dep.name);
    
    // Compilar con esbuild.build (soporta external, a diferencia de transform)
    await esbuild.build({
      entryPoints: [tempInputFile],
      outfile: tempOutputFile,
      bundle: true,
      format: 'iife',
      globalName: 'ComponentModule',
      platform: 'browser', // ⭐ IMPORTANTE: Indica que compilamos para navegador
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'es2020',
      external: externalPackages, // Marcar dependencias como externas (no las bundlea)
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: false, // No minificar para mejor debugging
      sourcemap: false,
      // ⭐ Evitar que esbuild genere código CommonJS wrapper
      footer: {
        js: '// Compiled by Dossin MCP Server'
      }
    });
    
    // Leer código compilado
    let compiledCode = await fs.readFile(tempOutputFile, 'utf-8');
    
    // ⭐ POST-PROCESAMIENTO: Limpiar y normalizar el código generado
    
    // 1. Reemplazar __toESM(__window.X) por window.X directamente
    compiledCode = compiledCode.replace(/__toESM\(__window\.(\w+)\)/g, 'window.$1');
    
    // 2. Reemplazar cualquier __window.X por window.X
    compiledCode = compiledCode.replace(/__window\.(\w+)/g, 'window.$1');
    
    // 3. Reemplazar require("package") por window.GlobalName para cada dependencia
    dependencies.forEach(dep => {
      // Patrón para encontrar require("package-name") o require('package-name')
      const requirePattern = new RegExp(
        `require\\(["']${dep.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\)`,
        'g'
      );
      compiledCode = compiledCode.replace(requirePattern, `window.${dep.globalName}`);
    });
    
    // 4. Eliminar definición de __require si existe (código muerto que genera esbuild)
    compiledCode = compiledCode.replace(
      /var __require = \/\* @__PURE__ \*\/ \(\(x\)[\s\S]*?\}\)\(function\(x\)[\s\S]*?\}\);?\n?/g,
      '// __require removed - using window globals'
    );
    
    // Limpiar archivos temporales
    await unlink(tempInputFile).catch(() => {});
    await unlink(tempOutputFile).catch(() => {});
    
    return compiledCode;
  } catch (error) {
    // Limpiar archivos temporales en caso de error
    try {
      await unlink(tempInputFile).catch(() => {});
      await unlink(tempOutputFile).catch(() => {});
    } catch {}
    
    throw new Error(`Error al compilar componente: ${error.message}`);
  }
}

// Función para crear HTML standalone con el componente compilado
function createStandaloneHTML(compiledCode, componentName, dependencies = []) {
  // Generar script tags para cada dependencia desde CDN
  const scriptTags = dependencies
    .map(dep => `  <script crossorigin src="${dep.cdnUrl}"></script>`)
    .join('\n');
  
  // Generar aliases dinámicos para cada dependencia
  const aliasMapping = dependencies.map(dep => {
    // Normalizar nombres comunes (react, react-dom, lucide, etc.)
    const aliases = [];
    
    if (dep.name === 'react') {
      aliases.push(`  window.react = window.react || window.React;`);
      aliases.push(`  window.React = window.React || window.react;`);
    } else if (dep.name === 'react-dom') {
      aliases.push(`  window['react-dom'] = window['react-dom'] || window.ReactDOM;`);
      aliases.push(`  window.ReactDOM = window.ReactDOM || window['react-dom'];`);
    } else if (dep.name === 'lucide-react') {
      aliases.push(`  window.lucide = window.lucide || window.Lucide || window.LucideReact || window.lucideReact;`);
      aliases.push(`  window.LucideReact = window.LucideReact || window.lucide;`);
    } else {
      // Para otras librerías, crear alias genérico
      aliases.push(`  window['${dep.name}'] = window['${dep.name}'] || window.${dep.globalName};`);
      aliases.push(`  window.${dep.globalName} = window.${dep.globalName} || window['${dep.name}'];`);
    }
    
    return aliases.join('\n');
  }).join('\n');
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} - Dossin</title>
${scriptTags}
  <script>
    // Preámbulo: Resolver problemas de globals y aliases UMD
    
    // 1. Definir __window para esbuild-generated code
    var __window = window;
    
    // 2. Crear aliases normalizados para dependencias
${aliasMapping}
  </script>
  <style>
    /* Reset CSS mínimo - El componente maneja sus propios estilos */
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-x: hidden;
    }
    #root {
      min-height: 100vh;
    }
    
    /* Estilos para inputs de los editores visuales del componente */
    input[type="color"],
    input[type="range"],
    input[type="text"],
    input[type="number"],
    select {
      cursor: pointer;
    }
    
    input[type="range"] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #e94560;
      cursor: pointer;
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #e94560;
      cursor: pointer;
      border: none;
    }
    
    /* Smooth transitions para el editor de estilos */
    * {
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Código compilado del componente (incluye todos los estilos y funcionalidad del editor visual)
    ${compiledCode}
    
    // Renderizar el componente
    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    // Extraer el componente del módulo compilado
    const Component = ComponentModule.default || ComponentModule;
    
    root.render(React.createElement(Component));
  </script>
</body>
</html>`;
}

// Función para guardar archivo en Downloads
async function saveToDownloads(htmlContent, fileName, componentName) {
  try {
    // Obtener directorio home del usuario
    const homeDir = os.homedir();
    const downloadsDir = path.join(homeDir, 'Downloads', 'dossin-components');
    
    // Crear directorio si no existe
    await fs.mkdir(downloadsDir, { recursive: true });
    
    // Generar nombre de archivo con timestamp si no se proporciona
    let finalFileName = fileName;
    if (!finalFileName) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      finalFileName = `${componentName}-${timestamp}.html`;
    }
    
    // Asegurar extensión .html
    if (!finalFileName.endsWith('.html')) {
      finalFileName += '.html';
    }
    
    const filePath = path.join(downloadsDir, finalFileName);
    
    // Guardar archivo
    await fs.writeFile(filePath, htmlContent, 'utf-8');
    
    // Calcular hash MD5
    const hash = createHash('md5').update(htmlContent).digest('hex');
    
    // Obtener tamaño del archivo
    const stats = await fs.stat(filePath);
    
    return {
      success: true,
      localPath: filePath,
      fileName: finalFileName,
      fileSize: stats.size,
      hash: hash,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Error al guardar archivo: ${error.message}`);
  }
}

// Función para subir archivo al backend (Fase 2 - preparada para el futuro)
async function uploadToBackend(htmlContent, metadata) {
  try {
    const response = await fetch(`${BACKEND_URL}/components/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: metadata.fileName,
        content: htmlContent,
        metadata: {
          componentName: metadata.componentName,
          timestamp: metadata.timestamp,
          size: metadata.fileSize,
          hash: metadata.hash
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error al subir al backend: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.url || result.publicUrl;
  } catch (error) {
    // Si falla, no es crítico (es opcional por ahora)
    console.error('Error al subir al backend:', error.message);
    return null;
  }
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
      {
        name: "compile_and_save_component",
        description:
          `Compila un componente React a un archivo HTML standalone y lo guarda en la carpeta Downloads del usuario.

Esta herramienta toma código JSX de un componente React, lo compila usando esbuild, y genera un archivo HTML completo que incluye:
- Todas las dependencias necesarias cargadas desde CDN (React, lucide-react, chart.js, etc.)
- El componente compilado embebido
- Estilos CSS del componente preservados
- Todo listo para abrir en el navegador o servir desde un servidor

El archivo se guarda en ~/Downloads/dossin-components/ y puede ser servido directamente desde el backend sin necesidad de compilación adicional.

IMPORTANTE - DEPENDENCIAS DINÁMICAS:
- Claude DEBE analizar el código del componente e identificar todas las dependencias (imports)
- Para cada dependencia, proporcionar: name, globalName, cdnUrl
- Ejemplo de dependencias comunes:
  * React: { name: "react", globalName: "React", cdnUrl: "https://unpkg.com/react@18/umd/react.production.min.js" }
  * ReactDOM: { name: "react-dom", globalName: "ReactDOM", cdnUrl: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" }
  * Lucide: { name: "lucide-react", globalName: "lucide", cdnUrl: "https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js" }
  * Chart.js: { name: "chart.js", globalName: "Chart", cdnUrl: "https://cdn.jsdelivr.net/npm/chart.js" }

CUÁNDO USAR:
- Después de generar cualquier componente React con las herramientas anteriores
- Cuando el usuario quiere guardar/exportar un componente
- Para crear archivos listos para producción
- Para optimizar recursos del backend (pre-compilación)

OPCIONES FUTURAS:
- uploadToBackend: false por defecto, true cuando el endpoint esté listo en el backend`,
        inputSchema: {
          type: "object",
          properties: {
            componentCode: {
              type: "string",
              description: "El código JSX completo del componente React a compilar. Debe incluir imports de React y hooks necesarios.",
            },
            componentName: {
              type: "string",
              description: "Nombre descriptivo del componente (ej: 'VolumenCargaProvincias', 'TurnosDelDia'). Se usa para el título y nombre del archivo.",
            },
            fileName: {
              type: "string",
              description: "Nombre personalizado para el archivo HTML (opcional). Si no se proporciona, se genera automáticamente con timestamp.",
            },
            dependencies: {
              type: "array",
              description: "Lista de dependencias externas que usa el componente. Claude debe analizar los imports y crear esta lista automáticamente. Cada dependencia debe incluir: name (nombre del paquete npm), globalName (variable global en el navegador), cdnUrl (URL del CDN).",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Nombre del paquete npm (ej: 'react', 'lucide-react', 'chart.js')"
                  },
                  globalName: {
                    type: "string",
                    description: "Nombre de la variable global en el navegador (ej: 'React', 'lucide', 'Chart')"
                  },
                  cdnUrl: {
                    type: "string",
                    description: "URL completa del CDN desde donde cargar la librería"
                  }
                },
                required: ["name", "globalName", "cdnUrl"]
              }
            },
            uploadToBackend: {
              type: "boolean",
              description: "Si es true, intenta subir el archivo compilado al backend además de guardarlo localmente. Por defecto: false (Fase 2 - aún no implementado en backend)",
            },
          },
          required: ["componentCode", "componentName"],
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

    if (request.params.name === "compile_and_save_component") {
      const { 
        componentCode, 
        componentName, 
        fileName = null,
        dependencies = [],
        uploadToBackend = false 
      } = request.params.arguments;
      
      if (!componentCode || typeof componentCode !== "string") {
        throw new Error("componentCode is required and must be a string");
      }
      
      if (!componentName || typeof componentName !== "string") {
        throw new Error("componentName is required and must be a string");
      }

      // Si no se proporcionan dependencias, usar React y ReactDOM por defecto
      const finalDependencies = dependencies.length > 0 ? dependencies : [
        {
          name: "react",
          globalName: "React",
          cdnUrl: "https://unpkg.com/react@18/umd/react.production.min.js"
        },
        {
          name: "react-dom",
          globalName: "ReactDOM",
          cdnUrl: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
        }
      ];

      // Compilar el componente React con dependencias dinámicas
      const compiledCode = await compileReactComponent(componentCode, finalDependencies);
      
      // Crear HTML standalone con las dependencias
      const htmlContent = createStandaloneHTML(compiledCode, componentName, finalDependencies);
      
      // Guardar en Downloads
      const saveResult = await saveToDownloads(htmlContent, fileName, componentName);
      
      // Intentar subir al backend si se solicita (Fase 2)
      let backendUrl = null;
      if (uploadToBackend) {
        backendUrl = await uploadToBackend(htmlContent, saveResult);
      }
      
      const response = {
        ...saveResult,
        backendUrl: backendUrl,
        dependencies: finalDependencies.map(d => d.name),
        message: backendUrl 
          ? `Componente compilado y guardado exitosamente. También subido al backend.`
          : `Componente compilado y guardado exitosamente en ${saveResult.localPath}`
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
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

