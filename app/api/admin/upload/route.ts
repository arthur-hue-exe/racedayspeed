import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos uma imagem." }, { status: 400 });
  }
  if (files.length > 10) {
    return NextResponse.json({ error: "Envie no máximo 10 imagens por vez." }, { status: 400 });
  }

  const urls: string[] = [];
  try {
    for (const file of files) {
      urls.push(await uploadProductImage(file));
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível enviar a imagem.";
    return NextResponse.json({ error: message, urls }, { status: 400 });
  }

  return NextResponse.json({ urls });
}
