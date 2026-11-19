import { stepGeometry } from "@/lib/series";
import type { VerdictTone } from "@/lib/price-verdict";

export const TONE_COLOR: Record<VerdictTone, string> = { good: "#1d7a4b", bad: "#b3261e", warn: "#8a5200", neutral: "#4c5049" };

/** Minigráfico dos últimos dias (decorativo: o texto ao lado traz os números). */
export default function Sparkline({ prices, tone }: { prices: number[]; tone: VerdictTone }) {
  if (prices.length < 2) return null;
  const { path, x, y } = stepGeometry(prices, 200, 52);
  const last = prices.length - 1;
  return <svg viewBox="0 0 200 52" aria-hidden="true" style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
    <path d={path} fill="none" stroke={TONE_COLOR[tone]} strokeWidth="2" strokeLinejoin="round" />
    <circle cx={x(last)} cy={y(prices[last])} r="3.5" fill={TONE_COLOR[tone]}/>
  </svg>;
}
