import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, RefreshCcw, ShieldCheck, MessageCircle } from "lucide-react";
import { getProductBySlug, getRelated } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { getAvailability, availabilityLabel } from "@/lib/types";
import { formatBRL } from "@/lib/money";
import { ProductGallery } from "@/components/product-gallery";
import { ProductBuyPanel } from "@/components/product-buy-panel";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "active") {
    return { title: "Produto não encontrado" };
  }
  const image = product.images[1]?.url ?? product.images[0]?.url;
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "active") notFound();

  const [related, settings] = await Promise.all([
    getRelated(product, 4),
    getSettings(),
  ]);
  const availability = getAvailability(product);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="pb-24 pt-[104px] md:pt-[124px]">
      <div className="container-race">
        <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-1 text-[0.68rem] text-metal">
          <Link href="/" className="transition hover:text-white">
            Início
          </Link>
          <ChevronRight size={12} aria-hidden />
          <Link href="/catalogo" className="transition hover:text-white">
            Catálogo
          </Link>
          {product.categorySlug && (
            <>
              <ChevronRight size={12} aria-hidden />
              <Link
                href={`/catalogo?categoria=${product.categorySlug}`}
                className="transition hover:text-white"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={12} aria-hidden />
          <span className="line-clamp-1 text-chalk/80">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.26em] text-metal">
              {product.categoryName ?? "Race Day"}
              {product.sku ? ` · ${product.sku}` : ""}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold uppercase leading-[0.94]">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="font-display text-3xl font-semibold text-white">
                {product.priceCents === null ? (
                  <span className="text-xl uppercase tracking-wide text-metal">Preço sob consulta</span>
                ) : (
                  formatBRL(product.priceCents)
                )}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] ${
                  availability === "available"
                    ? "border-lime/35 bg-lime/10 text-lime"
                    : availability === "sold_out"
                      ? "border-white/15 bg-white/5 text-metal"
                      : "border-racing/30 bg-racing/8 text-racing"
                }`}
              >
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${
                    availability === "available"
                      ? "bg-lime"
                      : availability === "sold_out"
                        ? "bg-white/35"
                        : "bg-racing"
                  }`}
                />
                {availabilityLabel[availability]}
              </span>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-metal">
              {product.shortDescription || product.description}
            </p>

            <ProductBuyPanel
              product={product}
              whatsappNumber={settings.store.whatsappNumber}
            />

            <div className="mt-8 space-y-2.5">
              <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <Truck size={16} className="mt-0.5 shrink-0 text-racing" aria-hidden />
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white">
                    Frete e prazo
                  </p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-metal">
                    {settings.shipping.note}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-lime" aria-hidden />
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white">
                    Pagamento
                  </p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-metal">
                    {settings.payment.methods}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <RefreshCcw size={16} className="mt-0.5 shrink-0 text-chalk/70" aria-hidden />
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white">
                    Trocas e devoluções
                  </p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-metal">
                    Consulte as condições na{" "}
                    <Link
                      href="/politicas/trocas-e-devolucoes"
                      className="text-chalk underline decoration-racing/60 underline-offset-2 hover:text-racing"
                    >
                      política de troca e devolução
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            <details className="mt-6 border-t border-white/8 pt-5">
              <summary className="cursor-pointer text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
                Descrição do produto
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-metal">
                {product.description || product.shortDescription}
              </p>
            </details>

            <details className="mt-4 border-t border-white/8 pt-5">
              <summary className="cursor-pointer text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
                Atendimento Race Day
              </summary>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-metal">
                <p>
                  Dúvidas sobre tamanho, disponibilidade ou condições? Fale com a equipe pelo
                  WhatsApp {settings.store.whatsappDisplay}.
                </p>
                <a
                  href={`https://wa.me/${settings.store.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-lime hover:text-racing"
                >
                  <MessageCircle size={14} aria-hidden /> Abrir conversa
                </a>
              </div>
            </details>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24" aria-labelledby="related-title">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="related-title"
                className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold uppercase leading-none"
              >
                Você também pode <span className="italic text-racing">gostar</span>
              </h2>
              <Link
                href="/catalogo"
                className="shrink-0 text-[0.68rem] uppercase tracking-[0.16em] text-metal transition hover:text-white"
              >
                Ver catálogo
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 50}>
                  <ProductCard product={item} sizesHint="(max-width: 640px) 50vw, 25vw" />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images.map((image) =>
              image.url.startsWith("http") ? image.url : `${siteUrl}${image.url}`,
            ),
            sku: product.sku ?? undefined,
            brand: { "@type": "Brand", name: "Race Day Speed & Glory" },
            category: product.categoryName ?? undefined,
            offers:
              product.priceCents === null
                ? undefined
                : {
                    "@type": "Offer",
                    priceCurrency: "BRL",
                    price: (product.priceCents / 100).toFixed(2),
                    url: `${siteUrl}/produto/${product.slug}`,
                    availability:
                      availability === "available"
                        ? "https://schema.org/InStock"
                        : availability === "sold_out"
                          ? "https://schema.org/OutOfStock"
                          : undefined,
                  },
          }),
        }}
      />
    </div>
  );
}
