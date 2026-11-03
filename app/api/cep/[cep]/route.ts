import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> },
) {
  const { cep } = await params;
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    return NextResponse.json(
      { error: "Informe um CEP com 8 dígitos." },
      { status: 400 },
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar o CEP agora. Preencha manualmente." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      erro?: boolean | string;
      cep?: string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };

    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      cep: data.cep ?? digits,
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Consulta de CEP indisponível. Preencha o endereço manualmente." },
      { status: 502 },
    );
  }
}
