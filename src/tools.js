import { DOSSIN_CONTEXT, BACKEND_URL } from './config.js';

// Definición de las herramientas del MCP
export const tools = [
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
      `Compila un componente React a un archivo HTML standalone con bundling completo y lo guarda en la carpeta Downloads del usuario.

Esta herramienta toma código JSX de un componente React, lo compila usando esbuild, y genera un archivo HTML completo que incluye:
- Todas las dependencias bundleadas (React, lucide-react, etc.) - ~200KB minificado
- El componente compilado y listo para ejecutar
- Tailwind CSS desde CDN para estilos
- Renderizado automático del componente
- Todo en un solo archivo HTML standalone

El archivo se guarda en ~/Downloads/dossin-components/ y puede ser:
- Abierto directamente en el navegador (file://)
- Subido a S3 y servido desde CloudFront
- Cargado en un iframe desde cualquier aplicación
- Usado offline sin conexión a internet

IMPORTANTE - DETECCIÓN AUTOMÁTICA DE DEPENDENCIAS:
- NO necesitas especificar dependencias manualmente
- esbuild detecta automáticamente todos los imports del código
- Las dependencias deben estar instaladas en node_modules del MCP
- Dependencias incluidas por defecto: react, react-dom, lucide-react
- Si usas otras librerías (chart.js, axios, etc.), deben estar instaladas en el MCP

VENTAJAS DEL BUNDLING:
- HTML completamente standalone (~200KB)
- No depende de CDNs externos (excepto Tailwind)
- Funciona offline
- Funciona en iframes aislados
- Perfecto para S3 + CloudFront
- Se cachea eficientemente

COMPATIBILIDAD:
- Funciona en todos los navegadores modernos
- Compatible con file://, http://, https://
- Funciona en iframes con sandbox

CUÁNDO USAR:
- Después de generar cualquier componente React
- Para crear archivos listos para producción
- Para subir a S3 y servir desde tu aplicación`,
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
      },
      required: ["componentCode", "componentName"],
    },
  },
];
