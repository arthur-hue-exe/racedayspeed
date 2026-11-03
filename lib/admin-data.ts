import "server-only";

import { query } from "./db";
import { mapAdminOrder } from "./admin-orders";
import type { Category, Order, OrderStatus } from "./types";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  priceCents: number | null;
  status: "active" | "draft";
  isNew: boolean;
  isFeatured: boolean;
  hasSizes: boolean;
  stock: number | null;
  sku: string | null;
  position: number;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  imageCount: number;
  sizeCount: number;
};

export type AdminProduct = AdminProductRow & {
  shortDescription: string;
  description: string;
  images: { id: string; url: string; alt: string; position: number }[];
  sizes: { id: string; label: string; stock: number | null; position: number }[];
};

export type AdminCategory = Category & { productCount: number };

export async function listAdminProducts(filters: {
  search?: string;
  status?: string;
  category?: string;
} = {}): Promise<AdminProductRow[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search.trim()}%`);
    conditions.push(`(p.name ilike $${params.length} or p.sku ilike $${params.length})`);
  }
  if (filters.status === "active" || filters.status === "draft") {
    params.push(filters.status);
    conditions.push(`p.status = $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    conditions.push(`c.slug = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const rows = await query<Record<string, unknown>>(
    `select p.id, p.slug, p.name, p.price_cents, p.status, p.is_new, p.is_featured,
            p.has_sizes, p.stock, p.sku, p.position, p.category_id,
            c.name as category_name,
            (select i.url from product_images i where i.product_id = p.id order by i.position limit 1) as image_url,
            (select count(*)::int from product_images i where i.product_id = p.id) as image_count,
            (select count(*)::int from product_sizes s where s.product_id = p.id) as size_count
     from products p
     left join categories c on c.id = p.category_id
     ${where}
     order by p.position, p.name`,
    params,
  );

  return rows.map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    priceCents: row.price_cents === null ? null : Number(row.price_cents),
    status: row.status as "active" | "draft",
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    hasSizes: Boolean(row.has_sizes),
    stock: row.stock === null ? null : Number(row.stock),
    sku: (row.sku as string) ?? null,
    position: Number(row.position),
    categoryId: (row.category_id as string) ?? null,
    categoryName: (row.category_name as string) ?? null,
    imageUrl: (row.image_url as string) ?? null,
    imageCount: Number(row.image_count),
    sizeCount: Number(row.size_count),
  }));
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const rows = await query<Record<string, unknown>>(
    `select p.*, c.name as category_name,
            (select i.url from product_images i where i.product_id = p.id order by i.position limit 1) as image_url,
            (select count(*)::int from product_images i where i.product_id = p.id) as image_count,
            (select count(*)::int from product_sizes s where s.product_id = p.id) as size_count
     from products p left join categories c on c.id = p.category_id
     where p.id = $1 limit 1`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;

  const [images, sizes] = await Promise.all([
    query<Record<string, unknown>>(
      "select id, url, alt, position from product_images where product_id = $1 order by position, created_at",
      [id],
    ),
    query<Record<string, unknown>>(
      "select id, label, stock, position from product_sizes where product_id = $1 order by position, label",
      [id],
    ),
  ]);

  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    shortDescription: (row.short_description as string) ?? "",
    description: (row.description as string) ?? "",
    priceCents: row.price_cents === null ? null : Number(row.price_cents),
    status: row.status as "active" | "draft",
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    hasSizes: Boolean(row.has_sizes),
    stock: row.stock === null ? null : Number(row.stock),
    sku: (row.sku as string) ?? null,
    position: Number(row.position),
    categoryId: (row.category_id as string) ?? null,
    categoryName: (row.category_name as string) ?? null,
    imageUrl: (row.image_url as string) ?? null,
    imageCount: Number(row.image_count),
    sizeCount: Number(row.size_count),
    images: images.map((image) => ({
      id: image.id as string,
      url: image.url as string,
      alt: (image.alt as string) ?? "",
      position: Number(image.position),
    })),
    sizes: sizes.map((size) => ({
      id: size.id as string,
      label: size.label as string,
      stock: size.stock === null ? null : Number(size.stock),
      position: Number(size.position),
    })),
  };
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const rows = await query<Record<string, unknown>>(
    `select c.*, (select count(*)::int from products p where p.category_id = c.id) as product_count
     from categories c order by c.position, c.name`,
  );
  return rows.map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    position: Number(row.position),
    productCount: Number(row.product_count),
  }));
}

export type DashboardData = {
  products: { total: number; active: number; onRequest: number; draft: number };
  orders: {
    total: number;
    awaitingWhatsapp: number;
    awaitingConfirmation: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    confirmedValueCents: number;
  };
  lowStock: {
    productId: string;
    productName: string;
    slug: string;
    sizeLabel: string | null;
    stock: number;
  }[];
  recentOrders: Order[];
};

export async function getDashboard(): Promise<DashboardData> {
  const [productRow] = await query<Record<string, unknown>>(
    `select count(*)::int as total,
            count(*) filter (where status = 'active')::int as active,
            count(*) filter (where status = 'active' and price_cents is null)::int as on_request,
            count(*) filter (where status = 'draft')::int as draft
     from products`,
  );

  const [orderRow] = await query<Record<string, unknown>>(
    `select count(*)::int as total,
            count(*) filter (where status = 'awaiting_whatsapp')::int as awaiting_whatsapp,
            count(*) filter (where status = 'awaiting_confirmation')::int as awaiting_confirmation,
            count(*) filter (where status in ('confirmed','preparing','shipped'))::int as in_progress,
            count(*) filter (where status = 'completed')::int as completed,
            count(*) filter (where status = 'cancelled')::int as cancelled,
            coalesce(sum(total_cents) filter (where status in ('confirmed','preparing','shipped','completed')), 0)::bigint as confirmed_value
     from orders`,
  );

  const lowStockRows = await query<Record<string, unknown>>(
    `select p.id as product_id, p.name as product_name, p.slug,
            s.label as size_label, s.stock as size_stock, p.stock as product_stock
     from products p
     left join product_sizes s on s.product_id = p.id
     where p.status = 'active'
       and (
         (p.has_sizes and s.stock is not null and s.stock <= 2)
         or (not p.has_sizes and p.stock is not null and p.stock <= 2)
       )
     order by coalesce(s.stock, p.stock), p.name
     limit 8`,
  );

  const recentRows = await query<Record<string, unknown>>(
    `select o.*,
       coalesce((select json_agg(row_to_json(i)) from order_items i where i.order_id = o.id), '[]'::json) as items
     from orders o order by o.created_at desc limit 6`,
  );

  return {
    products: {
      total: Number(productRow.total),
      active: Number(productRow.active),
      onRequest: Number(productRow.on_request),
      draft: Number(productRow.draft),
    },
    orders: {
      total: Number(orderRow.total),
      awaitingWhatsapp: Number(orderRow.awaiting_whatsapp),
      awaitingConfirmation: Number(orderRow.awaiting_confirmation),
      inProgress: Number(orderRow.in_progress),
      completed: Number(orderRow.completed),
      cancelled: Number(orderRow.cancelled),
      confirmedValueCents: Number(orderRow.confirmed_value),
    },
    lowStock: lowStockRows.map((row) => ({
      productId: row.product_id as string,
      productName: row.product_name as string,
      slug: row.slug as string,
      sizeLabel: (row.size_label as string) ?? null,
      stock: Number(row.size_stock ?? row.product_stock),
    })),
    recentOrders: recentRows.map((row) => mapAdminOrder(row)),
  };
}

export function isOrderStatus(value: string | undefined): value is OrderStatus {
  return (
    value === "awaiting_whatsapp" ||
    value === "awaiting_confirmation" ||
    value === "confirmed" ||
    value === "preparing" ||
    value === "shipped" ||
    value === "completed" ||
    value === "cancelled"
  );
}
