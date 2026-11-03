"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X, MessageCircle, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatBRL, formatPrice } from "@/lib/money";
import { cartKey } from "@/lib/cart";
import { useStore } from "./providers";

export function CartDrawer({
  whatsappUrl,
  shippingNote,
}: {
  whatsappUrl: string;
  shippingNote: string;
}) {
  const {
    items,
    cartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    hasUnpriced,
    ready,
  } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Fechar carrinho"
            onClick={closeCart}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col border-l border-white/10 bg-carbon/95 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={18} className="text-racing" aria-hidden />
                <h2 id="cart-title" className="font-display text-xl font-semibold uppercase tracking-wide">
                  Seu carrinho
                </h2>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[0.65rem] text-metal">
                  {items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                aria-label="Fechar carrinho"
                className="grid size-9 place-items-center rounded-full border border-white/10 text-metal transition hover:text-white"
              >
                <X size={17} aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!ready ? (
                <div className="space-y-4" aria-hidden>
                  {[0, 1].map((key) => (
                    <div key={key} className="flex gap-3">
                      <div className="size-20 shrink-0 animate-pulse rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/5">
                    <ShoppingBag size={24} className="text-metal" aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-2xl uppercase">Carrinho vazio</p>
                    <p className="mt-1 text-sm text-metal">
                      Sua próxima peça Race Day está no catálogo.
                    </p>
                  </div>
                  <Link
                    href="/catalogo"
                    onClick={closeCart}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-racing px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime"
                  >
                    Explorar coleção <ArrowRight size={14} aria-hidden />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const key = cartKey(item.slug, item.size);
                    const limit = item.maxQuantity ?? 10;
                    return (
                      <li
                        key={key}
                        className="flex gap-3 rounded-2xl border border-white/8 bg-white/3 p-3"
                      >
                        <Link
                          href={`/produto/${item.slug}`}
                          onClick={closeCart}
                          className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-graphite"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/produto/${item.slug}`}
                              onClick={closeCart}
                              className="line-clamp-2 text-sm font-medium leading-snug text-white hover:text-racing"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              aria-label={`Remover ${item.name}`}
                              className="shrink-0 rounded p-1 text-metal transition hover:text-white"
                            >
                              <Trash2 size={14} aria-hidden />
                            </button>
                          </div>
                          {item.size && (
                            <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.12em] text-metal">
                              Tamanho {item.size}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-racing">
                            {item.priceCents === null ? (
                              <span className="text-xs uppercase tracking-[0.12em] text-metal">
                                Sob consulta
                              </span>
                            ) : (
                              formatBRL(item.priceCents)
                            )}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-white/12">
                              <button
                                type="button"
                                onClick={() => updateQuantity(key, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                aria-label="Diminuir quantidade"
                                className="grid size-7 place-items-center rounded-full text-metal transition hover:text-white disabled:opacity-30"
                              >
                                <Minus size={12} aria-hidden />
                              </button>
                              <span className="min-w-6 text-center text-xs tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(key, item.quantity + 1)}
                                disabled={item.quantity >= limit}
                                aria-label="Aumentar quantidade"
                                className="grid size-7 place-items-center rounded-full text-metal transition hover:text-white disabled:opacity-30"
                              >
                                <Plus size={12} aria-hidden />
                              </button>
                            </div>
                            {item.priceCents !== null && (
                              <span className="text-xs text-metal">
                                {formatBRL(item.priceCents * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-metal">Subtotal</span>
                  <span className="font-display text-2xl font-semibold text-white">
                    {formatBRL(subtotal)}
                  </span>
                </div>
                {hasUnpriced && (
                  <p className="mt-2 rounded-lg border border-racing/25 bg-racing/8 px-3 py-2 text-[0.72rem] leading-relaxed text-racing">
                    Há itens com preço sob consulta. Eles não entram no total e impedem a
                    finalização pelo site.{" "}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      Consultar no WhatsApp
                    </a>
                  </p>
                )}
                <p className="mt-2 text-[0.7rem] leading-relaxed text-metal">{shippingNote}</p>
                {hasUnpriced ? (
                  <button
                    type="button"
                    disabled
                    className="mt-3 w-full cursor-not-allowed rounded-full bg-white/8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-metal"
                  >
                    Finalizar pedido
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-racing py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime"
                  >
                    Finalizar pedido <ArrowRight size={14} aria-hidden />
                  </Link>
                )}
                <p className="mt-2 text-center text-[0.65rem] text-metal">
                  Pedido enviado e confirmado pelo WhatsApp oficial.
                </p>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CartToast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full border border-lime/30 bg-carbon/95 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-xl"
        >
          <span className="size-1.5 rounded-full bg-lime" aria-hidden />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function WhatsAppFab({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a Race Day no WhatsApp"
      className="pulse-ring fixed bottom-5 right-5 z-40 grid size-13 place-items-center rounded-full bg-lime text-ink shadow-[0_18px_40px_-12px_rgba(183,240,0,0.6)] transition hover:scale-105 hover:bg-racing"
    >
      <MessageCircle size={22} strokeWidth={2.2} aria-hidden />
    </a>
  );
}
