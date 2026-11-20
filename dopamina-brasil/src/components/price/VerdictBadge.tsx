import type { VerdictTone } from "@/lib/price-verdict";
import styles from "../bf.module.css";

export default function VerdictBadge({ tone, label, small = false }: { tone: VerdictTone; label: string; small?: boolean }) {
  return <span className={`${styles.badge} ${styles[tone]} ${small ? styles.badgeSmall : ""}`}>{label}</span>;
}
