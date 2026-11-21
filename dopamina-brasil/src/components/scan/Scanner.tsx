"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Keyboard, Loader2 } from "lucide-react";
import { normalizeGtin } from "@/lib/ean";
import { trackEvent } from "@/lib/tracking";
import styles from "./scan.module.css";

type Phase = "idle" | "starting" | "scanning" | "looking" | "error";
type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (options: { formats: string[] }) => Detector;

/**
 * Leitor de código de barras para a loja física: a câmera lê o código da caixa
 * e abrimos o veredito do produto. Usa o leitor nativo do navegador quando existe
 * (Chrome Android) e uma biblioteca no resto (iPhone). Nada é gravado: a imagem
 * da câmera fica só no aparelho.
 */
export default function Scanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState("");

  useEffect(() => () => stopRef.current(), []);

  async function lookup(raw: string, via: "camera" | "manual") {
    const code = normalizeGtin(raw);
    if (!code) { setMessage("Esse número não é um código de barras válido. Confira os dígitos."); setPhase("error"); return; }
    stopRef.current();
    setPhase("looking"); setMessage("");
    if ("vibrate" in navigator) navigator.vibrate?.(60);
    try {
      const r = await fetch(`/api/ean?code=${code}`);
      const data = await r.json();
      trackEvent("tracking_update", data?.name, undefined, { action: "barcode_scan", via, found: Boolean(data?.ok), source: data?.source ?? null });
      if (data?.ok) { router.push(`/busca?q=${encodeURIComponent(data.query)}&origem=scanner`); return; }
      setMessage(data?.error ?? "Não encontramos este código. Digite o nome do produto.");
    } catch {
      setMessage("Sem conexão agora. Tente de novo.");
    }
    setPhase("error");
  }

  async function start() {
    setMessage(""); setPhase("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      const el = video.current!;
      el.srcObject = stream;
      await el.play();
      setPhase("scanning");
      let stopped = false;
      const stopStream = () => { stopped = true; stream.getTracks().forEach(t => t.stop()); };
      const Native = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
      if (Native) {
        const detector = new Native({ formats: ["ean_13", "ean_8", "upc_a"] });
        stopRef.current = stopStream;
        const loop = async () => {
          if (stopped) return;
          const found = await detector.detect(el).catch(() => []);
          const hit = found.find(f => normalizeGtin(f.rawValue));
          if (hit) void lookup(hit.rawValue, "camera");
          else requestAnimationFrame(() => void loop());
        };
        void loop();
      } else {
        // iPhone e outros sem leitor nativo: biblioteca carregada só nesta tela.
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoElement(el, result => {
          const text = result?.getText();
          if (text && normalizeGtin(text)) void lookup(text, "camera");
        });
        stopRef.current = () => { controls.stop(); stopStream(); };
      }
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      setMessage(denied
        ? "Sem acesso à câmera. Libere a câmera para o Dopamina nos ajustes do navegador, ou digite o número abaixo do código."
        : "Não conseguimos abrir a câmera neste aparelho. Digite o número abaixo do código de barras.");
      setPhase("error");
    }
  }

  return <section className={styles.wrap} aria-labelledby="scan-title">
    <h1 id="scan-title" className={styles.title}>Escanear na loja</h1>
    <p className={styles.lead}>Aponte a câmera para o código de barras da caixa. Mostramos o veredito e o menor preço online antes de você pagar.</p>

    <div className={styles.viewport} data-active={phase === "scanning" || phase === "looking"}>
      <video ref={video} playsInline muted className={styles.video} aria-hidden="true" />
      {(phase === "scanning" || phase === "looking") && <div className={styles.frame} aria-hidden="true" />}
      {phase === "idle" || phase === "error" || phase === "starting"
        ? <button type="button" className={styles.start} onClick={() => void start()} disabled={phase === "starting"}>
            {phase === "starting" ? <Loader2 size={20} className={styles.spin} /> : <Camera size={20} />} {phase === "error" ? "Tentar de novo" : "Abrir câmera"}
          </button>
        : null}
      {phase === "looking" && <p className={styles.status} role="status"><Loader2 size={18} className={styles.spin} /> Procurando o produto…</p>}
    </div>
    {message && <p className={styles.error} role="alert">{message}</p>}

    <form className={styles.manual} onSubmit={e => { e.preventDefault(); void lookup(manual, "manual"); }}>
      <label htmlFor="ean"><Keyboard size={16} aria-hidden="true" /> Ou digite os números do código</label>
      <div>
        <input id="ean" inputMode="numeric" autoComplete="off" placeholder="Ex.: 7891234567895" value={manual} onChange={e => setManual(e.target.value.replace(/[^\d ]/g, ""))} />
        <button type="submit" disabled={manual.replace(/\D/g, "").length < 8 || phase === "looking"}>Buscar</button>
      </div>
    </form>
    <p className={styles.fine}>A imagem da câmera não sai do seu aparelho. Enviamos só os números do código para descobrir qual é o produto.</p>
  </section>;
}
