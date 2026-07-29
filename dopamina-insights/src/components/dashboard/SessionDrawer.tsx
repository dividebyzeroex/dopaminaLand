import { X, User, Activity, MapPin, Laptop, Smartphone, Eye, ShoppingCart, CreditCard, Pointer } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionDrawer({
  selectedLead,
  setSelectedLead,
  handleCrmSync,
  crmIntegrationStatus,
}: {
  selectedLead: any;
  setSelectedLead: (lead: any | null) => void;
  handleCrmSync: (leadId: string, type: 'hubspot' | 'salesforce' | 'slack') => void;
  crmIntegrationStatus: Record<string, string>;
}) {
  if (!selectedLead) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-surface-light " onClick={() => setSelectedLead(null)} />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] border-l border-border bg-background shadow-md animate-toast-in">
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6 bg-surface-light">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <User className="h-5 w-5 text-muted" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-foreground">
                  {selectedLead.nickname ? `${selectedLead.nickname} (${selectedLead.deviceLocal.split('-').pop()?.trim()})` : selectedLead.deviceLocal}
                </h2>
                {selectedLead.email && <p className="text-xs text-primary font-medium">{selectedLead.email}</p>}
                <p className="text-[10px] text-muted font-mono">{selectedLead.id}</p>
              </div>
            </div>
            <button onClick={() => setSelectedLead(null)} className="rounded p-1.5 text-muted hover:bg-surface hover:text-foreground transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 p-6 space-y-8">
            {/* Score Card */}
            <div className="rounded-xl border border-border bg-surface-light p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Inteligência de Compra
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-medium text-muted uppercase">Intent Score</div>
                  <div className="text-3xl font-semibold text-foreground mt-1">{selectedLead.score}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-muted uppercase">Temperatura</div>
                  <span className={`mt-2 inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${selectedLead.stage === 'Decision' ? 'bg-rose-500/10 text-rose-500' : selectedLead.stage === 'Consideration' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {selectedLead.stage === 'Decision' ? 'Quente' : selectedLead.stage === 'Consideration' ? 'Morno' : 'Frio'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted">Probabilidade de Compra</span>
                  <span className="text-foreground">{Math.min(99, Math.max(5, selectedLead.score * 1.3)).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div className={`h-full rounded-full transition-all duration-500 ${selectedLead.score > 50 ? 'bg-rose-500' : selectedLead.score > 20 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, Math.max(5, selectedLead.score * 1.3))}%` }} />
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Dados da Sessão</h3>
              <div className="rounded-xl border border-border divide-y divide-border text-xs bg-surface-light">
                <div className="flex items-center justify-between p-3.5">
                  <span className="text-muted flex items-center gap-2"><Laptop className="h-3.5 w-3.5" /> Dispositivo</span>
                  <span className="font-medium text-foreground">{selectedLead.deviceLocal}</span>
                </div>
                <div className="flex items-center justify-between p-3.5">
                  <span className="text-muted flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Origem</span>
                  <span className="font-medium text-foreground">{selectedLead.source}</span>
                </div>
                <div className="flex items-center justify-between p-3.5">
                  <span className="text-muted flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> Última atividade</span>
                  <span className="font-medium text-foreground">{selectedLead.lastActive}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Jornada de Ações (Touchpoints)</h3>
              <div className="relative border-l border-border ml-3 pl-6 space-y-6">
                {selectedLead.timeline?.map((item: any, idx: number) => {
                  let Icon = Eye;
                  let color = 'text-muted';
                  let bg = 'bg-surface-lighter';
                  let text = `Viu: ${item.product_name || 'Produto'}`;
                  
                  if (item.event_type === 'add_to_cart') { 
                    Icon = ShoppingCart; 
                    color = 'text-blue-500'; 
                    bg = 'bg-blue-500/10';
                    text = `Carrinho: ${item.product_name || 'Produto'}`; 
                  } else if (item.event_type === 'fake_checkout') { 
                    Icon = CreditCard; 
                    color = 'text-emerald-500'; 
                    bg = 'bg-emerald-500/10';
                    text = `Checkout: R$ ${item.price_displayed?.toFixed(2)}`; 
                  } else if (item.event_type === 'rage_click') { 
                    Icon = Pointer; 
                    color = 'text-rose-500'; 
                    bg = 'bg-rose-500/10';
                    text = 'Rage Clicks detectados'; 
                  } else if (item.event_type === 'page_leave') { 
                    text = `Saiu da página (Dwell: ${item.metadata?.dwell_time_seconds || 0}s)`; 
                  }
                  
                  return (
                    <div key={item.id} className="relative">
                      <div className={`absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full border border-border ${bg} ${color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{text}</span>
                        <span className="text-[10px] text-muted">
                          {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {selectedLead.timeline?.length === 0 && (
                  <p className="text-xs text-muted">Nenhuma ação registrada nesta sessão.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Ações B2B</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleCrmSync(selectedLead.id, 'hubspot')}
                  disabled={crmIntegrationStatus[`${selectedLead.id}-hubspot`] === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-lg bg-surface border border-border py-2.5 text-xs font-medium text-foreground hover:bg-surface-lighter transition disabled:opacity-50"
                >
                  <div className="h-3 w-3 rounded-full bg-[#ff7a59]"></div>
                  {crmIntegrationStatus[`${selectedLead.id}-hubspot`] === 'loading' ? 'Enviando...' : 'HubSpot CRM'}
                </button>
                <button 
                  onClick={() => handleCrmSync(selectedLead.id, 'salesforce')}
                  disabled={crmIntegrationStatus[`${selectedLead.id}-salesforce`] === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-lg bg-surface border border-border py-2.5 text-xs font-medium text-foreground hover:bg-surface-lighter transition disabled:opacity-50"
                >
                  <div className="h-3 w-3 rounded-full bg-[#00a1e0]"></div>
                  {crmIntegrationStatus[`${selectedLead.id}-salesforce`] === 'loading' ? 'Enviando...' : 'Salesforce'}
                </button>
                <button 
                  onClick={() => handleCrmSync(selectedLead.id, 'slack')}
                  disabled={crmIntegrationStatus[`${selectedLead.id}-slack`] === 'loading'}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-surface border border-border py-2.5 text-xs font-medium text-foreground hover:bg-surface-lighter transition disabled:opacity-50"
                >
                  <div className="h-3 w-3 rounded-full bg-[#4a154b]"></div>
                  {crmIntegrationStatus[`${selectedLead.id}-slack`] === 'loading' ? 'Alertando...' : 'Ping no Slack'}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
