import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { getAdminProduct, listAdminCategories } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { deleteProductAction } from "../actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ salvo?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? `Editar ${product.name}` : "Produto" };
}

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <ProductForm
        product={product}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        saved={query.salvo === "1"}
      />

      <section className="rounded-2xl border border-white/8 bg-carbon/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Ações do produto
            </h2>
            <p className="mt-0.5 text-xs text-metal">
              O produto é removido do catálogo. Pedidos antigos mantêm o registro do item.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/produto/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-chalk transition hover:border-racing/40 hover:text-racing"
            >
              <ExternalLink size={13} aria-hidden />
              Ver na loja
            </Link>
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmSubmit
                message={`Excluir "${product.name}"? Esta ação não pode ser desfeita.`}
                className="inline-flex items-center gap-2 rounded-full border border-racing/30 px-4 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-racing transition hover:bg-racing hover:text-ink"
              >
                <Trash2 size={13} aria-hidden />
                Excluir produto
              </ConfirmSubmit>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
