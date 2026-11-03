import Link from "next/link";
import { ArrowUpRight, ImageOff, Plus, Search } from "lucide-react";
import { listAdminProducts, listAdminCategories } from "@/lib/admin-data";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Produtos" };

type SearchParams = Promise<{
  q?: string;
  status?: string;
  categoria?: string;
  preco?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    listAdminProducts({
      search: params.q,
      status: params.status,
      category: params.categoria,
    }),
    listAdminCategories(),
  ]);

  const filtered =
    params.preco === "consulta"
      ? products.filter((product) => product.priceCents === null)
      : products;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
            Produtos
          </h1>
          <p className="mt-1 text-sm text-metal">
            {filtered.length} produto(s) · cadastre preços sob consulta, estoque, tamanhos e imagens.
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-full bg-racing px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime"
        >
          <Plus size={15} aria-hidden />
          Novo produto
        </Link>
      </header>

      <form className="glass-panel grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_11rem_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar produto</span>
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-metal" aria-hidden />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Buscar por nome ou SKU"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-metal/60 focus:border-racing/60 focus:outline-none"
          />
        </label>
        <select
          name="categoria"
          defaultValue={params.categoria ?? ""}
          aria-label="Filtrar por categoria"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-racing/60 focus:outline-none"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          aria-label="Filtrar por status"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-racing/60 focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="draft">Rascunhos</option>
        </select>
        <select
          name="preco"
          defaultValue={params.preco ?? ""}
          aria-label="Filtrar por preço"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-racing/60 focus:outline-none"
        >
          <option value="">Todos os preços</option>
          <option value="consulta">Preço sob consulta</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-white/10 px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/15"
          >
            Filtrar
          </button>
          <Link
            href="/admin/produtos"
            className="rounded-full border border-white/10 px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-metal transition hover:text-white"
          >
            Limpar
          </Link>
        </div>
      </form>

      {params.preco === "consulta" && (
        <p className="rounded-xl border border-racing/25 bg-racing/8 px-4 py-3 text-sm text-racing">
          Exibindo somente produtos com preço sob consulta. Abra o produto e cadastre o valor para liberar a compra.
        </p>
      )}

      <section className="glass-panel overflow-hidden rounded-2xl">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-xl uppercase text-white">Nenhum produto encontrado</p>
            <p className="mt-1 text-sm text-metal">Ajuste os filtros ou cadastre um novo produto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="text-[0.6rem] uppercase tracking-[0.16em] text-metal">
                <tr className="border-b border-white/8">
                  <th className="px-5 py-3.5 font-semibold">Produto</th>
                  <th className="px-3 py-3.5 font-semibold">Categoria</th>
                  <th className="px-3 py-3.5 font-semibold">Preço</th>
                  <th className="px-3 py-3.5 font-semibold">Estoque</th>
                  <th className="px-3 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <ImageOff size={16} className="text-metal/50" aria-hidden />
                          )}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/admin/produtos/${product.id}`} className="block truncate font-medium text-white hover:text-racing">
                            {product.name}
                          </Link>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-metal">
                            {product.sku || "Sem SKU"}
                            {product.isNew && <span className="rounded bg-lime/15 px-1.5 py-0.5 text-lime">Novo</span>}
                            {product.isFeatured && <span className="rounded bg-racing/15 px-1.5 py-0.5 text-racing">Destaque</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-chalk/75">{product.categoryName ?? "—"}</td>
                    <td className="px-3 py-3">
                      {product.priceCents === null ? (
                        <span className="rounded-full bg-racing/12 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-racing">
                          Sob consulta
                        </span>
                      ) : (
                        <span className="font-medium text-white">{formatBRL(product.priceCents)}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-chalk/75">
                      {product.hasSizes
                        ? `${product.sizeCount} tamanho(s)`
                        : product.stock === null
                          ? "Sob consulta"
                          : `${product.stock} un.`}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.1em] ${
                          product.status === "active"
                            ? "border-lime/25 bg-lime/10 text-lime"
                            : "border-white/12 bg-white/5 text-metal"
                        }`}
                      >
                        {product.status === "active" ? "Ativo" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/produtos/${product.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-metal transition hover:border-racing/50 hover:text-racing"
                      >
                        Editar
                        <ArrowUpRight size={12} aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
