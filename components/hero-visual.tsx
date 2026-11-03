"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/money";

export function HeroVisual({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yMain = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "12%"]);
  const ySmall = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-18%"]);

  const main = products[0];
  const accent = products[1] ?? products[0];

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[34rem]">
      <div
        aria-hidden
        className="absolute -inset-16 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,213,0,0.14),transparent_62%)] blur-2xl"
      />

      <motion.div
        style={{ y: yMain }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative ml-auto w-[86%]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/12 bg-graphite shadow-[0_60px_120px_-50px_rgba(0,0,0,1)]">
          {main?.images[1] || main?.images[0] ? (
            <Image
              src={(main.images[1] ?? main.images[0]).url}
              alt={(main.images[1] ?? main.images[0]).alt || main.name}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 32rem"
              className="object-cover object-top"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.28em] text-chalk/70">
                Destaque da coleção
              </p>
              <p className="mt-1 max-w-[15rem] font-display text-xl font-semibold uppercase leading-tight">
                {main?.name ?? "Race Day"}
              </p>
            </div>
            <span className="glass-panel shrink-0 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold text-white">
              {main ? formatPrice(main.priceCents) : ""}
            </span>
          </div>
        </div>
      </motion.div>

      {accent && (
        <motion.div
          style={{ y: ySmall }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -left-2 bottom-10 w-[43%] sm:-left-6"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/15 bg-graphite shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]">
            {accent.images[0] && (
              <Image
                src={accent.images[0].url}
                alt={accent.images[0].alt || accent.name}
                fill
                sizes="(max-width: 1024px) 40vw, 14rem"
                className="object-cover"
              />
            )}
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/55 px-2.5 py-1.5 backdrop-blur">
              <p className="truncate text-[0.6rem] uppercase tracking-[0.12em] text-chalk/80">
                {accent.name}
              </p>
              <p className="font-display text-sm font-semibold text-racing">
                {formatPrice(accent.priceCents)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div
        aria-hidden
        className="absolute -right-2 -top-4 grid size-20 place-items-center rounded-full border border-white/10 bg-ink/60 backdrop-blur sm:-right-4 sm:size-24"
      >
        <svg viewBox="0 0 100 100" className="size-full animate-[spin_18s_linear_infinite]">
          <defs>
            <path id="hero-circle" d="M50,50 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" />
          </defs>
          <text className="fill-lime/90 text-[8.6px] uppercase tracking-[0.34em]">
            <textPath href="#hero-circle">
              Race Day • Speed &amp; Glory •
            </textPath>
          </text>
        </svg>
        <span className="absolute font-display text-[0.6rem] uppercase tracking-[0.2em] text-metal">
          46
        </span>
      </div>
    </div>
  );
}
