import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
import { getSettings, type StoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type PolicyKey = "privacidade" | "termos-de-uso" | "trocas-e-devolucoes";

const policies: Record<
  PolicyKey,
  { title: string; eyebrow: string; intro: string; get: (settings: StoreSettings) => string }
> = {
  privacidade: {
    title: "Política de privacidade",
    eyebrow: "Privacidade e LGPD",
    intro:
      "Como a Race Day Speed & Glory coleta, usa e protege os dados informados no site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
    get: (settings) => settings.policies.privacy,
  },
  "termos-de-uso": {
    title: "Termos de uso",
    eyebrow: "Condições do site",
    intro:
      "Regras para uso do site, realização de pedidos e relações de atendimento da Race Day Speed & Glory.",
    get: (settings) => settings.policies.terms,
  },
  "trocas-e-devolucoes": {
    title: "Trocas e devoluções",
    eyebrow: "Pós-venda",
    intro:
      "Como solicitar troca ou devolução, prazos e condições de atendimento dos pedidos Race Day.",
    get: (settings) => settings.policies.returns,
  },
};

type Params = Promise<{ slug: string }>;

function resolvePolicy(slug: string) {
  return slug in policies ? policies[slug as PolicyKey] : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const policy = resolvePolicy(slug);
  if (!policy) return { title: "Política não encontrada" };
  return {
    title: policy.title,
    description: policy.intro,
    alternates: { canonical: `/politicas/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const policy = resolvePolicy(slug);
  if (!policy) notFound();

  const settings = await getSettings();
  const content = policy.get(settings).trim();
  const paragraphs = content.split(/\n{2,}|\r\n\r\n/).filter(Boolean);
  const whatsappUrl = `https://wa.me/${settings.store.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá! Tenho uma dúvida sobre a ${policy.title.toLowerCase()} da Race Day.`,
  )}`;

  return (
    <div className="pb-24 pt-[104px] md:pt-[124px]">
      <div className="container-race">
        <nav
          aria-label="Trilha de navegação"
          className="flex flex-wrap items-center gap-1 text-[0.68rem] text-metal"
        >
          <Link href="/" className="transition hover:text-white">
            Início
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-chalk/80">{policy.title}</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="eyebrow">{policy.eyebrow}</p>
          <h1 className="mt-3 font-display text-[clamp(2.3rem,5vw,4rem)] font-bold uppercase leading-[0.9]">
            {policy.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-metal">{policy.intro}</p>
        </header>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_18rem]">
          <article className="glass-panel rounded-2xl p-6 md:p-9">
            <div className="space-y-4 text-[0.88rem] leading-relaxed text-chalk/80">
              {paragraphs.map((paragraph, index) => {
                const isHeading =
                  paragraph.length < 90 &&
                  !/[.!?]$/.test(paragraph.trim()) &&
                  paragraph.split(" ").length <= 12;
                if (isHeading) {
                  return (
                    <h2
                      key={index}
                      className="pt-3 font-display text-xl font-semibold uppercase tracking-wide text-white first:pt-0"
                    >
                      {paragraph}
                    </h2>
                  );
                }
                return (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-chalk/80">
                <ShieldCheck size={14} className="text-lime" aria-hidden />
                Dados e atendimento
              </p>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-metal">
                Dúvidas sobre seus dados, pedidos, trocas ou devoluções? Fale diretamente com
                a equipe Race Day.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-4 py-3 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-racing"
              >
                <MessageCircle size={14} aria-hidden />
                WhatsApp {settings.store.whatsappDisplay}
              </a>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 text-[0.7rem] leading-relaxed text-metal">
              <p className="font-semibold uppercase tracking-[0.12em] text-chalk/80">
                Também pode interessar
              </p>
              <ul className="mt-3 space-y-2">
                {Object.entries(policies)
                  .filter(([key]) => key !== slug)
                  .map(([key, item]) => (
                    <li key={key}>
                      <Link
                        href={`/politicas/${key}`}
                        className="transition hover:text-racing"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
