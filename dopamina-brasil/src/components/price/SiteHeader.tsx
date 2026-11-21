import Link from "next/link";
import { Heart, Search } from "lucide-react";
import studio from "../studio.module.css";
import styles from "../bf.module.css";
import { activeEvent } from "@/lib/events";
import BackButton from "../nav/BackButton";

export default function SiteHeader() {
  const live = activeEvent();
  return <header className={studio.nav}>
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}><BackButton /><Link href="/" className={studio.brand}>dopamina</Link></div>
    <nav className={styles.navLinks} aria-label="Principal">
      {live
        ? <Link href={`/datas/${live.event.slug}`} className={styles.navHot}><span className={styles.ribbonDot} style={{ background: live.event.accent }} aria-hidden="true" />{live.event.name}</Link>
        : <Link href="/datas" className={styles.navHot}>Datas</Link>}
      <Link href="/metodologia" className={styles.hideMobile}>Como julgamos</Link>
      {/* No celular essas duas ficam nas abas de baixo. */}
      <Link href="/lista" className={`${styles.searchIcon} ${styles.hideMobile}`} aria-label="Minha lista"><Heart size={18} strokeWidth={1.8} /></Link>
      <Link href="/busca" className={`${styles.searchIcon} ${styles.hideMobile}`} aria-label="Buscar produto"><Search size={18} strokeWidth={1.8} /></Link>
    </nav>
  </header>;
}
