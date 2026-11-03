import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CatalogControls } from "@/components/catalog-controls";
import { Reveal } from "@/components/reveal";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.categoria === "string" ? params.categoria : undefined;
  const query = typeof params.q === "string" ? params.q : undefined;
  const categories = await getCategories();
  const found = categories.find((entry) => entry.slug === category);
  const title = query
    ? `Busca: ${query}`
    : found
      ? found.name
      : params.novidades
        ? "Novidades"
        : "Catálogo completo";
  return {
    title,
    description: found?.description ?? "Catálogo oficial Race Day Speed & Glory.",
  };
}

const sorts = ["catalog", "price-asc", "price-desc", "newest"] as const;
type Sort = (typeof sorts)[number];

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = typeof params.categoria === "string" ? params.categoria : undefined;
  const query = typeof params.q === "string" ? params.q : "";
  const novidades = params.novidades === "1";
  const rawSort = typeof params.ordenar === "string" ? params.ordenar : "catalog";
  const sort: Sort = sorts.includes(rawSort as Sort) ? (rawSort as Sort) : "catalog";

  const [categories, products] = await Promise.all([
    getCategories(),
    getCatalog({ category, search: query || undefined, onlyNew: novidades, sort }),
  ]);

  const activeCategory = categories.find((entry) => entry.slug === category);
  const title = query
    ? `Resultados para “${query}”`
    : activeCategory
      ? activeCategory.name
      : novidades
        ? "Novidades"
        : "Catálogo completo";

  return (
    <div className="pb-24 pt-[112px] md:pt-[132px]">
      <div className="container-race">
        <nav aria-label="Trilha de navegação" className="flex items-center gap-1 text-[0.68rem] text-metal">
          <Link href="/" className="transition hover:text-white">
            Início
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-chalk/80">Catálogo</span>
          {activeCategory && (
            <>
              <ChevronRight size={12} aria-hidden />
              <span className="text-chalk/80">{activeCategory.name}</span>
            </>
          )}
        </nav>

        <div className="mt-8 flex flex-col gap-6 border-b border-white/8 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="text-racing">Race Day</span>
              <span aria-hidden className="h-px w-8 bg-racing/50" />
              {products.length} {products.length === 1 ? "peça" : "peças"}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-bold uppercase leading-[0.9]">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-metal">
              {activeCategory?.description ??
                "Peças do catálogo oficial Race Day. Preços sob consulta são combinados no atendimento pelo WhatsApp."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            aria-current={!category && !novidades ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition ${
              !category && !novidades
                ? "border-racing bg-racing text-ink"
                : "border-white/12 text-chalk/75 hover:border-white/30 hover:text-white"
            }`}
          >
            Tudo
          </Link>
          {categories.map((entry) => (
            <Link
              key={entry.id}
              href={`/catalogo?categoria=${entry.slug}`}
              aria-current={category === entry.slug ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition ${
                category === entry.slug
                  ? "border-racing bg-racing text-ink"
                  : "border-white/12 text-chalk/75 hover:border-white/30 hover:text-white"
              }`}
            >
              {entry.name}
            </Link>
          ))}
          <Link
            href="/catalogo?novidades=1"
            aria-current={novidades ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition ${
              novidades
                ? "border-lime bg-lime text-ink"
                : "border-white/12 text-chalk/75 hover:border-white/30 hover:text-white"
            }`}
          >
            Novidades
          </Link>
        </div>

        <div className="mt-6">
          <CatalogControls
            initialQuery={query}
            initialSort={sort}
            category={category}
            novidades={novidades}
          />
        </div>

        {products.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-white/8 bg-white/3 px-6 py-20 text-center">
            <p className="font-display text-3xl uppercase">Nenhuma peça encontrada</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-metal">
              Tente outra busca ou explore o catálogo completo. Se procura algo específico,
              fale com a Race Day no WhatsApp.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex rounded-full bg-racing px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink"
            >
              Ver todo o catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index, 7) * 45}>
                <ProductCard
                  product={product}
                  priority={index < 4}
                  sizesHint="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
