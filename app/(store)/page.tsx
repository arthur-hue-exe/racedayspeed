import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Instagram, ShieldCheck, Boxes, MessagesSquare } from "lucide-react";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { VideoSection } from "@/components/video-section";
import { getCatalog, getFeatured, getNewArrivals, getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RACE DAY SPEED & GLORY — Vista sua paixão",
  description:
    "Camisetas, jaquetas, equipamentos e colecionáveis do universo motorsport. Da pista para as ruas, o verdadeiro estilo Race Day começa aqui.",
};

const categoryImages: Record<string, string> = {
  camisetas: "/products/p01-card.webp",
  "jaquetas-e-equipamentos": "/products/p22-card.webp",
  colecionaveis: "/products/p23-card.webp",
};

export default async function HomePage() {
  const [featured, catalog, novidades, categories, settings] = await Promise.all([
    getFeatured(3),
    getCatalog(),
    getNewArrivals(6),
    getCategories(),
    getSettings(),
  ]);

  const highlight = catalog.slice(0, 8);
  const numbers = settings.store.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${numbers}?text=${encodeURIComponent(
    "Olá! Gostaria de conhecer as peças da RACE DAY SPEED & GLORY.",
  )}`;
  const instagramUrl = `https://instagram.com/${settings.store.instagram.replace(/^@/, "")}`;
  const filmImages = catalog.slice(0, 3).map((product) => ({
    url: product.images[1]?.url ?? product.images[0]?.url ?? "",
    alt: product.images[0]?.alt ?? product.name,
  }));

  return (
    <>
      <Hero products={featured.length ? featured : catalog.slice(0, 3)} />

      <section className="py-24 md:py-32" aria-labelledby="collection-title">
        <div className="container-race">
          <SectionHeading
            index="01"
            eyebrow="Coleção"
            title={
              <>
                Destaques <span className="italic text-racing">da pista</span>
              </>
            }
            description="Peças reais do catálogo oficial Race Day. Preços confirmados na página de cada produto — itens com valor sob consulta são combinados diretamente no atendimento."
            action={{ label: "Ver catálogo completo", href: "/catalogo" }}
          />

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {highlight.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard
                  product={product}
                  sizesHint="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/8 bg-carbon/40 py-24 md:py-32">
        <div className="container-race grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative grid grid-cols-5 grid-rows-6 gap-3">
              <div className="relative col-span-3 row-span-6 aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/products/p01-full.webp"
                  alt="Camiseta VR46 Lunna Edição Especial — frente e costas"
                  fill
                  sizes="(max-width: 1024px) 60vw, 30vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="relative col-span-2 row-span-3 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/products/p23-full.webp"
                  alt="Datsun 510 Kaido House Mini GT"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="relative col-span-2 row-span-3 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/products/p22-full.webp"
                  alt="Jaqueta Alpinestars preta"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
            <span
              aria-hidden
              className="absolute -bottom-6 -right-4 hidden rotate-[-3deg] rounded-xl bg-racing px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-ink sm:block"
            >
              Since the first lap
            </span>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow flex items-center gap-3">
              <span className="text-racing">03</span>
              <span aria-hidden className="h-px w-8 bg-racing/50" />
              A marca
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.6rem)] font-bold uppercase leading-[0.9]">
              Mais que um estilo,
              <br />
              <span className="italic text-racing">uma paixão</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-metal">
              A Race Day Speed &amp; Glory reúne produtos para quem carrega o universo das duas
              rodas, das pistas e da cultura automotiva no dia a dia.
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-metal">
              Camisetas temáticas, jaquetas, equipamentos e itens colecionáveis selecionados
              para quem vive a velocidade dentro e fora das pistas.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Boxes, title: "Catálogo oficial", text: "25 peças reais" },
                { icon: ShieldCheck, title: "Compra assistida", text: "Confirmação no WhatsApp" },
                { icon: MessagesSquare, title: "Atendimento direto", text: "Sem intermediários" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <item.icon size={17} className="text-lime" aria-hidden />
                  <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[0.68rem] text-metal">{item.text}</p>
                </div>
              ))}
            </div>

            <Link
              href="/sobre"
              className="group mt-8 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-chalk/80 transition hover:text-racing"
            >
              Conheça a Race Day
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Reveal>
        </div>
      </section>

      <VideoSection
        videoUrl={settings.media.heroVideoUrl}
        posterUrl={settings.media.heroVideoPoster}
        images={filmImages}
        whatsappUrl={whatsappUrl}
      />

      <section className="py-24 md:py-32" aria-labelledby="categories-title">
        <div className="container-race">
          <SectionHeading
            index="04"
            eyebrow="Explore"
            title={
              <>
                Escolha sua <span className="italic text-racing">categoria</span>
              </>
            }
            action={{ label: "Ir para o catálogo", href: "/catalogo" }}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {categories.map((category, index) => {
              const count = catalog.filter((product) => product.categorySlug === category.slug).length;
              return (
                <Reveal key={category.id} delay={index * 80}>
                  <Link
                    href={`/catalogo?categoria=${category.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-graphite md:aspect-[3/4]"
                  >
                    <Image
                      src={categoryImages[category.slug] ?? "/products/p01-card.webp"}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-5">
                      <span className="text-[0.6rem] uppercase tracking-[0.24em] text-lime">
                        {count} {count === 1 ? "peça" : "peças"}
                      </span>
                      <span className="mt-1 flex items-end justify-between gap-3">
                        <span className="font-display text-3xl font-semibold uppercase leading-none text-white">
                          {category.name}
                        </span>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/20 text-white transition group-hover:border-racing group-hover:bg-racing group-hover:text-ink">
                          <ArrowRight size={16} aria-hidden />
                        </span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {novidades.length > 0 && (
        <section className="border-y border-white/8 bg-carbon/40 py-24 md:py-32" aria-labelledby="new-title">
          <div className="container-race">
            <SectionHeading
              index="05"
              eyebrow="Novidades"
              title={
                <>
                  Chegou na <span className="italic text-racing">Race Day</span>
                </>
              }
              action={{ label: "Ver todas as novidades", href: "/catalogo?novidades=1" }}
            />
            <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
              {novidades.map((product) => (
                <div
                  key={product.id}
                  className="w-[78vw] shrink-0 snap-start sm:w-[52vw] md:w-auto"
                >
                  <ProductCard
                    product={product}
                    sizesHint="(max-width: 768px) 78vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden py-24">
        <div className="container-race">
          <Reveal className="glass-panel relative overflow-hidden rounded-3xl px-6 py-12 md:px-14 md:py-16">
            <div
              aria-hidden
              className="absolute -right-16 -top-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(183,240,0,0.18),transparent_65%)]"
            />
            <div className="relative max-w-2xl">
              <p className="eyebrow">Atendimento Race Day</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold uppercase leading-[0.92]">
                Não achou o tamanho?
                <br />
                <span className="italic text-racing">Fale com a gente.</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-metal">
                Confirmamos disponibilidade, tamanhos, frete e condições de pagamento
                diretamente pelo WhatsApp oficial.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-racing"
                >
                  <MessageCircle size={15} aria-hidden />
                  WhatsApp {settings.store.whatsappDisplay}
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white transition hover:border-racing/70 hover:text-racing"
                >
                  <Instagram size={15} aria-hidden />
                  @{settings.store.instagram.replace(/^@/, "")}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "RACE DAY SPEED & GLORY",
            description:
              "Camisetas, jaquetas, equipamentos e colecionáveis do universo motorsport.",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
            telephone: settings.store.whatsappDisplay,
            sameAs: [instagramUrl],
            paymentAccepted: settings.payment.methods,
          }),
        }}
      />
    </>
  );
}
