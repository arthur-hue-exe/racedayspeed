import { NextResponse } from "next/server";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { createOrder, OrderError } from "@/lib/orders";

const attempts = new Map<string, { count: number; resetAt: number }>();

function allow(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 12;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";

  if (!allow(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas de pedido. Aguarde alguns minutos e tente novamente." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (payload && typeof payload === "object" && "website" in payload) {
    const honeypot = (payload as { website?: unknown }).website;
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      return NextResponse.json({ error: "Não foi possível processar o pedido." }, { status: 400 });
    }
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Revise os campos destacados.",
        fields: fieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  try {
    const result = await createOrder(parsed.data);
    return NextResponse.json(
      {
        code: result.order.code,
        accessToken: result.accessToken,
        whatsappUrl: result.whatsappUrl,
        totalCents: result.order.totalCents,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("[orders] falha ao criar pedido:", error);
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido. Tente novamente ou fale no WhatsApp." },
      { status: 500 },
    );
  }
}
