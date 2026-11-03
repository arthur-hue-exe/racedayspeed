import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Race Day Speed & Glory — página inicial"
      className="group inline-flex items-center gap-2.5"
    >
      <span
        aria-hidden
        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[10px] border border-white/10 bg-carbon"
      >
        <span className="absolute -left-1 top-2 h-[3px] w-12 -rotate-[32deg] bg-racing" />
        <span className="absolute -left-1 top-4 h-[3px] w-12 -rotate-[32deg] bg-lime" />
        <span className="absolute -left-1 top-6 h-[3px] w-12 -rotate-[32deg] bg-white/80" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.35rem] font-extrabold uppercase italic tracking-[-0.02em] text-white">
          Race Day
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[0.5rem] font-medium uppercase tracking-[0.38em] text-metal">
            Speed &amp; Glory
          </span>
        )}
      </span>
    </Link>
  );
}
