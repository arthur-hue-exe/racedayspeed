import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center text-chalk">
      <p className="font-display text-[clamp(5rem,18vw,12rem)] font-extrabold leading-none text-white/8">
        404
      </p>
      <p className="mt-2 text-[0.7rem] uppercase tracking-[0.28em] text-metal">
        Race Day Speed &amp; Glory
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none">
        Página <span className="italic text-racing">não encontrada</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-metal">
        O endereço acessado não existe. Volte para a loja e explore a coleção.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-racing px-6 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime"
      >
        Voltar para a loja
      </Link>
    </div>
  );
}
