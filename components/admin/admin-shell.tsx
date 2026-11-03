"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shirt,
  Store,
  Tags,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { BrandLogo } from "@/components/brand-logo";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Shirt },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({
  admin,
  pendingOrders,
  children,
}: {
  admin: { name: string; email: string };
  pendingOrders: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const navigation = (
    <nav className="flex flex-col gap-1" aria-label="Navegação do painel">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
              active
                ? "bg-racing text-ink"
                : "text-chalk/75 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={17} aria-hidden className={active ? "text-ink" : "text-metal group-hover:text-racing"} />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/pedidos" && pendingOrders > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                  active ? "bg-ink/15 text-ink" : "bg-racing/15 text-racing"
                }`}
              >
                {pendingOrders}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/8 bg-ink/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <BrandLogo compact />
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="grid size-9 place-items-center rounded-full border border-white/10 text-metal transition hover:text-white"
            aria-label="Abrir loja"
          >
            <Store size={16} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu do painel"
            className="grid size-9 place-items-center rounded-full border border-white/10 text-white"
          >
            <Menu size={18} aria-hidden />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-dvh max-h-dvh w-[min(19rem,88vw)] flex-col border-l border-white/10 bg-carbon p-5">
            <div className="mb-6 flex shrink-0 items-center justify-between">
              <BrandLogo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu do painel"
                className="grid size-9 place-items-center rounded-full border border-white/10 text-white"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{navigation}</div>
            <div className="mt-4 shrink-0 border-t border-white/8 pt-4">
              <p className="truncate text-xs text-metal">{admin.email}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/"
                  className="flex-1 rounded-full border border-white/12 px-3 py-2 text-center text-[0.65rem] uppercase tracking-widest text-metal"
                >
                  Ver loja
                </Link>
                <form action={logoutAction} className="flex-1">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-white/8 px-3 py-2 text-[0.65rem] uppercase tracking-widest text-white"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/8 bg-carbon/70 px-4 py-6 lg:flex">
          <div className="px-2">
            <BrandLogo />
            <p className="mt-2 pl-[2.9rem] text-[0.55rem] uppercase tracking-[0.28em] text-metal">
              Painel administrativo
            </p>
          </div>

          <div className="mt-9">{navigation}</div>

          <div className="mt-auto space-y-4 border-t border-white/8 pt-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm text-chalk/70 transition hover:bg-white/5 hover:text-white"
            >
              <Store size={16} aria-hidden className="text-metal" />
              Ver loja
            </Link>
            <div className="rounded-xl bg-white/4 px-3.5 py-3">
              <p className="truncate text-xs font-medium text-white">{admin.name}</p>
              <p className="mt-0.5 truncate text-[0.68rem] text-metal">{admin.email}</p>
              <form action={logoutAction} className="mt-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-metal transition hover:text-racing"
                >
                  <LogOut size={13} aria-hidden />
                  Sair do painel
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
