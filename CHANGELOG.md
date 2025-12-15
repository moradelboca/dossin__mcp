# Changelog - Dossin MCP Server

## [2.0.0] - 2025-12-10 - Migración a Compilación Remota

### 🎯 BREAKING CHANGES

#### Compilación Remota en Backend
- **BREAKING CHANGE**: La compilación de componentes ahora se realiza en el backend
- Eliminado el sistema de compilación local con esbuild
- El MCP envía el código JSX al endpoint `/api/archivos/compilar` del backend
- El backend retorna una URL pública del componente compilado

### 🗑️ Archivos Eliminados

- `src/compiler.js` - Compilación local con esbuild
- `src/fileManager.js` - Guardado en ~/Downloads
- `scripts/bundle-libraries.js`
- `scripts/react-dom-wrapper.js`
- Carpeta `dossin-components/`

### 📦 Dependencias Removidas

Eliminadas las siguientes dependencias (ya no se compila localmente):
- `esbuild`
- `@babel/standalone`
- `react`
- `react-dom`
- `lucide-react`
- `recharts`

### ✨ Nuevas Características

- **MCP más ligero**: Solo depende de `@modelcontextprotocol/sdk` y `dotenv`
- **Compilación centralizada**: Todas las compilaciones se realizan en el backend
- **URL pública**: Los componentes compilados tienen URL pública inmediata
- **Gestión centralizada**: El backend puede versionar y administrar componentes

### 🔧 Cambios en la Tool `compile_and_save_component`

**Antes:**
```json
{
  "success": true,
  "localPath": "/Users/.../Downloads/dossin-components/Component.html",
  "fileName": "Component.html",
  "fileSize": 12456,
  "hash": "abc123..."
}
```

**Ahora:**
```json
{
  "success": true,
  "url": "https://dev.dossin.com.ar/components/Component.html",
  "htmlPath": "/components/Component.html",
  "message": "Componente compilado exitosamente..."
}
```

### 📝 Migración

Si usabas la versión anterior:
1. Asegúrate de que el endpoint `/api/archivos/compilar` esté disponible en tu backend
2. Los componentes ya no se guardan localmente, sino que se obtiene una URL pública
3. Actualiza tus scripts/flujos de trabajo para usar las URLs en lugar de archivos locales

---

## [1.3.0] - 2024-11-25 - Modularización del Código

### 🎯 Mejoras de Arquitectura

#### Modularización Completa
- Separación del código en módulos especializados para mejor mantenibilidad
- Estructura de carpetas `src/` con responsabilidades claras
- Reducción del archivo principal de ~600 líneas a ~60 líneas

### 📁 Nueva Estructura

```
index.js (60 líneas) - Punto de entrada
src/
  ├── config.js - Configuración y contexto del sistema
  ├── tools.js - Definición de herramientas MCP
  ├── handlers.js - Lógica de manejo de requests
  ├── database.js - Operaciones de base de datos
  ├── compiler.js - Compilación de componentes React
  └── fileManager.js - Gestión de archivos
```

### ✨ Beneficios

- **Mantenibilidad**: Cada módulo tiene una responsabilidad única
- **Legibilidad**: Archivos más pequeños y enfocados
- **Testabilidad**: Módulos independientes fáciles de probar
- **Reutilización**: Funciones importables donde se necesiten
- **Escalabilidad**: Fácil agregar nuevas funcionalidades

### 🔧 Cambios Técnicos

- Sin cambios en la funcionalidad externa
- Mismas herramientas MCP disponibles
- Compatibilidad total con versiones anteriores
- Sin cambios en dependencias

---

## [1.6.2] - 2024-11-19 - Sistema de Bundling Completo (DEPRECADO)

### 🎉 Cambios Mayores

#### Sistema de Bundling Completo
- **DEPRECADO**: Este sistema ha sido reemplazado por compilación remota en v2.0.0
- Bundleaba todas las dependencias (React, lucide-react, etc.)
- Cambio de CDN externo a bundling local con esbuild
- Formato IIFE para compatibilidad con file:// y iframes
- Código de renderizado incluido en la compilación

