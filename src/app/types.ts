export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

export interface Veiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  placa?: string;
  ano?: string;
}

export interface Servico {
  id: string;
  nome: string;
  valor: number;
}

export interface NotaServico {
  id: string;
  numero: string;
  data: string;
  clienteId: string;
  veiculoId: string;
  servicos: Servico[];
  observacoes?: string;
  total: number;
  status: 'pendente' | 'pago';
}

export interface Orcamento {
  id: string;
  numero: string;
  data: string;
  clienteId: string;
  veiculoId: string;
  servicos: Servico[];
  observacoes?: string;
  total: number;
  status: 'pendente' | 'aprovado' | 'recusado';
}
