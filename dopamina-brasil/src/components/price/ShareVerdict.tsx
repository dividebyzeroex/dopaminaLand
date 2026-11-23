"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, ImageDown, Link2, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import styles from "../bf.module.css";

type Props = { url: string; text: string; productName: string; /** Cartão em imagem (/og/cartao/...) para story e feed. */ cardUrl?: string };

const noop = () => () => {};

function WhatsAppIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.1.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" /></svg>;
}

/** Compartilhar o veredito: WhatsApp primeiro (onde as ofertas circulam), depois o menu do sistema ou copiar link. */
export default function ShareVerdict({ url, text, productName, cardUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const message = `${text}\n${url}`;
  // Só no navegador: no servidor é sempre false, evitando divergência na hidratação.
  const canShare = useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);

  function track(channel: string) {
    trackEvent("share_product", productName, undefined, { channel, url });
  }

  async function shareNative() {
    track("native");
    try { await navigator.share({ title: productName, text, url }); } catch { /* cancelado */ }
  }

  /** Imagem pronta para story: abre o menu de compartilhar com o arquivo; sem suporte, baixa o PNG. */
  async function shareImage() {
    if (!cardUrl || busy) return;
    track("image");
    setBusy(true);
    try {
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error("cartão indisponível");
      const blob = await res.blob();
      const file = new File([blob], "raio-x-dopamina.png", { type: blob.type || "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: productName, text });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      }
    } catch { /* cancelado ou sem rede: nada a fazer */ }
    finally { setBusy(false); }
  }

  async function copy() {
    track("copy");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch { /* sem permissão: o link continua visível na barra do navegador */ }
  }

  return <div className={styles.share}>
    <a className={styles.shareWhats} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp")}>
      <WhatsAppIcon /> Enviar no WhatsApp
    </a>
    {cardUrl && <button type="button" className={styles.shareGhost} onClick={() => void shareImage()} disabled={busy} aria-live="polite">
      <ImageDown size={16} aria-hidden="true" /> {busy ? "Gerando…" : "Imagem para story"}
    </button>}
    {canShare
      ? <button type="button" className={styles.shareGhost} onClick={() => void shareNative()}><Share2 size={16} aria-hidden="true" /> Compartilhar</button>
      : <button type="button" className={styles.shareGhost} onClick={() => void copy()} aria-live="polite">{copied ? <><Check size={16} aria-hidden="true" /> Link copiado</> : <><Link2 size={16} aria-hidden="true" /> Copiar link</>}</button>}
  </div>;
}
