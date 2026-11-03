"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { saveOrderNotesAction, type OrderActionState } from "@/app/admin/(panel)/pedidos/actions";

const initialState: OrderActionState = {};

export function OrderNotesForm({
  orderId,
  notes,
}: {
  orderId: string;
  notes: string;
}) {
  const [state, formAction, pending] = useActionState(saveOrderNotesAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={orderId} />
      <label htmlFor="notes" className="block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-metal">
        Observações internas
      </label>
      <textarea
        id="notes"
        name="notes"
        defaultValue={notes}
        rows={4}
        maxLength={2000}
        placeholder="Ex.: cliente confirmou Pix, combinado envio pelos Correios."
        className="w-full rounded-xl border border-white/12 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-metal/50 focus:border-racing/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-chalk transition hover:border-racing/40 hover:text-racing disabled:opacity-60"
      >
        {pending ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Save size={13} aria-hidden />}
        {pending ? "Salvando…" : "Salvar observações"}
      </button>
      {state.message && (
        <p
          role="status"
          className={`text-xs ${state.ok ? "text-lime" : "text-racing"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
