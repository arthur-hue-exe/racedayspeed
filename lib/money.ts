const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return formatter.format(cents / 100).replace(/\u00a0/g, " ");
}

export function formatPrice(cents: number | null): string {
  return cents === null ? "Sob consulta" : formatBRL(cents);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function centsFromReais(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const normalized = String(input).trim().replace(/[^\d,.-]/g, "");
  if (!normalized) return null;
  const value = Number(normalized.replace(",", "."));
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
