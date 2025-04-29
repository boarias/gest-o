// Define a interface para um registro de venda
export interface Venda {
  id: string; // uuid
  created_at: string; // timestamptz
  data_venda: string; // date (YYYY-MM-DD)
  cliente: string;
  situacao: string;
  localizador: string;
  origem: string;
  titular: string;
  valor_wallet: number;
  custo_wallet: number;
  valor_venda: number;
  emissor: string;
  financeiro: string;
  desagio_percentual: number; // Calculado no DB
  lucro: number; // Calculado no DB
}

// Define a interface para os indicadores do dashboard
export interface Indicadores {
  total_registros: number;
  total_vendas: number;
  total_lucro: number;
  desagio_medio: number;
}

// Define a interface para os saldos por titular
export interface Saldo {
  titular: string;
  saldo_lucro: number;
}

// Define a interface para as opções de filtro
export interface OpcoesFiltro {
  titulares: string[];
  emissores: string[];
  situacoes: string[];
  financeiros?: string[]; // Adicionado para o formulário
}

// Define a interface para os filtros ativos
export interface FiltrosAtivos {
  situacao?: string;
  titular?: string;
  emissor?: string;
  data_inicio?: string;
  data_fim?: string;
}

