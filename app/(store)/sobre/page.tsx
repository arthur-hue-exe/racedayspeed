import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre a Race Day",
  description:
    "Mais que um estilo, uma paixão. Conheça a Race Day Speed & Glory, loja de camisetas, jaquetas, equipamentos e colecionáveis do universo motorsport.",
  alternates: { canonical: "/sobre" },
};

export default async function AboutPage() {
  const settings = await getSettings();
  const whatsappUrl = `https://wa.me/${settings.store.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Olá! Vim pelo site da RACE DAY SPEED & GLORY e gostaria de atendimento.",
  )}`;
  const instagramUrl = `https://instagram.com/${settings.store.instagram.replace(/^@/, "")}`;

  const values = [
    {
      icon: Sparkles,
      title: "Curadoria de verdade",
      text: "Peças selecionadas do universo motorsport: camisetas temáticas, jaquetas, equipamentos e colecionáveis.",
    },
    {
      icon: ShieldCheck,
      title: "Compra assistida",
      text: "Cada pedido é confirmado no WhatsApp, com disponibilidade, frete e pagamento tratados diretamente pela equipe.",
    },
    {
      icon: Users,
      title: "Atendimento próximo",
      text: "Sem intermediários: você fala com a Race Day para tirar dúvidas de tamanho, estoque e entrega.",
    },
  ];

  return (
    <div className="pb-24 pt-[104px] md:pt-[124px]">
      <section className="container-race" aria-labelledby="about-title">
        <p className="eyebrow">A marca</p>
        <h1
          id="about-title"
          className="mt-4 max-w-5xl font-display text-[clamp(2.6rem,7vw,6rem)] font-bold uppercase leading-[0.86]"
        >
          Mais que um estilo,
          <br />
          <span className="italic text-racing">uma paixão.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-metal">
          A Race Day Speed &amp; Glory nasceu do encontro entre a cultura das pistas e o dia a
          dia de quem vive velocidade. Aqui, cada peça é escolhida para carregar essa história
          — dentro e fora das pistas.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-[1.15fr_0.85fr] md:grid-rows-2">
          <div className="relative row-span-2 min-h-[22rem] overflow-hidden rounded-3xl border border-white/10 md:min-h-[34rem]">
            <Image
              src="/products/p01-full.webp"
              alt="Camiseta VR46 Lunna Edição Especial — frente e costas"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover object-top"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-lime">
                Coleção oficial
              </p>
              <p className="mt-1 font-display text-3xl font-semibold uppercase leading-none text-white">
                Da pista para as ruas
              </p>
            </div>
          </div>
          <div className="relative min-h-[12rem] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/products/p23-full.webp"
              alt="Datsun 510 Kaido House Mini GT colecionável"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>
          <div className="relative min-h-[12rem] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/products/p22-full.webp"
              alt="Jaqueta Alpinestars do catálogo Race Day"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="mt-24 border-y border-white/8 bg-carbon/40 py-20 md:py-24">
        <div className="container-race grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="eyebrow">Nossa essência</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold uppercase leading-[0.94]">
              Velocidade é
              <br />
              <span className="italic text-racing">um jeito de viver</span>
            </h2>
          </Reveal>
          <Reveal delay={100} className="space-y-4 text-sm leading-relaxed text-metal">
            <p>
              Pilotos, equipes, motores e histórias que atravessam gerações. A Race Day
              traduz esse universo em produtos reais: camisetas, jaquetas, macacões,
              equipamentos e miniaturas colecionáveis.
            </p>
            <p>
              O catálogo é formado por 25 peças, com preços e disponibilidade informados de
              forma transparente. Itens marcados como “sob consulta” têm valor e estoque
              confirmados no atendimento — nada é inventado e nenhuma compra é finalizada com
              preço indefinido.
            </p>
            <p>
              Cada pedido feito pelo site é registrado com um número único antes de ser
              enviado ao WhatsApp oficial. A confirmação, o frete e o pagamento são tratados
              pela equipe, pessoa por pessoa.
            </p>
            <div className="pt-2">
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-chalk transition hover:text-racing"
              >
                Explorar a coleção
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-race py-20 md:py-24" aria-labelledby="values-title">
        <h2
          id="values-title"
          className="font-display text-[clamp(1.9rem,4vw,3rem)] font-bold uppercase leading-none"
        >
          O que guia a <span className="italic text-racing">Race Day</span>
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 70}>
              <div className="glass-panel h-full rounded-2xl p-6">
                <span className="grid size-11 place-items-center rounded-full bg-racing/12 text-racing">
                  <value.icon size={19} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold uppercase tracking-wide">
                  {value.title}
                </h3>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-metal">{value.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contato" className="container-race scroll-mt-28" aria-labelledby="contact-title">
        <Reveal className="glass-panel relative overflow-hidden rounded-3xl px-6 py-12 md:px-14 md:py-16">
          <div
            aria-hidden
            className="absolute -right-16 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(255,213,0,0.16),transparent_65%)]"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Contato</p>
              <h2
                id="contact-title"
                className="mt-3 font-display text-[clamp(2.1rem,4.6vw,3.8rem)] font-bold uppercase leading-[0.92]"
              >
                Fale com a
                <br />
                <span className="italic text-racing">equipe Race Day</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-metal">
                Atendimento pelo WhatsApp oficial para disponibilidade, tamanhos, frete,
                pagamento e acompanhamento de pedidos.
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

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5">
                <MessageCircle size={16} className="mt-0.5 shrink-0 text-lime" aria-hidden />
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-metal">
                    WhatsApp
                  </p>
                  <p className="mt-0.5 text-chalk">{settings.store.whatsappDisplay}</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5">
                <Instagram size={16} className="mt-0.5 shrink-0 text-racing" aria-hidden />
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-metal">
                    Instagram
                  </p>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-block text-chalk transition hover:text-racing"
                  >
                    @{settings.store.instagram.replace(/^@/, "")}
                  </a>
                </div>
              </li>
              {settings.store.email && (
                <li className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5">
                  <Mail size={16} className="mt-0.5 shrink-0 text-lime" aria-hidden />
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-metal">
                      E-mail
                    </p>
                    <a
                      href={`mailto:${settings.store.email}`}
                      className="mt-0.5 inline-block text-chalk transition hover:text-racing"
                    >
                      {settings.store.email}
                    </a>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-chalk/70" aria-hidden />
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-metal">
                    Atendimento
                  </p>
                  <p className="mt-0.5 text-chalk">{settings.company.hours}</p>
                </div>
              </li>
              {settings.company.address && (
                <li className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-chalk/70" aria-hidden />
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-metal">
                      Endereço
                    </p>
                    <p className="mt-0.5 text-chalk">{settings.company.address}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
