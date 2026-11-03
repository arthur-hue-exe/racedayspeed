"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import { centsFromReais } from "@/lib/money";
import { isAllowedImageUrl } from "@/lib/storage";
import { fieldErrors, productInputSchema } from "@/lib/validation";

export type ProductFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

type ImagePayload = { id?: string; url: string; alt: string };
type SizePayload = { label: string; stock: number | null };

function parseInteger(value: string, fallback: number | null): number | null {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parseImages(raw: string): ImagePayload[] | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return { error: "Não foi possível ler a galeria de imagens. Recarregue a página." };
  }
  if (!Array.isArray(parsed)) {
    return { error: "Galeria de imagens inválida." };
  }
  if (parsed.length > 12) {
    return { error: "Cada produto pode ter no máximo 12 imagens." };
  }
  const images: ImagePayload[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") return { error: "Galeria de imagens inválida." };
    const candidate = entry as Record<string, unknown>;
    const url = String(candidate.url ?? "").trim();
    const alt = String(candidate.alt ?? "").trim().slice(0, 200);
    const id = candidate.id ? String(candidate.id) : undefined;
    if (!url || url.length > 1000 || !isAllowedImageUrl(url)) {
      return { error: "Uma das imagens tem endereço inválido. Envie novamente pelo painel." };
    }
    images.push({ id, url, alt });
  }
  return images;
}

function parseSizes(raw: string): SizePayload[] | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return { error: "Não foi possível ler os tamanhos. Recarregue a página." };
  }
  if (!Array.isArray(parsed)) return { error: "Lista de tamanhos inválida." };
  if (parsed.length > 20) return { error: "Use no máximo 20 tamanhos por produto." };

  const sizes: SizePayload[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") return { error: "Lista de tamanhos inválida." };
    const candidate = entry as Record<string, unknown>;
    const label = String(candidate.label ?? "").trim().toUpperCase().slice(0, 10);
    if (!label) continue;
    if (seen.has(label)) return { error: `O tamanho ${label} está repetido.` };
    seen.add(label);
    const rawStock = String(candidate.stock ?? "").trim();
    let stock: number | null = null;
    if (rawStock) {
      const parsedStock = Number(rawStock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return { error: `Estoque inválido para o tamanho ${label}. Use um número inteiro ou deixe vazio.` };
      }
      stock = parsedStock;
    }
    sizes.push({ label, stock });
  }
  return sizes;
}

