import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, Send, Search, Filter, Loader2, CheckCircle2, Terminal } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  contact: string;
  channel: 'email' | 'whatsapp';
  productName: string;
  currentPrice: number;
  targetPrice: number;
  dateAdded: string;
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedLeads: Lead[] = (data || []).map(row => ({
        id: row.id,
        contact: row.contact,
        channel: row.channel,
        productName: row.product_name,
        currentPrice: Number(row.current_price),
        targetPrice: Number(row.target_price),
        dateAdded: row.created_at
      }));
      setLeads(mappedLeads);
    } catch (err) {
      console.error("Erro ao carregar leads do Supabase", err);
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const filteredLeads = leads.filter(lead => 
    lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTestSend = async (lead: Lead) => {
    setSendingId(lead.id);
    setSentId(null);

    try {
      const res = await fetch('/api/zernio-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: lead.contact,
          channel: lead.channel,
          productName: lead.productName,
          targetPrice: lead.targetPrice
        })
      });

      if (res.ok) {
        setSentId(lead.id);
        setTimeout(() => setSentId(null), 3000);
      }
    } catch (error) {
      console.error("Erro ao disparar teste", error);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans animate-fade-in py-2">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#181b1f] p-3 rounded-sm border border-[#2a2e37]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a]" />
          <input 
            type="text" 
            placeholder="Search endpoint / contact..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111217] border border-[#2a2e37] rounded-sm pl-9 pr-4 py-1.5 text-[11px] font-mono text-[#e4e4e7] outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#111217] border border-[#2a2e37] text-[#e4e4e7] text-[11px] font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#2a2e37] transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filter Data
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-[#111217] border border-[#2a2e37] rounded-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#181b1f] flex justify-between items-center">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" /> Webhook Targets (Zernio)
          </h3>
          <span className="font-mono text-[10px] text-[#71717a] uppercase">
            {filteredLeads.length} records active
          </span>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-[#181b1f] text-[#71717a] border-b border-[#2a2e37] sticky top-0">
              <tr>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Contact / Target</th>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Monitored Resource</th>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Trigger Threshold</th>
                <th className="px-4 py-2 font-bold uppercase tracking-wider text-right">Dispatch (Test API)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#52525b]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Fetching records...
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#181b1f] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-sm border ${lead.channel === 'whatsapp' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-blue-900/20 text-blue-400 border-blue-900/50'}`}>
                        {lead.channel === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#e4e4e7]">{lead.contact}</p>
                        <p className="text-[9px] text-[#71717a] uppercase mt-0.5">
                          T: {new Date(lead.dateAdded).toISOString().split('T')[0]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#e4e4e7] truncate max-w-[250px]" title={lead.productName}>
                      {lead.productName}
                    </p>
                    <p className="text-[9px] text-[#71717a] uppercase mt-0.5">Base: {formatBRL(lead.currentPrice)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-blue-900/20 text-blue-400 border border-blue-900/50">
                      {formatBRL(lead.targetPrice)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleTestSend(lead)}
                      disabled={sendingId === lead.id || sentId === lead.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold transition-colors border uppercase ${
                        sentId === lead.id
                          ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50 cursor-default'
                          : 'bg-[#181b1f] text-[#e4e4e7] border-[#2a2e37] hover:bg-[#2a2e37] hover:text-white disabled:opacity-50'
                      }`}
                    >
                      {sendingId === lead.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                          POSTing...
                        </>
                      ) : sentId === lead.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          200 OK
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-blue-400" />
                          Run Test
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#52525b] uppercase tracking-wider text-[11px]">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
