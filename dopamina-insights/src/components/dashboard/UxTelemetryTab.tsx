import React, { useMemo, useState } from 'react';
import { MousePointer2, AlertTriangle, Clock, Target, Activity, Zap, ShieldAlert, CheckCircle2, Monitor, Smartphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UxMetrics {
  avgDwellTime: number;
  rageClicksCount: number;
  scrollDepthMap: any[];
  deadClicksCount: number;
  frustrationCount: number;
  jsErrors: any[];
  webVitals: {
    lcp: number;
    cls: number;
    fid: number;
    inp: number;
    ttfb: number;
    fcp: number;
  };
  heatmapData: any[];
  visibilityImpressions: any[];
}

export default function UxTelemetryTab({ uxMetrics }: { uxMetrics: UxMetrics }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Extract unique paths for the dropdown
  const uniquePaths = useMemo(() => {
    const paths = new Set<string>();
    uxMetrics.heatmapData.forEach(p => p.path && paths.add(p.path));
    return Array.from(paths).sort();
  }, [uxMetrics.heatmapData]);
  
  const [selectedPath, setSelectedPath] = useState<string>(uniquePaths.length > 0 ? uniquePaths[0] : '/');

  // Filter heatmap points for the selected path and device
  const heatmapNodes = useMemo(() => {
    const isDesktop = device === 'desktop';
    
    // Desktop: vw > 768. Mobile: vw <= 768
    const filtered = uxMetrics.heatmapData.filter(p => {
      if (p.path !== selectedPath) return false;
      const pointIsDesktop = p.vw > 768;
      return isDesktop ? pointIsDesktop : !pointIsDesktop;
    });

    return filtered.slice(-2000).map((point, i) => {
      // For absolute pageX plotting, we use the original viewport width to scale the X coordinate
      // to match our container width.
      // Container width is 1024px for Desktop, 375px for Mobile.
      const containerWidth = isDesktop ? 1024 : 375;
      
      const leftPercent = Math.min(Math.max((point.x / point.vw) * 100, 0), 100);
      const topPx = point.y;
      
      const isClick = point.type === 'heatmap_click';
      
      return (
        <div
          key={i}
          className={`absolute rounded-full mix-blend-screen pointer-events-none ${
            isClick ? 'bg-red-500 w-4 h-4 blur-[2px] opacity-80 z-20' : 'bg-blue-400 w-3 h-3 blur-[4px] opacity-40 z-10'
          }`}
          style={{ left: `${leftPercent}%`, top: `${topPx}px`, transform: 'translate(-50%, -50%)' }}
        />
      );
    });
  }, [uxMetrics.heatmapData, selectedPath, device]);

  const formatMs = (ms: number) => ms > 0 ? `${ms}ms` : 'N/A';

  const containerWidthClass = device === 'desktop' ? 'w-full max-w-[1024px]' : 'w-full max-w-[375px]';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-500">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold">Avg. Dwell Time</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {uxMetrics.avgDwellTime}s
          </p>
          <p className="mt-1 text-sm text-muted">Tempo médio na página</p>
        </div>
        
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-orange-500">
            <MousePointer2 className="h-5 w-5" />
            <h3 className="font-semibold">Rage Clicks</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {uxMetrics.rageClicksCount}
          </p>
          <p className="mt-1 text-sm text-muted">Cliques múltiplos rápidos</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-amber-500">
            <Target className="h-5 w-5" />
            <h3 className="font-semibold">Dead Clicks</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {uxMetrics.deadClicksCount}
          </p>
          <p className="mt-1 text-sm text-muted">Cliques em elementos neutros</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-rose-500">
            <Activity className="h-5 w-5" />
            <h3 className="font-semibold">Mouse Frustration</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {uxMetrics.frustrationCount}
          </p>
          <p className="mt-1 text-sm text-muted">Mouse Jiggle (Confusão)</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heatmap Section - Takes full width now */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-bold text-foreground">Mapa de Calor Real</h3>
              
              <div className="flex flex-wrap items-center gap-4">
                <select 
                  value={selectedPath} 
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="bg-background border border-border rounded p-2 text-sm text-foreground focus:outline-none focus:border-neon"
                >
                  {uniquePaths.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  {uniquePaths.length === 0 && <option value="/">/</option>}
                </select>

                <div className="flex bg-background rounded border border-border overflow-hidden p-1 gap-1">
                  <button 
                    onClick={() => setDevice('desktop')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${device === 'desktop' ? 'bg-neon text-black' : 'text-muted hover:text-foreground'}`}
                  >
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                  <button 
                    onClick={() => setDevice('mobile')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${device === 'mobile' ? 'bg-neon text-black' : 'text-muted hover:text-foreground'}`}
                  >
                    <Smartphone className="w-4 h-4" /> Mobile
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center bg-black/50 p-4 rounded-xl border border-border relative overflow-hidden">
              {/* This wrapper limits the height so we can scroll the heatmap naturally */}
              <div className={`relative bg-background overflow-y-auto overflow-x-hidden border border-border/50 rounded shadow-2xl h-[700px] custom-scrollbar ${containerWidthClass}`}>
                
                {/* The Iframe of the real site */}
                <iframe 
                  src={`http://localhost:3000${selectedPath}${selectedPath.includes('?') ? '&' : '?'}heatmap=true`} 
                  className="w-full pointer-events-none" 
                  style={{ height: '5000px', border: 'none' }} // Massive height so iframe doesn't scroll internally
                  title="Heatmap Target"
                />

                {/* The Overlay where points are plotted */}
                <div className="absolute top-0 left-0 w-full" style={{ height: '5000px', pointerEvents: 'none' }}>
                  {heatmapNodes.length > 0 ? heatmapNodes : (
                    <div className="flex items-center justify-center h-[500px] text-muted text-sm bg-background/80 backdrop-blur-sm">
                      Nenhum dado capturado para esta tela neste dispositivo.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
              <span className="flex items-center gap-2 text-red-400"><div className="w-3 h-3 rounded-full bg-red-500 blur-[1px]"></div> Cliques</span>
              <span className="flex items-center gap-2 text-blue-400"><div className="w-3 h-3 rounded-full bg-blue-500 blur-[2px]"></div> Movimentos / Pausas</span>
            </div>
          </div>
        </div>

        {/* Web Vitals and Others */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-foreground">Core Web Vitals</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-lighter">
                <div>
                  <p className="font-semibold text-foreground">LCP</p>
                  <p className="text-xs text-muted">Largest Contentful Paint</p>
                </div>
                <div className={`font-mono font-bold ${uxMetrics.webVitals.lcp > 2500 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatMs(uxMetrics.webVitals.lcp)}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-lighter">
                <div>
                  <p className="font-semibold text-foreground">CLS</p>
                  <p className="text-xs text-muted">Cumulative Layout Shift</p>
                </div>
                <div className={`font-mono font-bold ${uxMetrics.webVitals.cls > 0.1 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {uxMetrics.webVitals.cls > 0 ? uxMetrics.webVitals.cls.toFixed(3) : 'N/A'}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-lighter">
                <div>
                  <p className="font-semibold text-foreground">FID / INP</p>
                  <p className="text-xs text-muted">Input Delay</p>
                </div>
                <div className={`font-mono font-bold ${uxMetrics.webVitals.fid > 100 || uxMetrics.webVitals.inp > 200 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatMs(uxMetrics.webVitals.inp || uxMetrics.webVitals.fid)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <h3 className="text-lg font-bold text-foreground">JS Errors</h3>
            </div>
            {uxMetrics.jsErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 opacity-50" />
                <p className="text-sm">Nenhum erro reportado.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {uxMetrics.jsErrors.map((err, i) => (
                  <div key={i} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                    <p className="font-bold text-rose-400 mb-1 truncate">{err.message}</p>
                    <p className="text-muted truncate">Path: {err.path}</p>
                    <p className="text-muted/50 mt-1">{new Date(err.time).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Profundidade de Scroll</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uxMetrics.scrollDepthMap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#CCFF00' }}
                    />
                    <Bar dataKey="value" fill="#CCFF00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Impressões (Visibilidade)</h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {uxMetrics.visibilityImpressions.length === 0 ? (
                  <p className="text-sm text-muted">Nenhum CTAs monitorado.</p>
                ) : (
                  uxMetrics.visibilityImpressions.map((imp, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-surface-lighter">
                      <span className="text-sm font-medium text-foreground truncate max-w-[70%]">
                        {imp.name}
                      </span>
                      <span className="text-sm font-bold text-neon bg-neon/10 px-2 py-1 rounded">
                        {imp.count} views
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
