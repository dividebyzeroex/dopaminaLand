import React, { useMemo, useState } from 'react';
import { MousePointer2, AlertTriangle, Clock, Target, Activity, Zap, ShieldAlert, CheckCircle2, Monitor, Smartphone, LayoutDashboard } from 'lucide-react';
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
    <div className="space-y-4 font-sans animate-fade-in py-2 pb-12">
      {/* Top KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none border-t-[3px] border-t-blue-500">
          <div className="flex items-center gap-2 text-blue-400">
            <Clock className="h-4 w-4" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider">Avg. Dwell Time</h3>
          </div>
          <p className="mt-3 text-2xl font-mono font-bold text-[#e4e4e7]">
            {uxMetrics.avgDwellTime}s
          </p>
          <p className="mt-1 font-mono text-[9px] text-[#52525b] uppercase tracking-wider">Average Session Length</p>
        </div>
        
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none border-t-[3px] border-t-orange-500">
          <div className="flex items-center gap-2 text-orange-400">
            <MousePointer2 className="h-4 w-4" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider">Rage Clicks</h3>
          </div>
          <p className="mt-3 text-2xl font-mono font-bold text-[#e4e4e7]">
            {uxMetrics.rageClicksCount}
          </p>
          <p className="mt-1 font-mono text-[9px] text-[#52525b] uppercase tracking-wider">High Frequency Clicks</p>
        </div>

        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none border-t-[3px] border-t-amber-500">
          <div className="flex items-center gap-2 text-amber-400">
            <Target className="h-4 w-4" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider">Dead Clicks</h3>
          </div>
          <p className="mt-3 text-2xl font-mono font-bold text-[#e4e4e7]">
            {uxMetrics.deadClicksCount}
          </p>
          <p className="mt-1 font-mono text-[9px] text-[#52525b] uppercase tracking-wider">Unresponsive Targets</p>
        </div>

        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none border-t-[3px] border-t-rose-500">
          <div className="flex items-center gap-2 text-rose-400">
            <Activity className="h-4 w-4" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider">Mouse Frustration</h3>
          </div>
          <p className="mt-3 text-2xl font-mono font-bold text-[#e4e4e7]">
            {uxMetrics.frustrationCount}
          </p>
          <p className="mt-1 font-mono text-[9px] text-[#52525b] uppercase tracking-wider">Erratic Mouse Jiggles</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Heatmap Section */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-blue-400" />
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa]">Real-time Session Heatmap</h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={selectedPath} 
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="bg-[#111217] border border-[#2a2e37] rounded-sm py-1.5 px-3 font-mono text-[10px] text-[#e4e4e7] uppercase tracking-wider outline-none focus:border-blue-500 cursor-pointer"
                >
                  {uniquePaths.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  {uniquePaths.length === 0 && <option value="/">/</option>}
                </select>

                <div className="flex bg-[#111217] rounded-sm border border-[#2a2e37] overflow-hidden">
                  <button 
                    onClick={() => setDevice('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${device === 'desktop' ? 'bg-blue-900/20 text-blue-400' : 'text-[#71717a] hover:bg-[#2a2e37] hover:text-[#e4e4e7]'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button 
                    onClick={() => setDevice('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors border-l border-[#2a2e37] ${device === 'mobile' ? 'bg-blue-900/20 text-blue-400' : 'text-[#71717a] hover:bg-[#2a2e37] hover:text-[#e4e4e7]'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center bg-[#111217] p-2 rounded-sm border border-[#2a2e37] relative overflow-hidden">
              {/* This wrapper limits the height so we can scroll the heatmap naturally */}
              <div className={`relative bg-white overflow-y-auto overflow-x-hidden border border-[#2a2e37] h-[600px] custom-scrollbar ${containerWidthClass}`}>
                
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
                    <div className="flex items-center justify-center h-[500px] font-mono text-[11px] text-[#52525b] uppercase tracking-wider bg-black/80">
                      No telemetry data available for this viewport.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-4 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2 text-rose-400"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 blur-[1px]"></div> Interactions</span>
              <span className="flex items-center gap-2 text-blue-400"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 blur-[2px]"></div> Trajectories</span>
            </div>
          </div>
        </div>

        {/* Web Vitals and Others */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none">
            <div className="flex items-center gap-2 mb-4 border-b border-[#2a2e37] pb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa]">Core Web Vitals</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2.5 rounded-sm bg-[#111217] border border-[#2a2e37]">
                <div>
                  <p className="font-mono text-[10px] font-bold text-[#e4e4e7] uppercase tracking-wider">LCP</p>
                  <p className="font-mono text-[9px] text-[#52525b] uppercase mt-0.5">Largest Contentful Paint</p>
                </div>
                <div className={`font-mono text-xs font-bold ${uxMetrics.webVitals.lcp > 2500 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatMs(uxMetrics.webVitals.lcp)}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-sm bg-[#111217] border border-[#2a2e37]">
                <div>
                  <p className="font-mono text-[10px] font-bold text-[#e4e4e7] uppercase tracking-wider">CLS</p>
                  <p className="font-mono text-[9px] text-[#52525b] uppercase mt-0.5">Cumulative Layout Shift</p>
                </div>
                <div className={`font-mono text-xs font-bold ${uxMetrics.webVitals.cls > 0.1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {uxMetrics.webVitals.cls > 0 ? uxMetrics.webVitals.cls.toFixed(3) : 'N/A'}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-sm bg-[#111217] border border-[#2a2e37]">
                <div>
                  <p className="font-mono text-[10px] font-bold text-[#e4e4e7] uppercase tracking-wider">FID / INP</p>
                  <p className="font-mono text-[9px] text-[#52525b] uppercase mt-0.5">Input Delay</p>
                </div>
                <div className={`font-mono text-xs font-bold ${uxMetrics.webVitals.fid > 100 || uxMetrics.webVitals.inp > 200 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatMs(uxMetrics.webVitals.inp || uxMetrics.webVitals.fid)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none">
            <div className="flex items-center gap-2 mb-4 border-b border-[#2a2e37] pb-3">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa]">JS Exceptions</h3>
            </div>
            {uxMetrics.jsErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-[#52525b]">
                <CheckCircle2 className="h-6 w-6 text-emerald-400/50 mb-2" />
                <p className="font-mono text-[10px] uppercase tracking-wider">0 Exceptions detected</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {uxMetrics.jsErrors.map((err, i) => (
                  <div key={i} className="p-2.5 rounded-sm bg-[#111217] border-l-2 border-l-rose-500 border border-[#2a2e37]">
                    <p className="font-mono text-[10px] font-bold text-rose-400 mb-1 truncate">{err.message}</p>
                    <p className="font-mono text-[9px] text-[#71717a] truncate">Target: {err.path}</p>
                    <p className="font-mono text-[9px] text-[#52525b] mt-1">@ {new Date(err.time).toISOString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-4 border-b border-[#2a2e37] pb-3">Scroll Depth Distribution</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uxMetrics.scrollDepthMap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e37" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111217', borderColor: '#2a2e37', borderRadius: '2px', fontFamily: 'monospace', fontSize: '10px' }}
                      itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-4 border-b border-[#2a2e37] pb-3">Visibility Telemetry</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {uxMetrics.visibilityImpressions.length === 0 ? (
                  <p className="font-mono text-[10px] text-[#52525b] uppercase tracking-wider">No elements tracked.</p>
                ) : (
                  uxMetrics.visibilityImpressions.map((imp, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-sm bg-[#111217] border border-[#2a2e37]">
                      <span className="font-mono text-[10px] text-[#e4e4e7] truncate max-w-[70%]">
                        {imp.name}
                      </span>
                      <span className="font-mono text-[9px] font-bold text-blue-400 bg-blue-900/20 border border-blue-900/50 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        {imp.count} hits
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
