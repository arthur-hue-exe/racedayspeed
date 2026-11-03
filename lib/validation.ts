import { z } from "zod";

const UF = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const digits = (value: string) => value.replace(/\D/g, "");

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo.")
    .refine((value) => value.includes(" "), "Informe nome e sobrenome."),
  customerPhone: z
    .string()
    .trim()
    .refine((value) => {
      const count = digits(value).length;
      return count >= 10 && count <= 13;
    }, "Informe um telefone/WhatsApp válido com DDD."),
  customerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
  cep: z
    .string()
    .trim()
    .refine((value) => digits(value).length === 8, "Informe um CEP com 8 dígitos."),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => UF.includes(value), "Selecione um estado válido."),
  city: z.string().trim().min(2, "Informe a cidade.").max(100),
  neighborhood: z.string().trim().min(2, "Informe o bairro.").max(100),
  street: z.string().trim().min(3, "Informe a rua ou avenida.").max(160),
  addressNumber: z.string().trim().min(1, "Informe o número.").max(20),
  complement: z.string().trim().max(120).optional().default(""),
  reference: z.string().trim().max(160).optional().default(""),
  terms: z.literal(true, { message: "É necessário aceitar os termos e a política de privacidade." }),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(160),
        size: z.string().trim().max(10).nullable().optional(),
        quantity: z.number().int().min(1, "Quantidade mínima de 1.").max(10, "Quantidade máxima de 10 por item."),
      }),
    )
    .min(1, "Seu carrinho está vazio.")
    .max(30, "Pedido com muitos itens. Fale com o atendimento."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productInputSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome do produto.").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
  categoryId: z.string().uuid("Selecione uma categoria.").nullable(),
  shortDescription: z.string().trim().max(240).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  price: z.string().trim().max(20).optional().default(""),
  status: z.enum(["active", "draft"]),
  isNew: z.coerce.boolean().optional().default(false),
  isFeatured: z.coerce.boolean().optional().default(false),
  hasSizes: z.coerce.boolean().optional().default(false),
  stock: z.string().trim().max(10).optional().default(""),
  sku: z.string().trim().max(60).optional().default(""),
  sizes: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Informe o tamanho.").max(10),
        stock: z.string().trim().max(10).optional().default(""),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

export const settingsInputSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .refine((value) => digits(value).length >= 12 && digits(value).length <= 15, "Informe o WhatsApp com DDI e DDD, ex.: 5561982817033."),
  whatsappDisplay: z.string().trim().min(8).max(30),
  instagram: z.string().trim().max(60).optional().default(""),
  email: z.string().trim().max(120).optional().default(""),
  shippingMode: z.enum(["pending", "flat"]),
  shippingFlat: z.string().trim().max(20).optional().default(""),
  shippingFreeAbove: z.string().trim().max(20).optional().default(""),
  shippingNote: z.string().trim().max(240).optional().default(""),
  paymentMethods: z.string().trim().max(600).optional().default(""),
  legalName: z.string().trim().max(160).optional().default(""),
  cnpj: z.string().trim().max(30).optional().default(""),
  address: z.string().trim().max(240).optional().default(""),
  hours: z.string().trim().max(240).optional().default(""),
  announcementEnabled: z.coerce.boolean().optional().default(false),
  announcementText: z.string().trim().max(160).optional().default(""),
  heroVideoUrl: z.string().trim().max(500).optional().default(""),
  policyPrivacy: z.string().trim().max(20000).optional().default(""),
  policyTerms: z.string().trim().max(20000).optional().default(""),
  policyReturns: z.string().trim().max(20000).optional().default(""),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
