import type { Metadata } from "next";
import Link from "next/link";
import studio from "@/components/studio.module.css";
import home from "@/components/home.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import { activeEvent, todaySP, upcomingEvents } from "@/lib/events";

export const revalidate = 10800;

export const metadata: Metadata = {
  title: "Calendário de datas comerciais: Natal, Dia das Mães, Black Friday e mais",
  description: "As datas que mais movimentam o varejo, com termômetro de preços e veredito honesto para cada uma.",
  alternates: { canonical: "/datas" },
};

const longDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function DatesPage() {
  const today = todaySP();
  const active = activeEvent(today);
  const list = upcomingEvents(today);

  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section className={home.hero}>
        <div className={home.heroCopy}>
          <span className={home.kicker}>Calendário</span>
          <h1 className={home.title} style={{ fontSize: "clamp(40px, 5.4vw, 72px)" }}>Toda data de oferta, <span>com o preço checado.</span></h1>
          <p className={home.lead}>O site muda sozinho para a próxima data que movimenta o varejo: ideias de presente, termômetro e veredito de cada uma.</p>
        </div>
      </section>
      <section className={home.rules} style={{ margin: "36px 0 64px" }} aria-label="Próximas datas">
        {list.map(o => {
          const live = active?.event.id === o.event.id;
          return <Link key={o.event.id} href={`/datas/${o.event.slug}`} className={home.rule} style={{ textDecoration: "none", color: "inherit", borderTop: `4px solid ${o.event.accent}` }}>
            <span className={home.kicker}>{live ? "Em campanha agora" : o.daysLeft === 0 ? "Hoje" : `Faltam ${o.daysLeft} dias`}</span>
            <h2 style={{ margin: 0, fontSize: 24, letterSpacing: "-.03em" }}>{o.event.name}</h2>
            <p>{longDate(o.date)}</p>
            <span className={styles.storeLink} style={{ alignSelf: "flex-start", background: live ? o.event.accent : undefined }}>Ver termômetro →</span>
          </Link>;
        })}
      </section>
      <SiteFooter />
    </div>
  </main>;
}
