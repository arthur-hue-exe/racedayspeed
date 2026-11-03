"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export function CatalogControls({
  initialQuery,
  initialSort,
  category,
  novidades,
}: {
  initialQuery: string;
  initialSort: string;
  category?: string;
  novidades?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    setQuery(initialQuery);
    setSort(initialSort);
  }, [initialQuery, initialSort]);

  function navigate(nextQuery: string, nextSort: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (category) params.set("categoria", category);
    if (novidades) params.set("novidades", "1");
    if (nextSort && nextSort !== "catalog") params.set("ordenar", nextSort);
    router.push(`/catalogo${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          navigate(query, sort);
        }}
        className="relative flex-1"
        role="search"
      >
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-metal"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar no catálogo"
          aria-label="Buscar no catálogo"
          className="h-11 w-full rounded-full border border-white/12 bg-white/4 pl-11 pr-4 text-sm text-white placeholder:text-metal/70 focus:border-racing/60 focus:outline-none"
        />
      </form>

      <label className="relative flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-metal" aria-hidden />
        <span className="sr-only">Ordenar produtos</span>
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            navigate(query, event.target.value);
          }}
          className="h-11 rounded-full border border-white/12 bg-white/4 px-4 pr-9 text-xs uppercase tracking-[0.1em] text-chalk/85 focus:border-racing/60 focus:outline-none"
        >
          <option value="catalog">Ordem do catálogo</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="newest">Mais recentes</option>
        </select>
      </label>
    </div>
  );
}
