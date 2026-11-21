import Link from "next/link";
import type { SearchHit } from "@/lib/buscape";
import type { Verdict } from "@/lib/price-verdict";
import { brl, shortDate, signedPct } from "@/lib/format";
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
  /** Ficha curta extraída do título (capacidade, armazenamento...). */
  specs?: string[];
  /** Quantas outras versões (cor, voltagem) foram agrupadas neste card. */
  versions?: number;
  /** "row": lista de uma coluna com imagem à esquerda (busca). */
  layout?: "grid" | "row";
};

export default function ProductCard({ hit, verdict, name, image, price, storeCount, note, series, checking, specs = [], versions = 0, layout = "grid" }: Props) {
  const title = name ?? hit.name;
  const value = price ?? verdict?.current ?? hit.price;
  const stores = storeCount ?? hit.storeCount;
  const where = hit.store
    ? <>Oferta avulsa na <b>{hit.store}</b></>
    : stores ? <>{stores} {stores === 1 ? "loja" : "lojas"}</> : null;

  const badge = <>
    {verdict && <VerdictBadge tone={verdict.tone} label={verdict.label} small />}
    {checking && <span className={styles.checking} aria-live="polite">Checando histórico…</span>}
  </>;
  const cls = layout === "row" ? `${styles.card} ${styles.cardRow}` : styles.card;
  const body = <>
    <div className={styles.cardVisual}>
      {layout === "grid" && badge}
      <ProductVisual src={image ?? hit.image} name={title} />
    </div>
    <div className={styles.cardBody}>
      {layout === "row" && (verdict || checking) && <div className={styles.rowBadge}>{badge}</div>}
      <span className={styles.cardMeta}>{note}{note && where ? " · " : ""}{where}{hit.cashback ? <> · cashback {brl(hit.cashback)}</> : null}</span>
      <h3>{title}</h3>
      {(specs.length > 0 || versions > 0) && <p className={styles.specs}>
        {specs.map(spec => <span key={spec}>{spec}</span>)}
        {versions > 0 && <span className={styles.versions}>+{versions} {versions === 1 ? "versão" : "versões"}</span>}
      </p>}
      <strong className={styles.cardPrice}>{brl(value)}</strong>
      {verdict && series && series.length > 1 && <div className={styles.cardSpark}><Sparkline prices={series} tone={verdict.tone} /></div>}
      {verdict?.kind === "maquiado" && verdict.recentPeak && verdict.recentPeakDate
        // "0% vs. típico" com selo de maquiado confunde: o que importa é o pico antes da "queda".
        ? <p className={styles.cardVerdict}>Subiu para <b style={{ color: TONE_COLOR.bad }}>{brl(verdict.recentPeak)}</b> em {shortDate(verdict.recentPeakDate)} e voltou ao preço de antes.</p>
        : verdict && verdict.kind !== "insuficiente" && verdict.vsMedian !== null && verdict.median
        ? <p className={styles.cardVerdict}><b style={{ color: TONE_COLOR[verdict.tone] }}>{signedPct(verdict.vsMedian)}</b> vs. típico de {brl(verdict.median)}</p>
        : hit.store ? <p className={styles.cardVerdict}>Sem histórico: oferta de uma loja só.</p> : null}
    </div>
  </>;

  return hit.path
    ? <Link href={`/produto/${hit.path}`} className={cls}>{body}</Link>
    : <a href={hit.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className={cls}>{body}</a>;
}
