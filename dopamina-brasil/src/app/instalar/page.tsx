import type { Metadata } from "next";
import studio from "@/components/studio.module.css";
import home from "@/components/home.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import InstallSteps from "@/components/pwa/InstallSteps";

export const metadata: Metadata = {
  title: "Instalar o app do Dopamina",
  description: "Coloque o Dopamina na tela inicial do iPhone ou do Android e receba alertas quando o preço cair.",
  alternates: { canonical: "/instalar" },
};

export default function InstallPage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section className={home.hero} style={{ paddingBottom: 20 }}>
        <div className={home.heroCopy}>
          <span className={home.kicker}>App grátis · sem loja de aplicativos</span>
          <h1 className={home.title} style={{ fontSize: "clamp(38px, 5vw, 64px)" }}>Instale o Dopamina <span>na tela inicial.</span></h1>
          <p className={home.lead}>Com o app instalado, você recebe uma notificação quando o preço de um produto que acompanha baixa, sobe ou fica estável, mesmo sem abrir o app.</p>
        </div>
      </section>
      <div style={{ maxWidth: 560, marginBottom: 64, background: "#fff", borderRadius: 20, padding: 22 }}><InstallSteps /></div>
      <SiteFooter />
    </div>
  </main>;
}
