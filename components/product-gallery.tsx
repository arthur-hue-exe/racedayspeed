"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-graphite">
        {current ? (
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt || name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs uppercase tracking-[0.2em] text-metal">
            Imagem em breve
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-chalk/80 backdrop-blur">
          Catálogo oficial
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5" role="tablist" aria-label="Imagens do produto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Ver imagem ${index + 1} de ${name}`}
              onClick={() => setActive(index)}
              className={`relative size-20 overflow-hidden rounded-xl border transition ${
                index === active
                  ? "border-racing"
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
