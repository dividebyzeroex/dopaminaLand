"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";
import studio from "../studio.module.css";
import { isBlockedSearch } from "@/lib/search-policy";
import { trackEvent } from "@/lib/tracking";

type Props = { defaultValue?: string; suggestions?: string[]; id?: string; placeholder?: string };

export default function SearchBox({ defaultValue = "", suggestions = [], id = "product-search", placeholder = "Produto ou link da oferta" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function go(term: string) {
    const query = term.trim();
    if (query.length < 2 || pending) return;
    if (isBlockedSearch(query)) { trackEvent("search_blocked", undefined, undefined, { query: query.slice(0, 120) }); setError("Esta pesquisa não é permitida. Busque outro produto."); return; }
    setError("");
    setValue(query);
    trackEvent("super_search", "search_submitted", undefined, { query });
    startTransition(() => router.push(`/busca?q=${encodeURIComponent(query)}`));
  }

  return <div>
    <form className={studio.search} role="search" onSubmit={event => { event.preventDefault(); go(value); }}>
      <Search size={18} strokeWidth={1.5} aria-hidden="true" />
      <label htmlFor={id} className="sr-only">Produto ou link da oferta</label>
      <input id={id} value={value} onChange={event => setValue(event.target.value)} placeholder={placeholder} enterKeyHint="search" autoComplete="off" />
      <button type="submit" aria-label="Ver histórico de preço" disabled={pending || value.trim().length < 2}>
        {pending ? <Loader2 size={18} className={studio.spin} /> : <><span>Ver histórico</span><ArrowRight size={18} /></>}
      </button>
    </form>
    {pending && <p role="status" className={studio.status}>Consultando preços e histórico…</p>}
    {error && <p role="alert" className={studio.error}>{error}</p>}
    {suggestions.length > 0 && <div className={studio.suggestions}><span>Experimente</span>{suggestions.map(item => <button type="button" key={item} disabled={pending} onClick={() => go(item)}>{item}</button>)}</div>}
  </div>;
}
