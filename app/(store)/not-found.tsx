import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function StoreNotFound() {
  return (
    <div className="container-race flex min-h-[80vh] flex-col items-center justify-center pb-20 pt-32 text-center">
      <p className="font-display text-[clamp(5rem,18vw,12rem)] font-extrabold leading-none text-white/8">
        404
      </p>
      <p className="eyebrow mt-2">Página não encontrada</p>
      <h1 className="mt-3 max-w-xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-bold uppercase leading-[0.94]">
        Essa curva <span className="italic text-racing">não existe</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-metal">
        O endereço pode ter mudado ou o produto saiu do catálogo. Volte à pista e explore a
        coleção oficial Race Day.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime"
        >
          Ver catálogo <ArrowRight size={15} aria-hidden />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white transition hover:border-racing/70 hover:text-racing"
        >
          <Search size={15} aria-hidden /> Página inicial
        </Link>
      </div>
    </div>
  );
}
