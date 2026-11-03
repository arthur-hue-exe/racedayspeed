import "server-only";

import { query } from "./db";
import type { Order, OrderItem, OrderStatus } from "./types";

export function mapAdminOrder(row: Record<string, unknown>): Order {
  const items = (row.items as Record<string, unknown>[] | undefined) ?? [];
  return {
    id: row.id as string,
    number: Number(row.number),
    code: row.code as string,
    status: row.status as OrderStatus,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: row.customer_email as string,
    cep: row.cep as string,
    state: row.state as string,
    city: row.city as string,
    neighborhood: row.neighborhood as string,
    street: row.street as string,
    addressNumber: row.address_number as string,
    complement: (row.complement as string) ?? "",
    reference: (row.reference as string) ?? "",
    subtotalCents: Number(row.subtotal_cents),
    shippingCents: row.shipping_cents === null ? null : Number(row.shipping_cents),
    totalCents: Number(row.total_cents),
    stockCommitted: Boolean(row.stock_committed),
    whatsappOpenedAt:
      (row.whatsapp_opened_at as Date | null)?.toISOString() ?? null,
    adminNotes: (row.admin_notes as string) ?? "",
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    items: items.map(mapAdminOrderItem),
  };
}

function mapAdminOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    productId: (row.product_id as string) ?? null,
    productName: row.product_name as string,
    productSlug: (row.product_slug as string) ?? "",
    sizeLabel: (row.size_label as string) ?? null,
    unitPriceCents: Number(row.unit_price_cents),
    quantity: Number(row.quantity),
    subtotalCents: Number(row.subtotal_cents),
    imageUrl: (row.image_url as string) ?? "",
  };
}

export async function listAdminOrders(
  status?: OrderStatus,
  search?: string,
): Promise<Order[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (status) {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }
  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(
      `(o.code ilike $${params.length} or o.customer_name ilike $${params.length} or o.customer_phone ilike $${params.length})`,
    );
  }
  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const rows = await query<Record<string, unknown>>(
    `select o.*,
      coalesce((select json_agg(row_to_json(i)) from order_items i where i.order_id = o.id), '[]'::json) as items
     from orders o ${where}
     order by o.created_at desc limit 300`,
    params,
  );
  return rows.map(mapAdminOrder);
}

export async function getAdminOrderWithToken(
  id: string,
): Promise<{ order: Order; accessToken: string } | null> {
  const rows = await query<Record<string, unknown>>(
    `select o.*, o.access_token,
      coalesce((select json_agg(row_to_json(i)) from order_items i where i.order_id = o.id), '[]'::json) as items
     from orders o where o.id = $1 limit 1`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    order: mapAdminOrder(row),
    accessToken: row.access_token as string,
  };
}

export async function countOrdersByStatus(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; count: number }>(
    "select status, count(*)::int as count from orders group by status",
  );
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));
}
