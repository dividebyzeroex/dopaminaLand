'use client';

import React, { useState, useMemo } from 'react';

interface InteractiveBrazilMapProps {
  sessions: any[];
  events: any[];
}

const BRAZIL_STATES = [
  { id: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { id: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { id: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { id: 'PR', name: 'Paraná', region: 'Sul' },
  { id: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
  { id: 'SC', name: 'Santa Catarina', region: 'Sul' },
  { id: 'BA', name: 'Bahia', region: 'Nordeste' },
  { id: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { id: 'CE', name: 'Ceará', region: 'Nordeste' },
  { id: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { id: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { id: 'AM', name: 'Amazonas', region: 'Norte' },
  { id: 'PA', name: 'Pará', region: 'Norte' },
  { id: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
];

export default function InteractiveBrazilMap({ sessions, events }: InteractiveBrazilMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>('SP');

  // Compute state traffic metrics
  const stateMetrics = useMemo(() => {
    const counts: Record<string, { sessions: number; checkouts: number; revenue: number }> = {};

    BRAZIL_STATES.forEach(st => {
      counts[st.id] = { sessions: 0, checkouts: 0, revenue: 0 };
    });

    if (sessions) {
      sessions.forEach(s => {
        const city = s.device_info?.city || '';
        let uf = 'SP'; // Default fallback
        if (city.includes('Rio de Janeiro') || city.includes('Niterói')) uf = 'RJ';
        else if (city.includes('Belo Horizonte') || city.includes('Uberlândia')) uf = 'MG';
        else if (city.includes('Curitiba') || city.includes('Londrina')) uf = 'PR';
        else if (city.includes('Porto Alegre') || city.includes('Caxias')) uf = 'RS';
        else if (city.includes('Florianópolis') || city.includes('Joinville')) uf = 'SC';
        else if (city.includes('Salvador')) uf = 'BA';
        else if (city.includes('Brasília')) uf = 'DF';
        else if (city.includes('Recife')) uf = 'PE';
        else if (city.includes('Fortaleza')) uf = 'CE';

        if (!counts[uf]) counts[uf] = { sessions: 0, checkouts: 0, revenue: 0 };
        counts[uf].sessions += 1;
      });
    }

    if (events) {
      events.forEach(e => {
        if (e.event_type === 'fake_checkout' || e.event_type === 'checkout_basket') {
          // Attribute to SP by default if not specified
          counts['SP'].checkouts += 1;
          counts['SP'].revenue += e.price_displayed || 0;
        }
      });
    }

    return counts;
  }, [sessions, events]);

  const maxSessions = Math.max(...Object.values(stateMetrics).map(m => m.sessions), 1);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <h3 className="text-base font-black text-foreground">Mapa Geográfico de Vendas & Tráfego</h3>
            <p className="text-xs text-zinc-500">Distribuição regional da busca por dopamina no Brasil</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* State Grid Matrix */}
        <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BRAZIL_STATES.map((st) => {
            const m = stateMetrics[st.id] || { sessions: 0, checkouts: 0, revenue: 0 };
            const intensity = Math.min(1, m.sessions / maxSessions);
            const isSelected = selectedState === st.id;

            return (
              <button
                key={st.id}
                onClick={() => setSelectedState(st.id)}
                className={`rounded-xl border p-3 text-left transition duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'border-neon bg-neon/10 shadow-lg shadow-neon/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* Heat Indicator Bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-neon transition-all"
                  style={{ opacity: 0.3 + intensity * 0.7 }}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-zinc-100">{st.id}</span>
                  <span className="text-[10px] text-zinc-500">{st.region}</span>
                </div>
                <p className="text-xs font-bold text-zinc-300 mt-1 truncate">{st.name}</p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">{m.sessions} acessos</span>
                  {m.checkouts > 0 && <span className="text-neon font-bold">{m.checkouts} compras</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected State Details Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-neon uppercase tracking-wider">Detalhamento Regional</span>
            {selectedState ? (
              <>
                <h4 className="text-xl font-black text-zinc-100 mt-1">
                  {BRAZIL_STATES.find(s => s.id === selectedState)?.name} ({selectedState})
                </h4>

                <div className="mt-6 space-y-4">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Volume de Acessos</p>
                    <p className="text-2xl font-black text-zinc-100 mt-0.5">
                      {stateMetrics[selectedState]?.sessions || 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Checkouts Fictícios</p>
                    <p className="text-2xl font-black text-neon mt-0.5">
                      {stateMetrics[selectedState]?.checkouts || 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Receita Estimada</p>
                    <p className="text-xl font-black text-emerald-400 mt-0.5">
                      R$ {(stateMetrics[selectedState]?.revenue || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-zinc-500 italic mt-4">Selecione um estado para ver detalhes.</p>
            )}
          </div>

          <p className="text-[10px] text-zinc-600 mt-6 italic text-center">
            *Dados geográficos aproximados via cabeçalhos IP/Navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
