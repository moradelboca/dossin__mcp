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
      `Envía un COMPONENTE DOSSIN al backend para compilación remota a HTML standalone.

🔐 AUTENTICACIÓN OBLIGATORIA:
⚠️ ANTES de llamar a esta tool, DEBES preguntar al usuario por su token de autenticación.
❗ El token es REQUERIDO para la compilación en el backend.

**FLUJO OBLIGATORIO**:
1. Pregunta al usuario: "Por favor, proporciona tu token de autenticación"
2. El usuario puede obtenerlo desde:
   - DevTools del frontend: document.cookie.split('; ').find(r => r.startsWith('accessToken='))?.split('=')[1]
   - O copiar directamente desde la aplicación
3. Una vez obtenido el token, procede con la compilación

---

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

COMPILACIÓN EN BACKEND:
- El backend compila el componente con todas las dependencias
- Genera HTML standalone listo para producción
- Retorna URL pública del componente compilado
- Compatible con iframes, S3, CDN

RESULTADO:
- URL pública del componente compilado
- HTML standalone con datos en tiempo real
- Listo para embeber o compartir
- Registrado con trazabilidad del usuario que lo creó

CUÁNDO USAR:
- Solo después de transformar ARTEFACTO → COMPONENTE DOSSIN
- Para generar archivos HTML de producción
- Para obtener URL pública del componente`,
    inputSchema: {
      type: "object",
      properties: {
        reactCode: {
          type: "string",
          description: "El código JSX completo del COMPONENTE DOSSIN. DEBE incluir: imports (React, useState, useEffect), fetch dinámico a la API, estados (loading, error, data), y manejo de errores. NO enviar artefactos con datos hardcodeados.",
        },
        componentName: {
          type: "string",
          description: "Nombre descriptivo del componente (ej: 'VolumenCargaProvincias', 'TurnosDelDia'). Se usa para el título del HTML y nombre del archivo.",
        },
        userToken: {
          type: "string",
          description: "Token JWT del usuario para autenticación (OBLIGATORIO). Debe ser solicitado al usuario ANTES de llamar a esta función. El token se envía como Authorization Bearer al backend y permite trazabilidad de quién creó el componente.",
        },
      },
      required: ["reactCode", "componentName", "userToken"],
    },
  },
];
