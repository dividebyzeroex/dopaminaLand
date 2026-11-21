"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardPaste, Loader2, ScanBarcode, Search } from "lucide-react";
import Link from "next/link";
import studio from "../studio.module.css";
import { blockedMessage, checkSearch } from "@/lib/search-policy";
import { trackEvent } from "@/lib/tracking";
import { addRecent } from "@/lib/recent-searches";
import { extractLink } from "@/lib/shared-link";

const noop = () => () => {};

type Props = { defaultValue?: string; suggestions?: string[]; id?: string; placeholder?: string; autoFocus?: boolean };

export default function SearchBox({ defaultValue = "", suggestions = [], id = "product-search", placeholder = "Produto ou link da oferta", autoFocus = false }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  // Só no navegador (no servidor é false): evita divergência na hidratação.
  const canPaste = useSyncExternalStore(noop, () => typeof navigator.clipboard?.readText === "function", () => false);

  /** "Colar link": lê a área de transferência só quando a pessoa toca (o sistema pede permissão). */
  async function paste() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      const link = extractLink(text);
      trackEvent("tracking_update", undefined, undefined, { action: "paste_link", has_link: Boolean(link) });
      if (link) go(link);
      else if (text) { setValue(text.slice(0, 120)); setError(""); }
      else setError("A área de transferência está vazia. Copie o link do produto no app ou site da loja.");
    } catch {
      setError("Não conseguimos ler o que você copiou. Toque e segure no campo e escolha Colar.");
    }
  }

  function go(term: string) {
    const query = term.trim();
    if (query.length < 2 || pending) return;
    const policy = checkSearch(query);
    if (policy.blocked) { setError(blockedMessage(policy.reason)); setValue(""); return; }
    setError("");
    setValue(query);
    trackEvent("super_search", "search_submitted", undefined, { query });
    addRecent(query);
    startTransition(() => router.push(`/busca?q=${encodeURIComponent(query)}`));
  }

  return <div>
    <form className={studio.search} role="search" onSubmit={event => { event.preventDefault(); go(value); }}>
      <Search size={18} strokeWidth={1.5} aria-hidden="true" />
      <label htmlFor={id} className="sr-only">Produto ou link da oferta</label>
      <input id={id} value={value} onChange={event => setValue(event.target.value)} placeholder={placeholder} enterKeyHint="search" autoComplete="off" autoFocus={autoFocus} />
      <button type="submit" aria-label="Ver histórico de preço" disabled={pending || value.trim().length < 2}>
        {pending ? <Loader2 size={18} className={studio.spin} /> : <><span>Ver histórico</span><ArrowRight size={18} /></>}
      </button>
    </form>
    {pending && <p role="status" className={studio.status}>Consultando preços e histórico…</p>}
    {error && <p role="alert" className={studio.error}>{error}</p>}
    <div className={studio.quickActions}>
      {canPaste && <button type="button" className={studio.pasteButton} onClick={() => void paste()} disabled={pending}><ClipboardPaste size={16} aria-hidden="true" /> Colar link da loja</button>}
      <Link href="/escanear" className={studio.pasteButton}><ScanBarcode size={16} aria-hidden="true" /> Escanear código</Link>
    </div>
    {suggestions.length > 0 && <div className={studio.suggestions}><span>Experimente</span>{suggestions.map(item => <button type="button" key={item} disabled={pending} onClick={() => go(item)}>{item}</button>)}</div>}
  </div>;
}
