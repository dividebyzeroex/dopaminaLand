/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) só aceita <img>, não next/image. */
import { ImageResponse } from "next/og";
import { analyzeProduct } from "@/lib/analysis";
import { isSafeProductPath } from "@/lib/buscape";
import { brl, signedPct } from "@/lib/format";
import { displaySeries, stepGeometry } from "@/lib/series";
import type { VerdictTone } from "@/lib/price-verdict";

/** Imagem de compartilhamento (1200×630) de cada produto: selo, preço e gráfico. */
const size = { width: 1200, height: 630 };
const CACHE = { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" };

const TONES: Record<VerdictTone, { fg: string; bg: string }> = {
  good: { fg: "#1d7a4b", bg: "#e3f1e8" },
  bad: { fg: "#b3261e", bg: "#f8e1de" },
  warn: { fg: "#8a5200", bg: "#f8ecd6" },
  neutral: { fg: "#4c5049", bg: "#e9ebe5" },
};

/** Baixa a foto antes; se falhar, a imagem sai sem foto em vez de quebrar. */
async function photo(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch { return null; }
}

function Fallback() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#f5f5f0", color: "#20211f" }}>
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -2 }}>dopamina</div>
      <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -4, marginTop: 24 }}>Desconto de verdade ou maquiagem?</div>
    </div>,
    { ...size, headers: CACHE },
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.map(part => decodeURIComponent(part).toLowerCase()).join("/");
  const data = isSafeProductPath(path) ? await analyzeProduct(path).catch(() => null) : null;
  if (!data) return Fallback();

  const { product, history, verdict } = data;
  const tone = TONES[verdict.tone];
  const today = product.checkedAt.slice(0, 10);
  const prices = displaySeries(history, product.bestPrice, today).slice(-40).map(p => p.price);
  const W = 1040, H = 170;
  const chart = prices.length > 1 ? stepGeometry(prices, W, H, 10) : null;
  const img = await photo(product.image);
  const checked = new Date(product.checkedAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const name = product.name.length > 70 ? `${product.name.slice(0, 68)}…` : product.name;
  const delta = verdict.kind === "maquiado" && verdict.recentPeak && verdict.baseline
    ? `Subiu ${Math.round(((verdict.recentPeak - verdict.baseline) / verdict.baseline) * 100)}% antes de “cair”`
    : verdict.vsMedian !== null && verdict.median ? `${signedPct(verdict.vsMedian)} vs. preço típico de ${brl(verdict.median)}` : verdict.headline;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f5f5f0", color: "#20211f", padding: "44px 80px 36px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.5 }}>dopamina</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 999, background: tone.bg, color: tone.fg, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: tone.fg }} />
          {verdict.label}
        </div>
      </div>

      <div style={{ display: "flex", gap: 36, marginTop: 28, alignItems: "center" }}>
        {img && <div style={{ width: 170, height: 170, borderRadius: 24, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src={img} alt="" width={140} height={140} style={{ objectFit: "contain" }} />
        </div>}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.2, letterSpacing: -1 }}>{name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 10 }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -3 }}>{product.bestPrice ? brl(product.bestPrice) : "—"}</div>
            <div style={{ fontSize: 28, color: tone.fg, fontWeight: 600 }}>{delta}</div>
          </div>
        </div>
      </div>

      {chart && <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 18 }}>
        <path d={chart.area} fill={tone.fg} fillOpacity={0.08} />
        {verdict.median && <line x1={10} x2={W - 10} y1={chart.y(verdict.median)} y2={chart.y(verdict.median)} stroke="#8b9087" strokeWidth={2} strokeDasharray="8 8" />}
        <path d={chart.path} fill="none" stroke="#20211f" strokeWidth={4} />
        <circle cx={chart.x(prices.length - 1)} cy={chart.y(prices[prices.length - 1])} r={11} fill="#2854ec" stroke="#ffffff" strokeWidth={4} />
      </svg>}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: 24, color: "#4c5049" }}>
        <div>{`Histórico de ${prices.length} dias · consulta em ${checked}`}</div>
        <div style={{ fontWeight: 600, color: "#20211f" }}>dopaminado.com.br</div>
      </div>
    </div>,
    { ...size, headers: CACHE },
  );
}
