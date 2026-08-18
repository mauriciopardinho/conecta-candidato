const { z } = require('zod');

const registerVoterSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().nullable(),
  region_id: z.string().uuid().optional().nullable(),
  password: z.string().min(6),
  accepted_terms: z.boolean(),
});

const verifyWhatsappSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3),
});

const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const suggestionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  region_id: z.string().uuid().optional().nullable(),
  category: z.enum([
    'saude', 'educacao', 'seguranca', 'infraestrutura', 'transporte',
    'emprego', 'esporte', 'cultura', 'meio_ambiente', 'outras',
  ]),
  proposal_id: z.string().uuid().optional().nullable(),
  attachment_url: z.string().url().optional().nullable(),
});

const requestSchema = z.object({
  region_id: z.string().uuid().optional().nullable(),
  subject: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  photo_url: z.string().url().optional().nullable(),
});

const registrationSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(8),
  region_id: z.string().uuid().optional().nullable(),
  operational_note: z.string().optional().nullable(),
  has_consent: z.boolean(),
  consent_evidence: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

const createAgentSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  region_id: z.string().uuid().optional().nullable(),
  username: z.string().min(3),
  password: z.string().min(6),
});

const proposalSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.string().min(2),
  image_url: z.string().url().optional().nullable(),
  region_id: z.string().uuid().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

module.exports = {
  registerVoterSchema,
  verifyWhatsappSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  suggestionSchema,
  requestSchema,
  registrationSchema,
  createAgentSchema,
  proposalSchema,
};
