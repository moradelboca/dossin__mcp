import { getDatabaseSchema, executeQuery } from './database.js';
import { tools } from './tools.js';
import { BACKEND_URL } from './config.js';

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
    reactCode, 
    componentName,
    userToken
  } = args;
  
  if (!reactCode || typeof reactCode !== "string") {
    throw new Error("reactCode is required and must be a string");
  }
  
  if (!componentName || typeof componentName !== "string") {
    throw new Error("componentName is required and must be a string");
  }

  // Enviar al backend para compilación remota
  const endpoint = `${BACKEND_URL}/archivos/compilar`;
  
  const formData = new FormData();
  formData.append('reactCode', reactCode);
  formData.append('componentName', componentName);
  
  // Preparar headers
  const headers = {};
  
  // Si se proporciona token de usuario, agregarlo como Bearer token
  if (userToken && typeof userToken === "string") {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error al compilar en el backend: ${response.status} - ${errorData}`);
  }

  const result = await response.json();
  
  const responseMessage = {
    success: result.success,
    url: result.url,
    htmlPath: result.htmlPath,
    message: `Componente compilado exitosamente en el backend. URL: ${result.url}`
  };
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(responseMessage, null, 2),
      },
    ],
  };
}
