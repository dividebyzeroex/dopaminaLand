import Link from "next/link";
import type { SearchHit } from "@/lib/buscape";
import type { Verdict } from "@/lib/price-verdict";
import { brl, signedPct } from "@/lib/format";
import ProductVisual from "../ProductVisual";
import VerdictBadge from "./VerdictBadge";
import Sparkline, { TONE_COLOR } from "./Sparkline";
import styles from "../bf.module.css";

type Props = {
  hit: SearchHit;
  verdict: Verdict | null;
  name?: string;
  image?: string;
  price?: number | null;
  storeCount?: number | null;
  note?: string;
  /** Preços diários para o minigráfico (o último é o de agora). */
  series?: number[];
  /** Veredito ainda sendo calculado (busca em duas etapas). */
  checking?: boolean;
};

export default function ProductCard({ hit, verdict, name, image, price, storeCount, note, series, checking }: Props) {
  const title = name ?? hit.name;
  const value = price ?? verdict?.current ?? hit.price;
  const stores = storeCount ?? hit.storeCount;
  const where = hit.store
    ? <>Oferta avulsa na <b>{hit.store}</b></>
    : stores ? <>{stores} {stores === 1 ? "loja" : "lojas"}</> : null;

  const body = <>
    <div className={styles.cardVisual}>
      {verdict && <VerdictBadge tone={verdict.tone} label={verdict.label} small />}
      {checking && <span className={styles.checking} aria-live="polite">Checando histórico…</span>}
      <ProductVisual src={image ?? hit.image} name={title} />
    </div>
    <div className={styles.cardBody}>
      <span className={styles.cardMeta}>{note}{note && where ? " · " : ""}{where}{hit.cashback ? <> · cashback {brl(hit.cashback)}</> : null}</span>
      <h3>{title}</h3>
      <strong className={styles.cardPrice}>{brl(value)}</strong>
      {verdict && series && series.length > 1 && <div className={styles.cardSpark}><Sparkline prices={series} tone={verdict.tone} /></div>}
      {verdict && verdict.kind !== "insuficiente" && verdict.vsMedian !== null && verdict.median
        ? <p className={styles.cardVerdict}><b style={{ color: TONE_COLOR[verdict.tone] }}>{signedPct(verdict.vsMedian)}</b> vs. típico de {brl(verdict.median)}</p>
        : hit.store ? <p className={styles.cardVerdict}>Sem histórico: oferta de uma loja só.</p> : null}
    </div>
  </>;

  return hit.path
    ? <Link href={`/produto/${hit.path}`} className={styles.card}>{body}</Link>
    : <a href={hit.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className={styles.card}>{body}</a>;
}
