export type CartItem = {
  slug: string;
  name: string;
  priceCents: number | null;
  image: string;
  size: string | null;
  quantity: number;
  maxQuantity: number | null;
};

export function cartKey(slug: string, size: string | null): string {
  return `${slug}::${size ?? ""}`;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + (item.priceCents ?? 0) * item.quantity,
    0,
  );
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function hasUnpricedItems(items: CartItem[]): boolean {
  return items.some((item) => item.priceCents === null);
}
