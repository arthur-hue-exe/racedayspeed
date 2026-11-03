import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "ghost" | "lime";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-[0.72rem] font-bold uppercase tracking-[0.16em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-racing text-ink hover:bg-lime hover:shadow-[0_18px_40px_-18px_rgba(255,213,0,0.65)]",
  lime: "bg-lime text-ink hover:bg-racing",
  outline:
    "border border-white/20 text-white hover:border-racing/70 hover:bg-racing/8 hover:text-racing",
  ghost: "text-chalk/80 hover:text-white",
};

const sizes = {
  md: "px-5 py-3",
  lg: "px-7 py-4",
  sm: "px-4 py-2 text-[0.65rem]",
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  external,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: keyof typeof sizes;
}) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
