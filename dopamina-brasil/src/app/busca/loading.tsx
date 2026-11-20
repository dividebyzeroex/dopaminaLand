import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";

export default function Loading() {
  return <main className={studio.shell} aria-busy="true">
    <div className={studio.wrap}>
      <SiteHeader />
      <section style={{ padding: "44px 0 30px", maxWidth: 640 }}>
        <span className={studio.eyebrow}>Consultando lojas e histórico de preços…</span>
        <div className={styles.skeleton} style={{ height: 44, width: "70%", marginTop: 18 }} />
        <div className={styles.skeleton} style={{ height: 62, marginTop: 26, borderRadius: 16 }} />
      </section>
      <section className={styles.grid} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => <div key={i}><div className={styles.skeleton} style={{ height: 210 }} /><div className={styles.skeleton} style={{ height: 14, marginTop: 16, width: "85%" }} /><div className={styles.skeleton} style={{ height: 22, marginTop: 12, width: "45%" }} /></div>)}
      </section>
    </div>
  </main>;
}
