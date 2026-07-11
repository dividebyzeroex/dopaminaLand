'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import gameData from '@/data/achievements.json';

import { initSession } from '@/lib/tracking';

// Leaderboard Mock
const leaderboard = [
  { rank: 1, name: 'Chuck Norris', orders: 999, dopamine: 149850 },
  { rank: 2, name: 'Elon M.', orders: 300, dopamine: 42500 },
  { rank: 3, name: 'John Wick', orders: 150, dopamine: 22000 },
  { rank: 4, name: 'MC Xamã', orders: 100, dopamine: 14000 },
  { rank: 5, name: 'Tia do Zap', orders: 66, dopamine: 9600 },
  { rank: 6, name: 'Keanu R.', orders: 45, dopamine: 6500 },
  { rank: 7, name: 'Comprei Tudo', orders: 30, dopamine: 4000 },
  { rank: 8, name: 'Faminto 24h', orders: 15, dopamine: 2000 },
  { rank: 9, name: 'V', orders: 9, dopamine: 1350 },
  { rank: 10, name: 'Zé das Compras', orders: 8, dopamine: 1050 },
];

interface PhysicalReward {
  id: string;
  name: string;
  levelRequired: number;
  xpRequired: number;
  description: string;
  icon: string;
}

const PHYSICAL_REWARDS: PhysicalReward[] = [
  { id: 'adesivos', name: 'Kit de Adesivos Cyberpunk', levelRequired: 2, xpRequired: 500, description: 'Um pacote de adesivos holográficos irados para colar no seu notebook.', icon: '📦' },
  { id: 'chaveiro', name: 'Chaveiro Neon Dopamina', levelRequired: 3, xpRequired: 2500, description: 'Chaveiro futurista com logo brilhante da Dopamina Brasil.', icon: '🔑' },
  { id: 'copo', name: 'Copo Térmico Futurista', levelRequired: 4, xpRequired: 10000, description: 'Mantém seu café quente e sua dopamina gelada.', icon: '🥤' },
  { id: 'oculos', name: 'Óculos LED Holográfico', levelRequired: 5, xpRequired: 35000, description: 'O acessório definitivo para se destacar no metaverso.', icon: '👓' },
  { id: 'camiseta', name: 'Camiseta Dopaminado Corp', levelRequired: 6, xpRequired: 100000, description: 'Camiseta cyberpunk oversized oficial da marca Dopaminado.', icon: '👕' },
];