### ✨ Nuevas Características

- **Bundling automático**: esbuild detecta y bundlea todas las dependencias
- **HTML standalone**: Archivos de ~200KB con todo incluido
- **Tailwind CSS**: Incluido desde CDN para estilos
- **Renderizado automático**: El componente se renderiza sin código adicional
- **Compatibilidad total**: Funciona en file://, S3, iframes, offline

### 🔧 Cambios Técnicos

#### Función `compileReactComponent`
- Formato IIFE (`format: 'iife'`) para compatibilidad universal
- Bundling completo (`external: []`)
- Código de renderizado agregado antes de compilar
- Minificación automática para reducir tamaño
- Detección automática de dependencias con `nodePaths`

#### Función `createStandaloneHTML`
- Incluye Tailwind CSS desde CDN
- Estilos de respaldo si CDN falla
- Sin import maps (todo bundleado)
- Script tradicional (no module)

#### Dependencias
- **Instaladas en node_modules**: `react`, `react-dom`, `lucide-react`
- **Bundleadas automáticamente**: esbuild las detecta y las incluye
- **Resultado**: HTML standalone de ~200KB con todo incluido

### 📝 Documentación

- Agregado `MIGRATION_TO_ESM.md` con guía completa de migración
- Actualizado contexto del sistema en `DOSSIN_CONTEXT`
- Actualizada descripción de la herramienta `compile_and_save_component`

### 🐛 Bugs Corregidos

- ✅ Resuelto error `react.forwardRef is undefined` con lucide-react
- ✅ Eliminados problemas de CORS con file://
- ✅ Corregidos errores de resolución de módulos
- ✅ Componentes ahora se renderizan automáticamente

### 🌍 Compatibilidad

- **Navegadores soportados**: Chrome 89+, Edge 89+, Safari 16.4+, Firefox 108+
- **Import Maps**: Soportado nativamente en todos los navegadores modernos (2023+)

### 📦 Dependencias

No hay cambios en las dependencias de Node.js del servidor MCP.

### ⚠️ Breaking Changes

1. **Dependencias requeridas**: Ahora se necesita `react`, `react-dom`, `lucide-react` en node_modules
2. **Tamaño de archivos**: HTML generado es ~200KB (vs ~15KB anterior)
3. **Parámetro dependencies**: ELIMINADO - esbuild detecta automáticamente todas las dependencias
4. **Parámetro uploadToBackend**: ELIMINADO - funcionalidad no implementada

### 🔄 Migración

Para componentes existentes, Claude debe:
1. **NO especificar dependencias** - el sistema las detecta automáticamente
2. Usar imports normales de ES6: `import React from 'react'`
3. Asegurarse que las dependencias estén instaladas en node_modules del MCP
4. Recompilar el componente con el nuevo sistema

### 📚 Ejemplos

#### Antes (v1.x - UMD con dependencias manuales)
```javascript
// Claude especificaba dependencies manualmente
{
  "componentCode": "...",
  "componentName": "MiComponente",
  "dependencies": [
    { "name": "lucide-react", "esmUrl": "https://esm.sh/lucide-react@latest" }
  ]
}
```

#### Ahora (v2.x - Bundling automático)
```javascript
// Claude solo envía el código - esbuild detecta todo
{
  "componentCode": "import React from 'react'; import { Phone } from 'lucide-react'; ...",
  "componentName": "MiComponente"
}
// ✅ esbuild detecta automáticamente react y lucide-react
// ✅ Las bundlea en el HTML (~200KB)
// ✅ Todo funciona offline
```

---

## [1.0.0] - 2024-11-13 - Versión Inicial

### Características Iniciales
- Compilación de componentes React con esbuild
- Sistema UMD con variables globales
- Guardado en Downloads
- Soporte para dependencias dinámicas
