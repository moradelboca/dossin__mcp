import * as esbuild from "esbuild";
import { promises as fs } from "fs";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";

// Función para compilar componente React usando esbuild (ESM con bundling)
export async function compileReactComponent(componentCode, componentName) {
  const tempInputFile = path.join(tmpdir(), `dossin-component-${Date.now()}.jsx`);
  const tempOutputFile = path.join(tmpdir(), `dossin-compiled-${Date.now()}.js`);
  
  try {
    // Validar que componentName esté presente
    if (!componentName) {
      throw new Error('componentName es requerido para renderizar el componente');
    }
    
    // Limpiar el código del componente:
    // Solo remover export default para evitar conflictos
    let cleanedCode = componentCode
      .replace(/export\s+default\s+\w+\s*;?\s*/gi, '')
      .trim();
    
    // Agregar solo lo que falta: createRoot y exports
    // Dejamos que Claude maneje sus propios imports de React
    const codeWithExports = `
${cleanedCode}

import { createRoot } from 'react-dom/client';

// Exportar todo lo necesario para el código de inicialización
export { React, createRoot, ${componentName} as default };
`;
    
    // Escribir código del componente con exports
    await writeFile(tempInputFile, codeWithExports, 'utf-8');
    
    // Compilar con esbuild a formato IIFE bundleando todas las dependencias
    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    const possibleNodeModulesPaths = [
      path.join(scriptDir, 'node_modules'),
      path.join(process.cwd(), 'node_modules'),
      path.join(scriptDir, '..', 'node_modules'),
      path.join(scriptDir, '..', '..', 'node_modules'),
    ];
    
    try {
      await esbuild.build({
        entryPoints: [tempInputFile],
        outfile: tempOutputFile,
        bundle: true,
        format: 'iife',
        globalName: 'DossinApp',
        platform: 'browser',
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        target: 'es2020',
        external: [],
        nodePaths: possibleNodeModulesPaths,
        define: {
          'process.env.NODE_ENV': '"production"'
        },
        minify: true,
        sourcemap: false,
      });
    } catch (buildError) {
      // Detectar si es un error de módulo/librería faltante
      const errorMessage = buildError.message || '';
      
      // Patrones comunes de error de módulo no encontrado
      const moduleNotFoundPatterns = [
        /Could not resolve "(.+?)"/,
        /Cannot find module ['"](.+?)['"]/,
        /Module not found: ['"](.+?)['"]/,
      ];
      
      for (const pattern of moduleNotFoundPatterns) {
        const match = errorMessage.match(pattern);
        if (match) {
          const missingLib = match[1];
          
          throw new Error(
            `❌ Librería '${missingLib}' no está instalada en el MCP.\n\n` +
            `Para usarla en componentes compilados, primero debe instalarse:\n` +
            `  1. Navega a la carpeta del MCP\n` +
            `  2. Ejecuta: npm install ${missingLib}\n` +
            `  3. Reinicia Claude Desktop\n` +
            `  4. Vuelve a compilar el componente\n\n` +
            `Librerías ya disponibles: react, react-dom, lucide-react\n\n` +
            `Nota: Puedes usar cualquier librería de npm, solo asegúrate de instalarla primero.`
          );
        }
      }
      
      // Si no es un error de módulo faltante, re-lanzar el error original
      throw buildError;
    }
    
    // Leer código compilado
    let compiledCode = await fs.readFile(tempOutputFile, 'utf-8');
    
    // Agregar código de inicialización
    compiledCode += `

// Compiled by Dossin MCP Server - Auto-initialization
(function() {
  function initDossinComponent() {
    try {
      if (typeof DossinApp === 'undefined') {
        throw new Error('DossinApp no está definido. El bundle no se cargó correctamente.');
      }
      
      if (!DossinApp.React) {
        throw new Error('React no está disponible en DossinApp');
      }
      
      if (!DossinApp.createRoot) {
        throw new Error('createRoot no está disponible en DossinApp');
      }
      
      const Component = DossinApp.default;
      if (!Component) {
        throw new Error('El componente no se exportó correctamente desde el bundle');
      }
      
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        throw new Error('Elemento #root no encontrado en el DOM');
      }
      
      const root = DossinApp.createRoot(rootElement);
      root.render(DossinApp.React.createElement(Component));
      
      console.log('✅ Componente Dossin inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar componente Dossin:', error);
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = \`
          <div style="padding: 40px; max-width: 600px; margin: 50px auto; background: #fee; border: 2px solid #c33; border-radius: 8px; font-family: system-ui, sans-serif;">
            <h2 style="color: #c33; margin: 0 0 16px 0;">❌ Error al cargar el componente</h2>
            <p style="margin: 0 0 12px 0; color: #666;"><strong>Mensaje:</strong></p>
            <pre style="background: #fff; padding: 12px; border-radius: 4px; overflow-x: auto; color: #333;">\${error.message}</pre>
            <p style="margin: 16px 0 0 0; font-size: 14px; color: #888;">Revisa la consola del navegador para más detalles.</p>
          </div>
        \`;
      }
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDossinComponent);
  } else {
    initDossinComponent();
  }
})();
`;
    
    // Limpiar archivos temporales
    await unlink(tempInputFile).catch(() => {});
    await unlink(tempOutputFile).catch(() => {});
    
    return compiledCode;
  } catch (error) {
    try {
      await unlink(tempInputFile).catch(() => {});
      await unlink(tempOutputFile).catch(() => {});
    } catch {}
    
    throw new Error(`Error al compilar componente: ${error.message}`);
  }
}

// Función para crear HTML standalone con el componente compilado
export function createStandaloneHTML(compiledCode, componentName) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} - Dossin</title>
  
  <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"></script>
  
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-x: hidden;
    }
    #root {
      min-height: 100vh;
    }
    
    input[type="color"],
    input[type="range"],
    input[type="text"],
    input[type="number"],
    select {
      cursor: pointer;
    }
    
    input[type="range"] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #e94560;
      cursor: pointer;
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #e94560;
      cursor: pointer;
      border: none;
    }
    
    * {
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script>
${compiledCode}
  </script>
</body>
</html>`;
}
