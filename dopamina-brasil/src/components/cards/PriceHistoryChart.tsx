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
        <div className="flex-1 flex flex-col pl-12 pr-4"> {/* Added padding for absolute Y-axis and right tooltip */}
          <div className="relative flex-1 min-h-[220px]">
            
            {/* Y Axis HTML Labels (Absolute positioned) */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const priceAtGrid = max - (range * pct);
              return (
                <div 
                  key={`y-label-${i}`}
                  className="absolute left-[-50px] w-[42px] text-right text-[10px] text-muted-foreground/60"
                  style={{ top: `${pct * 100}%`, transform: 'translateY(-50%)' }}
                >
                  {formatBRL(priceAtGrid).replace(',00', '')}
                </div>
              );
            })}

            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
              {/* Y Axis Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <line
                  key={`y-grid-${i}`}
                  x1={0} y1={pct * 200} x2={600} y2={pct * 200}
                  stroke="#f1f5f9" strokeWidth={1}
                />
              ))}

              {/* Area fill */}
              <path 
                d={`${pathD} L 600 200 L 0 200 Z`} 
                fill="url(#buscapeAreaGradient)" 
              />

              {/* Step Line */}
              <path 
                d={pathD} 
                fill="none" 
                stroke="#00C853" 
                strokeWidth={2.5} 
                strokeLinejoin="round" 
              />
              
              <defs>
                <linearGradient id="buscapeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C853" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#00C853" stopOpacity={0.02} />
                </linearGradient>
              </defs>
            </svg>

            {/* Current Price Floating Badge (HTML positioned over SVG) */}
            {points.length > 0 && (
              <div 
                className="absolute right-0 flex items-center justify-end pointer-events-none"
                style={{ 
                  top: `${(toY(points[points.length - 1].price) / 200) * 100}%`,
                  transform: 'translate(10px, -50%)' // Slightly offset to the right, centered vertically on the line
                }}
              >
                <div className="relative mr-3 bg-white border border-[#e2e8f0] rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.05)] px-3 py-1.5 flex flex-col items-center min-w-[85px]">
                  <span className="text-sm font-black text-foreground">{formatBRL(currentPrice)}</span>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase">Agora</span>
                  
                  {/* Little triangle pointing to the dot */}
                  <div className="absolute top-1/2 -right-[5px] -mt-[5px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-white" />
                  <div className="absolute top-1/2 -right-[6px] -mt-[5px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-[#e2e8f0] -z-10" />
                </div>
                
                {/* Marker Dot (Black circle) */}
                <div className="w-2.5 h-2.5 bg-black rounded-full shrink-0 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1.5 bg-black rounded-full -rotate-12" />
                </div>
              </div>
            )}

            {/* X Axis Labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[11px] text-muted-foreground/70">
              {points.map((p, i) => {
                // Show roughly 6 labels
                if (points.length > 6 && i % Math.ceil(points.length / 6) !== 0 && i !== points.length - 1 && i !== 0) return null;
                return (
                  <span key={`x-label-${i}`} style={{ position: 'absolute', left: `${(i / (points.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
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
