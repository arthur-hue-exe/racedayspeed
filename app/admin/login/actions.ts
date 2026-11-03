"use server";

import { redirect } from "next/navigation";
import {
  assertLoginAllowed,
  authenticate,
  createSession,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  try {
    await assertLoginAllowed();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Acesso temporariamente bloqueado." };
  }

  let user;
  try {
    user = await authenticate(email, password);
  } catch {
    return { error: "Não foi possível validar o acesso agora. Tente novamente." };
  }

  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession(user.id);
  redirect("/admin");
}
