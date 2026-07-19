'use client';

import { useState, useEffect } from 'react';

interface FomoEvent {
  name: string;
  action: string;
  icon: string;
  isReward?: boolean;
}

const BRAZILIAN_NAMES = [
  'Lucas', 'Gabriel', 'Pedro', 'Matheus', 'João', 'Enzo', 'Gustavo', 'Felipe', 'Rodrigo', 'Bruno', 
  'Thiago', 'Daniel', 'Rafael', 'Leonardo', 'Vitor', 'André', 'Caio', 'Marcos', 'Arthur', 'Guilherme',
  'Mariana', 'Beatriz', 'Julia', 'Camila', 'Larissa', 'Isabela', 'Amanda', 'Paula', 'Gabriela', 'Fernanda',
  'Letícia', 'Sofia', 'Carolina', 'Alice', 'Luana', 'Bruna', 'Clara', 'Manuela', 'Yasmin', 'Jéssica',
  'Alexandre', 'Diego', 'Eduardo', 'Henrique', 'Marcelo', 'Murilo', 'Renan', 'Samuel', 'Vanessa', 'Patrícia',
  'Aline', 'Bárbara', 'Cintia', 'Débora', 'Elisa', 'Flávia', 'Gisele', 'Helena', 'Ingrid', 'Juliana',
  'Karina', 'Lívia', 'Mirella', 'Natália', 'Olívia', 'Priscila', 'Raquel', 'Sabrina', 'Tainá', 'Valéria'
];

const BRAZILIAN_CITIES = [
  'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 'Curitiba - PR', 'Porto Alegre - RS',
  'Florianópolis - SC', 'Salvador - BA', 'Brasília - DF', 'Recife - PE', 'Fortaleza - CE',
  'Campinas - SP', 'Niterói - RJ', 'Joinville - SC', 'Vitória - ES', 'Manaus - AM',
  'Goiânia - GO', 'Belém - PA', 'São Luís - MA', 'Maceió - AL', 'Natal - RN',
  'Teresina - PI', 'João Pessoa - PB', 'Aracaju - SE', 'Cuiabá - MT', 'Campo Grande - MS',
  'Porto Velho - RO', 'Macapá - AP', 'Rio Branco - AC', 'Boa Vista - RR', 'Palmas - TO',
  'Santos - SP', 'Ribeirão Preto - SP', 'Sorocaba - SP', 'Londrina - PR', 'Maringá - PR',
  'Caxias do Sul - RS', 'Pelotas - RS', 'Blumenau - SC', 'Balneário Camboriú - SC', 'Uberlândia - MG',
  'Juiz de Fora - MG', 'Niterói - RJ', 'São Bernardo do Campo - SP', 'Santo André - SP', 'Guarulhos - SP'
];

const ACTIONS = [
  'acabou de garantir',
  'resgatou agora mesmo',
  'levou para casa de graça',
  'garantiu com frete grátis',
  'acabou de levar para casa',
  'solicitou o envio de',
  'reivindicou com sucesso',
  'resgatou em segundos'
];

const REWARDS = [
  { name: 'Kit de Adesivos Cyberpunk', icon: '📦', suffix: 'irado!' },
  { name: 'Chaveiro Neon Dopamina', icon: '🔑', suffix: 'ultra futurista!!' },
  { name: 'Copo Térmico Futurista', icon: '🥤', suffix: 'para o seu café/drink!' },
  { name: 'Óculos LED Holográfico', icon: '👓', suffix: 'estiloso!' },
  { name: 'Camiseta Dopaminado Corp', icon: '👕', suffix: 'oversized oficial!' },
];

const FAKE_PRODUCTS = [
  { name: 'RTX 4090 Fictícia', icon: '💻', suffix: 'por R$ 0,00' },
  { name: 'PlayStation 6 Pro', icon: '🎮', suffix: 'por R$ 0,00' },
  { name: 'iPhone 17 Pro Max', icon: '📱', suffix: 'por R$ 0,00' },
  { name: 'Celta Rebaixado com Escada', icon: '🚗', suffix: 'por R$ 0,00' },
  { name: 'Vasco da Gama (O Clube)', icon: '⚽', suffix: 'por R$ 0,00' },
];

const PURCHASE_ACTIONS = [
  'acabou de comprar um(a)',
  'garantiu seu(ua)',
  'levou para casa um(a)',
  'adicionou ao carrinho um(a)',
];

export default function FomoToast() {
  const [currentEvent, setCurrentEvent] = useState<FomoEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before first toast
    const initialTimer = setTimeout(() => {
      triggerRandomToast();
    }, 8000);

    // Loop interval to trigger toast periodically
    const interval = setInterval(() => {
      triggerRandomToast();
    }, 28000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const triggerRandomToast = () => {
    const isPurchase = Math.random() > 0.5;
    const name = BRAZILIAN_NAMES[Math.floor(Math.random() * BRAZILIAN_NAMES.length)];
    const city = BRAZILIAN_CITIES[Math.floor(Math.random() * BRAZILIAN_CITIES.length)];
    
    let action, item, isReward;
    if (isPurchase) {
      action = PURCHASE_ACTIONS[Math.floor(Math.random() * PURCHASE_ACTIONS.length)];
      item = FAKE_PRODUCTS[Math.floor(Math.random() * FAKE_PRODUCTS.length)];
      isReward = false;
    } else {
      action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      item = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      isReward = true;
    }

    setCurrentEvent({
      name: `${name} de ${city}`,
      action: `${action} ${item.name} ${item.suffix}`,
      icon: item.icon,
      isReward
    });
    setIsVisible(true);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  if (!currentEvent) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-[100] flex items-center gap-3 rounded-2xl border bg-card/95 px-4 py-3.5 shadow-2xl backdrop-blur-md max-w-xs transition-all duration-500 ${
        currentEvent.isReward ? 'border-orange-500/20' : 'border-neon/20'
      } ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <div className={`relative shrink-0 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${currentEvent.isReward ? 'bg-orange-500/10' : 'bg-neon/10'}`}>
        {currentEvent.icon}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${currentEvent.isReward ? 'text-orange-600' : 'text-neon'}`}>
          <span>{currentEvent.isReward ? 'Resgate recente' : 'Compra ao vivo'}</span>
          <span className={`h-1 w-1 rounded-full inline-block ${currentEvent.isReward ? 'bg-orange-500' : 'bg-neon'}`} />
          <span className="text-[10px] text-muted normal-case font-medium">agora mesmo</span>
        </p>
        <p className="text-xs font-black text-foreground truncate mt-0.5">{currentEvent.name}</p>
        <p className="text-[11px] text-muted leading-snug mt-0.5">{currentEvent.action}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="shrink-0 text-muted hover:text-foreground text-xs self-start"
      >
        ✕
      </button>
    </div>
  );
}
