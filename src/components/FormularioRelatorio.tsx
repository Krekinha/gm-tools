import React from 'react';
import type { RelatorioTecnico } from '../types/relatorio';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FormularioRelatorioProps {
  relatorio: RelatorioTecnico;
  onChange: (relatorio: RelatorioTecnico) => void;
  onAtualizarPreview?: () => void;
}

export const FormularioRelatorio: React.FC<FormularioRelatorioProps> = ({ relatorio, onChange, onAtualizarPreview }) => {
  const handleChange = (field: keyof RelatorioTecnico, value: string | number) => {
    onChange({ ...relatorio, [field]: value });
  };

  const handleNestedChange = (parent: keyof RelatorioTecnico, field: string, value: string) => {
    onChange({
      ...relatorio,
      [parent]: {
        ...(relatorio[parent] as Record<string, string>),
        [field]: value
      }
    });
  };

  const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-600 flex items-center">
        <div className="w-1 h-5 bg-gradient-to-b from-primary-500 to-secondary-500 mr-3 rounded"></div>
        {title}
      </h3>
      {children}
    </div>
  );

  const FormGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col">
      <label className="font-semibold text-gray-600 mb-2 text-sm">{label}:</label>
      {children}
    </div>
  );

  // usando componentes shadcn Input e Textarea

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-4 border-primary-500 pb-2">
        Configuração do Relatório Técnico
      </h2>
      
      <FormSection title="Informações Gerais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Data">
            <Input
              type="date"
              value={relatorio.data}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('data', e.target.value)}
            />
          </FormGroup>
        </div>
      </FormSection>


      <FormSection title="Dados do Contrato">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormGroup label="Contrato">
            <Input
              type="text"
              value={relatorio.contrato.contrato}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNestedChange('contrato', 'contrato', e.target.value)}
              placeholder="Ex: LOGGI RCO"
            />
          </FormGroup>
          <FormGroup label="RQ">
            <Input
              type="text"
              value={relatorio.contrato.rq}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNestedChange('contrato', 'rq', e.target.value)}
              placeholder="Ex: RQ17724107"
            />
          </FormGroup>
          <FormGroup label="Fornecedor">
            <Input
              type="text"
              value={relatorio.contrato.fornecedor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNestedChange('contrato', 'fornecedor', e.target.value)}
              placeholder="Ex: GMA MANUTENÇÃO E SERVIÇOS LTDA"
            />
          </FormGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormGroup label="Valor Inicial (R$)">
            <Input
              type="number"
              step="0.01"
              value={relatorio.contrato.valorInicial}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = parseFloat(e.target.value) || 0;
                onChange({
                  ...relatorio,
                  contrato: {
                    ...relatorio.contrato,
                    valorInicial: value
                  }
                });
              }}
              placeholder="0.00"
            />
          </FormGroup>
          <FormGroup label="OS">
            <Input
              type="text"
              value={relatorio.contrato.os}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNestedChange('contrato', 'os', e.target.value)}
              placeholder="Ex: 20230001"
            />
          </FormGroup>
          <FormGroup label="Pedido">
            <Input
              type="text"
              value={relatorio.contrato.pedido}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNestedChange('contrato', 'pedido', e.target.value)}
              placeholder="Ex: OC17724107"
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Escopo">
        <FormGroup label="Descrição do Escopo">
          <Textarea
            value={relatorio.escopo.descricao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNestedChange('escopo', 'descricao', e.target.value)}
            placeholder="Ex: Abertura de alçapão."
            rows={3}
          />
        </FormGroup>
      </FormSection>

      <FormSection title="Descrição Técnica">
        <div className="space-y-4">
          {relatorio.descricaoTecnica.itens.map((item, index) => (
            <FormGroup key={index} label={`Item ${index + 1}`}>
              <Textarea
                value={item}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const newItens = [...relatorio.descricaoTecnica.itens];
                  newItens[index] = e.target.value;
                  onChange({
                    ...relatorio,
                    descricaoTecnica: {
                      ...relatorio.descricaoTecnica,
                      itens: newItens
                    }
                  });
                }}
                placeholder={`Ex: Foi aberto um alçapão no forro de PVC conforme solicitação.`}
                rows={3}
              />
            </FormGroup>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            onChange({
              ...relatorio,
              descricaoTecnica: {
                ...relatorio.descricaoTecnica,
                itens: [...relatorio.descricaoTecnica.itens, '']
              }
            });
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          + Adicionar Item
        </button>
      </FormSection>

      <FormSection title="Fotos do Serviço">
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              const dataUrls = await Promise.all(files.map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })));
              onChange({
                ...relatorio,
                fotos: [...(relatorio.fotos || []), ...dataUrls]
              });
            }}
          />
          {relatorio.fotos && relatorio.fotos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {relatorio.fotos.map((src, idx) => (
                <img key={idx} src={src} alt={`foto-${idx}`} className="w-full h-32 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          onClick={onAtualizarPreview}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Atualizar preview
        </Button>
      </div>
    </div>
  );
};