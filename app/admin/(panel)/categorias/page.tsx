import { Trash2 } from "lucide-react";
import { listAdminCategories } from "@/lib/admin-data";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { deleteCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
          Categorias
        </h1>
        <p className="mt-1 text-sm text-metal">
          Organize a navegação da loja. Excluir uma categoria não apaga os produtos: eles ficam sem categoria.
        </p>
      </header>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white">
          Nova categoria
        </h2>
        <CategoryForm nextPosition={categories.length + 1} />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {categories.map((category) => (
          <section key={category.id} className="glass-panel rounded-2xl p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                  {category.name}
                </h2>
                <p className="text-xs text-metal">
                  {category.productCount} produto(s) · /{category.slug}
                </p>
              </div>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <ConfirmSubmit
                  message={`Excluir a categoria "${category.name}"? Os produtos ficarão sem categoria.`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.1em] text-metal transition hover:border-racing/40 hover:text-racing"
                >
                  <Trash2 size={12} aria-hidden />
                  Excluir
                </ConfirmSubmit>
              </form>
            </div>
            <CategoryForm category={category} />
          </section>
        ))}
      </div>
    </div>
  );
}
