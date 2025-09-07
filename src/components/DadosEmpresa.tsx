import React from 'react';
import { NOME_EMPRESA, CNPJ_EMPRESA } from '../constants/empresa';

export const DadosEmpresa: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <img src={new URL('../assets/logo.png', import.meta.url).toString()} alt="logo" className="h-10 w-auto" />
      <div className="leading-tight">
        <div className="font-bold text-base text-gray-900">{NOME_EMPRESA}</div>
        <div className="text-sm text-gray-700">{CNPJ_EMPRESA}</div>
      </div>
    </div>
  );
};


