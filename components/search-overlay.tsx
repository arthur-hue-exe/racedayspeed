"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatPrice } from "@/lib/money";
import { useStore } from "./providers";

type SearchResult = {
  slug: string;
  name: string;
  priceCents: number | null;
  image: string;
  categoryName: string | null;
};

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      setResults([]);
      return;
    }
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = (await response.json()) as { results: SearchResult[] };
          setResults(data.results);
        }
      } catch {
        // busca cancelada ou indisponível
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchOpen]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/80 px-4 pt-24 backdrop-blur-md sm:pt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Pesquisar no catálogo"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="glass-panel w-full max-w-2xl overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search size={20} className="text-racing" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busque por time, piloto ou peça"
                aria-label="Buscar produtos"
                className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-metal/70"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Fechar busca"
                className="grid size-8 place-items-center rounded-full border border-white/10 text-metal transition hover:text-white"
              >
                <X size={15} aria-hidden />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {query.trim().length < 2 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-metal">
                    Digite ao menos 2 letras. Ex.: Gulf, Rossi, Alpinestars, Kawasaki.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["Gulf", "VR46", "Ducati", "Alpinestars"].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-chalk/80 transition hover:border-racing/50 hover:text-white"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : loading ? (
                <div className="space-y-2 px-2 py-3" aria-hidden>
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-16 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-metal">
                  Nenhum produto encontrado para “{query}”.
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map((result) => (
                    <li key={result.slug}>
                      <Link
                        href={`/produto/${result.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/6"
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-graphite">
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-white">
                            {result.name}
                          </span>
                          <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-metal">
                            {result.categoryName ?? "Race Day"}
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-racing">
                          {formatPrice(result.priceCents)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {query.trim().length >= 2 && (
              <Link
                href={`/catalogo?q=${encodeURIComponent(query.trim())}`}
                onClick={closeSearch}
                className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 text-xs uppercase tracking-[0.16em] text-chalk/80 transition hover:text-white"
              >
                Ver todos os resultados no catálogo
                <ArrowRight size={14} aria-hidden />
              </Link>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
