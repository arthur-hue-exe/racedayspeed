import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { HeroVisual } from "./hero-visual";
import { Reveal } from "./reveal";

const ticker = [
  "Motorsport Culture",
  "Da pista para as ruas",
  "Peças originais do catálogo",
  "Race Day Speed & Glory",
  "Atendimento direto no WhatsApp",
];

export function Hero({ products }: { products: Product[] }) {
  return (
    <section className="relative overflow-hidden pb-24 pt-[112px] md:min-h-[100svh] md:pt-[140px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 speed-lines opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 select-none font-display text-[26vw] font-extrabold uppercase leading-none text-stroke opacity-[0.16]"
      >
        Race
        <br />
        Day
      </div>

      <div className="container-race relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <div className="relative z-10 pt-6 md:pt-0">
            <Reveal>
              <p className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-metal">
                <span aria-hidden className="h-px w-10 bg-lime" />
                Coleção oficial · Motorsport
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 text-display text-[clamp(3.6rem,9.2vw,7.8rem)] text-white">
                Race Day
                <span className="mt-1 block italic text-racing">Speed &amp; Glory</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-md font-display text-xl font-medium uppercase tracking-wide text-chalk/90 md:text-2xl">
                Vista sua paixão. Viva a velocidade.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-metal">
                Da pista para as ruas. O verdadeiro estilo motorsport começa aqui.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalogo"
                  className="group inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-ink transition duration-300 hover:bg-lime hover:shadow-[0_20px_45px_-18px_rgba(255,213,0,0.6)]"
                >
                  Explorar coleção
                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/catalogo?novidades=1"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white transition hover:border-racing/70 hover:bg-racing/8 hover:text-racing"
                >
                  Ver novidades
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/8 pt-6">
                {[
                  { value: "25", label: "peças no catálogo" },
                  { value: "3", label: "categorias oficiais" },
                  { value: "100%", label: "atendimento direto" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="font-display text-3xl font-semibold text-white">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.18em] text-metal">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="relative">
            <HeroVisual products={products} />
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-white/8 pt-5">
          <span className="text-[0.6rem] uppercase tracking-[0.28em] text-metal">
            Role para explorar
          </span>
          <ArrowDown size={15} className="animate-bounce text-racing" aria-hidden />
        </div>
      </div>

      <div className="mt-10 overflow-hidden border-y border-white/8 bg-carbon/60 py-3.5">
        <div className="marquee-track gap-0" aria-hidden>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {ticker.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-6 whitespace-nowrap px-6 font-display text-xs font-medium uppercase tracking-[0.28em] text-chalk/55"
                >
                  {item}
                  <span className="size-1.5 rotate-45 bg-racing" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
