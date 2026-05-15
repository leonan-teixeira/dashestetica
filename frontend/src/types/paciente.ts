export interface Endereco {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface Anamnese {
  id: number;
  paciente_id: number;
  alergias: string | null;
  medicamentos_uso_continuo: string | null;
  condicoes_pre_existentes: string | null;
  gestante: boolean;
  amamentando: boolean;
  usa_anticoncepcional: boolean;
  fumante: boolean;
  pratica_atividade_fisica: boolean;
  objetivo_tratamento: string | null;
  observacoes: string | null;
  respondida_em: string | null;
  updated_at: string;
}

export interface Paciente {
  id: number;
  nome_completo: string;
  cpf: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: Endereco | null;
  foto_perfil_path: string | null;
  observacoes_gerais: string | null;
  consentimento_aceito_em: string | null;
  consentimento_versao: string | null;
  anonimizado_em: string | null;
  created_at: string;
  anamnese?: Anamnese | null;
}
