export type Availability = "available" | "sold_out" | "on_request";

export type ProductSize = {
  id: string;
  label: string;
  stock: number | null;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number | null;
  status: "active" | "draft";
  isNew: boolean;
  isFeatured: boolean;
  hasSizes: boolean;
  stock: number | null;
  sku: string | null;
  position: number;
  categorySlug: string | null;
  categoryName: string | null;
  images: ProductImage[];
  sizes: ProductSize[];
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  position: number;
};

export type OrderStatus =
  | "awaiting_whatsapp"
  | "awaiting_confirmation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string;
  sizeLabel: string | null;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  imageUrl: string;
};

export type Order = {
  id: string;
  number: number;
  code: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  addressNumber: string;
  complement: string;
  reference: string;
  subtotalCents: number;
  shippingCents: number | null;
  totalCents: number;
  stockCommitted: boolean;
  whatsappOpenedAt: string | null;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export function getAvailability(product: {
  hasSizes: boolean;
  stock: number | null;
  sizes: { stock: number | null }[];
}): Availability {
  const stocks = product.hasSizes
    ? product.sizes.map((size) => size.stock)
    : [product.stock];

  if (stocks.some((stock) => stock !== null && stock > 0)) return "available";
  if (stocks.length > 0 && stocks.every((stock) => stock === 0)) return "sold_out";
  return "on_request";
}

export const availabilityLabel: Record<Availability, string> = {
  available: "Disponível",
  sold_out: "Esgotado",
  on_request: "Sob consulta",
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  awaiting_whatsapp: "Aguardando envio pelo WhatsApp",
  awaiting_confirmation: "Aguardando confirmação",
  confirmed: "Pedido confirmado",
  preparing: "Em preparação",
  shipped: "Enviado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const orderStatusOrder: OrderStatus[] = [
  "awaiting_whatsapp",
  "awaiting_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
];
