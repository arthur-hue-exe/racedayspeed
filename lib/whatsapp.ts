import { formatBRL } from "./money";
import type { Order } from "./types";

export function buildWhatsAppMessage(order: Order): string {
  const lines: string[] = [
    "Olá! Gostaria de finalizar meu pedido na RACE DAY SPEED & GLORY.",
    "",
    "🏁 NOVO PEDIDO — RACE DAY",
    "",
    `📦 Número do pedido: #${order.code}`,
    "",
    "👤 DADOS DO CLIENTE",
    "",
    `Nome: ${order.customerName}`,
    `Telefone: ${order.customerPhone}`,
    `E-mail: ${order.customerEmail}`,
    "",
    "📍 ENDEREÇO DE ENTREGA",
    "",
    `CEP: ${order.cep}`,
    `Estado: ${order.state}`,
    `Cidade: ${order.city}`,
    `Bairro: ${order.neighborhood}`,
    `Rua: ${order.street}`,
    `Número: ${order.addressNumber}`,
    `Complemento: ${order.complement || "—"}`,
    `Referência: ${order.reference || "—"}`,
    "",
    "🛒 PRODUTOS DO PEDIDO",
    "",
  ];

  for (const item of order.items) {
    lines.push(item.productName);
    if (item.sizeLabel) lines.push(`Tamanho: ${item.sizeLabel}`);
    lines.push(`Quantidade: ${item.quantity}`);
    lines.push(`Valor unitário: ${formatBRL(item.unitPriceCents)}`);
    lines.push(`Subtotal: ${formatBRL(item.subtotalCents)}`);
    lines.push("");
  }

  lines.push(
    "💰 RESUMO FINANCEIRO",
    "",
    `Subtotal: ${formatBRL(order.subtotalCents)}`,
    `Frete: ${order.shippingCents === null ? "a confirmar no atendimento" : formatBRL(order.shippingCents)}`,
    `TOTAL: ${formatBRL(order.totalCents)}${order.shippingCents === null ? " (frete a confirmar)" : ""}`,
    "",
    "Gostaria de confirmar a disponibilidade, o prazo de entrega e as condições de pagamento.",
    "",
    "Obrigado!",
  );

  return lines.join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
