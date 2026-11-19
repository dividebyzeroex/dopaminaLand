import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";

export default function Loading() {
  return <main className={studio.shell} aria-busy="true">
    <div className={studio.wrap}>
      <SiteHeader />
      <section className={styles.productHero}>
        <div className={`${styles.productVisualBox} ${styles.skeleton}`} />
        <div>
          <span className={studio.eyebrow}>Lendo o histórico de preço…</span>
          <div className={styles.skeleton} style={{ height: 44, width: "85%", marginTop: 16 }} />
          <div className={styles.skeleton} style={{ height: 52, width: "45%", marginTop: 22 }} />
          <div className={styles.skeleton} style={{ height: 170, marginTop: 24 }} />
        </div>
      </section>
    </div>
  </main>;
}
