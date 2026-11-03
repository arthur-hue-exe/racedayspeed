"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import {
  saveCategoryAction,
  type CategoryFormState,
} from "@/app/admin/(panel)/categorias/actions";
import type { AdminCategory } from "@/lib/admin-data";

const initialState: CategoryFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-metal/50 focus:border-racing/60 focus:outline-none";
const labelClass =
  "mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-metal";

export function CategoryForm({
  category,
  nextPosition = 1,
}: {
  category?: AdminCategory;
  nextPosition?: number;
}) {
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_5rem]">
        <div>
          <label htmlFor={`name-${category?.id ?? "new"}`} className={labelClass}>
            Nome *
          </label>
          <input
            id={`name-${category?.id ?? "new"}`}
            name="name"
            defaultValue={category?.name ?? ""}
            required
            className={inputClass}
            placeholder="Camisetas"
          />
          {state.errors?.name && <p className="mt-1 text-xs text-racing">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor={`slug-${category?.id ?? "new"}`} className={labelClass}>
            Slug *
          </label>
          <input
            id={`slug-${category?.id ?? "new"}`}
            name="slug"
            defaultValue={category?.slug ?? ""}
            required
            className={inputClass}
            placeholder="camisetas"
          />
          {state.errors?.slug && <p className="mt-1 text-xs text-racing">{state.errors.slug}</p>}
        </div>
        <div>
          <label htmlFor={`position-${category?.id ?? "new"}`} className={labelClass}>
            Ordem
          </label>
          <input
            id={`position-${category?.id ?? "new"}`}
            name="position"
            type="number"
            min={0}
            defaultValue={category?.position ?? nextPosition}
            className={inputClass}
          />
          {state.errors?.position && <p className="mt-1 text-xs text-racing">{state.errors.position}</p>}
        </div>
      </div>
      <div>
        <label htmlFor={`description-${category?.id ?? "new"}`} className={labelClass}>
          Descrição
        </label>
        <input
          id={`description-${category?.id ?? "new"}`}
          name="description"
          defaultValue={category?.description ?? ""}
          maxLength={240}
          className={inputClass}
          placeholder="Resumo usado na página de catálogo."
        />
        {state.errors?.description && <p className="mt-1 text-xs text-racing">{state.errors.description}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-racing hover:text-ink disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : category ? (
            <Save size={14} aria-hidden />
          ) : (
            <Plus size={14} aria-hidden />
          )}
          {pending ? "Salvando…" : category ? "Salvar categoria" : "Criar categoria"}
        </button>
        {state.message && (
          <p role="status" className={`text-xs ${state.ok ? "text-lime" : "text-racing"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
