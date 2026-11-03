import { StoreProvider } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer, CartToast, WhatsAppFab } from "@/components/cart-drawer";
import { SearchOverlay } from "@/components/search-overlay";
import { IntroExperience } from "@/components/intro";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const number = settings.store.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(
    "Olá! Vim pelo site da RACE DAY SPEED & GLORY e gostaria de atendimento.",
  )}`;
  const instagramUrl = `https://instagram.com/${settings.store.instagram.replace(/^@/, "")}`;

  return (
    <StoreProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-racing focus:px-5 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-ink"
      >
        Ir para o conteúdo
      </a>
      <IntroExperience />
      <SiteHeader
        announcement={settings.announcement}
        whatsappUrl={whatsappUrl}
        instagramUrl={instagramUrl}
      />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} />
      <CartDrawer whatsappUrl={whatsappUrl} shippingNote={settings.shipping.note} />
      <SearchOverlay />
      <CartToast />
      <WhatsAppFab url={whatsappUrl} />
    </StoreProvider>
  );
}
