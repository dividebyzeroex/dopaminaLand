import type { Metadata } from "next";
import studio from "@/components/studio.module.css";
import home from "@/components/home.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import MyAlerts from "@/components/pwa/MyAlerts";

export const metadata: Metadata = { title: "Meus alertas de preço", robots: { index: false } };

export default function AlertsPage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section className={home.hero} style={{ paddingBottom: 24 }}>
        <div className={home.heroCopy}>
          <span className={home.kicker}>Neste aparelho</span>
          <h1 className={home.title} style={{ fontSize: "clamp(38px, 5vw, 64px)" }}>Meus alertas <span>de preço.</span></h1>
          <p className={home.lead}>Checamos cada produto todos os dias e avisamos quando o preço baixa, sobe ou fica estável por uma semana.</p>
        </div>
      </section>
      <MyAlerts />
      <SiteFooter />
    </div>
  </main>;
}
