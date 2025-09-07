export interface RelatorioTecnico {
  titulo: string;
  data: string;
  contrato: {
    contrato: string;
    rq: string;
    fornecedor: string;
    valorInicial: number;
    os: string;
    pedido: string;
  };
  escopo: {
    descricao: string;
  };
  descricaoTecnica: {
    itens: string[];
  };
  fotos?: string[]; // dataURLs ou URLs de imagens
  tecnico: {
    nome: string;
    registro: string;
    especialidade: string;
  };
  equipamento: {
    nome: string;
    modelo: string;
    serial: string;
    marca: string;
  };
  problema: {
    descricao: string;
    sintomas: string;
    causa: string;
  };
  solucao: {
    procedimento: string;
    pecas: string;
    observacoes: string;
  };
  status: 'Concluído' | 'Pendente' | 'Em Andamento';
  valor: number;
  assinatura: string;
}
