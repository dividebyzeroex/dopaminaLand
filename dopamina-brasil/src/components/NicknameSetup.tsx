'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

const AVATAR_OPTIONS = ['🦫', '🛵', '👽', '🐋', '👻', '🏰', '🦉', '🐦', '🎮', '⚡', '🔥', '🧪'];

const NICKNAME_ADJECTIVES = [
  'Cósmico', 'Elétrico', 'Neon', 'Fantasma', 'Turbo', 'Rebaixado',
  'Blindado', 'Holográfico', 'Sombrio', 'Imortal', 'Supremo', 'Galático',
];
const NICKNAME_NOUNS = [
  'Capivara', 'Motoboy', 'Pinguim', 'Samurai', 'Celta', 'Boleto',
  'Alien', 'Catapulta', 'Pirata', 'Ninja', 'Cavaleiro', 'Pombo',
];

function generateNickname() {
  const adj = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${noun} ${adj} #${num}`;
}

export default function NicknameSetup() {
  const { nickname, setNickname } = useGame();
  const [show, setShow] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🦫');
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    try {
      const hasSetup = localStorage.getItem('dopamina-nickname-setup');
      const isHeatmapIframe = window.location.search.includes('heatmap=true');
      if (!hasSetup && !isHeatmapIframe) {
        // Delay to appear after intro
        const timer = setTimeout(() => setShow(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleConfirm = () => {
    const finalName = inputName.trim() || generateNickname();
    setNickname(`${selectedAvatar} ${finalName}`);
    try { localStorage.setItem('dopamina-nickname-setup', 'true'); } catch {}
    setShow(false);
  };

  const handleRandomize = () => {
    setInputName(generateNickname());
    setSelectedAvatar(AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md mx-4 rounded-3xl border border-neon/20 bg-card p-8 shadow-2xl animate-slide-up">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-neon/10 blur-3xl" />

        <div className="relative z-10 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-neon mb-2">identidade dopamina</p>
          <h2 className="font-[var(--font-display)] text-2xl font-black text-foreground">
            Quem é você nessa loucura?
          </h2>
          <p className="mt-2 text-sm text-muted">
            Escolha seu avatar e nome de guerra.
          </p>

          {/* Avatar Grid */}
          <div className="mt-6 grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition mx-auto ${
                  selectedAvatar === emoji
                    ? 'bg-neon/20 border-2 border-neon scale-110 shadow-lg shadow-neon/20'
                    : 'bg-surface border border-border hover:border-neon/30'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Nickname Input */}
          <div className="mt-6">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={generateNickname()}
              maxLength={30}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm font-bold text-foreground placeholder:text-muted/50 outline-none focus:border-neon transition"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleRandomize}
              className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-bold text-muted hover:text-foreground hover:border-neon/30 transition"
            >
              🎲 Aleatório
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-neon py-3 text-sm font-extrabold text-background hover:bg-neon-light transition animate-pulse-glow"
            >
              Confirmar ⚡
            </button>
          </div>

          <button
            onClick={() => {
              try { localStorage.setItem('dopamina-nickname-setup', 'true'); } catch {}
              setShow(false);
            }}
            className="mt-3 text-xs text-muted hover:text-foreground transition"
          >
            pular
          </button>
        </div>
      </div>
    </div>
  );
}
