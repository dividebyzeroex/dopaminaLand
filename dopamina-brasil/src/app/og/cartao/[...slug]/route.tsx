/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) só aceita <img>, não next/image. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeProduct } from "@/lib/analysis";
import { isSafeProductPath } from "@/lib/buscape";
import { brl, signedPct } from "@/lib/format";
import { displaySeries, stepGeometry } from "@/lib/series";
import { decisionOf, type VerdictTone } from "@/lib/price-verdict";
import { photo } from "@/lib/og-photo";

/**
 * Cartão de Raio-X para postar no story (1080×1920) ou no feed (1080×1350, com ?f=feed):
 * veredito, preço, gráfico e os três números que explicam. Tema escuro da marca.
 */
// Fonte da marca para títulos e números (o texto corrido usa a fonte padrão). Lida uma vez.
const archivo = await readFile(join(process.cwd(), "src/lib/og-fonts/ArchivoBlack.ttf")).catch(() => null);
const fonts = archivo ? [{ name: "Archivo Black", data: archivo, style: "normal" as const, weight: 400 as const }] : undefined;
const HEAD = archivo ? { fontFamily: "Archivo Black" } : { fontWeight: 800 as const };

const CACHE = { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" };
const INK = "#f4f2ec";
const DIM = "#a6a99f";
// "fill" é rgba explícito: o Satori não aplica fillOpacity em cima de uma cor sólida.
const TONES: Record<VerdictTone, { fg: string; bg: string; fill: string }> = {
  good: { fg: "#6fe3a5", bg: "#46d68c26", fill: "rgba(111,227,165,0.10)" },
  bad: { fg: "#ff8a6e", bg: "#ff5a3630", fill: "rgba(255,138,110,0.10)" },
  warn: { fg: "#ffc46b", bg: "#f2b45c26", fill: "rgba(255,196,107,0.10)" },
  neutral: { fg: "#d9d8d1", bg: "#ffffff18", fill: "rgba(217,216,209,0.08)" },
};

function Fallback({ height }: { height: number }) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0f100e", color: INK }}>
      <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>dopamina.</div>
      <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 30 }}>Antes da dopamina, o histórico.</div>
    </div>,
    { width: 1080, height, headers: CACHE, fonts },
  );
}

const Stat = ({ label, value, color = INK }: { label: string; value: string; color?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "22px 24px", borderRadius: 24, background: "#1b1c19", border: "2px solid #ffffff1f" }}>
    <div style={{ display: "flex", fontSize: 24, color: DIM }}>{label}</div>
    <div style={{ display: "flex", fontSize: 38, marginTop: 8, color, ...HEAD }}>{value}</div>
  </div>
);

export async function GET(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const feed = new URL(req.url).searchParams.get("f") === "feed";
  const height = feed ? 1350 : 1920;
  const { slug } = await params;
  const path = slug.map(part => decodeURIComponent(part).toLowerCase()).join("/");
  const data = isSafeProductPath(path) ? await analyzeProduct(path).catch(() => null) : null;
  if (!data) return Fallback({ height });

  const { product, history, verdict } = data;
  const tone = TONES[verdict.tone];
  const today = product.checkedAt.slice(0, 10);
  const prices = displaySeries(history, product.bestPrice, today).slice(-40).map(p => p.price);
  const W = 928, H = feed ? 210 : 270;
  const chart = prices.length > 1 ? stepGeometry(prices, W, H, 10) : null;
  const img = await photo(product.image);
  const checked = new Date(product.checkedAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
  const name = product.name.length > 64 ? `${product.name.slice(0, 62)}…` : product.name;
  const decision = decisionOf(verdict.kind).replace(/\.$/, "");
  const delta = verdict.kind === "maquiado" && verdict.recentPeak && verdict.baseline
    ? `Subiu ${Math.round(((verdict.recentPeak - verdict.baseline) / verdict.baseline) * 100)}% antes de “cair”`
    : verdict.vsMedian !== null && verdict.median ? `${signedPct(verdict.vsMedian)} vs. o preço típico` : verdict.headline;
  const pad = feed ? "60px 76px 54px" : "250px 76px 250px";

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0f100e", color: INK, padding: pad }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: 44, ...HEAD }}>dopamina<span style={{ color: "#ff5a36" }}>.</span></div>
        <div style={{ display: "flex", padding: "12px 20px", borderRadius: 999, border: "2px solid #ffffff1f", color: DIM, fontSize: 22, ...HEAD }}>RAIO-X</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: feed ? 26 : 56 }}>
        <div style={{ display: "flex", fontSize: 26, color: "#ff5a36", letterSpacing: 3, ...HEAD }}>{`VEREDITO DOPAMINA · ${checked}`}</div>
        <div style={{ display: "flex", fontSize: feed ? 92 : 104, color: tone.fg, marginTop: 14, lineHeight: 1.02, ...HEAD }}>{`${decision}.`}</div>
        <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 20, padding: "10px 22px", borderRadius: 999, background: tone.bg, color: tone.fg, fontSize: 28, ...HEAD }}>{verdict.label}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: feed ? 28 : 52 }}>
        {img && <div style={{ display: "flex", width: feed ? 170 : 220, height: feed ? 170 : 220, borderRadius: 32, background: "#ffffff", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src={img} alt="" width={feed ? 140 : 180} height={feed ? 140 : 180} style={{ objectFit: "contain" }} />
        </div>}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: feed ? 30 : 34, lineHeight: 1.2 }}>{name}</div>
          <div style={{ display: "flex", fontSize: feed ? 68 : 80, marginTop: 8, ...HEAD }}>{product.bestPrice ? brl(product.bestPrice) : "—"}</div>
          <div style={{ display: "flex", fontSize: 26, color: tone.fg, fontWeight: 600 }}>{delta}</div>
        </div>
      </div>

      {chart && <div style={{ display: "flex", marginTop: feed ? 22 : 40, padding: "20px 0", borderRadius: 28, background: "#1b1c19", border: "2px solid #ffffff1f", justifyContent: "center" }}>
        <svg width={W - 40} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d={chart.area} fill={tone.fill} />
          {verdict.median && <line x1={10} x2={W - 10} y1={chart.y(verdict.median)} y2={chart.y(verdict.median)} stroke="#8b9087" strokeWidth={2} strokeDasharray="8 8" />}
          <path d={chart.path} fill="none" stroke={INK} strokeWidth={5} />
          <circle cx={chart.x(prices.length - 1)} cy={chart.y(prices[prices.length - 1])} r={12} fill="#4a68ff" stroke="#1b1c19" strokeWidth={4} />
        </svg>
      </div>}

      {verdict.median && verdict.min && <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
        <Stat label="Hoje" value={brl(verdict.current)} />
        <Stat label="Preço típico" value={brl(verdict.median)} />
        <Stat label="Mínimo" value={brl(verdict.min)} color="#6fe3a5" />
      </div>}

      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
        <div style={{ display: "flex", fontSize: 26, color: DIM, letterSpacing: 2, ...HEAD }}>ANTES DA DOPAMINA, O HISTÓRICO.</div>
        <div style={{ display: "flex", fontSize: 24, color: DIM, marginTop: 10 }}>{`dopaminado.com.br · ${prices.length} dias de histórico, consultado em ${checked}. Preços mudam ao longo do dia; confira na loja antes de pagar.`}</div>
      </div>
    </div>,
    { width: 1080, height, headers: CACHE, fonts },
  );
}
