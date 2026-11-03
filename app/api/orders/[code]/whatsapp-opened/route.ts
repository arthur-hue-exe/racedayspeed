import { NextResponse } from "next/server";
import { markWhatsappOpened } from "@/lib/orders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    if (typeof body.token === "string") token = body.token;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const ok = await markWhatsappOpened(code, token);
  return NextResponse.json({ ok });
}
