import React, { useMemo } from 'react';
import { MousePointer2, AlertTriangle, Clock, Target, Activity, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
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
  
  const heatmapNodes = useMemo(() => {
    // Filter to limit points for performance
    return uxMetrics.heatmapData.slice(-1000).map((point, i) => {
      // Normalize X
      const left = Math.min(Math.max((point.x / point.vw) * 100, 0), 100);
      // Normalize Y (assume average page height is 2500px for the visualization)
      const maxPageHeight = 3000;
      const top = Math.min(Math.max((point.y / maxPageHeight) * 100, 0), 100);
      
      const isClick = point.type === 'heatmap_click';
      
      return (
        <div
          key={i}
          className={`absolute rounded-full mix-blend-screen pointer-events-none ${
            isClick ? 'bg-red-500 w-4 h-4 blur-[2px] opacity-80' : 'bg-blue-400 w-3 h-3 blur-[4px] opacity-30'
          }`}
          style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
        />
      );
    });
  }, [uxMetrics.heatmapData]);

  const formatMs = (ms: number) => ms > 0 ? `${ms}ms` : 'N/A';

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
        {/* Web Vitals */}
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
              <h3 className="text-lg font-bold text-foreground">JS Errors (Silenciosos)</h3>
            </div>
            {uxMetrics.jsErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 opacity-50" />
                <p className="text-sm">Nenhum erro de JS capturado.</p>
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

        {/* Heatmap & Scroll */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Scatter Heatmap (Simulado)</h3>
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Cliques</span>
                <span className="flex items-center gap-1 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Movimentos</span>
              </div>
            </div>
            
            <div className="relative w-full h-[500px] bg-background border border-border rounded-lg overflow-hidden flex flex-col">
              {/* Mock skeleton of a generic page for reference */}
              <div className="w-full h-12 bg-surface border-b border-border flex items-center px-4 opacity-50">
                <div className="w-24 h-4 bg-muted rounded"></div>
                <div className="ml-auto flex gap-2">
                  <div className="w-12 h-4 bg-muted rounded"></div>
                  <div className="w-12 h-4 bg-muted rounded"></div>
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-surface opacity-30 rounded-lg"></div>
                <div className="absolute top-48 left-10 w-1/3 h-48 bg-surface opacity-30 rounded-lg"></div>
                <div className="absolute top-48 right-10 w-1/3 h-48 bg-surface opacity-30 rounded-lg"></div>
                
                {/* The Heatmap Overlay */}
                {heatmapNodes.length > 0 ? heatmapNodes : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
                    Aguardando dados de telemetria...
                  </div>
                )}
              </div>
            </div>
          </div>

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
              <h3 className="text-lg font-bold text-foreground mb-4">Impressões de Botões (Visibilidade)</h3>
              <div className="space-y-3">
                {uxMetrics.visibilityImpressions.length === 0 ? (
                  <p className="text-sm text-muted">Nenhum CTAs monitorado registrado.</p>
                ) : (
                  uxMetrics.visibilityImpressions.slice(0, 5).map((imp, i) => (
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
