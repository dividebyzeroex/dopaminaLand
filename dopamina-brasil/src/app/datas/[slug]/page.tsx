import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import studio from "@/components/studio.module.css";
import home from "@/components/home.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import Thermometer, { ThermometerSkeleton } from "@/components/price/Thermometer";
import Methodology from "@/components/price/Methodology";
import { EVENTS, eventBySlug, eventLabel, occurrence, todaySP } from "@/lib/events";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 10800;
// Só as datas do calendário existem; qualquer outro endereço é 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return EVENTS.map(e => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = eventBySlug((await params).slug);
  if (!event) return { title: "Data não encontrada", robots: { index: false } };
  const { date } = occurrence(event, todaySP());
  const year = date.slice(0, 4);
  return {
    title: `${event.name} ${year}: termômetro de descontos reais e maquiados`,
    description: `Veredito honesto para os presentes e produtos mais procurados no ${event.name}: veja quais estão abaixo do preço normal e quais subiram antes de “cair”.`,
    alternates: { canonical: `/datas/${event.slug}` },
  };
}

const longDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" });

export default async function EventPage({ params }: Props) {
  const event = eventBySlug((await params).slug);
  if (!event) notFound();
  const today = todaySP();
  const o = occurrence(event, today);
  const live = o.start <= today && today <= o.end;

  return <main className={studio.shell} style={{ "--accent": event.accent } as CSSProperties}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section className={home.hero}>
        <div className={home.heroCopy}>
          <Link href="/datas" className={home.pill}><span className={home.pillDot} aria-hidden="true" />{live ? eventLabel(o) : `${event.name} ${o.date.slice(0, 4)} · ${longDate(o.date)}`}</Link>
          <h1 className={home.title}>{event.copy.title} <span>{event.copy.titleSoft}</span></h1>
          <p className={home.lead}>{event.copy.lead}</p>
          <SearchBox id={`busca-${event.slug}`} suggestions={event.suggestions} />
          {!live && <p className={home.footnote}>A campanha desta data começa em {longDate(o.start)}. Até lá, a lista abaixo já mistura ideias de presente com o que está sendo procurado agora.</p>}
        </div>
      </section>

      <div className={`${home.head} ${home.headTight}`}>
        <div><span className={home.kicker}>Termômetro · {event.name}</span><h2>{event.copy.thermometerTitle}</h2></div>
        <p>A lista mistura ideias de presente da data com o que as pessoas estão procurando agora, e muda a cada 3 horas.</p>
      </div>
      <Suspense fallback={<ThermometerSkeleton count={8} />}><Thermometer eventId={event.id} /></Suspense>

      <Methodology />
      <SiteFooter />
    </div>
  </main>;
}
