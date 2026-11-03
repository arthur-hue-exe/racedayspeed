import "server-only";

import type pg from "pg";
import { query, withTransaction } from "./db";
import { getSettings, computeShipping } from "./settings";
import type { CheckoutInput } from "./validation";
import { buildWhatsAppMessage, whatsappLink } from "./whatsapp";
import type { Order, OrderItem, OrderStatus } from "./types";

export class OrderError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "INVALID_ORDER") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const COMMITTED_STATUSES: OrderStatus[] = [
  "confirmed",
  "preparing",
  "shipped",
  "completed",
];

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  awaiting_whatsapp: ["awaiting_confirmation", "confirmed", "cancelled"],
  awaiting_confirmation: ["confirmed", "cancelled"],
  confirmed: ["preparing", "shipped", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

type OrderRow = Record<string, unknown>;

function mapItem(row: Record<string, unknown>): OrderItem {
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

function mapOrder(row: OrderRow, items: OrderItem[]): Order {
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
    whatsappOpenedAt: (row.whatsapp_opened_at as Date | null)?.toISOString() ?? null,
    adminNotes: (row.admin_notes as string) ?? "",
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    items,
  };
}

async function loadItems(
  client: pg.PoolClient | undefined,
  orderId: string,
): Promise<OrderItem[]> {
  const runner = client ?? (await import("./db")).pool;
  const result = await runner.query(
    "select * from order_items where order_id = $1 order by id",
    [orderId],
  );
  return result.rows.map(mapItem);
}

export type CreateOrderResult = {
  order: Order;
  accessToken: string;
  whatsappMessage: string;
  whatsappUrl: string;
};

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const settings = await getSettings();

  return withTransaction(async (client) => {
    const merged = new Map<
      string,
      { slug: string; size: string | null; quantity: number }
    >();

    for (const item of input.items) {
      const key = `${item.slug}::${item.size ?? ""}`;
      const current = merged.get(key);
      if (current) {
        current.quantity = Math.min(10, current.quantity + item.quantity);
      } else {
        merged.set(key, {
          slug: item.slug,
          size: item.size ?? null,
          quantity: item.quantity,
        });
      }
    }

    let subtotalCents = 0;
    const prepared: Array<{
      productId: string;
      name: string;
      slug: string;
      size: string | null;
      unitPriceCents: number;
      quantity: number;
      subtotalCents: number;
      imageUrl: string;
    }> = [];

    for (const item of merged.values()) {
      const productResult = await client.query(
        `select p.id, p.name, p.slug, p.price_cents, p.status, p.has_sizes, p.stock,
                coalesce((select json_agg(json_build_object('label', s.label, 'stock', s.stock))
                  from product_sizes s where s.product_id = p.id), '[]'::json) as sizes,
                coalesce((select i.url from product_images i where i.product_id = p.id
                  order by i.position limit 1), '') as image_url
         from products p where p.slug = $1 limit 1`,
        [item.slug],
      );
      const product = productResult.rows[0];
      if (!product || product.status !== "active") {
        throw new OrderError(
          `O produto "${item.slug}" não está mais disponível. Remova-o do carrinho e tente novamente.`,
          409,
          "PRODUCT_UNAVAILABLE",
        );
      }

      if (product.price_cents === null) {
        throw new OrderError(
          `"${product.name}" está com preço sob consulta e não pode ser finalizado pelo site.`,
          409,
          "PRICE_ON_REQUEST",
        );
      }

      let sizeLabel: string | null = null;
      if (product.has_sizes) {
        if (!item.size) {
          throw new OrderError(
            `Selecione um tamanho para "${product.name}".`,
            400,
            "SIZE_REQUIRED",
          );
        }
        const size = (product.sizes as { label: string; stock: number | null }[]).find(
          (entry) => entry.label === item.size,
        );
        if (!size) {
          throw new OrderError(
            `O tamanho ${item.size} não está cadastrado para "${product.name}".`,
            400,
            "SIZE_NOT_FOUND",
          );
        }
        if (size.stock === 0) {
          throw new OrderError(
            `O tamanho ${item.size} de "${product.name}" está esgotado.`,
            409,
            "OUT_OF_STOCK",
          );
        }
        if (size.stock !== null && item.quantity > size.stock) {
          throw new OrderError(
            `Restam ${size.stock} unidade(s) do tamanho ${item.size} de "${product.name}".`,
            409,
            "INSUFFICIENT_STOCK",
          );
        }
        sizeLabel = size.label;
      } else {
        if (product.stock === 0) {
          throw new OrderError(
            `"${product.name}" está esgotado no momento.`,
            409,
            "OUT_OF_STOCK",
          );
        }
        if (product.stock !== null && item.quantity > product.stock) {
          throw new OrderError(
            `Restam ${product.stock} unidade(s) de "${product.name}".`,
            409,
            "INSUFFICIENT_STOCK",
          );
        }
      }

      const unitPriceCents = Number(product.price_cents);
      const itemSubtotal = unitPriceCents * item.quantity;
      subtotalCents += itemSubtotal;
      prepared.push({
        productId: product.id as string,
        name: product.name as string,
        slug: product.slug as string,
        size: sizeLabel,
        unitPriceCents,
        quantity: item.quantity,
        subtotalCents: itemSubtotal,
        imageUrl: (product.image_url as string) ?? "",
      });
    }

    const shippingCents = computeShipping(subtotalCents, settings);
    const totalCents = subtotalCents + (shippingCents ?? 0);

    const orderResult = await client.query(
      `insert into orders (
        customer_name, customer_phone, customer_email, cep, state, city, neighborhood,
        street, address_number, complement, reference, subtotal_cents, shipping_cents,
        total_cents, status
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'awaiting_whatsapp')
      returning *, access_token`,
      [
        input.customerName,
        input.customerPhone,
        input.customerEmail,
        input.cep.replace(/\D/g, ""),
        input.state,
        input.city,
        input.neighborhood,
        input.street,
        input.addressNumber,
        input.complement ?? "",
        input.reference ?? "",
        subtotalCents,
        shippingCents,
        totalCents,
      ],
    );

    const orderRow = orderResult.rows[0];
    const items: OrderItem[] = [];

    for (const item of prepared) {
      const inserted = await client.query(
        `insert into order_items (
          order_id, product_id, product_name, product_slug, size_label,
          unit_price_cents, quantity, subtotal_cents, image_url
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
        [
          orderRow.id,
          item.productId,
          item.name,
          item.slug,
          item.size,
          item.unitPriceCents,
          item.quantity,
          item.subtotalCents,
          item.imageUrl,
        ],
      );
      items.push(mapItem(inserted.rows[0]));
    }

    const order = mapOrder(orderRow, items);
    const whatsappMessage = buildWhatsAppMessage(order);
    const whatsappUrl = whatsappLink(settings.store.whatsappNumber, whatsappMessage);

    return {
      order,
      accessToken: orderRow.access_token as string,
      whatsappMessage,
      whatsappUrl,
    };
  });
}

export async function getPublicOrder(
  code: string,
  token: string,
): Promise<Order | null> {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(token)) return null;
  const rows = await query(
    "select * from orders where code = $1 and access_token = $2 limit 1",
    [code.toUpperCase(), token],
  );
  if (!rows[0]) return null;
  const items = await loadItems(undefined, rows[0].id as string);
  return mapOrder(rows[0], items);
}

export async function markWhatsappOpened(code: string, token: string): Promise<boolean> {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(token)) return false;
  const result = await query(
    `update orders
     set status = 'awaiting_confirmation', whatsapp_opened_at = coalesce(whatsapp_opened_at, now()), updated_at = now()
     where code = $1 and access_token = $2 and status = 'awaiting_whatsapp'
     returning id`,
    [code.toUpperCase(), token],
  );
  return result.length > 0;
}

export async function getAdminOrders(status?: OrderStatus): Promise<Order[]> {
  const params: unknown[] = [];
  const where = status ? "where o.status = $1" : "";
  if (status) params.push(status);
  const rows = await query(
    `select o.*,
      coalesce((select json_agg(row_to_json(i)) from order_items i where i.order_id = o.id), '[]'::json) as items
     from orders o ${where}
     order by o.created_at desc limit 200`,
    params,
  );
  return rows.map((row) =>
    mapOrder(row, ((row.items as Record<string, unknown>[]) ?? []).map(mapItem)),
  );
}

export async function getAdminOrder(id: string): Promise<Order | null> {
  const rows = await query("select * from orders where id = $1 limit 1", [id]);
  if (!rows[0]) return null;
  const items = await loadItems(undefined, id);
  return mapOrder(rows[0], items);
}

async function commitStock(client: pg.PoolClient, order: Order): Promise<void> {
  for (const item of order.items) {
    if (!item.productId) continue;
    if (item.sizeLabel) {
      const sizeResult = await client.query(
        "select stock from product_sizes where product_id = $1 and label = $2 for update",
        [item.productId, item.sizeLabel],
      );
      const stock = sizeResult.rows[0]?.stock;
      if (stock === null || stock === undefined) continue;
      if (stock < item.quantity) {
        throw new OrderError(
          `Estoque insuficiente para ${item.productName} (${item.sizeLabel}). Disponível: ${stock}.`,
          409,
          "INSUFFICIENT_STOCK",
        );
      }
      await client.query(
        "update product_sizes set stock = stock - $1 where product_id = $2 and label = $3",
        [item.quantity, item.productId, item.sizeLabel],
      );
    } else {
      const productResult = await client.query(
        "select stock from products where id = $1 for update",
        [item.productId],
      );
      const stock = productResult.rows[0]?.stock;
      if (stock === null || stock === undefined) continue;
      if (stock < item.quantity) {
        throw new OrderError(
          `Estoque insuficiente para ${item.productName}. Disponível: ${stock}.`,
          409,
          "INSUFFICIENT_STOCK",
        );
      }
      await client.query("update products set stock = stock - $1 where id = $2", [
        item.quantity,
        item.productId,
      ]);
    }
  }
}

async function restoreStock(client: pg.PoolClient, order: Order): Promise<void> {
  for (const item of order.items) {
    if (!item.productId) continue;
    if (item.sizeLabel) {
      await client.query(
        `update product_sizes set stock = stock + $1
         where product_id = $2 and label = $3 and stock is not null`,
        [item.quantity, item.productId, item.sizeLabel],
      );
    } else {
      await client.query(
        "update products set stock = stock + $1 where id = $2 and stock is not null",
        [item.quantity, item.productId],
      );
    }
  }
}

export async function updateOrderStatus(id: string, nextStatus: OrderStatus): Promise<void> {
  await withTransaction(async (client) => {
    const result = await client.query("select * from orders where id = $1 for update", [id]);
    if (!result.rows[0]) throw new OrderError("Pedido não encontrado.", 404, "NOT_FOUND");
    const order = mapOrder(result.rows[0], await loadItems(client, id));
    if (order.status === nextStatus) return;

    if (!ALLOWED_TRANSITIONS[order.status].includes(nextStatus)) {
      throw new OrderError(
        `Não é possível alterar de "${order.status}" para "${nextStatus}".`,
        409,
        "INVALID_TRANSITION",
      );
    }

    if (COMMITTED_STATUSES.includes(nextStatus) && !order.stockCommitted) {
      await commitStock(client, order);
    }

    if (nextStatus === "cancelled" && order.stockCommitted) {
      await restoreStock(client, order);
    }

    const stockCommitted = COMMITTED_STATUSES.includes(nextStatus) && !order.stockCommitted
      ? true
      : nextStatus === "cancelled" && order.stockCommitted
        ? false
        : order.stockCommitted;

    await client.query(
      "update orders set status = $1, stock_committed = $2, updated_at = now() where id = $3",
      [nextStatus, stockCommitted, id],
    );
  });
}

export async function updateOrderNotes(id: string, notes: string): Promise<void> {
  await query("update orders set admin_notes = $1, updated_at = now() where id = $2", [
    notes.slice(0, 2000),
    id,
  ]);
}
