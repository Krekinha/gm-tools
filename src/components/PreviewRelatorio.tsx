import React, { useEffect, useMemo, useState } from 'react';
import type { RelatorioTecnico } from '../types/relatorio';
import { gerarPDFBlob } from '../utils/pdfGenerator';

interface PreviewRelatorioProps {
  relatorio: RelatorioTecnico;
}

export const PreviewRelatorio: React.FC<PreviewRelatorioProps> = ({ relatorio }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const relatorioMemo = useMemo(() => relatorio, [relatorio]);

  const gerar = () => {
    let revokedUrl: string | null = null;
    let alive = true;
    (async () => {
      const blob = await gerarPDFBlob(relatorioMemo);
      if (!alive) return;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      revokedUrl = url;
    })();
    return () => {
      alive = false;
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  };

  useEffect(() => {
    const cleanup = gerar();
    return cleanup;
  }, [relatorioMemo]);

  // atualização do preview é feita externamente via snapshot setter no App/Form

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 dark:border-border rounded-xl overflow-hidden bg-white dark:bg-card">
        {pdfUrl ? (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-[85vh]"
            title="Preview PDF"
          />
        ) : (
          <div className="p-8 text-gray-500 dark:text-muted-foreground">Gerando preview...</div>
        )}
      </div>
    </div>
  );
};