import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Entrar" };

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute inset-0 speed-lines opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-10 size-[28rem] rounded-full bg-lime/8 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[24rem] rounded-full bg-racing/8 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo />
          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-metal">
            Área restrita
          </span>
        </div>

        <div className="glass-panel rounded-3xl p-7 md:p-9">
          <span className="grid size-11 place-items-center rounded-full bg-racing/12 text-racing">
            <LockKeyhole size={20} aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-wide text-white">
            Painel Race Day
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-metal">
            Acesso exclusivo da equipe. Gerencie catálogo, pedidos e configurações da loja.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[0.68rem] uppercase tracking-[0.18em] text-metal/70">
          Race Day Speed &amp; Glory · Speed &amp; Glory
        </p>
      </div>
    </div>
  );
}
