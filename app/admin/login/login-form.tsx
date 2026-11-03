"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-metal">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-metal/60 focus:border-racing/60 focus:outline-none"
          placeholder="admin@racedayspeed.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-metal">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-metal/60 focus:border-racing/60 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-racing/40 bg-racing/10 px-4 py-3 text-sm text-racing">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-racing px-6 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-lime disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <LogIn size={16} aria-hidden />}
        {pending ? "Entrando…" : "Entrar no painel"}
      </button>
    </form>
  );
}
