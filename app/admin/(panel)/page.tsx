import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  ClipboardList,
  Plus,
  Shirt,
  Tags,
} from "lucide-react";
import { getDashboard } from "@/lib/admin-data";
import { formatBRL, formatDate } from "@/lib/money";
import { orderStatusLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Visão geral" };

function statusTone(status: string): string {
  switch (status) {
    case "awaiting_whatsapp":
    case "awaiting_confirmation":
      return "bg-racing/12 text-racing border-racing/25";
    case "confirmed":
    case "preparing":
    case "shipped":
      return "bg-lime/10 text-lime border-lime/25";
    case "completed":
      return "bg-white/6 text-chalk border-white/15";
    case "cancelled":
      return "bg-white/4 text-metal border-white/10";
    default:
      return "bg-white/4 text-metal border-white/10";
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboard();
  const pending = data.orders.awaitingWhatsapp + data.orders.awaitingConfirmation;

  const metrics = [
    {
      label: "Produtos ativos",
      value: String(data.products.active),
      hint: `${data.products.total} cadastrados · ${data.products.draft} em rascunho`,
      icon: Shirt,
      href: "/admin/produtos",
    },
    {
      label: "Sob consulta",
      value: String(data.products.onRequest),
      hint: "Aguardando cadastro de preço",
      icon: Tags,
      href: "/admin/produtos?preco=consulta",
    },
    {
      label: "Pedidos abertos",
      value: String(pending),
      hint: `${data.orders.inProgress} em andamento · ${data.orders.completed} concluídos`,
      icon: ClipboardList,
      href: "/admin/pedidos",
    },
    {
      label: "Valor em pedidos confirmados",
      value: formatBRL(data.orders.confirmedValueCents),
      hint: "Confirmados, em preparação, enviados e concluídos",
      icon: Banknote,
      href: "/admin/pedidos",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-metal">
            Acompanhe a operação da loja e o que precisa de atenção agora.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-racing px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime"
          >
            <Plus size={15} aria-hidden />
            Novo produto
          </Link>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-chalk transition hover:border-racing/50 hover:text-racing"
          >
            Ver pedidos
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="glass-panel group rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5 hover:border-racing/30"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-xl bg-white/5 text-metal transition group-hover:text-racing">
                  <Icon size={17} aria-hidden />
                </span>
                <ArrowUpRight size={14} className="text-metal/50 transition group-hover:text-racing" aria-hidden />
              </div>
              <p className="mt-5 font-display text-3xl font-bold leading-none text-white">
                {metric.value}
              </p>
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-metal">
                {metric.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-metal/70">{metric.hint}</p>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="glass-panel min-w-0 rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                Pedidos recentes
              </h2>
              <p className="text-xs text-metal">Registrados pelo site e enviados ao WhatsApp.</p>
            </div>
            <Link href="/admin/pedidos" className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-racing hover:text-lime">
              Ver todos
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-sm text-metal">Nenhum pedido registrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="text-[0.6rem] uppercase tracking-[0.16em] text-metal">
                  <tr className="border-b border-white/6">
                    <th className="px-5 py-3 font-semibold">Pedido</th>
                    <th className="px-3 py-3 font-semibold">Cliente</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3">
                        <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-white hover:text-racing">
                          #{order.code}
                        </Link>
                        <p className="text-[0.65rem] text-metal">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3 text-chalk/85">{order.customerName}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.1em] ${statusTone(order.status)}`}>
                          {orderStatusLabel[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-white">
                        {formatBRL(order.totalCents)}
                        {order.shippingCents === null && (
                          <span className="block text-[0.58rem] uppercase tracking-wide text-metal">+ frete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="glass-panel min-w-0 rounded-2xl">
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-white">
              <AlertTriangle size={16} className="text-racing" aria-hidden />
              Estoque baixo
            </h2>
            <p className="text-xs text-metal">Itens com 2 unidades ou menos.</p>
          </div>

          {data.lowStock.length === 0 ? (
            <p className="px-5 py-10 text-sm text-metal">
              Nenhum item com estoque baixo cadastrado. Itens sem controle de estoque aparecem como disponíveis sob consulta.
            </p>
          ) : (
            <ul className="divide-y divide-white/6">
              {data.lowStock.map((item) => (
                <li key={`${item.productId}-${item.sizeLabel ?? "unico"}`} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/produtos/${item.productId}`} className="block truncate text-sm font-medium text-white hover:text-racing">
                      {item.productName}
                    </Link>
                    <p className="text-[0.65rem] uppercase tracking-[0.12em] text-metal">
                      {item.sizeLabel ? `Tamanho ${item.sizeLabel}` : "Estoque único"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.stock === 0 ? "bg-white/8 text-metal" : "bg-racing/15 text-racing"
                    }`}
                  >
                    {item.stock === 0 ? "Esgotado" : `${item.stock} un.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
