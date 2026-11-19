import { getThermometer } from "@/lib/featured";
import ProductCard from "./ProductCard";
import styles from "../bf.module.css";

/** Grade com o veredito dos produtos mais buscados. Renderiza vazio se a fonte falhar. */
export default async function Thermometer({ limit }: { limit?: number }) {
  const items = await getThermometer().catch(() => []);
  if (!items.length) return <p className={styles.verdictMeta} style={{ marginBottom: 50 }}>Não foi possível montar o termômetro agora. Pesquise um produto acima.</p>;
  return <section className={styles.grid} aria-label="Termômetro da Black Friday">
    {items.slice(0, limit).map(item => <ProductCard key={item.hit.path} hit={item.hit} verdict={item.verdict} name={item.name} image={item.image} price={item.verdict.current} storeCount={item.storeCount} note={item.group} />)}
  </section>;
}

export function ThermometerSkeleton({ count = 4 }: { count?: number }) {
  return <section className={styles.grid} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <div key={i}><div className={styles.skeleton} style={{ height: 210 }} /><div className={styles.skeleton} style={{ height: 14, marginTop: 16, width: "80%" }} /><div className={styles.skeleton} style={{ height: 22, marginTop: 12, width: "40%" }} /></div>)}
  </section>;
}
