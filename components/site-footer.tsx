import Link from "next/link";
import { Instagram, MessageCircle, MapPin, Clock } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";
import { BrandLogo } from "./brand-logo";

const columns = [
  {
    title: "Coleção",
    links: [
      { label: "Todas as peças", href: "/catalogo" },
      { label: "Camisetas", href: "/catalogo?categoria=camisetas" },
      { label: "Jaquetas e equipamentos", href: "/catalogo?categoria=jaquetas-e-equipamentos" },
      { label: "Colecionáveis", href: "/catalogo?categoria=colecionaveis" },
      { label: "Novidades", href: "/catalogo?novidades=1" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre a Race Day", href: "/sobre" },
      { label: "Contato", href: "/sobre#contato" },
      { label: "Política de privacidade", href: "/politicas/privacidade" },
      { label: "Termos de uso", href: "/politicas/termos-de-uso" },
      { label: "Trocas e devoluções", href: "/politicas/trocas-e-devolucoes" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  const instagramUrl = `https://instagram.com/${settings.store.instagram.replace(/^@/, "")}`;
  const whatsappUrl = `https://wa.me/${settings.store.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <footer className="relative mt-8 overflow-hidden border-t border-white/8 bg-carbon/70">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[16vw] font-extrabold uppercase leading-none text-white/[0.03]"
      >
        Speed &amp; Glory
      </div>

      <div className="container-race relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-metal">
              A Race Day Speed &amp; Glory reúne produtos para quem carrega o universo das duas
              rodas, das pistas e da cultura automotiva no dia a dia.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/8 px-4 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-lime transition hover:bg-lime/15"
              >
                <MessageCircle size={14} aria-hidden />
                {settings.store.whatsappDisplay}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-chalk/80 transition hover:border-racing/60 hover:text-white"
              >
                <Instagram size={14} aria-hidden />
                @{settings.store.instagram.replace(/^@/, "")}
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-[0.65rem] uppercase tracking-[0.26em] text-metal">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-chalk/70 transition hover:text-racing"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/8 pt-6 text-[0.72rem] text-metal md:grid-cols-3">
          <p className="flex items-start gap-2">
            <Clock size={14} className="mt-0.5 shrink-0 text-racing/80" aria-hidden />
            {settings.company.hours}
          </p>
          {settings.company.address && (
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-racing/80" aria-hidden />
              {settings.company.address}
            </p>
          )}
          <p className="md:text-right">
            Formas de pagamento: {settings.payment.methods}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-6 text-[0.65rem] text-metal sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.company.legalName}. Todos os direitos
            reservados.
          </p>
          <p className="uppercase tracking-[0.18em]">
            Da pista para as ruas — Race Day Speed &amp; Glory
          </p>
        </div>
      </div>
    </footer>
  );
}
