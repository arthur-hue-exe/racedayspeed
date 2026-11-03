import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { listAdminOrders, countOrdersByStatus } from "@/lib/admin-orders";
import { isOrderStatus } from "@/lib/admin-data";
import { formatBRL, formatDate } from "@/lib/money";
import { orderStatusLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pedidos" };

type SearchParams = Promise<{ status?: string; q?: string }>;

const statusTone: Record<string, string> = {
  awaiting_whatsapp: "border-racing/25 bg-racing/10 text-racing",
  awaiting_confirmation: "border-racing/25 bg-racing/10 text-racing",
  confirmed: "border-lime/25 bg-lime/10 text-lime",
  preparing: "border-lime/25 bg-lime/10 text-lime",
  shipped: "border-lime/20 bg-lime/8 text-lime",
  completed: "border-white/15 bg-white/5 text-chalk",
  cancelled: "border-white/10 bg-white/4 text-metal",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = isOrderStatus(params.status) ? params.status : undefined;
  const [orders, counts] = await Promise.all([
    listAdminOrders(status, params.q),
    countOrdersByStatus(),
  ]);

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const filters = [
    { key: "", label: "Todos", count: total },
    { key: "awaiting_whatsapp", label: "Aguardando WhatsApp", count: counts.awaiting_whatsapp ?? 0 },
    { key: "awaiting_confirmation", label: "Aguardando confirmação", count: counts.awaiting_confirmation ?? 0 },
    { key: "confirmed", label: "Confirmados", count: counts.confirmed ?? 0 },
    { key: "preparing", label: "Em preparação", count: counts.preparing ?? 0 },
    { key: "shipped", label: "Enviados", count: counts.shipped ?? 0 },
    { key: "completed", label: "Concluídos", count: counts.completed ?? 0 },
    { key: "cancelled", label: "Cancelados", count: counts.cancelled ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Atendimento</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-metal">
            Pedidos registrados pelo site. A confirmação acontece no atendimento pelo WhatsApp.
          </p>
        </div>
        <form className="relative">
          <span className="sr-only">Buscar pedido</span>
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-metal" aria-hidden />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Código, nome ou telefone"
            className="w-64 rounded-full border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-metal/60 focus:border-racing/60 focus:outline-none"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </header>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const href = filter.key
            ? `/admin/pedidos?status=${filter.key}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`
            : `/admin/pedidos${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`;
          const active = (status ?? "") === filter.key;
          return (
            <Link
              key={filter.key || "all"}
              href={href}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] transition ${
                active
                  ? "border-racing bg-racing text-ink"
                  : "border-white/10 text-metal hover:border-white/25 hover:text-white"
              }`}
            >
              {filter.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[0.58rem] ${active ? "bg-ink/15" : "bg-white/8"}`}>
                {filter.count}
              </span>
            </Link>
          );
        })}
      </div>

      <section className="glass-panel overflow-hidden rounded-2xl">
        {orders.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-xl uppercase text-white">Nenhum pedido encontrado</p>
            <p className="mt-1 text-sm text-metal">
              {params.q || status ? "Ajuste a busca ou o filtro de status." : "Os pedidos enviados pelo site aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[50rem] text-left text-sm">
              <thead className="text-[0.6rem] uppercase tracking-[0.16em] text-metal">
                <tr className="border-b border-white/8">
                  <th className="px-5 py-3.5 font-semibold">Pedido</th>
                  <th className="px-3 py-3.5 font-semibold">Cliente</th>
                  <th className="px-3 py-3.5 font-semibold">Itens</th>
                  <th className="px-3 py-3.5 font-semibold">Total</th>
                  <th className="px-3 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-white hover:text-racing">
                        #{order.code}
                      </Link>
                      <p className="text-[0.65rem] text-metal">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="text-chalk/90">{order.customerName}</p>
                      <p className="text-[0.65rem] text-metal">{order.customerPhone}</p>
                    </td>
                    <td className="px-3 py-3.5 text-metal">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} un.
                    </td>
                    <td className="px-3 py-3.5 font-medium text-white">
                      {formatBRL(order.totalCents)}
                      {order.shippingCents === null && (
                        <span className="block text-[0.58rem] uppercase tracking-wide text-metal">+ frete a confirmar</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.56rem] uppercase tracking-[0.08em] ${statusTone[order.status] ?? ""}`}>
                        {orderStatusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-metal transition hover:border-racing/50 hover:text-racing"
                      >
                        Detalhes
                        <ArrowUpRight size={12} aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
