import { query } from "./db";
import type { Category, Product } from "./types";

const PRODUCT_SELECT = `
  select
    p.id, p.slug, p.name, p.short_description, p.description, p.price_cents,
    p.status, p.is_new, p.is_featured, p.has_sizes, p.stock, p.sku, p.position,
    c.slug as category_slug, c.name as category_name,
    coalesce((
      select json_agg(json_build_object('id', i.id, 'url', i.url, 'alt', i.alt) order by i.position, i.created_at)
      from product_images i where i.product_id = p.id
    ), '[]'::json) as images,
    coalesce((
      select json_agg(json_build_object('id', s.id, 'label', s.label, 'stock', s.stock) order by s.position)
      from product_sizes s where s.product_id = p.id
    ), '[]'::json) as sizes
  from products p
  left join categories c on c.id = p.category_id
`;

type Row = Record<string, unknown>;

function mapProduct(row: Row): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    shortDescription: (row.short_description as string) ?? "",
    description: (row.description as string) ?? "",
    priceCents: row.price_cents === null ? null : Number(row.price_cents),
    status: row.status as Product["status"],
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    hasSizes: Boolean(row.has_sizes),
    stock: row.stock === null || row.stock === undefined ? null : Number(row.stock),
    sku: (row.sku as string) ?? null,
    position: Number(row.position),
    categorySlug: (row.category_slug as string) ?? null,
    categoryName: (row.category_name as string) ?? null,
    images: (row.images as Product["images"]) ?? [],
    sizes: ((row.sizes as Product["sizes"]) ?? []).map((size) => ({
      ...size,
      stock: size.stock === null ? null : Number(size.stock),
    })),
  };
}

export async function getCategories(): Promise<Category[]> {
  const rows = await query("select * from categories order by position, name");
  return rows.map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    position: Number(row.position),
  }));
}

export type CatalogFilters = {
  category?: string;
  search?: string;
  sort?: "catalog" | "price-asc" | "price-desc" | "newest";
  onlyNew?: boolean;
  includeDraft?: boolean;
  limit?: number;
};

export async function getCatalog(filters: CatalogFilters = {}): Promise<Product[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (!filters.includeDraft) {
    conditions.push("p.status = 'active'");
  }
  if (filters.category) {
    params.push(filters.category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search.trim()}%`);
    conditions.push(
      `(p.name ilike $${params.length} or p.short_description ilike $${params.length} or p.description ilike $${params.length})`,
    );
  }
  if (filters.onlyNew) {
    conditions.push("p.is_new = true");
  }

  const orderBy =
    filters.sort === "price-asc"
      ? "p.price_cents asc nulls last, p.position"
      : filters.sort === "price-desc"
        ? "p.price_cents desc nulls last, p.position"
        : filters.sort === "newest"
          ? "p.position desc"
          : "p.position asc";

  const limit = filters.limit ? ` limit ${Number(filters.limit)}` : "";
  const where = conditions.length ? ` where ${conditions.join(" and ")}` : "";
  const rows = await query(`${PRODUCT_SELECT}${where} order by ${orderBy}${limit}`, params);
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await query(`${PRODUCT_SELECT} where p.slug = $1 limit 1`, [slug]);
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const rows = await query(`${PRODUCT_SELECT} where p.id = $1 limit 1`, [id]);
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getFeatured(limit = 3): Promise<Product[]> {
  const rows = await query(
    `${PRODUCT_SELECT} where p.status = 'active' and p.is_featured = true order by p.position limit $1`,
    [limit],
  );
  return rows.map(mapProduct);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const rows = await query(
    `${PRODUCT_SELECT} where p.status = 'active' and p.is_new = true order by p.position desc limit $1`,
    [limit],
  );
  return rows.map(mapProduct);
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const rows = await query(
    `${PRODUCT_SELECT}
     where p.status = 'active' and p.id <> $1
       and (p.category_id = (select category_id from products where id = $1) or $2::text is null)
     order by (p.category_id = (select category_id from products where id = $1)) desc, p.position
     limit $3`,
    [product.id, product.categorySlug, limit],
  );
  return rows.map(mapProduct);
}
