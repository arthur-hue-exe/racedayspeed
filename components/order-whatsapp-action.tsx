"use client";

import { useState } from "react";
import { ExternalLink, MessageCircle } from "lucide-react";

export function OrderWhatsAppAction({
  code,
  token,
  whatsappUrl,
  display,
}: {
  code: string;
  token: string;
  whatsappUrl: string;
  display: string;
}) {
  const [opened, setOpened] = useState(false);

  function handleClick() {
    if (opened) return;
    setOpened(true);
    void fetch(`/api/orders/${code}/whatsapp-opened`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      keepalive: true,
    }).catch(() => undefined);
  }

  return (
    <div className="mt-5">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-lime px-6 py-4 text-[0.74rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-racing"
      >
        <MessageCircle size={17} aria-hidden />
        Enviar pedido no WhatsApp {display}
        <ExternalLink size={13} aria-hidden />
      </a>
      <p className="mt-2.5 text-center text-[0.68rem] leading-relaxed text-metal">
        Ao abrir a conversa, confira a mensagem e toque em <strong className="text-chalk">ENVIAR</strong>.
        O pedido só chega à equipe depois desse envio.
      </p>
      {opened && (
        <p
          aria-live="polite"
          className="mt-2 rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-center text-[0.66rem] leading-relaxed text-metal"
        >
          WhatsApp aberto em outra aba. Se não abriu, use o botão novamente ou fale com a
          equipe pelo número {display}.
        </p>
      )}
    </div>
  );
}
