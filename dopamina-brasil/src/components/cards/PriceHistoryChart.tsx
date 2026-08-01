import { useMemo, useState } from "react";
import { Info, BellRing, TrendingUp, TrendingDown } from "lucide-react";

interface PricePoint {
  month: string;
  price: number;
  label: string;
  status: string;
}

interface PriceHistoryChartProps {
  data: {
    price_history: PricePoint[];
    current_price: number;
    scraped_price: number;
  };
}

export default function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const history = data.price_history || [];
  const [timeRange, setTimeRange] = useState("6m");
  const [alertEnabled, setAlertEnabled] = useState(false);

  const chartData = useMemo(() => {
    if (history.length === 0) return { points: [], min: 0, max: 0, avg: 0 };
    const prices = history.map(h => h.price);
    const min = Math.min(...prices) * 0.95;
    const max = Math.max(...prices) * 1.05;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { points: history, min, max, avg };
  }, [history]);

  if (history.length === 0) return null;

  const { points, min, max, avg } = chartData;
  const range = max - min;
  const toY = (price: number) => ((max - price) / range) * 180;

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const currentPrice = data.current_price || points[points.length - 1].price;
  
  // Step Path (Buscapé uses straight lines that hold value then drop/rise)
  let pathD = "";
  if (points.length > 0) {
    pathD = `M 0 ${toY(points[0].price)}`;
    for (let i = 1; i < points.length; i++) {
      const prevX = ((i - 1) / (points.length - 1)) * 600;
      const currX = (i / (points.length - 1)) * 600;
      const prevY = toY(points[i - 1].price);
      const currY = toY(points[i].price);
      
      // Step: horizontal to next X, then vertical to next Y
      pathD += ` L ${currX} ${prevY} L ${currX} ${currY}`;
    }
  }

  // Calculate if price is good based on average
  let priceStatusText = "O preço está normal";
  let priceStatusColor = "text-blue-600";
  let iconBg = "bg-blue-600";
  // position on the gradient slider (0 to 100)
  // assuming min is 0, max is 100.
  // let's map: < avg = better (towards 0, green), > avg = worse (towards 100, orange)
  let sliderPos = 50;
  if (currentPrice < avg * 0.95) {
    priceStatusText = "O preço está excelente";
    priceStatusColor = "text-emerald-600";
    iconBg = "bg-emerald-600";
    sliderPos = 10;
  } else if (currentPrice < avg) {
    priceStatusText = "O preço está bom";
    priceStatusColor = "text-blue-600";
    iconBg = "bg-blue-600";
    sliderPos = 35;
  } else if (currentPrice > avg * 1.05) {
    priceStatusText = "O preço está alto";
    priceStatusColor = "text-orange-500";
    iconBg = "bg-orange-500";
    sliderPos = 90;
  } else {
    sliderPos = 50;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-foreground mb-6 font-[var(--font-display)]">Histórico de Preços</h2>
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Chart Column */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 min-h-[220px]">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Y Axis Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const priceAtGrid = max - (range * pct);
                return (
                  <g key={i}>
                    <line
                      x1={0} y1={pct * 180} x2={600} y2={pct * 180}
                      stroke="#f1f5f9" strokeWidth={1}
                    />
                    <text
                      x={-10} y={(pct * 180) + 4}
                      textAnchor="end"
                      className="text-[10px] fill-muted-foreground/60"
                    >
                      {formatBRL(priceAtGrid).replace(',00', '')}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path 
                d={`${pathD} L 600 180 L 0 180 Z`} 
                fill="url(#buscapeAreaGradient)" 
              />

              {/* Step Line */}
              <path 
                d={pathD} 
                fill="none" 
                stroke="#00C853" // Buscapé green
                strokeWidth={2.5} 
                strokeLinejoin="round" 
              />

              {/* Current Price Floating Badge (End of line) */}
              {points.length > 0 && (
                <g transform={`translate(600, ${toY(points[points.length - 1].price)})`}>
                  {/* Floating tooltip box */}
                  <rect x="-90" y="-55" width="85" height="45" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
                  <text x="-47.5" y="-30" textAnchor="middle" className="text-sm font-black fill-foreground">
                    {formatBRL(currentPrice)}
                  </text>
                  <text x="-47.5" y="-18" textAnchor="middle" className="text-[9px] font-medium fill-muted-foreground">
                    AGORA
                  </text>
                  
                  {/* Marker dot */}
                  <circle cx="0" cy="0" r="4" fill="black" />
                  <rect x="-6" y="-3" width="12" height="6" rx="3" fill="black" transform="rotate(-15)" />
                </g>
              )}

              <defs>
                <linearGradient id="buscapeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C853" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#00C853" stopOpacity={0.02} />
                </linearGradient>
              </defs>
            </svg>

            {/* X Axis Labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[11px] text-muted-foreground/70 px-1">
              {points.map((p, i) => {
                // Show roughly 6 labels
                if (points.length > 6 && i % Math.ceil(points.length / 6) !== 0 && i !== points.length - 1 && i !== 0) return null;
                return (
                  <span key={i} style={{ position: 'absolute', left: `${(i / (points.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                    {i === points.length - 1 ? "Hoje" : p.month}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Time Range Filters */}
          <div className="flex gap-2 mt-10">
            {['40 dias', '3 meses', '6 meses', '1 ano'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  timeRange === range 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-foreground hover:bg-slate-50 border-[#e2e8f0]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Info Column (Right) */}
        <div className="lg:w-80 flex flex-col gap-4">
          
          {/* Price Evaluation Card */}
          <div className="border border-[#e2e8f0] rounded-xl p-5 shadow-sm bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}>
                  <TrendingDown className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-[15px] text-foreground">
                  {priceStatusText.split(priceStatusText.split(' ').pop() || '')[0]}
                  <span className={priceStatusColor}>{priceStatusText.split(' ').pop()}</span>
                </h3>
              </div>
              <Info className="w-5 h-5 text-muted-foreground/50" />
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              Com base nos últimos 6 meses, o valor está próximo da média de {formatBRL(avg)}
            </p>

            {/* Gradient Slider */}
            <div className="relative pt-4 pb-2">
              <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500" />
              {/* Slider Thumb */}
              <div 
                className="absolute top-1/2 -mt-[5px] w-3 h-3 bg-white border-[2.5px] border-black rounded-full"
                style={{ left: `calc(${sliderPos}% - 6px)` }}
              />
              {/* Tiny triangle pointing down to thumb */}
              <div 
                className="absolute top-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-black"
                style={{ left: `calc(${sliderPos}% - 4px)` }}
              />
            </div>
          </div>

          {/* Price Alert Card */}
          <div className="border border-[#e2e8f0] rounded-xl p-5 shadow-sm bg-white flex items-center justify-between">
            <div className="flex flex-col gap-1 pr-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <BellRing className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-[14px] text-foreground">Quer pagar mais barato?</h3>
              </div>
              <p className="text-xs text-muted-foreground ml-8">Avisamos quando o preço baixar</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setAlertEnabled(!alertEnabled)}
              className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
                alertEnabled ? 'bg-[#00C853]' : 'bg-[#e2e8f0]'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
                alertEnabled ? 'left-[26px]' : 'left-[2px]'
              }`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
