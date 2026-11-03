"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { centsFromReais } from "@/lib/money";
import { getSettings, type StoreSettings } from "@/lib/settings";
import { fieldErrors, settingsInputSchema } from "@/lib/validation";

export type SettingsFormState = {
  message?: string;
  errors?: Record<string, string>;
};

export async function saveSettingsAction(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();

  const parsed = settingsInputSchema.safeParse({
    whatsappNumber: formData.get("whatsappNumber") ?? "",
    whatsappDisplay: formData.get("whatsappDisplay") ?? "",
    instagram: formData.get("instagram") ?? "",
    email: formData.get("email") ?? "",
    shippingMode: formData.get("shippingMode") ?? "pending",
    shippingFlat: formData.get("shippingFlat") ?? "",
    shippingFreeAbove: formData.get("shippingFreeAbove") ?? "",
    shippingNote: formData.get("shippingNote") ?? "",
    paymentMethods: formData.get("paymentMethods") ?? "",
    legalName: formData.get("legalName") ?? "",
    cnpj: formData.get("cnpj") ?? "",
    address: formData.get("address") ?? "",
    hours: formData.get("hours") ?? "",
    announcementEnabled: formData.get("announcementEnabled") === "on",
    announcementText: formData.get("announcementText") ?? "",
    heroVideoUrl: formData.get("heroVideoUrl") ?? "",
    policyPrivacy: formData.get("policyPrivacy") ?? "",
    policyTerms: formData.get("policyTerms") ?? "",
    policyReturns: formData.get("policyReturns") ?? "",
  });

  if (!parsed.success) {
    return {
      message: "Revise os campos destacados antes de salvar.",
      errors: fieldErrors(parsed.error),
    };
  }

  const data = parsed.data;
  const errors: Record<string, string> = {};

  const email = data.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido ou deixe em branco.";
  }

  const videoUrl = data.heroVideoUrl.trim();
  if (videoUrl && !videoUrl.startsWith("/") && !videoUrl.startsWith("https://")) {
    errors.heroVideoUrl = "Use um caminho local (/videos/...) ou uma URL https://.";
  }

  let flatCents = centsFromReais(data.shippingFlat);
  if (data.shippingFlat.trim() && flatCents === null) {
    errors.shippingFlat = "Valor de frete inválido. Use, por exemplo, 29,90.";
  }
  if (data.shippingMode === "flat" && flatCents === null) {
    errors.shippingFlat = "Informe o valor fixo do frete ou mantenha o modo 'a confirmar'.";
  }

  const freeAboveCents = centsFromReais(data.shippingFreeAbove);
  if (data.shippingFreeAbove.trim() && freeAboveCents === null) {
    errors.shippingFreeAbove = "Valor inválido. Use, por exemplo, 300,00.";
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos destacados antes de salvar.", errors };
  }

  if (data.shippingMode === "pending") {
    flatCents = null;
  }

  const current = await getSettings();
  const next: StoreSettings = {
    store: {
      whatsappNumber: data.whatsappNumber.replace(/\D/g, ""),
      whatsappDisplay: data.whatsappDisplay.trim(),
      instagram: data.instagram.replace(/^@/, "").trim(),
      email,
    },
    shipping: {
      mode: data.shippingMode,
      flatCents,
      freeAboveCents,
      note: data.shippingNote.trim(),
    },
    payment: { methods: data.paymentMethods.trim() },
    company: {
      legalName: data.legalName.trim(),
      cnpj: data.cnpj.trim(),
      address: data.address.trim(),
      hours: data.hours.trim(),
    },
    policies: {
      privacy: data.policyPrivacy.trim(),
      terms: data.policyTerms.trim(),
      returns: data.policyReturns.trim(),
    },
    media: {
      heroVideoUrl: videoUrl,
      heroVideoPoster: current.media.heroVideoPoster,
    },
    announcement: {
      enabled: data.announcementEnabled ?? false,
      text: data.announcementText.trim(),
    },
  };

  try {
    for (const [key, value] of Object.entries(next)) {
      await query(
        `insert into settings (key, value) values ($1, $2)
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [key, JSON.stringify(value)],
      );
    }
  } catch (error) {
    console.error("[admin] falha ao salvar configurações:", error);
    return { message: "Não foi possível salvar as configurações agora." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes?salvo=1");
}
