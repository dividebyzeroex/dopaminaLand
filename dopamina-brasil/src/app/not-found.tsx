import Link from "next/link";
import styles from "@/components/studio.module.css";

export default function NotFound() {
  return <main className={styles.shell}>
    <div className={styles.wrap}>
      <header className={styles.nav}><Link href="/" className={styles.brand}>dopamina</Link></header>
      <section className={styles.reportHero}>
        <span className={styles.eyebrow}>Erro 404</span>
        <h1>Esta página<br />não existe.</h1>
        <p className={styles.intro}>O link pode ter mudado. Que tal pesquisar o produto que você procura e ver o histórico de preço?</p>
        <Link href="/" className={styles.blueLink}>Voltar para a busca</Link>
      </section>
    </div>
  </main>;
}