export async function saveProductAction(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim();
  const hasSizes = formData.get("hasSizes") === "on";

  const parsed = productInputSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    categoryId: categoryIdRaw || null,
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price") ?? "",
    status: formData.get("status") ?? "draft",
    isNew: formData.get("isNew") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    hasSizes,
    stock: formData.get("stock") ?? "",
    sku: formData.get("sku") ?? "",
    sizes: [],
  });

  if (!parsed.success) {
    return {
      message: "Revise os campos destacados antes de salvar.",
      errors: fieldErrors(parsed.error),
    };
  }

  const data = parsed.data;
  const errors: Record<string, string> = {};

  const rawPrice = data.price.trim();
  let priceCents: number | null = null;
  if (rawPrice) {
    priceCents = centsFromReais(rawPrice);
    if (priceCents === null) {
      errors.price = "Preço inválido. Use, por exemplo, 100,00.";
    }
  }

  let stock: number | null = null;
  if (!hasSizes) {
    const rawStock = data.stock.trim();
    if (rawStock) {
      const parsedStock = Number(rawStock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        errors.stock = "Estoque inválido. Use um número inteiro ou deixe vazio para sob consulta.";
      } else {
        stock = parsedStock;
      }
    }
  }

  const images = parseImages(String(formData.get("images") ?? "[]"));
  if (!Array.isArray(images)) {
    errors.images = images.error;
  }

  const sizes = parseSizes(String(formData.get("sizes") ?? "[]"));
  if (!Array.isArray(sizes)) {
    errors.sizes = sizes.error;
  } else if (hasSizes && sizes.length === 0) {
    errors.sizes = "Cadastre pelo menos um tamanho ou desmarque o controle de tamanhos.";
  }

  const positionInput = String(formData.get("position") ?? "").trim();
  let position = positionInput ? Number(positionInput) : Number.NaN;
  if (!Number.isInteger(position) || position < 0) position = Number.NaN;

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos destacados antes de salvar.", errors };
  }

  const imageList = images as ImagePayload[];
  const sizeList = sizes as SizePayload[];

  let productId = id;
  try {
    productId = await withTransaction(async (client) => {
      let targetId = id;

      if (targetId) {
        await client.query(
          `update products set
             name = $1, slug = $2, category_id = $3, short_description = $4,
             description = $5, price_cents = $6, status = $7, is_new = $8,
             is_featured = $9, has_sizes = $10, stock = $11, sku = $12,
             updated_at = now()
           where id = $13`,
          [
            data.name,
            data.slug,
            data.categoryId,
            data.shortDescription ?? "",
            data.description ?? "",
            priceCents,
            data.status,
            data.isNew ?? false,
            data.isFeatured ?? false,
            hasSizes,
            hasSizes ? null : stock,
            data.sku.trim() || null,
            targetId,
          ],
        );
      } else {
        if (!Number.isInteger(position)) {
          const result = await client.query<{ next: number }>(
            "select coalesce(max(position), 0) + 1 as next from products",
          );
          position = Number(result.rows[0]?.next ?? 1);
        }
        const inserted = await client.query<{ id: string }>(
          `insert into products
             (name, slug, category_id, short_description, description, price_cents,
              status, is_new, is_featured, has_sizes, stock, sku, position)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           returning id`,
          [
            data.name,
            data.slug,
            data.categoryId,
            data.shortDescription ?? "",
            data.description ?? "",
            priceCents,
            data.status,
            data.isNew ?? false,
            data.isFeatured ?? false,
            hasSizes,
            hasSizes ? null : stock,
            data.sku.trim() || null,
            position,
          ],
        );
        targetId = inserted.rows[0].id;
      }

      if (Number.isInteger(position)) {
        await client.query("update products set position = $1 where id = $2", [
          position,
          targetId,
        ]);
      }

      if (hasSizes) {
        const labels = sizeList.map((size) => size.label);
        await client.query(
          "delete from product_sizes where product_id = $1 and not (label = any($2::text[]))",
          [targetId, labels],
        );
        for (const [index, size] of sizeList.entries()) {
          await client.query(
            `insert into product_sizes (product_id, label, stock, position)
             values ($1,$2,$3,$4)
             on conflict (product_id, label)
             do update set stock = excluded.stock, position = excluded.position`,
            [targetId, size.label, size.stock, index],
          );
        }
      } else {
        await client.query("delete from product_sizes where product_id = $1", [targetId]);
      }

      const keptIds = imageList.map((image) => image.id).filter(Boolean) as string[];
      await client.query(
        "delete from product_images where product_id = $1 and not (id = any($2::uuid[]))",
        [targetId, keptIds],
      );
      for (const [index, image] of imageList.entries()) {
        if (image.id) {
          await client.query(
            "update product_images set url = $1, alt = $2, position = $3 where id = $4 and product_id = $5",
            [image.url, image.alt, index, image.id, targetId],
          );
        } else {
          await client.query(
            "insert into product_images (product_id, url, alt, position) values ($1,$2,$3,$4)",
            [targetId, image.url, image.alt, index],
          );
        }
      }

      return targetId;
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      return {
        message: "Não foi possível salvar.",
        errors: { slug: "Já existe um produto com este endereço (slug)." },
      };
    }
    console.error("[admin] falha ao salvar produto:", error);
    return { message: "Não foi possível salvar o produto agora. Tente novamente." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath(`/produto/${data.slug}`);
  redirect(`/admin/produtos/${productId}?salvo=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await query("delete from products where id = $1", [id]);
  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/produtos?excluido=1");
}
