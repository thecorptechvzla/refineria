import fs from 'fs';
import path from 'path';
import SeguridadContent from './SeguridadContent';

export default function SeguridadPage() {
  let content: string;
  try {
    const filePath = path.join(process.cwd(), '..', 'SEGURIDAD_REPORTE.md');
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    content = `# 🛡️ Reporte de Seguridad — Refinería GoldTrack

**Estado:** No se pudo cargar el archivo \`SEGURIDAD_REPORTE.md\`.  
Verifica que el archivo exista en la raíz del proyecto.

---

*Auditoría realizada por OpenCode Modo Ciberseguridad — Julio 2026*`;
  }
  return <SeguridadContent content={content} />;
}
