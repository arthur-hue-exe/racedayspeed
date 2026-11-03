"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem } from "@/lib/cart";
import { cartCount, cartKey, cartSubtotal, hasUnpricedItems } from "@/lib/cart";

const STORAGE_KEY = "raceday.cart.v1";

type StoreContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  hasUnpriced: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toast: string | null;
  showToast: (message: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    (typeof item.priceCents === "number" || item.priceCents === null) &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(isCartItem).map((item) => ({
              ...item,
              quantity: Math.max(1, Math.min(10, Math.round(item.quantity))),
            })),
          );
        }
      }
    } catch {
      // carrinho corrompido é descartado com segurança
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // modo privado pode bloquear o armazenamento
    }
  }, [items, ready]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, searchOpen]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const key = cartKey(item.slug, item.size);
        const existing = current.find(
          (entry) => cartKey(entry.slug, entry.size) === key,
        );
        const limit = item.maxQuantity ?? 10;
        if (existing) {
          return current.map((entry) =>
            cartKey(entry.slug, entry.size) === key
              ? {
                  ...entry,
                  ...item,
                  quantity: Math.min(limit, entry.quantity + quantity),
                }
              : entry,
          );
        }
        return [
          ...current,
          { ...item, quantity: Math.max(1, Math.min(limit, quantity)) },
        ];
      });
      setCartOpen(true);
      showToast(`${item.name} adicionado ao carrinho`);
    },
    [showToast],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => {
        if (cartKey(item.slug, item.size) !== key) return item;
        const limit = item.maxQuantity ?? 10;
        return {
          ...item,
          quantity: Math.max(1, Math.min(limit, Math.round(quantity))),
        };
      }),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) =>
      current.filter((item) => cartKey(item.slug, item.size) !== key),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<StoreContextValue>(
    () => ({
      items,
      ready,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      hasUnpriced: hasUnpricedItems(items),
      cartOpen,
      searchOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      toast,
      showToast,
    }),
    [
      items,
      ready,
      cartOpen,
      searchOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toast,
      showToast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore precisa estar dentro de StoreProvider");
  return context;
}
