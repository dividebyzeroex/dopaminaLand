"use client";

import { useState } from "react";
import type { ThermometerItem } from "@/lib/featured";
import type { VerdictTone } from "@/lib/price-verdict";
import ProductCard from "./ProductCard";
import styles from "../bf.module.css";

const FILTERS: { key: "all" | VerdictTone; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "bad", label: "Maquiado" },
  { key: "good", label: "Abaixo do normal" },
  { key: "warn", label: "Acima do normal" },
  { key: "neutral", label: "Preço comum" },
];

export default function ThermometerGrid({ items, limit, showFilters = true }: { items: ThermometerItem[]; limit?: number; showFilters?: boolean }) {
  const [filter, setFilter] = useState<"all" | VerdictTone>("all");
  const count = (key: "all" | VerdictTone) => (key === "all" ? items.length : items.filter(i => i.verdict.tone === key).length);
  const visible = items.filter(i => filter === "all" || i.verdict.tone === filter).slice(0, limit);

  return <div>
    {showFilters && <div role="group" aria-label="Filtrar por veredito" className={styles.filters} style={{ marginBottom: 18 }}>
      {FILTERS.filter(f => count(f.key) > 0).map(f => <button key={f.key} type="button" className={styles.filter} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}<span>{count(f.key)}</span></button>)}
    </div>}
    <section className={styles.grid} aria-label="Termômetro da Black Friday" aria-live="polite">
      {visible.map(item => <ProductCard key={item.hit.path} hit={item.hit} verdict={item.verdict} name={item.name} image={item.image} price={item.verdict.current} storeCount={item.storeCount} note={item.group} series={item.series} />)}
    </section>
  </div>;
}
