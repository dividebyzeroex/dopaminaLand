import Link from "next/link";
import { Search } from "lucide-react";
import studio from "../studio.module.css";
import styles from "../bf.module.css";

export default function SiteHeader() {
  return <header className={studio.nav}>
    <Link href="/" className={studio.brand}>dopamina</Link>
    <nav className={styles.navLinks} aria-label="Principal">
      <Link href="/black-friday" className={styles.navHot}><span className={styles.ribbonDot} aria-hidden="true" />Black Friday</Link>
      <Link href="/black-friday#como-julgamos" className={styles.hideMobile}>Como julgamos</Link>
      <Link href="/#busca" className={styles.searchIcon} aria-label="Buscar produto"><Search size={18} strokeWidth={1.8} /></Link>
    </nav>
  </header>;
}
