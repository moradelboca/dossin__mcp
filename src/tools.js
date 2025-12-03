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
      `Compila un componente React a HTML standalone con bundling completo y lo guarda en ~/Downloads/dossin-components/.

⚠️ IMPORTANTE - TRANSFORMACIÓN OBLIGATORIA ANTES DE COMPILAR:

El componente debe estar en MODO COMPILACIÓN (NO modo preview):

❌ NO compilar componentes con datos hardcodeados:
   const data = [{id: 1, nombre: 'Item'}]; // NO
   
✅ SÍ compilar componentes con fetch dinámico:
   const [data, setData] = useState([]);
   useEffect(() => {
     fetch('${BACKEND_URL}/database/query', {...})
       .then(res => res.json())
       .then(result => setData(result.data));
   }, []);

PROCESO DE TRANSFORMACIÓN:
1. Remover datos hardcodeados
2. Agregar useState para datos, loading, error
3. Agregar useEffect con fetch al endpoint correcto
4. Incluir manejo de estados (loading, error)
5. LUEGO compilar con esta tool

COMPILACIÓN Y BUNDLING:
- esbuild bundlea automáticamente todas las dependencias
- Detecta imports y los incluye en el HTML (~200KB)
- Libertad total de librerías (sin restricciones)
- Si falta una librería, el bundling fallará con error

RESULTADO:
- HTML standalone que carga datos en tiempo real
- Funciona offline (excepto para fetch de datos)
- Compatible con file://, S3, iframes
- Tailwind CSS desde CDN

USO:
- Después de transformar el componente a modo fetch
- Para archivos listos para producción
- Para servir desde backend o S3`,
    inputSchema: {
      type: "object",
      properties: {
        componentCode: {
          type: "string",
          description: "El código JSX completo del componente React en MODO COMPILACIÓN (con fetch, no hardcodeado). Debe incluir useState, useEffect, fetch() y manejo de estados.",
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
