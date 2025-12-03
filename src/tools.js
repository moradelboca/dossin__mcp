import { DOSSIN_CONTEXT, BACKEND_URL } from './config.js';

// Definición de las herramientas del MCP
export const tools = [
  {
    name: "get_database_schema",
    description:
      `${DOSSIN_CONTEXT}

---

Obtiene el schema completo de la base de datos MySQL incluyendo tablas, columnas, tipos de datos, relaciones (foreign keys), índices y constraints.

**CUÁNDO USAR**: 
- Primera interacción con la base de datos
- Antes de construir consultas complejas
- Para entender relaciones entre tablas
- Cuando necesites saber nombres exactos de columnas

**RETORNA**: JSON con estructura completa de la base de datos.`,
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "execute_query",
    description:
      `Ejecuta consultas SQL SELECT en la base de datos de Dossin.

**DATOS DISPONIBLES**:
- Turnos: Programación de carga/descarga
- Camiones: Vehículos y sus matrículas
- Cargas: Operaciones activas/históricas
- Choferes: Conductores registrados
- Clientes: Empresas y productores
- Productos: Catálogo agrícola
- Destinos: Puertos, acopios, plantas

**MEJORES PRÁCTICAS**:
✅ Usa parámetros (?) para valores dinámicos
✅ Obtén el schema primero si no conoces la estructura
✅ Limita resultados con LIMIT cuando sea apropiado
✅ Usa CURDATE() para fecha actual
⛔ Solo consultas SELECT permitidas

**EJEMPLO**: 
query: "SELECT * FROM turnos WHERE fecha >= CURDATE() LIMIT 10"
params: []`,
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Consulta SQL SELECT. Usa placeholders (?) para valores dinámicos. Ejemplo: SELECT * FROM turnos WHERE fecha = ? AND estado = ?",
        },
        params: {
          type: "array",
          description:
            "Array de parámetros para reemplazar placeholders (?). Ejemplo: ['2025-12-02', 'pendiente']",
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
      `Compila un COMPONENTE DOSSIN a HTML standalone con bundling completo y lo guarda en ~/Downloads/dossin-components/.

⚠️ CRÍTICO - DIFERENCIA ENTRE ARTEFACTO Y COMPONENTE DOSSIN:

📱 ARTEFACTO DE CLAUDE (NO compilar):
   - Componente con datos hardcodeados
   - Se muestra en el chat de Claude
   - const turnos = [{id: 1, ...}, {id: 2, ...}]; // Datos fijos
   - NO tiene fetch(), NO tiene useEffect
   - ❌ NO usar con compile_and_save_component

🔧 COMPONENTE DOSSIN (SÍ compilar):
   - Componente con fetch dinámico
   - const [data, setData] = useState([]);
   - useEffect(() => { fetch('${BACKEND_URL}/database/query', ...) }, []);
   - Incluye estados: loading, error, data
   - ✅ USAR con compile_and_save_component

TRANSFORMACIÓN REQUERIDA (Artefacto → Componente Dossin):
1. Remover: const turnos = [datos_hardcodeados];
2. Agregar: const [turnos, setTurnos] = useState([]);
3. Agregar: const [loading, setLoading] = useState(true);
4. Agregar: const [error, setError] = useState(null);
5. Agregar: useEffect con fetch al endpoint
6. Agregar: manejo de if(loading) e if(error)

COMPILACIÓN Y BUNDLING:
- esbuild bundlea automáticamente todas las dependencias
- Detecta imports y los incluye en el HTML (~200KB)
- Libertad total de librerías (sin restricciones)
- Si falta una librería, la compilación FALLARÁ con error detallado
- El error indicará qué librería instalar y cómo hacerlo
- NO continúes si ves error de librería faltante - informa al usuario

Librerías ya instaladas: react, react-dom, lucide-react, recharts

RESULTADO:
- HTML standalone que carga datos en tiempo real
- Compatible con file://, S3, iframes
- Tailwind CSS desde CDN

CUÁNDO USAR:
- Solo después de transformar ARTEFACTO → COMPONENTE DOSSIN
- Para generar archivos HTML de producción
- Para servir desde backend o S3`,
    inputSchema: {
      type: "object",
      properties: {
        componentCode: {
          type: "string",
          description: "El código JSX del COMPONENTE DOSSIN (con fetch dinámico, NO el artefacto hardcodeado). Debe incluir useState, useEffect, fetch() y manejo de estados (loading, error).",
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
