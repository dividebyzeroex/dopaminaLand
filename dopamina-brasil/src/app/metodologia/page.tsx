import type { Metadata } from "next";
import studio from "@/components/studio.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import Methodology from "@/components/price/Methodology";

export const metadata: Metadata = {
  title: "Como julgamos cada preço",
  description: "As regras abertas do veredito do Dopamina: desconto real, abaixo do normal, desconto maquiado, preço comum e acima do normal.",
  alternates: { canonical: "/metodologia" },
};

export default function MethodologyPage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <Methodology />
      <SiteFooter />
    </div>
  </main>;
}
