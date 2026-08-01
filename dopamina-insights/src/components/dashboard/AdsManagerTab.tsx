import { useState } from 'react';
import { Wallet, TrendingUp, Search, Plus, Play, Pause, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AdsManagerTab({ products = [] }: { products: any[] }) {
  // Real data states (currently empty because the Supabase tables aren't created yet)
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Wallet & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Available Balance</span>
            <Wallet className="w-4 h-4 text-orange-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-[#71717a] font-mono">R$</span>
            <span className="text-3xl font-bold font-mono text-[#e4e4e7]">
              {walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button className="mt-4 w-full bg-[#2a2e37] hover:bg-[#3f3f46] text-[#e4e4e7] font-mono text-[11px] uppercase py-2 rounded-sm transition-colors flex items-center justify-center gap-2">
            <Plus className="w-3 h-3" /> Add Funds
          </button>
        </div>

        <div className="bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4">
          <div className="flex justify-between items-start mb-4">
            <span className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Est. Daily Spend</span>
            <TrendingUp className="w-4 h-4 text-blue-400 opacity-50" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-[#71717a] font-mono">R$</span>
            <span className="text-3xl font-bold font-mono text-blue-400">0,00</span>
          </div>
          <div className="mt-4 h-1 w-full bg-[#111217] rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[0%]" />
          </div>
          <p className="mt-2 text-[10px] text-[#71717a] font-mono uppercase tracking-wider">0% of daily limits reached</p>
        </div>

        <div className="bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4">
          <div className="flex justify-between items-start mb-4">
            <span className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Active Bids</span>
            <Search className="w-4 h-4 text-emerald-400 opacity-50" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">0</span>
            <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider">Keywords</span>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 bg-[#111217] text-[#a1a1aa] border border-[#2a2e37] rounded-sm font-mono text-[9px] uppercase tracking-wider">0 Paused</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Create Campaign Panel */}
        <div className="lg:col-span-1 bg-[#181b1f] border border-[#2a2e37] rounded-sm flex flex-col">
          <div className="p-3 border-b border-[#2a2e37] bg-[#111217] flex justify-between items-center">
            <h3 className="font-mono text-[11px] text-[#e4e4e7] uppercase tracking-widest font-bold">New Campaign</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2">Target Product</label>
              <select className="w-full bg-[#111217] border border-[#2a2e37] text-[#e4e4e7] text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-500">
                <option value="">Select a product to sponsor...</option>
                {products?.slice(0, 5).map((p: any) => (
                  <option key={p.id || p.query} value={p.id || p.query}>{p.name || p.query}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2">Keywords (Comma separated)</label>
              <textarea 
                className="w-full bg-[#111217] border border-[#2a2e37] text-[#e4e4e7] text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-500 h-20 resize-none"
                placeholder="iphone 15, smartphone apple..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2">Bid Strategy</label>
                <select className="w-full bg-[#111217] border border-[#2a2e37] text-[#e4e4e7] text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-500">
                  <option value="cpc">Max CPC (Clicks)</option>
                  <option value="cpa">Target CPA (Sales)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2">Max Bid (R$)</label>
                <input 
                  type="number" 
                  defaultValue={1.5}
                  step={0.1}
                  className="w-full bg-[#111217] border border-[#2a2e37] text-[#e4e4e7] text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider mb-2">Daily Budget (R$)</label>
              <input 
                type="number" 
                defaultValue={50.00}
                className="w-full bg-[#111217] border border-[#2a2e37] text-[#e4e4e7] text-xs font-mono p-2 rounded-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-auto pt-4">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-mono text-[11px] uppercase py-3 rounded-sm transition-colors flex items-center justify-center gap-2 font-bold opacity-50 cursor-not-allowed">
                Insufficient Funds <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Campaigns List */}
        <div className="lg:col-span-2 bg-[#181b1f] border border-[#2a2e37] rounded-sm flex flex-col">
          <div className="p-3 border-b border-[#2a2e37] bg-[#111217] flex justify-between items-center">
            <h3 className="font-mono text-[11px] text-[#e4e4e7] uppercase tracking-widest font-bold">Active Deployments</h3>
            <span className="font-mono text-[9px] text-[#71717a] uppercase tracking-wider">{activeCampaigns.length} Running</span>
          </div>
          
          <div className="flex-1 overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2e37]">
                  <th className="p-3 font-mono text-[10px] text-[#a1a1aa] uppercase tracking-wider">Status</th>
                  <th className="p-3 font-mono text-[10px] text-[#a1a1aa] uppercase tracking-wider">Target</th>
                  <th className="p-3 font-mono text-[10px] text-[#a1a1aa] uppercase tracking-wider">Strategy</th>
                  <th className="p-3 font-mono text-[10px] text-[#a1a1aa] uppercase tracking-wider text-right">Spend</th>
                  <th className="p-3 font-mono text-[10px] text-[#a1a1aa] uppercase tracking-wider text-right">Clicks</th>
                  <th className="p-3 font-mono text-[10px] text-[#a1a1aa] uppercase tracking-wider text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-[#e4e4e7]">
                {activeCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#71717a] font-mono text-xs">
                      No active campaigns deployed.<br/>
                      <span className="text-[10px] opacity-70 mt-2 inline-block">Add funds to your wallet to start bidding on keywords.</span>
                    </td>
                  </tr>
                ) : (
                  activeCampaigns.map((camp, idx) => (
                    <tr key={idx} className="border-b border-[#2a2e37]/50 hover:bg-[#111217] transition-colors group">
                      {/* Placeholder for future mapping */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