export default function ContaClient() {
  const {
    nickname,
    email,
    setNickname,
    setEmail,
    xp,
    level,
    levelEmoji,
    levelTitle,
    xpProgress,
    nextLevel,
    purchaseCount,
    totalSpent,
    achievements,
    claimedRewards,
    claimReward,
  } = useGame();

  const [inputName, setInputName] = useState(nickname);
  const [inputEmail, setInputEmail] = useState(email);
  const [isSaved, setIsSaved] = useState(false);

  // Physical Reward form states
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [bairro, setBairro] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobtitle, setJobtitle] = useState('');
  const [company, setCompany] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const [selectedRewardToClaim, setSelectedRewardToClaim] = useState<PhysicalReward | null>(null);

  // Stats mock
  const delivered = purchaseCount; // Assumes all arrived immediately
  const lost = 0; // Faked 0 lost
  const kmTraveled = purchaseCount * 850; // Random multiplier for km traveled

  useEffect(() => {
    setInputName(nickname);
  }, [nickname]);

  useEffect(() => {
    setInputEmail(email);
  }, [email]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newNickname = inputName || 'Anônimo';
    const newEmail = inputEmail;

    setNickname(newNickname);
    setEmail(newEmail);

    // Save to localStorage immediately so tracking picks it up
    try {
      const saved = localStorage.getItem('dopamina-game');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.nickname = newNickname;
      parsed.email = newEmail;
      localStorage.setItem('dopamina-game', JSON.stringify(parsed));
    } catch {}

    // Force-update the session in DB
    initSession(true);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClaimReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRewardToClaim) return;
    setSubmittingClaim(true);

    try {
      const response = await fetch('/api/crm/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimData: {
            email: email || localStorage.getItem('dopamina-email') || '',
            nickname,
            address,
            number,
            bairro,
            city,
            state: stateName,
            zip: cep,
            phone,
            jobtitle,
            company,
            rewardId: selectedRewardToClaim.id,
            rewardName: selectedRewardToClaim.name,
          }
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        claimReward(selectedRewardToClaim.id, selectedRewardToClaim.name);
        setSelectedRewardToClaim(null);
      } else {
        alert(`Erro ao processar resgate: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert('Erro de rede ao conectar com o HubSpot.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-5xl font-black text-foreground">
          Minha conta ⚡
        </h1>
        <p className="mt-2 text-lg font-medium text-muted">
          Seu histórico de pedidos puramente dopaminérgico
        </p>
      </div>

      {/* Profile Creation Section */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-surface-light p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground">
            Crie um perfil para ver tudo em qualquer lugar
          </h2>
          <p className="text-sm font-medium text-muted">
            Sem senhas — apenas nome e email. Seus pedidos acompanham você.
          </p>
        </div>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="seu nome"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-neon"
            required
          />
          <input
            type="email"
            placeholder="seu email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-neon"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-neon px-8 py-4 font-extrabold text-white transition hover:scale-105 active:scale-95"
          >
            {isSaved ? 'Salvo! ✓' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🛒</div>
          <div className="mt-2 text-4xl font-black text-foreground">{purchaseCount}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Pedidos Feitos
          </div>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🎉</div>
          <div className="mt-2 text-4xl font-black text-emerald-500">{delivered}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Entregues
          </div>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🐳</div>
          <div className="mt-2 text-4xl font-black text-rose-500">{lost}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Perdidos
          </div>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm md:col-span-1">
          <div className="text-2xl">💸</div>
          <div className="mt-2 text-4xl font-black text-neon">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Total Economizado
          </div>
          <p className="mt-1 text-[10px] text-muted">que você NÃO gastou</p>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🌍</div>
          <div className="mt-2 text-4xl font-black text-foreground">
            {new Intl.NumberFormat('pt-BR').format(kmTraveled)} km
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Km Viajados
          </div>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">⚡</div>
          <div className="mt-2 text-4xl font-black text-purple-600">{xp}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Dopamina Ganha
          </div>
        </div>
      </div>

      {/* Hall of Shame */}
      <div className="mb-12 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          <span>🏆</span> HALL DA VERGONHA
        </div>
        <p className="mt-2 font-medium text-foreground">
          Nenhum desastre... ainda. 😇
        </p>
      </div>

      {/* Level XP Bar */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-[#2a1a3a] p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl shadow-inner">
              {levelEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neon px-2.5 py-0.5 text-xs font-black uppercase">
                  Level {level}
                </span>
                <h3 className="font-[var(--font-display)] text-3xl font-black">
                  {levelTitle}
                </h3>
              </div>
            </div>
          </div>
          <div className="text-right text-sm font-bold text-white/60">
            {xp} ⚡
          </div>
        </div>
        
        <div className="mt-6">
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, xpProgress))}%` }}
            />
          </div>
          <div className="mt-3 text-xs font-medium text-white/50">
            {nextLevel 
              ? `${nextLevel.xpRequired - xp} ⚡ restantes para: ${nextLevel.title}`
              : 'Nível Máximo Alcançado! Sua dopamina transbordou.'}
          </div>
        </div>
      </div>

      {/* ═══════════ CATALOGO DE RECOMPENSAS FÍSICAS ═══════════ */}
      <div className="mb-12 rounded-3xl border border-orange-500/20 bg-white p-6 shadow-sm md:p-8 animate-fade-in">
        {/* Swag Hero Card */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0e2e] via-[#2a133d] to-[#4c1256] p-6 text-white shadow-xl border border-purple-500/20 md:p-8">
          {/* Abstract light glow effects */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                🔥 Swag Lab Oficial
              </div>
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                DOPAMINA SWAG LAB 🧪
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Transforme seu engajamento e conquistas virtuais em recompensas do mundo real. Cada nível desbloqueia um item exclusivo produzido pela Dopamina Brasil. Frete 100% grátis para todo o território nacional.
              </p>
            </div>

            {/* XP Requirements Legend Panel */}
            <div className="w-full lg:max-w-md rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm space-y-4">
              <h4 className="text-xs font-black tracking-widest text-orange-400 uppercase">Tabela de Conversão de XP</h4>
              <div className="space-y-2.5">
                {PHYSICAL_REWARDS.map((rew) => {
                  const isCurrentUnlocked = level >= rew.levelRequired;
                  return (
                    <div key={rew.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{rew.icon}</span>
                        <div>
                          <p className="font-bold text-white">{rew.name}</p>
                          <p className="text-[10px] text-white/40">Desbloqueia no Nível {rew.levelRequired}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black rounded-lg px-2.5 py-1 text-[10px] ${
                          isCurrentUnlocked 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-white/5 text-white/50 border border-white/10'
                        }`}>
                          {rew.xpRequired.toLocaleString('pt-BR')} ⚡ XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Brindes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PHYSICAL_REWARDS.map((rew) => {
            const isUnlocked = level >= rew.levelRequired;
            const isClaimed = (claimedRewards || []).includes(rew.id);

            return (
              <div
                key={rew.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition ${
                  isClaimed
                    ? 'border-emerald-500/30 bg-emerald-50/20'
                    : isUnlocked
                    ? 'border-orange-500/30 bg-orange-50/5 shadow-sm'
                    : 'border-transparent bg-surface-light opacity-60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-4xl mb-3 block">{rew.icon}</span>
                    {!isUnlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        🔒 Nível {rew.levelRequired}
                      </span>
                    ) : isClaimed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Resgatado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                        🎁 Pronto
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-foreground text-sm mt-2">{rew.name}</h3>
                  <p className="text-[11px] text-muted leading-tight mt-1">{rew.description}</p>
                </div>

                <div className="mt-4">
                  {!isUnlocked ? (
                    <div className="text-[10px] text-slate-400 font-bold">
                      Falta {rew.levelRequired - level} nível{rew.levelRequired - level > 1 ? 's' : ''}
                    </div>
                  ) : isClaimed ? (
                    <div className="text-[10px] text-emerald-600 font-bold">Solicitação enviada</div>
                  ) : (
                    <button
                      onClick={() => setSelectedRewardToClaim(rew)}
                      className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2 uppercase tracking-wide transition active:scale-95"
                    >
                      Resgatar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulário de Resgate (se selecionado) */}
        {selectedRewardToClaim && (
          <div className="mt-8 border-t border-border pt-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                Solicitando Resgate: <span className="text-orange-600">{selectedRewardToClaim.name} {selectedRewardToClaim.icon}</span>
              </h3>
              <button
                onClick={() => setSelectedRewardToClaim(null)}
                className="text-xs text-muted hover:text-foreground font-bold"
              >
                Cancelar ×
              </button>
            </div>

            <form onSubmit={handleClaimReward} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Cargo</label>
                  <input
                    type="text"
                    placeholder="ex: Tech Lead, Dev, Estudante"
                    value={jobtitle}
                    onChange={(e) => setJobtitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Empresa / Instituição</label>
                  <input
                    type="text"
                    placeholder="ex: Google, Freelancer, UFSC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">WhatsApp / Celular</label>
                  <input
                    type="tel"
                    placeholder="(48) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">CEP</label>
                  <input
                    type="text"
                    placeholder="88000-000"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Rua / Logradouro</label>
                  <input
                    type="text"
                    placeholder="Av. Beira Mar Norte"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Número</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Bairro</label>
                  <input
                    type="text"
                    placeholder="Centro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Cidade</label>
                  <input
                    type="text"
                    placeholder="Florianópolis"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Estado (UF)</label>
                  <input
                    type="text"
                    placeholder="SC"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingClaim}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 py-4 font-black text-white text-sm tracking-wider uppercase transition active:scale-[0.98]"
              >
                {submittingClaim ? 'Processando envio...' : 'Confirmar Solicitação de Recompensa 🎁'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Achievements Grid */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl font-extrabold uppercase tracking-wide text-foreground">
            <span>🏅</span> CONQUISTAS
          </h2>
          <div className="text-sm font-bold text-muted">
            {achievements.length}/{gameData.achievements.length} desbloqueadas
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {gameData.achievements.map((ach) => {
            const isUnlocked = achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-6 text-center transition ${
                  isUnlocked 
                    ? 'border-border bg-purple-50/50 shadow-sm' 
                    : 'border-transparent bg-surface-light opacity-60 grayscale'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute right-3 top-3 text-xs text-muted">🔒</div>
                )}
                {isUnlocked && (
                  <div className="absolute right-3 top-3 text-xs text-emerald-500">✔️</div>
                )}
                <div className="mb-3 text-4xl">{ach.icon}</div>
                <h4 className="font-bold text-foreground">{ach.title}</h4>
                <p className="mt-1 text-[11px] text-muted">{ach.description}</p>
                {isUnlocked && (
                  <div className="mt-3 rounded-full bg-neon/10 px-2 py-0.5 text-[10px] font-black text-neon">
                    +{ach.xpReward} ⚡
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-12 rounded-3xl bg-surface-light p-6 shadow-sm md:p-8">
        <h2 className="mb-6 flex items-center gap-2 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
          <span>🏆</span> LEADERBOARD — TOP COMPRADORES
        </h2>
        <div className="flex flex-col gap-2">
          {leaderboard.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-lg font-black text-muted">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </div>
                <div className="font-bold text-foreground">{user.name}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-sm font-medium text-muted sm:block">
                  {user.orders} pedidos
                </div>
                <div className="font-[var(--font-display)] text-lg font-black text-purple-600">
                  {new Intl.NumberFormat('pt-BR').format(user.dopamine)} ⚡
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
