import type { Metadata } from "next";
import Link from "next/link";
import studio from "@/components/studio.module.css";
import home from "@/components/home.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import MyList from "@/components/list/MyList";

export const metadata: Metadata = { title: "Minha lista", robots: { index: false } };

export default function ListPage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section className={home.hero} style={{ paddingBottom: 16 }}>
        <div className={home.heroCopy}>
          <span className={home.kicker}>Neste aparelho</span>
          <h1 className={home.title} style={{ fontSize: "clamp(38px, 5vw, 64px)" }}>Minha lista</h1>
          <p className={home.lead}>O que você salvou e os alertas que criou, com quanto o preço mudou desde então. <Link href="/alertas" style={{ color: "inherit" }}>Configurar avisos</Link>.</p>
        </div>
      </section>
      <MyList />
      <SiteFooter />
    </div>
  </main>;
}
