# Changelog - Dossin MCP Server

## [2.0.0] - 2024-11-19 - Sistema de Bundling Completo

### 🎉 Cambios Mayores

#### Sistema de Bundling Completo
- **BREAKING CHANGE**: El sistema ahora bundlea todas las dependencias (React, lucide-react, etc.)
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
