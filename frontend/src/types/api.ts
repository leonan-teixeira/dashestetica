export interface Clinica {
  id: number;
  nome: string;
  email_contato: string | null;
  telefone: string | null;
  cnpj: string | null;
  endereco: Record<string, string> | null;
  assinatura_inicio: string | null;
  assinatura_fim: string | null;
  plano: 'basico' | 'pro' | 'enterprise';
  ativo: boolean;
  assinatura_ativa: boolean;
  usuario: { id: number; name: string; email: string } | null;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  clinica_id: number | null;
  is_super_admin: boolean;
  clinica?: {
    id: number;
    nome: string;
    assinatura_ativa: boolean;
    assinatura_fim: string | null;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  unidade: string;
  estoque_minimo: number;
  estoque_atual: number;
  estoque_baixo: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id: number;
  produto_id: number;
  produto?: { id: number; nome: string; unidade: string } | null;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  preco_unitario: number | null;
  valor_total: number | null;
  motivo: string | null;
  observacao: string | null;
  created_at: string;
}

export interface RelatorioEstoqueItem {
  id: number;
  nome: string;
  categoria: string | null;
  unidade: string;
  estoque_minimo: number;
  estoque_atual: number;
  estoque_baixo: boolean;
  ativo: boolean;
  valor_investido: number;
}

export interface RelatorioEstoque {
  totais: {
    total_produtos: number;
    produtos_ativos: number;
    produtos_inativos: number;
    alertas_estoque: number;
    valor_total_estoque: number;
  };
  itens: RelatorioEstoqueItem[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
