import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  MessageCircle,
  Package,
  PackageCheck,
} from "lucide-react";
import { getAdminOrderWithToken } from "@/lib/admin-orders";
import { getSettings } from "@/lib/settings";
import { nextOrderStatuses } from "@/lib/orders";
import { formatBRL, formatDate } from "@/lib/money";
import { orderStatusLabel, orderStatusOrder, type OrderStatus } from "@/lib/types";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderNotesForm } from "@/components/admin/order-notes-form";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getAdminOrderWithToken(id);
  return { title: result ? `Pedido ${result.order.code}` : "Pedido" };
}

const statusTone: Record<string, string> = {
  awaiting_whatsapp: "border-racing/25 bg-racing/10 text-racing",
  awaiting_confirmation: "border-racing/25 bg-racing/10 text-racing",
  confirmed: "border-lime/25 bg-lime/10 text-lime",
  preparing: "border-lime/25 bg-lime/10 text-lime",
  shipped: "border-lime/20 bg-lime/8 text-lime",
  completed: "border-white/15 bg-white/5 text-chalk",
  cancelled: "border-white/10 bg-white/4 text-metal",
};

const timeline: OrderStatus[] = orderStatusOrder.filter((status) => status !== "cancelled");

export default async function AdminOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const [result, settings] = await Promise.all([
    getAdminOrderWithToken(id),
    getSettings(),
  ]);
  if (!result) notFound();
  const { order, accessToken } = result;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/pedido/${order.code}?token=${accessToken}`;
  const digits = order.customerPhone.replace(/\D/g, "");
  const waNumber = digits.length <= 11 ? `55${digits}` : digits;
  const firstName = order.customerName.split(" ")[0];
  const customerMessage = `Olá, ${firstName}! Aqui é a ${settings.company.legalName || "Race Day Speed & Glory"}, sobre o pedido #${order.code}.`;
  const customerWhatsApp = `https://wa.me/${waNumber}?text=${encodeURIComponent(customerMessage)}`;

  const currentIndex = timeline.indexOf(order.status);
  const options = nextOrderStatuses(order.status);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-metal transition hover:text-white"
        >
          <ArrowLeft size={13} aria-hidden />
          Voltar para pedidos
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
            Pedido #{order.code}
          </h1>
          <span className={`rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.1em] ${statusTone[order.status] ?? ""}`}>
            {orderStatusLabel[order.status]}
          </span>
        </div>
        <p className="mt-1 text-sm text-metal">
          Registrado em {formatDate(order.createdAt)} · Atualizado em {formatDate(order.updatedAt)}
          {order.whatsappOpenedAt ? ` · WhatsApp aberto em ${formatDate(order.whatsappOpenedAt)}` : ""}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <a
          href={customerWhatsApp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-ink transition hover:bg-racing"
        >
          <MessageCircle size={14} aria-hidden />
          Falar com o cliente no WhatsApp
        </a>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-chalk transition hover:border-racing/40 hover:text-racing"
        >
          <ExternalLink size={14} aria-hidden />
          Página do cliente
        </a>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-metal">
          <PackageCheck size={14} aria-hidden />
          {order.stockCommitted ? "Estoque já baixado" : "Estoque ainda não baixado"}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
        <div className="min-w-0 space-y-6">
          <section className="glass-panel rounded-2xl">
            <div className="border-b border-white/8 px-5 py-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Itens do pedido</h2>
              <p className="text-xs text-metal">{order.items.length} linha(s) de produto</p>
            </div>
            <ul className="divide-y divide-white/6">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Package size={18} className="text-metal/50" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-metal">
                      {item.sizeLabel ? `Tamanho ${item.sizeLabel}` : "Tamanho único"} · {item.quantity} un. ·{" "}
                      {formatBRL(item.unitPriceCents)} cada
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-white">{formatBRL(item.subtotalCents)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-white/8 px-5 py-4 text-sm">
              <div className="flex justify-between text-metal">
                <dt>Subtotal</dt>
                <dd>{formatBRL(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-metal">
                <dt>Frete</dt>
                <dd>{order.shippingCents === null ? "A confirmar no atendimento" : formatBRL(order.shippingCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-2 font-display text-lg font-bold text-white">
                <dt>Total</dt>
                <dd>{formatBRL(order.totalCents)}</dd>
              </div>
              {order.shippingCents === null && (
                <p className="text-[0.68rem] text-metal/75">O total acima não inclui o frete, que será combinado no atendimento.</p>
              )}
            </dl>
          </section>

          <section className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Linha do tempo</h2>
            <ol className="mt-4 space-y-0">
              {timeline.map((status, index) => {
                const done = currentIndex >= index;
                const current = order.status === status;
                return (
                  <li key={status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border text-[0.6rem] ${
                          done
                            ? "border-lime bg-lime text-ink"
                            : "border-white/15 bg-white/5 text-metal"
                        }`}
                      >
                        {done ? <Check size={12} aria-hidden /> : index + 1}
                      </span>
                      {index < timeline.length - 1 && (
                        <span className={`h-7 w-px ${currentIndex > index ? "bg-lime/50" : "bg-white/10"}`} />
                      )}
                    </div>
                    <p className={`pb-4 pt-0.5 text-sm ${current ? "font-semibold text-white" : done ? "text-chalk/80" : "text-metal"}`}>
                      {orderStatusLabel[status]}
                    </p>
                  </li>
                );
              })}
            </ol>
            {order.status === "cancelled" && (
              <p className="rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-xs text-metal">
                Este pedido foi cancelado.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Cliente</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-metal">Nome</dt>
                <dd className="mt-0.5 text-chalk">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-metal">Telefone</dt>
                <dd className="mt-0.5 text-chalk">{order.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-metal">E-mail</dt>
                <dd className="mt-0.5 break-all text-chalk">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-metal">Entrega</dt>
                <dd className="mt-0.5 leading-relaxed text-chalk/85">
                  {order.street}, {order.addressNumber}
                  {order.complement ? ` — ${order.complement}` : ""}
                  <br />
                  {order.neighborhood} · {order.city}/{order.state}
                  <br />
                  CEP {order.cep}
                  {order.reference ? (
                    <>
                      <br />
                      Referência: {order.reference}
                    </>
                  ) : null}
                </dd>
              </div>
            </dl>
          </section>

          <section className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Atualizar status</h2>
            <p className="mb-4 mt-0.5 text-xs text-metal">
              Status atual: {orderStatusLabel[order.status]}
            </p>
            <OrderStatusForm orderId={order.id} current={order.status} options={options} />
          </section>

          <section className="glass-panel rounded-2xl p-5">
            <OrderNotesForm orderId={order.id} notes={order.adminNotes} />
          </section>
        </aside>
      </div>
    </div>
  );
}
