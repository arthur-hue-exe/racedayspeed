import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getPublicOrder } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";
import { formatBRL, formatDate } from "@/lib/money";
import { orderStatusLabel, type OrderStatus } from "@/lib/types";
import { OrderWhatsAppAction } from "@/components/order-whatsapp-action";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acompanhe seu pedido",
  description: "Detalhes e status do pedido registrado na Race Day Speed & Glory.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ code: string }>;
type SearchParams = Promise<{ token?: string | string[] }>;

const FLOW: OrderStatus[] = [
  "awaiting_whatsapp",
  "awaiting_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
];

const statusDescription: Record<OrderStatus, string> = {
  awaiting_whatsapp:
    "O pedido foi registrado no site. Falta enviar a mensagem no WhatsApp para a equipe receber os detalhes.",
  awaiting_confirmation:
    "A mensagem do pedido foi preparada. Aguarde a confirmação de disponibilidade, frete e pagamento pela equipe.",
  confirmed:
    "Pedido confirmado pela equipe Race Day. O pagamento e o prazo de envio são combinados no atendimento.",
  preparing: "Estamos separando e preparando as peças do seu pedido.",
  shipped: "Pedido enviado. A equipe acompanha a entrega com você pelo WhatsApp.",
  completed: "Pedido concluído. Obrigado por vestir a Race Day.",
  cancelled:
    "Este pedido foi cancelado. Fale com a equipe pelo WhatsApp para entender o motivo ou refazer o pedido.",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { code } = await params;
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;

  if (!token) notFound();
  const [order, settings] = await Promise.all([
    getPublicOrder(code, token),
    getSettings(),
  ]);
  if (!order) notFound();

  const whatsappUrl = whatsappLink(
    settings.store.whatsappNumber,
    buildWhatsAppMessage(order),
  );
  const currentIndex = FLOW.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  return (
    <div className="pb-24 pt-[104px] md:pt-[124px]">
      <div className="container-race">
        <nav
          aria-label="Trilha de navegação"
          className="flex flex-wrap items-center gap-1 text-[0.68rem] text-metal"
        >
          <Link href="/" className="transition hover:text-white">
            Início
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-chalk/80">Pedido #{order.code}</span>
        </nav>

        <header className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Pedido registrado</p>
            <h1 className="mt-3 font-display text-[clamp(2.3rem,5vw,3.8rem)] font-bold uppercase leading-[0.92]">
              Pedido <span className="text-racing">#{order.code}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-metal">
              Registrado em {formatDate(order.createdAt)}. Guarde este link: ele é pessoal e
              permite acompanhar o status do seu pedido.
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[0.62rem] uppercase tracking-[0.14em] ${
              cancelled
                ? "border-white/20 bg-white/5 text-metal"
                : order.status === "awaiting_whatsapp"
                  ? "border-racing/40 bg-racing/10 text-racing"
                  : "border-lime/35 bg-lime/10 text-lime"
            }`}
          >
            <span
              aria-hidden
              className={`size-1.5 rounded-full ${
                cancelled ? "bg-white/40" : order.status === "awaiting_whatsapp" ? "bg-racing" : "bg-lime"
              }`}
            />
            {orderStatusLabel[order.status]}
          </span>
        </header>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="space-y-6">
            {!cancelled && order.status === "awaiting_whatsapp" && (
              <section
                aria-labelledby="send-whatsapp"
                className="glass-panel rounded-2xl border-racing/30 p-5 md:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime/15 text-lime">
                    <MessageCircle size={19} aria-hidden />
                  </span>
                  <div>
                    <h2
                      id="send-whatsapp"
                      className="font-display text-xl font-semibold uppercase tracking-wide"
                    >
                      Falta um passo: envie no WhatsApp
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-metal">
                      Seu pedido já está salvo no site. Abra o WhatsApp oficial pelo botão
                      abaixo e <strong className="text-chalk">toque em ENVIAR</strong> na
                      conversa para que a equipe receba os dados.
                    </p>
                  </div>
                </div>
                <OrderWhatsAppAction
                  code={order.code}
                  token={token}
                  whatsappUrl={whatsappUrl}
                  display={settings.store.whatsappDisplay}
                />
                <p className="mt-3 text-center text-[0.65rem] leading-relaxed text-metal">
                  A confirmação do pedido é feita manualmente pela equipe. Nenhum pagamento
                  é cobrado automaticamente.
                </p>
              </section>
            )}

            {!cancelled && order.status !== "awaiting_whatsapp" && (
              <section
                aria-labelledby="contact-team"
                className="glass-panel rounded-2xl p-5 md:p-6"
              >
                <h2
                  id="contact-team"
                  className="font-display text-xl font-semibold uppercase tracking-wide"
                >
                  Precisa de algo?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-metal">
                  A equipe Race Day atende pelo WhatsApp {settings.store.whatsappDisplay} para
                  confirmar disponibilidade, frete, pagamento e prazo de entrega.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-lime/35 bg-lime/8 px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-lime transition hover:bg-lime/15"
                >
                  <MessageCircle size={15} aria-hidden />
                  Abrir conversa no WhatsApp
                </a>
              </section>
            )}

            <section className="glass-panel rounded-2xl p-5 md:p-6" aria-labelledby="status-title">
              <div className="flex items-center gap-2.5">
                <Clock3 size={16} className="text-racing" aria-hidden />
                <h2
                  id="status-title"
                  className="font-display text-xl font-semibold uppercase tracking-wide"
                >
                  Status do pedido
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-metal">
                {statusDescription[order.status]}
              </p>

              {cancelled ? (
                <p className="mt-5 rounded-xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-metal">
                  Se você não solicitou o cancelamento, fale com a equipe pelo WhatsApp{" "}
                  {settings.store.whatsappDisplay}.
                </p>
              ) : (
                <ol className="mt-6 space-y-0">
                  {FLOW.map((step, index) => {
                    const done = index < currentIndex;
                    const current = index === currentIndex;
                    return (
                      <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < FLOW.length - 1 && (
                          <span
                            aria-hidden
                            className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${
                              done ? "bg-lime/40" : "bg-white/10"
                            }`}
                          />
                        )}
                        <span
                          aria-hidden
                          className={`relative mt-0.5 grid size-[23px] shrink-0 place-items-center rounded-full border text-[0.6rem] ${
                            done
                              ? "border-lime/50 bg-lime text-ink"
                              : current
                                ? "border-racing bg-racing text-ink"
                                : "border-white/15 bg-white/4 text-metal"
                          }`}
                        >
                          {done ? <Check size={12} /> : index + 1}
                        </span>
                        <div>
                          <p
                            className={`text-[0.78rem] font-semibold uppercase tracking-[0.08em] ${
                              done || current ? "text-white" : "text-metal"
                            }`}
                          >
                            {orderStatusLabel[step]}
                          </p>
                          {current && (
                            <p className="mt-0.5 text-[0.68rem] leading-snug text-racing">
                              Etapa atual
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section className="glass-panel rounded-2xl p-5 md:p-6" aria-labelledby="items-title">
              <div className="flex items-center gap-2.5">
                <Package size={16} className="text-lime" aria-hidden />
                <h2
                  id="items-title"
                  className="font-display text-xl font-semibold uppercase tracking-wide"
                >
                  Itens do pedido
                </h2>
              </div>
              <ul className="mt-5 space-y-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-3.5">
                    <div className="relative size-18 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-graphite">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-white">
                        {item.productSlug ? (
                          <Link
                            href={`/produto/${item.productSlug}`}
                            className="transition hover:text-racing"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          item.productName
                        )}
                      </p>
                      <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.1em] text-metal">
                        {item.sizeLabel ? `Tamanho ${item.sizeLabel} · ` : ""}
                        Qtd. {item.quantity}
                      </p>
                      <div className="mt-1 flex items-baseline justify-between gap-3 text-[0.78rem]">
                        <span className="text-metal">
                          {formatBRL(item.unitPriceCents)} cada
                        </span>
                        <span className="font-semibold tabular-nums text-white">
                          {formatBRL(item.subtotalCents)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-metal">Subtotal</dt>
                  <dd className="tabular-nums text-white">{formatBRL(order.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-metal">Frete</dt>
                  <dd className="text-right tabular-nums text-white">
                    {order.shippingCents === null ? (
                      <span className="text-[0.7rem] uppercase tracking-[0.1em] text-racing">
                        A confirmar no atendimento
                      </span>
                    ) : order.shippingCents === 0 ? (
                      <span className="text-lime">Grátis</span>
                    ) : (
                      formatBRL(order.shippingCents)
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-metal">
                    Total
                  </dt>
                  <dd className="font-display text-2xl font-semibold tabular-nums text-white">
                    {formatBRL(order.totalCents)}
                  </dd>
                </div>
              </dl>
              {order.shippingCents === null && (
                <p className="mt-1.5 text-right text-[0.62rem] leading-relaxed text-metal">
                  Total dos itens. O frete será informado pela equipe.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28" aria-label="Dados do pedido">
            <section className="glass-panel rounded-2xl p-5 md:p-6" aria-labelledby="delivery-title">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-racing" aria-hidden />
                <h2
                  id="delivery-title"
                  className="font-display text-lg font-semibold uppercase tracking-wide"
                >
                  Entrega
                </h2>
              </div>
              <div className="mt-4 space-y-1 text-[0.8rem] leading-relaxed text-metal">
                <p className="font-medium text-white">{order.customerName}</p>
                <p>{order.customerPhone}</p>
                <p>{order.customerEmail}</p>
                <p className="pt-2">
                  {order.street}, {order.addressNumber}
                  {order.complement ? ` — ${order.complement}` : ""}
                </p>
                <p>
                  {order.neighborhood} · {order.city} — {order.state}
                </p>
                <p>CEP {order.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}</p>
                {order.reference && <p>Referência: {order.reference}</p>}
              </div>
            </section>

            <section
              className="rounded-2xl border border-white/8 bg-white/3 p-5 text-[0.7rem] leading-relaxed text-metal"
              aria-label="Como funciona"
            >
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-chalk/80">
                <ShieldCheck size={14} className="text-lime" aria-hidden />
                Como funciona
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4">
                <li>O pedido é registrado no site com número único.</li>
                <li>Você envia a mensagem pronta no WhatsApp oficial.</li>
                <li>A equipe confirma estoque, frete e pagamento.</li>
                <li>O status deste link é atualizado a cada etapa.</li>
              </ol>
              <p className="mt-3 flex items-start gap-2">
                <Truck size={13} className="mt-0.5 shrink-0 text-racing" aria-hidden />
                Frete e prazo nunca são cobrados automaticamente: são combinados no
                atendimento.
              </p>
            </section>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-chalk transition hover:border-racing/60 hover:text-racing"
              >
                Continuar comprando
              </Link>
              <Link
                href="/"
                className="text-center text-[0.65rem] uppercase tracking-[0.12em] text-metal transition hover:text-white"
              >
                Voltar para o início
              </Link>
            </div>
          </aside>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-[0.65rem] text-metal">
          <CheckCircle2 size={13} className="text-lime" aria-hidden />
          Este link é pessoal. Não o compartilhe para proteger seus dados.
        </p>
      </div>
    </div>
  );
}
