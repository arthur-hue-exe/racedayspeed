"use client";

import Link from "next/link";
import { RotateCcw, MessageCircle } from "lucide-react";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-race flex min-h-[80vh] flex-col items-center justify-center pb-20 pt-32 text-center">
      <span className="grid size-16 place-items-center rounded-full border border-racing/30 bg-racing/8 text-racing">
        <RotateCcw size={24} aria-hidden />
      </span>
      <p className="eyebrow mt-5">Falha temporária</p>
      <h1 className="mt-3 max-w-xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-bold uppercase leading-[0.94]">
        Algo saiu da <span className="italic text-racing">trajetória</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-metal">
        Não foi possível carregar esta página agora. Tente novamente. Se o problema
        continuar, fale com a equipe Race Day pelo WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime"
        >
          <RotateCcw size={15} aria-hidden /> Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white transition hover:border-racing/70 hover:text-racing"
        >
          <MessageCircle size={15} aria-hidden /> Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
