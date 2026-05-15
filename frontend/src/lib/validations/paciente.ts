import { z } from 'zod';

export const pacienteSchema = z.object({
  nome_completo: z.string().min(3, 'Nome muito curto').max(255),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (000.000.000-00)'),
  data_nascimento: z.string().optional(),
  telefone: z.string().min(10, 'Telefone inválido').max(20),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  observacoes_gerais: z.string().optional(),
  consentimento_aceito: z.boolean().refine((v) => v === true, {
    message: 'É necessário aceitar o termo de consentimento',
  }),
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;
