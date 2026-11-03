"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X, Instagram, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BrandLogo } from "./brand-logo";
import { useStore } from "./providers";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Camisetas", href: "/catalogo?categoria=camisetas" },
  { label: "Jaquetas e equipamentos", href: "/catalogo?categoria=jaquetas-e-equipamentos" },
  { label: "Colecionáveis", href: "/catalogo?categoria=colecionaveis" },
  { label: "Novidades", href: "/catalogo?novidades=1" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/sobre#contato" },
];

export function SiteHeader({
  announcement,
  whatsappUrl,
  instagramUrl,
}: {
  announcement: { enabled: boolean; text: string };
  whatsappUrl: string;
  instagramUrl: string;
}) {
  const { count, openCart, openSearch } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {announcement.enabled && (
        <div
          className={`overflow-hidden border-b border-white/5 bg-black/80 transition-all duration-500 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          <div className="container-race flex h-8 items-center justify-between gap-4 text-[0.66rem] uppercase tracking-[0.2em] text-metal">
            <span className="truncate">{announcement.text}</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-lime transition hover:text-racing md:inline-flex"
            >
              <MessageCircle size={12} aria-hidden />
              Fale com a Race Day
            </a>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-ink/75 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-race flex h-[68px] items-center justify-between gap-6">
          <BrandLogo />

          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group relative text-[0.78rem] font-medium uppercase tracking-[0.14em] text-chalk/75 transition hover:text-white"
                  >
                    {item.label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-racing transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Pesquisar produtos"
              className="grid size-10 place-items-center rounded-full text-chalk/80 transition hover:bg-white/5 hover:text-white"
            >
              <Search size={19} aria-hidden />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrinho, ${count} item(ns)`}
              className="relative grid size-10 place-items-center rounded-full text-chalk/80 transition hover:bg-white/5 hover:text-white"
            >
              <ShoppingBag size={19} aria-hidden />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-racing px-1 text-[0.62rem] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              className="grid size-10 place-items-center rounded-full text-chalk/80 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu size={21} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/97 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-race flex h-[68px] items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="grid size-10 place-items-center rounded-full border border-white/10 text-white"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <nav className="container-race flex flex-1 flex-col justify-center gap-1 pb-16">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 border-b border-white/5 py-3.5 font-display text-3xl font-semibold uppercase tracking-tight text-white"
                  >
                    <span className="text-[0.6rem] tracking-[0.3em] text-metal">
                      0{index + 1}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-racing px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-ink"
                >
                  <MessageCircle size={15} aria-hidden /> WhatsApp
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  <Instagram size={15} aria-hidden /> Instagram
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
