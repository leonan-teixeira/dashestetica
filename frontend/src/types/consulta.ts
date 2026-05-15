import type { Paciente } from './paciente';

export type ConsultaStatus =
  | 'agendada'
  | 'confirmada'
  | 'realizada'
  | 'cancelada'
  | 'nao_compareceu';

export interface Procedimento {
  id: number;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  categoria: string | null;
  ativo: boolean;
  created_at: string;
}

export interface FotoEvolucao {
  id: number;
  paciente_id: number;
  consulta_id: number;
  tipo: 'antes' | 'durante' | 'depois';
  url: string | null;
  mime: string;
  tamanho_bytes: number;
  largura: number | null;
  altura: number | null;
  observacao: string | null;
  created_at: string;
}

export interface Consulta {
  id: number;
  paciente_id: number;
  inicio: string;
  fim: string;
  status: ConsultaStatus;
  valor_total: number | null;
  forma_pagamento: string | null;
  pago: boolean;
  observacoes: string | null;
  evolucao_clinica: string | null;
  proxima_recomendacao_dias: number | null;
  created_at: string;
  paciente?: Paciente;
  procedimentos?: Procedimento[];
  fotos?: FotoEvolucao[];
}
