import Link from "next/link";
import { Bell, Search } from "lucide-react";
import studio from "../studio.module.css";
import styles from "../bf.module.css";
import { activeEvent } from "@/lib/events";

export default function SiteHeader() {
  const live = activeEvent();
  return <header className={studio.nav}>
    <Link href="/" className={studio.brand}>dopamina</Link>
    <nav className={styles.navLinks} aria-label="Principal">
      {live
        ? <Link href={`/datas/${live.event.slug}`} className={styles.navHot}><span className={styles.ribbonDot} style={{ background: live.event.accent }} aria-hidden="true" />{live.event.name}</Link>
        : <Link href="/datas" className={styles.navHot}>Datas</Link>}
      <Link href="/metodologia" className={styles.hideMobile}>Como julgamos</Link>
      <Link href="/alertas" className={styles.searchIcon} aria-label="Meus alertas de preço"><Bell size={18} strokeWidth={1.8} /></Link>
      <Link href="/#busca" className={styles.searchIcon} aria-label="Buscar produto"><Search size={18} strokeWidth={1.8} /></Link>
    </nav>
  </header>;
}
