// Configuración del servidor MCP
export const SERVER_CONFIG = {
  name: "dossin-mcp-server",
  version: "1.0.0",
};

export const BACKEND_URL = process.env.BACKEND_URL || "https://dev.dossin.com.ar/api";

// Contexto del sistema Dossin para el LLM
export const DOSSIN_CONTEXT = `
DOSSIN - Sistema de Gestión de Cargas Agrícolas

Sistema integral para el sector agropecuario que administra:
- **Turnos**: Programación de carga/descarga de productos agrícolas
- **Camiones**: Vehículos de transporte (matrículas, choferes, capacidad)
- **Cargas**: Operaciones de mercaderías y productos agrícolas
- **Choferes**: Conductores registrados
- **Clientes**: Empresas y productores
- **Productos**: Catálogo agrícola (cereales, oleaginosas)
- **Destinos**: Puertos, acopios, plantas

Base de datos MySQL con operaciones del sistema.

---

GENERACIÓN DE COMPONENTES REACT - REGLAS OBLIGATORIAS:

⚠️ SIEMPRE genera componentes React para consultas/visualizaciones de datos.

**1. PRINCIPIO ATÓMICO**:
   - Mostrar SOLO información solicitada explícitamente
   - NO agregar datos extra o sugerencias no pedidas
   - Un propósito único y claro por componente

**2. DOS TIPOS DE COMPONENTES - ARTEFACTO vs COMPONENTE DOSSIN**:

   📱 ARTEFACTO DE CLAUDE (Para mostrar en el chat):
   - Este es el componente que se muestra como artefacto en la interfaz de Claude
   - Ejecutar execute_query PRIMERO para obtener datos reales de la BD
   - Hardcodear los datos obtenidos directamente en el código del componente
   - NO usar fetch(), NO useEffect, NO estados de loading/error
   - Los datos están embebidos en el código para visualización inmediata
   - Ejemplo: const turnos = [{id: 1, hora: '08:00', camion: 'ABC123'}, ...];
   
   🔧 COMPONENTE DOSSIN (Para compile_and_save_component):
   - Este es el componente que se compila y guarda como HTML standalone
   - ANTES de llamar compile_and_save_component, TRANSFORMAR el artefacto:
     1. Remover datos hardcodeados del artefacto
     2. Agregar: const [data, setData] = useState([]);
     3. Agregar: const [loading, setLoading] = useState(true);
     4. Agregar: const [error, setError] = useState(null);
     5. Agregar useEffect con fetch() dinámico
   - Endpoint: POST ${BACKEND_URL}/database/query
   - Body: { sql: "query_original", params: [] }
   - Parsear: result.data contiene los datos
   - Incluir manejo de estados (if loading, if error)
   - El HTML final carga datos en tiempo real del backend

**3. CÓDIGO COMPLETO Y FUNCIONAL**:
   - Incluir TODOS los imports necesarios
   - Diseño responsive con Tailwind
   - Código ejecutable sin modificaciones
   - Manejo de errores apropiado

**4. LIBRERÍAS SIN RESTRICCIONES**:
   - Imports normales: import X from 'libreria'
   - esbuild bundlea automáticamente
   - Si falta alguna, la compilación FALLARÁ con error claro
   - El error dirá qué librería instalar - DETENER y avisar al usuario
   - Librerías instaladas: react, react-dom, lucide-react, recharts

**RECORDATORIOS CRÍTICOS**:
- ARTEFACTO: datos hardcodeados (muestra inmediata en Claude)
- COMPONENTE DOSSIN: fetch dinámico (HTML compilado para producción)
- Siempre transformar antes de compilar
- Componentes atómicos y específicos
- Backend: ${BACKEND_URL}
`.trim();
