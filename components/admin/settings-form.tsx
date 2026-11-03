"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  saveSettingsAction,
  type SettingsFormState,
} from "@/app/admin/(panel)/configuracoes/actions";
import type { StoreSettings } from "@/lib/settings";

const initialState: SettingsFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-metal/50 focus:border-racing/60 focus:outline-none";
const labelClass =
  "mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-metal";

function reais(cents: number | null): string {
  return cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-racing">
      {message}
    </p>
  );
}

function Section({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="glass-panel rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-metal">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsForm({
  settings,
  saved,
}: {
  settings: StoreSettings;
  saved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Loja</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
            Configurações
          </h1>
          <p className="mt-1 text-sm text-metal">
            Contato, frete, informações legais e políticas públicas da loja.
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-racing px-5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
          {pending ? "Salvando…" : "Salvar configurações"}
        </button>
      </header>

      {saved && (
        <p className="rounded-xl border border-lime/25 bg-lime/8 px-4 py-3 text-sm text-lime">
          Configurações salvas. A loja já usa os novos dados.
        </p>
      )}
      {state.message && (
        <p role="alert" className="rounded-xl border border-racing/35 bg-racing/8 px-4 py-3 text-sm text-racing">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Section
            title="Contato e atendimento"
            description="Esses dados são usados no rodapé, na página Sobre, no WhatsApp e nas políticas."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="whatsappNumber" className={labelClass}>
                  WhatsApp (DDI + DDD + número) *
                </label>
                <input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  defaultValue={settings.store.whatsappNumber}
                  className={inputClass}
                  placeholder="5561982817033"
                  inputMode="numeric"
                />
                <p className="mt-1.5 text-[0.68rem] text-metal/70">Somente números. Ex.: 5561982817033.</p>
                <ErrorText message={state.errors?.whatsappNumber} />
              </div>
              <div>
                <label htmlFor="whatsappDisplay" className={labelClass}>
                  WhatsApp exibido *
                </label>
                <input
                  id="whatsappDisplay"
                  name="whatsappDisplay"
                  defaultValue={settings.store.whatsappDisplay}
                  className={inputClass}
                  placeholder="(61) 98281-7033"
                />
                <ErrorText message={state.errors?.whatsappDisplay} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="instagram" className={labelClass}>
                  Instagram
                </label>
                <input
                  id="instagram"
                  name="instagram"
                  defaultValue={settings.store.instagram}
                  className={inputClass}
                  placeholder="racedayspeed"
                />
                <ErrorText message={state.errors?.instagram} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  E-mail de contato
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings.store.email}
                  className={inputClass}
                  placeholder="contato@racedayspeed.com"
                />
                <ErrorText message={state.errors?.email} />
              </div>
            </div>
          </Section>

          <Section
            title="Frete"
            description="O site nunca inventa valor de frete. Enquanto estiver em 'a confirmar', o pedido informa que o frete será combinado no atendimento."
          >
            <div>
              <label htmlFor="shippingMode" className={labelClass}>
                Modo de frete
              </label>
              <select
                id="shippingMode"
                name="shippingMode"
                defaultValue={settings.shipping.mode}
                className={inputClass}
              >
                <option value="pending">A confirmar no atendimento</option>
                <option value="flat">Valor fixo calculado no site</option>
              </select>
              <ErrorText message={state.errors?.shippingMode} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shippingFlat" className={labelClass}>
                  Frete fixo (R$)
                </label>
                <input
                  id="shippingFlat"
                  name="shippingFlat"
                  defaultValue={reais(settings.shipping.flatCents)}
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Ex.: 29,90"
                />
                <p className="mt-1.5 text-[0.68rem] text-metal/70">Usado apenas no modo de valor fixo.</p>
                <ErrorText message={state.errors?.shippingFlat} />
              </div>
              <div>
                <label htmlFor="shippingFreeAbove" className={labelClass}>
                  Frete grátis a partir de (R$)
                </label>
                <input
                  id="shippingFreeAbove"
                  name="shippingFreeAbove"
                  defaultValue={reais(settings.shipping.freeAboveCents)}
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Opcional"
                />
                <ErrorText message={state.errors?.shippingFreeAbove} />
              </div>
            </div>
            <div>
              <label htmlFor="shippingNote" className={labelClass}>
                Aviso de frete exibido na loja
              </label>
              <input
                id="shippingNote"
                name="shippingNote"
                defaultValue={settings.shipping.note}
                className={inputClass}
                placeholder="Frete e prazo confirmados no atendimento"
              />
              <ErrorText message={state.errors?.shippingNote} />
            </div>
          </Section>

          <Section title="Empresa e pagamento" description="Dados institucionais e formas de pagamento informadas ao cliente.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="legalName" className={labelClass}>
                  Nome / razão social
                </label>
                <input
                  id="legalName"
                  name="legalName"
                  defaultValue={settings.company.legalName}
                  className={inputClass}
                  placeholder="Race Day Speed & Glory"
                />
                <ErrorText message={state.errors?.legalName} />
              </div>
              <div>
                <label htmlFor="cnpj" className={labelClass}>
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  name="cnpj"
                  defaultValue={settings.company.cnpj}
                  className={inputClass}
                  placeholder="00.000.000/0000-00"
                />
                <ErrorText message={state.errors?.cnpj} />
              </div>
            </div>
            <div>
              <label htmlFor="address" className={labelClass}>
                Endereço
              </label>
              <input
                id="address"
                name="address"
                defaultValue={settings.company.address}
                className={inputClass}
                placeholder="Cidade/UF ou endereço completo"
              />
              <ErrorText message={state.errors?.address} />
            </div>
            <div>
              <label htmlFor="hours" className={labelClass}>
                Horário / atendimento
              </label>
              <input
                id="hours"
                name="hours"
                defaultValue={settings.company.hours}
                className={inputClass}
                placeholder="Atendimento pelo WhatsApp..."
              />
              <ErrorText message={state.errors?.hours} />
            </div>
            <div>
              <label htmlFor="paymentMethods" className={labelClass}>
                Formas de pagamento
              </label>
              <textarea
                id="paymentMethods"
                name="paymentMethods"
                defaultValue={settings.payment.methods}
                rows={3}
                className={inputClass}
                placeholder="Pix, cartão de crédito e dinheiro — condições confirmadas no atendimento."
              />
              <ErrorText message={state.errors?.paymentMethods} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Anúncio e mídia" description="Faixa de aviso no topo do site e vídeo da seção de velocidade.">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                name="announcementEnabled"
                defaultChecked={settings.announcement.enabled}
                className="size-4 accent-[#ffd500]"
              />
              <span>
                <span className="block text-sm font-medium text-white">Exibir faixa de anúncio</span>
                <span className="block text-[0.68rem] text-metal">Aparece acima do cabeçalho.</span>
              </span>
            </label>
            <div>
              <label htmlFor="announcementText" className={labelClass}>
                Texto do anúncio
              </label>
              <input
                id="announcementText"
                name="announcementText"
                defaultValue={settings.announcement.text}
                maxLength={160}
                className={inputClass}
                placeholder="Frete e disponibilidade confirmados no atendimento"
              />
              <ErrorText message={state.errors?.announcementText} />
            </div>
            <div>
              <label htmlFor="heroVideoUrl" className={labelClass}>
                Vídeo da seção de velocidade
              </label>
              <input
                id="heroVideoUrl"
                name="heroVideoUrl"
                defaultValue={settings.media.heroVideoUrl}
                className={inputClass}
                placeholder="/videos/race-day.mp4 ou https://..."
              />
              <p className="mt-1.5 text-[0.68rem] text-metal/70">
                Deixe vazio para usar a composição visual animada. O arquivo precisa estar hospedado em local estável.
              </p>
              <ErrorText message={state.errors?.heroVideoUrl} />
            </div>
          </Section>

          <Section
            title="Políticas"
            description="Textos públicos em /politicas. Separe títulos por linha. Salvar aqui não substitui a revisão jurídica."
          >
            <div>
              <label htmlFor="policyPrivacy" className={labelClass}>
                Política de privacidade (LGPD)
              </label>
              <textarea
                id="policyPrivacy"
                name="policyPrivacy"
                defaultValue={settings.policies.privacy}
                rows={8}
                className={`${inputClass} text-[0.8rem] leading-relaxed`}
              />
              <ErrorText message={state.errors?.policyPrivacy} />
            </div>
            <div>
              <label htmlFor="policyTerms" className={labelClass}>
                Termos de uso
              </label>
              <textarea
                id="policyTerms"
                name="policyTerms"
                defaultValue={settings.policies.terms}
                rows={8}
                className={`${inputClass} text-[0.8rem] leading-relaxed`}
              />
              <ErrorText message={state.errors?.policyTerms} />
            </div>
            <div>
              <label htmlFor="policyReturns" className={labelClass}>
                Trocas e devoluções
              </label>
              <textarea
                id="policyReturns"
                name="policyReturns"
                defaultValue={settings.policies.returns}
                rows={8}
                className={`${inputClass} text-[0.8rem] leading-relaxed`}
              />
              <ErrorText message={state.errors?.policyReturns} />
            </div>
          </Section>
        </div>
      </div>

      <div className="flex justify-end border-t border-white/8 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
          {pending ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
