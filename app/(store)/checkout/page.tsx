import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finalizar pedido",
  description:
    "Confira seus dados de entrega e envie o pedido para a Race Day Speed & Glory pelo WhatsApp oficial.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();

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
          <Link href="/catalogo" className="transition hover:text-white">
            Catálogo
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-chalk/80">Finalizar pedido</span>
        </nav>

        <header className="mt-8 max-w-2xl">
          <p className="eyebrow">Checkout Race Day</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-bold uppercase leading-[0.9]">
            Finalizar <span className="italic text-racing">pedido</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-metal">
            Preencha seus dados de contato e entrega. O pedido é registrado no site e a
            confirmação acontece pelo WhatsApp oficial da Race Day — nenhum pagamento é
            cobrado automaticamente nesta etapa.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-metal">
            <Lock size={12} className="text-lime" aria-hidden />
            Ambiente seguro · dados usados apenas para o pedido
          </p>
        </header>

        <CheckoutForm
          shipping={settings.shipping}
          paymentMethods={settings.payment.methods}
          whatsappDisplay={settings.store.whatsappDisplay}
          storeName={settings.company.legalName || "Race Day Speed & Glory"}
        />
      </div>
    </div>
  );
}
