import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import os from "os";

// Función para guardar archivo en Downloads
export async function saveToDownloads(htmlContent, fileName, componentName) {
  try {
    const homeDir = os.homedir();
    const downloadsDir = path.join(homeDir, 'Downloads', 'dossin-components');
    
    // Crear directorio si no existe
    await fs.mkdir(downloadsDir, { recursive: true });
    
    // Generar nombre de archivo con timestamp si no se proporciona
    let finalFileName = fileName;
    if (!finalFileName) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      finalFileName = `${componentName}-${timestamp}.html`;
    }
    
    // Asegurar extensión .html
    if (!finalFileName.endsWith('.html')) {
      finalFileName += '.html';
    }
    
    const filePath = path.join(downloadsDir, finalFileName);
    
    // Guardar archivo
    await fs.writeFile(filePath, htmlContent, 'utf-8');
    
    // Calcular hash MD5
    const hash = createHash('md5').update(htmlContent).digest('hex');
    
    // Obtener tamaño del archivo
    const stats = await fs.stat(filePath);
    
    return {
      success: true,
      localPath: filePath,
      fileName: finalFileName,
      fileSize: stats.size,
      hash: hash,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Error al guardar archivo: ${error.message}`);
  }
}
