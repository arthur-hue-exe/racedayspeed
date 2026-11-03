import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  index?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={`flex flex-col gap-5 ${
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {(index || eyebrow) && (
          <p className="eyebrow flex items-center gap-3">
            {index && <span className="text-racing">{index}</span>}
            <span aria-hidden className="h-px w-8 bg-racing/50" />
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-bold uppercase leading-[0.92] tracking-tight text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-metal">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-chalk/80 transition hover:text-racing"
        >
          {action.label}
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </Reveal>
  );
}
