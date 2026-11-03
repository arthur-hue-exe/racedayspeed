"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  ShoppingBag,
  User,
} from "lucide-react";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { formatBRL } from "@/lib/money";
import { cartKey, type CartItem } from "@/lib/cart";
import type { StoreSettings } from "@/lib/settings";
import { useStore } from "./providers";

const UF = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type FormState = {
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
};

const initialForm: FormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  cep: "",
  state: "",
  city: "",
  neighborhood: "",
  street: "",
  addressNumber: "",
  complement: "",
  reference: "",
};

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

function inputClass(error?: string): string {
  return `w-full rounded-xl border bg-black/35 px-3.5 py-3 text-sm text-white placeholder:text-metal/50 transition focus:border-racing focus:outline-none focus:ring-2 focus:ring-racing/20 ${
    error ? "border-racing/60" : "border-white/12"
  }`;
}

function Field({
  id,
  label,
  error,
  hint,
  optional,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-chalk/80"
        >
          {label}
        </label>
        {optional && (
          <span className="text-[0.58rem] uppercase tracking-[0.12em] text-metal">
            Opcional
          </span>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.7rem] leading-snug text-racing">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.65rem] leading-snug text-metal">{hint}</p>
      ) : null}
    </div>
  );
}

type ShippingConfig = StoreSettings["shipping"];

