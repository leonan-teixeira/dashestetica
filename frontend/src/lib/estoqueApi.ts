import { api } from './api';
import type {
  Produto,
  MovimentacaoEstoque,
  RelatorioEstoque,
  PaginatedResponse,
} from '@/types/api';

export async function listProdutos(params?: {
  busca?: string;
  categoria?: string;
  ativo?: boolean | '';
  page?: number;
}): Promise<PaginatedResponse<Produto>> {
  const { data } = await api.get('/estoque/produtos', { params });
  return data;
}

export async function getProduto(id: number): Promise<Produto> {
  const { data } = await api.get(`/estoque/produtos/${id}`);
  return data.data;
}

export async function createProduto(payload: {
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  unidade?: string;
  estoque_minimo?: number;
}): Promise<Produto> {
  const { data } = await api.post('/estoque/produtos', payload);
  return data.data;
}

export async function updateProduto(id: number, payload: Partial<{
  nome: string;
  descricao: string | null;
  categoria: string | null;
  unidade: string;
  estoque_minimo: number;
}>): Promise<Produto> {
  const { data } = await api.put(`/estoque/produtos/${id}`, payload);
  return data.data;
}

export async function toggleAtivoProduto(id: number): Promise<Produto> {
  const { data } = await api.patch(`/estoque/produtos/${id}/toggle-ativo`);
  return data.data;
}

export async function deleteProduto(id: number): Promise<void> {
  await api.delete(`/estoque/produtos/${id}`);
}

export async function listMovimentacoes(params?: {
  produto_id?: number;
  tipo?: 'entrada' | 'saida';
  data_inicio?: string;
  data_fim?: string;
  page?: number;
}): Promise<PaginatedResponse<MovimentacaoEstoque>> {
  const { data } = await api.get('/estoque/movimentacoes', { params });
  return data;
}

export async function createMovimentacao(payload: {
  produto_id: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  preco_unitario?: number | null;
  motivo?: string | null;
  observacao?: string | null;
}): Promise<MovimentacaoEstoque> {
  const { data } = await api.post('/estoque/movimentacoes', payload);
  return data.data;
}

export async function getRelatorio(): Promise<RelatorioEstoque> {
  const { data } = await api.get('/estoque/relatorio');
  return data;
}

export async function getCategorias(): Promise<string[]> {
  const { data } = await api.get('/estoque/categorias');
  return data;
}
