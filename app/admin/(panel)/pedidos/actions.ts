"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { updateOrderNotes, updateOrderStatus, OrderError } from "@/lib/orders";
import { isOrderStatus } from "@/lib/admin-data";

export type OrderActionState = { ok?: boolean; message?: string };

export async function changeOrderStatusAction(
  _previous: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !isOrderStatus(status)) {
    return { message: "Selecione um status válido." };
  }

  try {
    await updateOrderStatus(id, status);
  } catch (error) {
    if (error instanceof OrderError) return { message: error.message };
    console.error("[admin] falha ao alterar status:", error);
    return { message: "Não foi possível alterar o status agora." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Status atualizado." };
}

export async function saveOrderNotesAction(
  _previous: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "");

  if (!id) return { message: "Pedido não identificado." };

  try {
    await updateOrderNotes(id, notes);
  } catch (error) {
    console.error("[admin] falha ao salvar observações:", error);
    return { message: "Não foi possível salvar as observações." };
  }

  revalidatePath(`/admin/pedidos/${id}`);
  return { ok: true, message: "Observações salvas." };
}
