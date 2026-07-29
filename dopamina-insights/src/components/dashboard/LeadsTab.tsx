import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, Send, Search, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import { TabHeaderBanner } from './TabHeaderBanner';
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
    <div className="space-y-6">
      <TabHeaderBanner 
        title="Base de Leads & Alertas" 
        subtitle="Gerencie os contatos capturados pelos Alertas de Menor Preço e dispare testes de integração (Zernio)."
        icon="📧"
        badgeText="ZERNIO ALERTS"
        badgeColor="emerald"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-light p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Buscar lead ou produto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-foreground text-sm font-medium rounded-xl hover:bg-surface-dark transition">
          <Filter className="w-4 h-4" />
          Filtrar Status
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-surface-light border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Lead / Contato</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Produto Monitorado</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Preço Alvo</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs text-right">Ações (Testar API)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando leads do Supabase...
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${lead.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {lead.channel === 'whatsapp' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{lead.contact}</p>
                        <p className="text-xs text-muted">
                          Adicionado em {new Date(lead.dateAdded).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground truncate max-w-[200px]" title={lead.productName}>
                      {lead.productName}
                    </p>
                    <p className="text-xs text-muted">Preço ao criar: {formatBRL(lead.currentPrice)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      {formatBRL(lead.targetPrice)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleTestSend(lead)}
                      disabled={sendingId === lead.id || sentId === lead.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        sentId === lead.id
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                          : 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm disabled:opacity-50'
                      }`}
                    >
                      {sendingId === lead.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Enviando...
                        </>
                      ) : sentId === lead.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enviado
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Disparar Teste
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    Nenhum lead encontrado.
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
