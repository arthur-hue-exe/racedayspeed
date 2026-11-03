import { cache } from "react";
import { query } from "./db";

export type StoreSettings = {
  store: {
    whatsappNumber: string;
    whatsappDisplay: string;
    instagram: string;
    email: string;
  };
  shipping: {
    mode: "pending" | "flat";
    flatCents: number | null;
    freeAboveCents: number | null;
    note: string;
  };
  payment: { methods: string };
  company: { legalName: string; cnpj: string; address: string; hours: string };
  policies: { privacy: string; terms: string; returns: string };
  media: { heroVideoUrl: string; heroVideoPoster: string };
  announcement: { enabled: boolean; text: string };
};

const defaults: StoreSettings = {
  store: {
    whatsappNumber: "5561982817033",
    whatsappDisplay: "(61) 98281-7033",
    instagram: "racedayspeed",
    email: "",
  },
  shipping: {
    mode: "pending",
    flatCents: null,
    freeAboveCents: null,
    note: "Frete e prazo são confirmados no atendimento pelo WhatsApp.",
  },
  payment: {
    methods: "Pix, cartão de crédito e dinheiro — condições confirmadas no atendimento.",
  },
  company: {
    legalName: "Race Day Speed & Glory",
    cnpj: "",
    address: "",
    hours: "Atendimento pelo WhatsApp (61) 98281-7033.",
  },
  policies: {
    privacy:
      "A política de privacidade está sendo atualizada. Fale com a Race Day pelo WhatsApp (61) 98281-7033.",
    terms:
      "Os termos de uso estão sendo atualizados. Fale com a Race Day pelo WhatsApp (61) 98281-7033.",
    returns:
      "A política de troca e devolução está sendo atualizada. Fale com a Race Day pelo WhatsApp (61) 98281-7033.",
  },
  media: { heroVideoUrl: "", heroVideoPoster: "" },
  announcement: {
    enabled: true,
    text: "Frete e disponibilidade confirmados no atendimento",
  },
};

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const rows = await query<{ key: string; value: Record<string, unknown> }>(
    "select key, value from settings",
  );
  const merged = structuredClone(defaults);
  for (const row of rows) {
    if (row.key in merged) {
      Object.assign(
        (merged as unknown as Record<string, object>)[row.key],
        row.value,
      );
    }
  }
  return merged;
});

export function whatsappDigits(settings: StoreSettings): string {
  return settings.store.whatsappNumber.replace(/\D/g, "");
}

export function computeShipping(
  subtotalCents: number,
  settings: StoreSettings,
): number | null {
  const { mode, flatCents, freeAboveCents } = settings.shipping;
  if (mode !== "flat" || flatCents === null) return null;
  if (freeAboveCents !== null && subtotalCents >= freeAboveCents) return 0;
  return flatCents;
}
