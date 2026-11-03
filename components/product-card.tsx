"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpRight } from "lucide-react";
import { getAvailability, availabilityLabel, type Product } from "@/lib/types";
import { formatPrice } from "@/lib/money";
import { useStore } from "./providers";
import { Tilt } from "./tilt";

export function ProductCard({
  product,
  priority = false,
  sizesHint = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  product: Product;
  priority?: boolean;
  sizesHint?: string;
}) {
  const { addItem } = useStore();
  const router = useRouter();
  const availability = getAvailability(product);
  const image = product.images[0];

  function handleQuickAdd() {
    if (availability === "sold_out") return;
    if (product.hasSizes || product.priceCents === null) {
      router.push(`/produto/${product.slug}`);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: image?.url ?? "",
      size: null,
      maxQuantity: product.stock,
    });
  }

  return (
    <article className="group relative flex flex-col">
      <Tilt intensity={5}>
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-graphite shadow-[0_30px_60px_-45px_rgba(0,0,0,1)]">
          <Link
            href={`/produto/${product.slug}`}
            className="relative block aspect-[5/4] overflow-hidden"
            aria-label={`Ver detalhes de ${product.name}`}
          >
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || product.name}
                fill
                priority={priority}
                sizes={sizesHint}
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.2em] text-metal">
                Sem imagem
              </span>
            )}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent opacity-80" />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_32%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.isNew && (
              <span className="rounded-full bg-lime px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-ink">
                Novo
              </span>
            )}
            {(product.priceCents !== null || availability === "sold_out") && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-chalk/85 backdrop-blur">
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${
                    availability === "available"
                      ? "bg-lime"
                      : availability === "sold_out"
                        ? "bg-white/35"
                        : "bg-racing"
                  }`}
                />
                {availabilityLabel[availability]}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-14">
            <span className="glass-panel inline-flex items-baseline gap-1 rounded-xl px-3 py-2">
              <span
                className={`font-display text-lg font-semibold leading-none ${
                  product.priceCents === null ? "text-metal uppercase tracking-wide text-[0.68rem]" : "text-white"
                }`}
              >
                {formatPrice(product.priceCents)}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={availability === "sold_out"}
            aria-label={
              product.hasSizes
                ? `Escolher tamanho de ${product.name}`
                : `Adicionar ${product.name} ao carrinho`
            }
            className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-racing text-ink transition duration-300 hover:bg-lime disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-metal"
          >
            <Plus size={18} aria-hidden />
          </button>
        </div>
      </Tilt>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/produto/${product.slug}`}
            className="line-clamp-2 font-display text-[1.05rem] font-semibold uppercase leading-tight tracking-wide text-white transition group-hover:text-racing"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-metal">
            {product.categoryName ?? "Race Day"}
          </p>
        </div>
        <Link
          href={`/produto/${product.slug}`}
          aria-label={`Abrir ${product.name}`}
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-white/10 text-metal transition hover:border-racing/60 hover:text-white"
        >
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