export function CheckoutForm({
  shipping,
  paymentMethods,
  whatsappDisplay,
  storeName,
}: {
  shipping: ShippingConfig;
  paymentMethods: string;
  whatsappDisplay: string;
  storeName: string;
}) {
  const router = useRouter();
  const {
    items,
    ready,
    subtotal,
    hasUnpriced,
    clearCart,
    openCart,
    showToast,
  } = useStore();

  const [form, setForm] = useState<FormState>(initialForm);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [cepMessage, setCepMessage] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const shippingCents =
    shipping.mode === "flat" && shipping.flatCents !== null
      ? shipping.freeAboveCents !== null && subtotal >= shipping.freeAboveCents
        ? 0
        : shipping.flatCents
      : null;
  const totalCents = subtotal + (shippingCents ?? 0);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function lookupCep() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setErrors((current) => ({ ...current, cep: "Informe um CEP com 8 dígitos." }));
      setCepStatus("error");
      setCepMessage("Informe um CEP com 8 dígitos para buscar o endereço.");
      return;
    }
    setCepStatus("loading");
    setCepMessage("");
    try {
      const response = await fetch(`/api/cep/${digits}`);
      const data = (await response.json()) as {
        street?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        error?: string;
      };
      if (!response.ok) {
        setCepStatus("error");
        setCepMessage(data.error ?? "Não foi possível consultar o CEP. Preencha manualmente.");
        return;
      }
      setForm((current) => ({
        ...current,
        street: data.street || current.street,
        neighborhood: data.neighborhood || current.neighborhood,
        city: data.city || current.city,
        state: data.state || current.state,
      }));
      setErrors((current) => {
        const next = { ...current };
        delete next.cep;
        delete next.street;
        delete next.neighborhood;
        delete next.city;
        delete next.state;
        return next;
      });
      setCepStatus("success");
      setCepMessage("Endereço encontrado. Confira os dados e preencha o número.");
    } catch {
      setCepStatus("error");
      setCepMessage("Consulta de CEP indisponível. Preencha o endereço manualmente.");
    }
  }

  function handleCepBlur() {
    if (form.cep.replace(/\D/g, "").length === 8 && !form.street && cepStatus === "idle") {
      void lookupCep();
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError("");

    if (!ready || submitting) return;
    if (items.length === 0) {
      setServerError("Seu carrinho está vazio.");
      return;
    }
    if (hasUnpriced) {
      setServerError(
        "Remova do carrinho os itens com preço sob consulta para finalizar o pedido pelo site.",
      );
      return;
    }

    const payload = {
      ...form,
      terms,
      items: items.map((item) => ({
        slug: item.slug,
        size: item.size,
        quantity: item.quantity,
      })),
      website: honeypotRef.current?.value ?? "",
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors = fieldErrors(parsed.error);
      setErrors(nextErrors);
      const firstKey = Object.keys(nextErrors).find((key) => key !== "form");
      if (firstKey) {
        requestAnimationFrame(() => {
          document.getElementById(firstKey)?.focus();
        });
      } else {
        setServerError("Revise os campos destacados.");
      }
      return;
    }

    setSubmitting(true);
    setErrors({});

    // Abre a aba do WhatsApp ainda dentro do gesto do usuário para não ser bloqueada.
    let whatsappTab: Window | null = null;
    try {
      whatsappTab = window.open("about:blank", "_blank");
    } catch {
      whatsappTab = null;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as {
        code?: string;
        accessToken?: string;
        whatsappUrl?: string;
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok || !data.code || !data.accessToken || !data.whatsappUrl) {
        whatsappTab?.close();
        setErrors(data.fields ?? {});
        setServerError(
          data.error ??
            "Não foi possível registrar o pedido. Tente novamente ou fale com a equipe pelo WhatsApp.",
        );
        setSubmitting(false);
        return;
      }

      const orderPath = `/pedido/${data.code}?token=${data.accessToken}`;

      if (whatsappTab) {
        try {
          whatsappTab.opener = null;
          whatsappTab.location.replace(data.whatsappUrl);
          void fetch(`/api/orders/${data.code}/whatsapp-opened`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: data.accessToken }),
            keepalive: true,
          }).catch(() => undefined);
        } catch {
          whatsappTab.close();
        }
      }

      clearCart();
      showToast(`Pedido #${data.code} registrado. Confirme o envio no WhatsApp.`);
      router.push(orderPath);
      router.refresh();
    } catch {
      whatsappTab?.close();
      setSubmitting(false);
      setServerError(
        "Sem conexão com o servidor. Verifique sua internet e tente novamente — nenhum pedido foi registrado.",
      );
    }
  }

  if (!ready) {
    return (
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]" aria-hidden>
        <div className="h-[28rem] animate-pulse rounded-3xl bg-white/4" />
        <div className="h-[20rem] animate-pulse rounded-3xl bg-white/4" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="glass-panel mt-12 rounded-3xl px-6 py-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-white/10 bg-white/5">
          <ShoppingBag size={26} className="text-metal" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold uppercase">Carrinho vazio</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-metal">
          Adicione uma peça da coleção Race Day para iniciar um pedido. Preços sob consulta
          são atendidos diretamente pelo WhatsApp.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime"
        >
          Explorar coleção <ArrowRight size={14} aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {hasUnpriced && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-racing/35 bg-racing/8 px-4 py-4 text-sm leading-relaxed text-racing"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">
                Há itens com preço sob consulta no carrinho.
              </p>
              <p className="mt-1 text-[0.78rem]">
                O pedido não pode ser finalizado pelo site enquanto o valor não estiver
                definido. Remova esses itens ou fale com a equipe pelo WhatsApp{" "}
                {whatsappDisplay}.
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCart}
                  className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] underline underline-offset-4"
                >
                  <Pencil size={13} aria-hidden /> Editar carrinho
                </button>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] underline underline-offset-4"
                >
                  Ver produtos com preço
                </Link>
              </div>
            </div>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-racing/40 bg-racing/10 px-4 py-3.5 text-sm leading-relaxed text-racing"
          >
            <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden />
            <p>{serverError}</p>
          </div>
        )}

        <section className="glass-panel rounded-2xl p-5 md:p-6" aria-labelledby="contact-title">
          <div className="flex items-center gap-2.5">
            <User size={16} className="text-racing" aria-hidden />
            <h2
              id="contact-title"
              className="font-display text-lg font-semibold uppercase tracking-wide"
            >
              Seus dados
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="customerName"
              label="Nome completo"
              error={errors.customerName}
              className="sm:col-span-2"
            >
              <input
                id="customerName"
                name="customerName"
                type="text"
                autoComplete="name"
                value={form.customerName}
                onChange={(event) => update("customerName", event.target.value)}
                placeholder="Nome e sobrenome"
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={errors.customerName ? "customerName-error" : undefined}
                className={inputClass(errors.customerName)}
              />
            </Field>
            <Field
              id="customerPhone"
              label="Telefone / WhatsApp"
              error={errors.customerPhone}
              hint="Com DDD, ex.: (61) 98281-7033"
            >
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.customerPhone}
                onChange={(event) => update("customerPhone", event.target.value)}
                placeholder="(61) 98281-7033"
                aria-invalid={Boolean(errors.customerPhone)}
                aria-describedby={errors.customerPhone ? "customerPhone-error" : undefined}
                className={inputClass(errors.customerPhone)}
              />
            </Field>
            <Field id="customerEmail" label="E-mail" error={errors.customerEmail}>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.customerEmail}
                onChange={(event) => update("customerEmail", event.target.value)}
                placeholder="voce@email.com"
                aria-invalid={Boolean(errors.customerEmail)}
                aria-describedby={errors.customerEmail ? "customerEmail-error" : undefined}
                className={inputClass(errors.customerEmail)}
              />
            </Field>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5 md:p-6" aria-labelledby="address-title">
          <div className="flex items-center gap-2.5">
            <MapPin size={16} className="text-lime" aria-hidden />
            <h2
              id="address-title"
              className="font-display text-lg font-semibold uppercase tracking-wide"
            >
              Endereço de entrega
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-6">
            <Field id="cep" label="CEP" error={errors.cep} className="sm:col-span-3">
              <div className="flex gap-2">
                <input
                  id="cep"
                  name="cep"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={form.cep}
                  onChange={(event) => update("cep", maskCep(event.target.value))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  aria-invalid={Boolean(errors.cep)}
                  aria-describedby={errors.cep ? "cep-error" : undefined}
                  className={inputClass(errors.cep)}
                />
                <button
                  type="button"
                  onClick={() => void lookupCep()}
                  disabled={cepStatus === "loading"}
                  className="shrink-0 rounded-xl border border-white/15 px-3 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-chalk transition hover:border-racing/60 hover:text-racing disabled:opacity-50"
                >
                  {cepStatus === "loading" ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                  ) : (
                    "Buscar"
                  )}
                </button>
              </div>
              <p
                aria-live="polite"
                className={`mt-1.5 text-[0.65rem] leading-snug ${
                  cepStatus === "error"
                    ? "text-racing"
                    : cepStatus === "success"
                      ? "text-lime"
                      : "text-metal"
                }`}
              >
                {cepMessage || "Digite o CEP para preencher o endereço automaticamente."}
              </p>
            </Field>

            <Field
              id="state"
              label="Estado"
              error={errors.state}
              className="sm:col-span-3"
            >
              <select
                id="state"
                name="state"
                autoComplete="address-level1"
                value={form.state}
                onChange={(event) => update("state", event.target.value)}
                aria-invalid={Boolean(errors.state)}
                aria-describedby={errors.state ? "state-error" : undefined}
                className={inputClass(errors.state)}
              >
                <option value="">Selecione a UF</option>
                {UF.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="city"
              label="Cidade"
              error={errors.city}
              className="sm:col-span-4"
            >
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                placeholder="Cidade"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? "city-error" : undefined}
                className={inputClass(errors.city)}
              />
            </Field>
            <Field
              id="neighborhood"
              label="Bairro"
              error={errors.neighborhood}
              className="sm:col-span-2"
            >
              <input
                id="neighborhood"
                name="neighborhood"
                type="text"
                autoComplete="address-level3"
                value={form.neighborhood}
                onChange={(event) => update("neighborhood", event.target.value)}
                placeholder="Bairro"
                aria-invalid={Boolean(errors.neighborhood)}
                aria-describedby={errors.neighborhood ? "neighborhood-error" : undefined}
                className={inputClass(errors.neighborhood)}
              />
            </Field>
            <Field
              id="street"
              label="Rua / Avenida"
              error={errors.street}
              className="sm:col-span-4"
            >
              <input
                id="street"
                name="street"
                type="text"
                autoComplete="address-line1"
                value={form.street}
                onChange={(event) => update("street", event.target.value)}
                placeholder="Rua ou avenida"
                aria-invalid={Boolean(errors.street)}
                aria-describedby={errors.street ? "street-error" : undefined}
                className={inputClass(errors.street)}
              />
            </Field>
            <Field
              id="addressNumber"
              label="Número"
              error={errors.addressNumber}
              className="sm:col-span-2"
            >
              <input
                id="addressNumber"
                name="addressNumber"
                type="text"
                autoComplete="address-line2"
                value={form.addressNumber}
                onChange={(event) => update("addressNumber", event.target.value)}
                placeholder="Nº"
                aria-invalid={Boolean(errors.addressNumber)}
                aria-describedby={errors.addressNumber ? "addressNumber-error" : undefined}
                className={inputClass(errors.addressNumber)}
              />
            </Field>
            <Field
              id="complement"
              label="Complemento"
              error={errors.complement}
              optional
              className="sm:col-span-3"
            >
              <input
                id="complement"
                name="complement"
                type="text"
                value={form.complement}
                onChange={(event) => update("complement", event.target.value)}
                placeholder="Apto, bloco, ponto de referência"
                className={inputClass(errors.complement)}
              />
            </Field>
            <Field
              id="reference"
              label="Ponto de referência"
              error={errors.reference}
              optional
              className="sm:col-span-3"
            >
              <input
                id="reference"
                name="reference"
                type="text"
                value={form.reference}
                onChange={(event) => update("reference", event.target.value)}
                placeholder="Referência para entrega"
                className={inputClass(errors.reference)}
              />
            </Field>
          </div>
        </section>

        <div className="hidden" aria-hidden>
          <label htmlFor="website">Não preencha este campo</label>
          <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <section className="glass-panel rounded-2xl p-5 md:p-6">
          <label htmlFor="terms" className="flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={terms}
                onChange={(event) => {
                  setTerms(event.target.checked);
                  setErrors((current) => {
                    if (!current.terms) return current;
                    const next = { ...current };
                    delete next.terms;
                    return next;
                  });
                }}
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? "terms-error" : undefined}
                className="peer size-5 appearance-none rounded border border-white/25 bg-black/40 transition checked:border-racing checked:bg-racing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-racing"
              />
              <Check
                size={13}
                className="pointer-events-none absolute text-ink opacity-0 peer-checked:opacity-100"
                aria-hidden
              />
            </span>
            <span className="text-[0.78rem] leading-relaxed text-metal">
              Li e aceito os{" "}
              <Link
                href="/politicas/termos-de-uso"
                target="_blank"
                className="text-chalk underline decoration-racing/50 underline-offset-2 hover:text-racing"
              >
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link
                href="/politicas/privacidade"
                target="_blank"
                className="text-chalk underline decoration-racing/50 underline-offset-2 hover:text-racing"
              >
                política de privacidade
              </Link>
              , e autorizo o contato pelo WhatsApp informado para confirmar o pedido.
            </span>
          </label>
          {errors.terms && (
            <p id="terms-error" className="mt-2 text-[0.7rem] text-racing">
              {errors.terms}
            </p>
          )}
        </section>

        <div className="lg:hidden">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shippingCents={shippingCents}
            totalCents={totalCents}
            shippingNote={shipping.note}
            paymentMethods={paymentMethods}
            onEdit={openCart}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || hasUnpriced}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-racing px-6 py-4 text-[0.74rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-metal"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Registrando pedido…
            </>
          ) : (
            <>
              <MessageCircle size={16} aria-hidden />
              Registrar pedido e abrir WhatsApp
            </>
          )}
        </button>
        <p className="text-center text-[0.68rem] leading-relaxed text-metal">
          O pedido é salvo antes de abrir o WhatsApp. A confirmação, o frete e o pagamento
          são tratados pela equipe no atendimento — com {storeName}.
        </p>
      </form>

      <aside className="sticky top-28 hidden lg:block" aria-label="Resumo do pedido">
        <OrderSummary
          items={items}
          subtotal={subtotal}
          shippingCents={shippingCents}
          totalCents={totalCents}
          shippingNote={shipping.note}
          paymentMethods={paymentMethods}
          onEdit={openCart}
        />
      </aside>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  shippingCents,
  totalCents,
  shippingNote,
  paymentMethods,
  onEdit,
}: {
  items: CartItem[];
  subtotal: number;
  shippingCents: number | null;
  totalCents: number;
  shippingNote: string;
  paymentMethods: string;
  onEdit: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
          Resumo do pedido
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-metal transition hover:text-racing"
        >
          <Pencil size={12} aria-hidden /> Editar
        </button>
      </div>

      <ul className="mt-4 space-y-3.5">
        {items.map((item) => (
          <li key={cartKey(item.slug, item.size)} className="flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-graphite">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/80 px-1.5 py-0.5 text-[0.6rem] font-semibold tabular-nums text-white">
                {item.quantity}×
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[0.8rem] font-medium leading-snug text-white">
                {item.name}
              </p>
              {item.size && (
                <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.1em] text-metal">
                  Tamanho {item.size}
                </p>
              )}
              <p className="mt-1 text-[0.75rem] font-semibold text-racing">
                {item.priceCents === null ? "Sob consulta" : formatBRL(item.priceCents)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-metal">Subtotal</dt>
          <dd className="tabular-nums text-white">{formatBRL(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-metal">Frete</dt>
          <dd className="text-right tabular-nums text-white">
            {shippingCents === null ? (
              <span className="text-[0.7rem] uppercase tracking-[0.1em] text-racing">
                A confirmar
              </span>
            ) : shippingCents === 0 ? (
              <span className="text-lime">Grátis</span>
            ) : (
              formatBRL(shippingCents)
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
          <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-metal">Total</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums text-white">
            {formatBRL(totalCents)}
          </dd>
        </div>
      </dl>
      {shippingCents === null && (
        <p className="mt-1.5 text-right text-[0.62rem] leading-relaxed text-metal">
          Total dos itens. O frete será informado no atendimento.
        </p>
      )}

      <div className="mt-4 space-y-2 rounded-xl border border-white/8 bg-white/3 px-3.5 py-3 text-[0.68rem] leading-relaxed text-metal">
        <p>
          <span className="font-semibold uppercase tracking-[0.1em] text-chalk/80">Frete:</span>{" "}
          {shippingNote}
        </p>
        <p>
          <span className="font-semibold uppercase tracking-[0.1em] text-chalk/80">
            Pagamento:
          </span>{" "}
          {paymentMethods}
        </p>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[0.65rem] leading-relaxed text-metal">
        <Lock size={12} className="mt-0.5 shrink-0 text-lime" aria-hidden />
        Nenhum pagamento é processado neste site. A equipe confirma disponibilidade, frete
        e forma de pagamento pelo WhatsApp.
      </p>
    </div>
  );
}
