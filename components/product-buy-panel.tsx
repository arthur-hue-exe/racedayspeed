"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, MessageCircle, Info } from "lucide-react";
import { getAvailability, type Product } from "@/lib/types";
import { formatBRL } from "@/lib/money";
import { useStore } from "./providers";

export function ProductBuyPanel({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const { addItem } = useStore();
  const availability = getAvailability(product);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedSize = product.sizes.find((entry) => entry.label === size) ?? null;
  const limit = product.hasSizes
    ? (selectedSize?.stock ?? 10)
    : (product.stock ?? 10);
  const soldOut = availability === "sold_out";
  const unpriced = product.priceCents === null;
  const needsSize = product.hasSizes && !selectedSize;
  const sizeSoldOut = selectedSize?.stock === 0;
  const canAdd = !soldOut && !unpriced && !needsSize && !sizeSoldOut;

  function handleAdd() {
    if (!canAdd) return;
    addItem(
      {
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        image: product.images[0]?.url ?? "",
        size: size,
        maxQuantity: product.hasSizes ? selectedSize?.stock ?? null : product.stock,
      },
      quantity,
    );
  }

  const consultMessage = encodeURIComponent(
    `Olá! Tenho interesse em "${product.name}"${
      size ? ` (tamanho ${size})` : ""
    }. Poderia confirmar disponibilidade, valor e prazo de entrega?`,
  );
  const consultUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${consultMessage}`;

  return (
    <div id="comprar" className="mt-7 scroll-mt-28">
      {product.hasSizes && (
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-chalk/80">
              Tamanho
            </p>
            <span className="text-[0.65rem] text-metal">
              {needsSize ? "Selecione para continuar" : size ? `Selecionado: ${size}` : ""}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((entry) => {
              const out = entry.stock === 0;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setSize(entry.label);
                    setQuantity(1);
                  }}
                  disabled={out}
                  aria-pressed={size === entry.label}
                  aria-label={`Tamanho ${entry.label}${out ? " — esgotado" : ""}`}
                  className={`min-w-12 rounded-lg border px-3 py-2.5 text-sm transition ${
                    size === entry.label
                      ? "border-racing bg-racing text-ink"
                      : out
                        ? "cursor-not-allowed border-white/8 text-metal/40 line-through"
                        : "border-white/15 text-white hover:border-racing/60"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
          {selectedSize?.stock !== null && selectedSize?.stock !== undefined && (
            <p className="mt-2 text-[0.7rem] text-lime">
              {selectedSize.stock === 0
                ? "Tamanho esgotado."
                : `${selectedSize.stock} unidade(s) em estoque.`}
            </p>
          )}
          {selectedSize?.stock === null && (
            <p className="mt-2 text-[0.7rem] text-racing">
              Disponibilidade deste tamanho confirmada no atendimento.
            </p>
          )}
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-3 ${product.hasSizes ? "mt-6" : ""}`}>
        <div className="flex items-center rounded-full border border-white/15">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
            className="grid size-11 place-items-center rounded-full text-metal transition hover:text-white disabled:opacity-30"
          >
            <Minus size={15} aria-hidden />
          </button>
          <span className="min-w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(limit, value + 1))}
            disabled={quantity >= limit}
            aria-label="Aumentar quantidade"
            className="grid size-11 place-items-center rounded-full text-metal transition hover:text-white disabled:opacity-30"
          >
            <Plus size={15} aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-racing px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-metal"
        >
          <ShoppingBag size={15} aria-hidden />
          {soldOut
            ? "Produto esgotado"
            : needsSize
              ? "Selecione um tamanho"
              : unpriced
                ? "Preço sob consulta"
                : "Adicionar ao carrinho"}
        </button>
      </div>

      {unpriced && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-racing/25 bg-racing/8 px-4 py-3 text-[0.72rem] leading-relaxed text-racing">
          <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            Este item está no catálogo com preço e disponibilidade sob consulta. Não é possível
            finalizar a compra pelo site até que valor e estoque sejam definidos.
          </p>
        </div>
      )}

      <a
        href={consultUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-lime/35 bg-lime/8 px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-lime transition hover:bg-lime/15"
      >
        <MessageCircle size={15} aria-hidden />
        {unpriced ? "Consultar valor no WhatsApp" : "Tirar dúvidas no WhatsApp"}
      </a>

      <p className="mt-4 text-center text-[0.68rem] text-metal">
        {product.priceCents !== null
          ? `Valor unitário: ${formatBRL(product.priceCents)}`
          : "Valor e disponibilidade serão informados no atendimento."}
      </p>
    </div>
  );
}
