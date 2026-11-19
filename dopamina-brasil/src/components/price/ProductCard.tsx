import Link from "next/link";
import type { SearchHit } from "@/lib/buscape";
import type { Verdict } from "@/lib/price-verdict";
import { brl, signedPct } from "@/lib/format";
import ProductVisual from "../ProductVisual";
import VerdictBadge from "./VerdictBadge";
import styles from "../bf.module.css";

type Props = { hit: SearchHit; verdict: Verdict | null; name?: string; image?: string; price?: number | null; storeCount?: number | null; note?: string };

export default function ProductCard({ hit, verdict, name, image, price, storeCount, note }: Props) {
  const title = name ?? hit.name;
  const value = price ?? verdict?.current ?? hit.price;
  const stores = storeCount ?? hit.storeCount;
  const body = <>
    <div className={styles.cardVisual}>
      {verdict && <VerdictBadge tone={verdict.tone} label={verdict.label} small />}
      <ProductVisual src={image ?? hit.image} name={title} />
    </div>
    {note && <span className={styles.cardMeta} style={{ marginTop: 12 }}>{note}</span>}
    <h3>{title}</h3>
    <strong>{brl(value)}</strong>
    <p className={styles.cardMeta}>
      {hit.store ? <>Oferta avulsa na <b>{hit.store}</b> · sem histórico</> : stores ? <>{stores} {stores === 1 ? "loja" : "lojas"}</> : "Menor preço encontrado"}
      {hit.cashback ? <> · cashback {brl(hit.cashback)}</> : null}
      {hit.rating ? <> · nota <b>{hit.rating.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</b></> : null}
    </p>
    {verdict && verdict.kind !== "insuficiente" && verdict.vsMedian !== null && verdict.median &&
      <p className={styles.cardVerdict}>{signedPct(verdict.vsMedian)} vs. preço típico de {brl(verdict.median)}</p>}
  </>;

  return hit.path
    ? <Link href={`/produto/${hit.path}`} className={styles.card}>{body}</Link>
    : <a href={hit.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.card}>{body}</a>;
}
