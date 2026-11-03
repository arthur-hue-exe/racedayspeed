"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export type CategoryFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function saveCategoryAction(
  _previous: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const rawPosition = String(formData.get("position") ?? "").trim();
  const position = rawPosition ? Number(rawPosition) : 0;

  const errors: Record<string, string> = {};
  if (name.length < 2 || name.length > 80) errors.name = "Informe um nome de 2 a 80 caracteres.";
  if (!slugPattern.test(slug)) errors.slug = "Use letras minúsculas, números e hífens.";
  if (description.length > 240) errors.description = "Descrição com no máximo 240 caracteres.";
  if (!Number.isInteger(position) || position < 0) errors.position = "Informe uma ordem válida.";

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos destacados.", errors };
  }

  try {
    if (id) {
      await query(
        "update categories set name = $1, slug = $2, description = $3, position = $4 where id = $5",
        [name, slug, description, position, id],
      );
    } else {
      await query(
        "insert into categories (name, slug, description, position) values ($1,$2,$3,$4)",
        [name, slug, description, position],
      );
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { errors: { slug: "Já existe uma categoria com este slug." }, message: "Slug em uso." };
    }
    console.error("[admin] falha ao salvar categoria:", error);
    return { message: "Não foi possível salvar a categoria agora." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { ok: true, message: id ? "Categoria atualizada." : "Categoria criada." };
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await query("delete from categories where id = $1", [id]);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}
