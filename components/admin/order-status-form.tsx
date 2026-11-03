"use client";

import { useActionState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { changeOrderStatusAction, type OrderActionState } from "@/app/admin/(panel)/pedidos/actions";
import { orderStatusLabel, type OrderStatus } from "@/lib/types";

const initialState: OrderActionState = {};

export function OrderStatusForm({
  orderId,
  current,
  options,
}: {
  orderId: string;
  current: OrderStatus;
  options: OrderStatus[];
}) {
  const [state, formAction, pending] = useActionState(changeOrderStatusAction, initialState);

  if (options.length === 0) {
    return (
      <p className="text-sm text-metal">
        Este pedido está <strong className="text-chalk">{orderStatusLabel[current].toLowerCase()}</strong> e não
        permite novas alterações de status.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={orderId} />
      <label htmlFor="status" className="block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-metal">
        Novo status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={options[0]}
        className="w-full rounded-xl border border-white/12 bg-black/30 px-3.5 py-2.5 text-sm text-white focus:border-racing/60 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {orderStatusLabel[option]}
          </option>
        ))}
      </select>
      <p className="text-[0.68rem] leading-relaxed text-metal/75">
        Alterar para um status confirmado dá baixa no estoque. Cancelar um pedido já confirmado devolve as
        unidades ao estoque.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-racing px-4 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <RefreshCw size={14} aria-hidden />}
        {pending ? "Atualizando…" : "Atualizar status"}
      </button>
      {state.message && (
        <p
          role="alert"
          className={`rounded-lg border px-3 py-2 text-xs ${
            state.ok
              ? "border-lime/25 bg-lime/8 text-lime"
              : "border-racing/30 bg-racing/8 text-racing"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
