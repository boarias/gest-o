import axios, { AxiosResponse } from 'axios';
import { Venda, Indicadores, Saldo, FiltrosAtivos } from '../types'; // Importar tipos

// Define a URL base da API. Em produção, isso viria de uma variável de ambiente.
// Para desenvolvimento local, aponta para o backend rodando na porta 3001.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipagem para a resposta da API de opções
interface OpcaoResponse {
  distinct_value: string;
}

// Funções da API com tipagem

// Buscar Indicadores
export const getIndicadores = (): Promise<AxiosResponse<Indicadores>> => {
  return apiClient.get<Indicadores>('/indicadores');
};

// Buscar Saldos por Titular
export const getSaldos = (): Promise<AxiosResponse<Saldo[]>> => {
  return apiClient.get<Saldo[]>('/saldos');
};

// Buscar Vendas (com filtros opcionais)
export const getVendas = (filtros?: FiltrosAtivos): Promise<AxiosResponse<Venda[]>> => {
  return apiClient.get<Venda[]>('/vendas', { params: filtros });
};

// Buscar Opções para Filtros (Titular, Emissor, Situação)
export const getOpcoes = (campo: 'titular' | 'emissor' | 'situacao'): Promise<AxiosResponse<OpcaoResponse[]>> => {
  return apiClient.get<OpcaoResponse[]>(`/opcoes/${campo}`);
};

// Criar Nova Venda
// O backend espera um objeto Venda, mas sem id, created_at, desagio_percentual, lucro (serão calculados/gerados)
export const createVenda = (vendaData: Omit<Partial<Venda>, 'id' | 'created_at' | 'desagio_percentual' | 'lucro'>): Promise<AxiosResponse<Venda>> => {
  return apiClient.post<Venda>('/vendas', vendaData);
};

// Atualizar Venda Existente
// O backend espera um objeto Venda parcial, identificando a venda pelo ID na URL
export const updateVenda = (id: string, vendaData: Omit<Partial<Venda>, 'id' | 'created_at' | 'desagio_percentual' | 'lucro'>): Promise<AxiosResponse<Venda>> => {
  return apiClient.put<Venda>(`/vendas/${id}`, vendaData);
};

// Excluir Venda
export const deleteVenda = (id: string): Promise<AxiosResponse<{ message: string }>> => {
  return apiClient.delete<{ message: string }>(`/vendas/${id}`);
};

