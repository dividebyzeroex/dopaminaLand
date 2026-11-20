import { getThermometer, thermometerSourceNote } from "@/lib/featured";
import type { EventId } from "@/lib/events";
import ThermometerGrid from "./ThermometerGrid";
import styles from "../bf.module.css";

/** Termômetro com o veredito dos produtos mais buscados. Mostra um aviso se a fonte falhar. */
export default async function Thermometer({ limit, showFilters = true, eventId = null }: { limit?: number; showFilters?: boolean; eventId?: EventId | null }) {
  const items = await getThermometer(eventId).catch(() => []);
  if (!items.length) return <p className={styles.verdictMeta} style={{ marginBottom: 50 }}>Não foi possível montar o termômetro agora. Pesquise um produto acima.</p>;
  return <>
    <ThermometerGrid items={items} limit={limit} showFilters={showFilters} />
    <p className={styles.verdictMeta} style={{ marginBottom: 8 }}>{thermometerSourceNote(items)}</p>
  </>;
}

export function ThermometerSkeleton({ count = 4 }: { count?: number }) {
  return <section className={styles.grid} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <div key={i}><div className={styles.skeleton} style={{ height: 170, borderRadius: 20 }} /><div className={styles.skeleton} style={{ height: 14, marginTop: 16, width: "80%" }} /><div className={styles.skeleton} style={{ height: 22, marginTop: 12, width: "40%" }} /></div>)}
  </section>;
}
