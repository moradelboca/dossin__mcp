#!/bin/bash

# Script de testing para la autenticación con token de usuario
# Simula el comportamiento del MCP al enviar requests con token

BACKEND_URL="https://dev.dossin.com.ar/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_token_here"

echo "=== Test 1: Query sin token (debería funcionar en dev, fallar en prod) ==="
curl -X POST "${BACKEND_URL}/database/query" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT COUNT(*) as total FROM turnos",
    "params": []
  }' \
  | jq '.'

echo -e "\n\n=== Test 2: Query CON token ==="
curl -X POST "${BACKEND_URL}/database/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT * FROM turnos LIMIT 5",
    "params": []
  }' \
  | jq '.'

echo -e "\n\n=== Test 3: Compilar sin token ==="
curl -X POST "${BACKEND_URL}/archivos/compilar" \
  -F "componentName=TestComponent" \
  -F 'reactCode=export default function Test() { return <div>Hello World</div>; }' \
  | jq '.'

echo -e "\n\n=== Test 4: Compilar CON token ==="
curl -X POST "${BACKEND_URL}/archivos/compilar" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "componentName=TestComponentAuth" \
  -F 'reactCode=export default function TestAuth() { return <div>Hello from Authenticated User</div>; }' \
  | jq '.'

echo -e "\n\n=== Test 5: Schema (público, no requiere token) ==="
curl -X GET "${BACKEND_URL}/database/schema" \
  -H "Content-Type: application/json" \
  | jq '.tables | length'

echo -e "\n\n✅ Tests completados"
echo "Reemplaza TOKEN=\"...\" con tu token real para probar en producción"
