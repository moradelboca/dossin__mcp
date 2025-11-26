import { getDatabaseSchema, executeQuery } from './database.js';
import { compileReactComponent, createStandaloneHTML } from './compiler.js';
import { saveToDownloads } from './fileManager.js';
import { tools } from './tools.js';

// Handler para listar herramientas
export function handleListTools() {
  return { tools };
}

// Handler para ejecutar herramientas
export async function handleCallTool(request) {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_database_schema":
        return await handleGetDatabaseSchema();
      
      case "execute_query":
        return await handleExecuteQuery(args);
      
      case "compile_and_save_component":
        return await handleCompileAndSaveComponent(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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
}

// Handler específico para get_database_schema
async function handleGetDatabaseSchema() {
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

// Handler específico para execute_query
async function handleExecuteQuery(args) {
  const { query, params = [] } = args;
  
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

// Handler específico para compile_and_save_component
async function handleCompileAndSaveComponent(args) {
  const { 
    componentCode, 
    componentName, 
    fileName = null
  } = args;
  
  if (!componentCode || typeof componentCode !== "string") {
    throw new Error("componentCode is required and must be a string");
  }
  
  if (!componentName || typeof componentName !== "string") {
    throw new Error("componentName is required and must be a string");
  }

  // Compilar el componente React
  const compiledCode = await compileReactComponent(componentCode, componentName);
  
  // Crear HTML standalone
  const htmlContent = createStandaloneHTML(compiledCode, componentName);
  
  // Guardar en Downloads
  const saveResult = await saveToDownloads(htmlContent, fileName, componentName);
  
  const response = {
    ...saveResult,
    message: `Componente compilado y guardado exitosamente en ${saveResult.localPath}`
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
