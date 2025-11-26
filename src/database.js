import { BACKEND_URL } from './config.js';

// Función para obtener el schema de la base de datos desde el backend
export async function getDatabaseSchema() {
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
export async function executeQuery(query, params = []) {
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
