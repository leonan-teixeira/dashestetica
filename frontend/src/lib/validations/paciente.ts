import { z } from 'zod';

const enderecoSchema = z
  .object({
    cep:         z.string().max(9).optional().or(z.literal('')),
    rua:         z.string().max(255).optional().or(z.literal('')),
    numero:      z.string().max(20).optional().or(z.literal('')),
    complemento: z.string().max(100).optional().or(z.literal('')),
    bairro:      z.string().max(100).optional().or(z.literal('')),
    cidade:      z.string().max(100).optional().or(z.literal('')),
    uf:          z.string().max(2).optional().or(z.literal('')),
  })
  .optional();

export const pacienteSchema = z.object({
  nome_completo:      z.string().min(3, 'Nome muito curto').max(255),
  cpf:                z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (000.000.000-00)'),
  data_nascimento:    z.string().optional(),
  telefone:           z.string().min(10, 'Telefone inválido').max(20),
  email:              z.string().email('E-mail inválido').optional().or(z.literal('')),
  endereco:           enderecoSchema,
  observacoes_gerais: z.string().optional(),
  consentimento_aceito: z.boolean().refine((v) => v === true, {
    message: 'É necessário aceitar o termo de consentimento',
  }),
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;
