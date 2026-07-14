'use client';

import { useState } from 'react';
import { Upload, FileText, Save, X } from 'lucide-react';

interface ActaUploaderProps {
  processId: string;
  actaKey: 'recepcion' | 'fundicion' | 'conformidad';
  label: string;
  existingUrl?: string | null;
  onUrlChange: (url: string | null) => void;
  uploadFile: (file: File) => Promise<{ url: string }>;
  saveActaUrl: (data: {
    processId: string;
    actaRecepcion?: string | null;
    actaFundicion?: string | null;
    actaConformidad?: string | null;
  }) => Promise<unknown>;
}

export default function ActaUploader({
  processId,
  actaKey,
  label,
  existingUrl,
  onUrlChange,
  uploadFile,
  saveActaUrl,
}: ActaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const { url } = await uploadFile(file);
      await saveActaUrl({
        processId,
        [`acta${actaKey.charAt(0).toUpperCase() + actaKey.slice(1)}`]: url,
      });
      onUrlChange(url);
    } catch {
      setError(`Error al subir ${label}. Intente de nuevo.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onUrlChange(null);
    saveActaUrl({
      processId,
      [`acta${actaKey.charAt(0).toUpperCase() + actaKey.slice(1)}`]: null,
    }).catch(() => {});
  };

  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>

      {existingUrl ? (
        <div className="flex items-center justify-between px-3 py-2.5 bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-green-400 shrink-0" />
            <a
              href={`/api/processes/${processId}/actas/${actaKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-300 truncate hover:text-green-400 underline underline-offset-2"
            >
              Ver PDF
            </a>
          </div>
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer transition-colors">
              <Upload className="w-3 h-3" />
              <span>Reemplazar</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                disabled={isUploading}
              />
            </label>
            <button
              onClick={handleRemove}
              className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
              title="Eliminar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : isUploading ? (
        <div className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-500/5 border border-dashed border-slate-700">
          <Save className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Subiendo...</span>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-500/5 border border-dashed border-slate-700 text-slate-500 hover:bg-blue-500/10 hover:border-slate-600 hover:text-slate-400 transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Seleccionar PDF</span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            disabled={isUploading}
          />
        </label>
      )}

      {error && (
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
