/**
 * Calendário comercial: o site se personaliza sozinho para a próxima data que
 * movimenta o varejo. Cada evento tem a data calculada para qualquer ano, uma
 * janela de campanha (dias antes/depois), o texto da home, a cor de destaque e
 * ideias de presente que entram no termômetro junto com os mais populares.
 *
 * Módulo puro (sem rede nem Next): testado em tests/events.test.ts.
 */

export type EventId = "consumidor" | "maes" | "namorados" | "pais" | "criancas" | "black-friday" | "natal";

export type CommerceEvent = {
  id: EventId;
  slug: string;
  name: string;
  /** Data do evento no ano informado (AAAA-MM-DD). */
  dateOf: (year: number) => string;
  /** A campanha começa `lead` dias antes e termina `tail` dias depois da data. */
  lead: number;
  tail: number;
  accent: string;
  copy: {
    title: string;
    titleSoft: string;
    lead: string;
    thermometerTitle: string;
    /** Rótulo curto para o veredito ("Veredito Dia das Mães"). */
    verdictLabel: string;
  };
  /** Termos de presente que entram no termômetro (cada um vira o 1º produto não acessório). */
  giftQueries: string[];
  suggestions: string[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** n-ésimo dia da semana (0 = domingo) de um mês (1–12). */
export function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  return iso(year, month, day);
}

export function addDays(date: string, delta: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export const EVENTS: CommerceEvent[] = [
  {
    id: "consumidor", slug: "dia-do-consumidor", name: "Dia do Consumidor",
    dateOf: y => iso(y, 3, 15), lead: 10, tail: 0, accent: "#2854ec",
    copy: {
      title: "Dia do Consumidor:", titleSoft: "desconto real ou maquiado?",
      lead: "As lojas anunciam ofertas o mês inteiro. Mostramos se o preço de hoje está mesmo abaixo do que o produto costuma custar.",
      thermometerTitle: "Os mais buscados, com veredito.", verdictLabel: "Veredito Dia do Consumidor",
    },
    giftQueries: [], suggestions: ["iPhone 16", "Air Fryer", "Smart TV 55"],
  },
  {
    id: "maes", slug: "dia-das-maes", name: "Dia das Mães",
    // Brasil: segundo domingo de maio.
    dateOf: y => nthWeekday(y, 5, 0, 2), lead: 21, tail: 0, accent: "#c2417a",
    copy: {
      title: "O presente da sua mãe", titleSoft: "pelo preço de verdade.",
      lead: "Ideias de presente com histórico de preço: veja se a oferta é real antes de comprar e onde está mais barato.",
      thermometerTitle: "Presentes para mãe, com veredito.", verdictLabel: "Veredito Dia das Mães",
    },
    giftQueries: ["secador dyson", "air fryer", "kindle", "smartwatch samsung", "cafeteira nespresso", "aspirador robo"],
    suggestions: ["Air Fryer", "Kindle", "Secador Dyson"],
  },
  {
    id: "namorados", slug: "dia-dos-namorados", name: "Dia dos Namorados",
    dateOf: y => iso(y, 6, 12), lead: 14, tail: 0, accent: "#d6336c",
    copy: {
      title: "Presente para o seu amor,", titleSoft: "sem desconto de mentira.",
      lead: "Fones, relógios, perfumes e mais: o histórico mostra se o preço de hoje vale a pena.",
      thermometerTitle: "Presentes de namorados, com veredito.", verdictLabel: "Veredito Dia dos Namorados",
    },
    giftQueries: ["apple watch", "airpods", "jbl flip", "kindle", "instax mini", "perfume"],
    suggestions: ["AirPods", "Apple Watch", "Kindle"],
  },
  {
    id: "pais", slug: "dia-dos-pais", name: "Dia dos Pais",
    // Brasil: segundo domingo de agosto.
    dateOf: y => nthWeekday(y, 8, 0, 2), lead: 21, tail: 0, accent: "#2f6db5",
    copy: {
      title: "Presente do Dia dos Pais", titleSoft: "pelo preço justo.",
      lead: "Ferramentas, TVs, games e mais: comparamos o preço de hoje com o histórico de cada produto.",
      thermometerTitle: "Presentes para pai, com veredito.", verdictLabel: "Veredito Dia dos Pais",
    },
    giftQueries: ["smart tv 55", "furadeira bosch", "churrasqueira eletrica", "barbeador philips", "playstation 5", "smartwatch"],
    suggestions: ["Smart TV 55", "Furadeira", "PlayStation 5"],
  },
  {
    id: "criancas", slug: "dia-das-criancas", name: "Dia das Crianças",
    dateOf: y => iso(y, 10, 12), lead: 21, tail: 0, accent: "#d9480f",
    copy: {
      title: "Brinquedo bom", titleSoft: "pelo preço certo.",
      lead: "LEGO, games, bonecas e mais: veja se o desconto do Dia das Crianças é real antes de comprar.",
      thermometerTitle: "Presentes para crianças, com veredito.", verdictLabel: "Veredito Dia das Crianças",
    },
    giftQueries: ["lego", "nintendo switch", "tablet infantil", "bicicleta infantil", "barbie", "hot wheels"],
    suggestions: ["LEGO", "Nintendo Switch", "Barbie"],
  },
  {
    id: "black-friday", slug: "black-friday", name: "Black Friday",
    // Sexta-feira depois da quarta quinta-feira de novembro; a campanha vai até a Cyber Monday.
    dateOf: y => addDays(nthWeekday(y, 11, 4, 4), 1), lead: 30, tail: 3, accent: "#e0452b",
    copy: {
      title: "Desconto de verdade", titleSoft: "ou maquiagem?",
      lead: "Cole o link ou digite o produto. Mostramos quanto ele costuma custar, se subiu antes de “cair” e onde está mais barato agora.",
      thermometerTitle: "Os mais buscados, com veredito.", verdictLabel: "Veredito Black Friday",
    },
    giftQueries: [], suggestions: ["iPhone 16", "PlayStation 5", "Air Fryer", "Kindle"],
  },
  {
    id: "natal", slug: "natal", name: "Natal",
    dateOf: y => iso(y, 12, 25), lead: 24, tail: 0, accent: "#b42318",
    copy: {
      title: "Presente de Natal", titleSoft: "pelo preço certo.",
      lead: "Antes de encher o carrinho, veja se o preço de cada presente está abaixo do normal ou só parece promoção.",
      thermometerTitle: "Presentes de Natal, com veredito.", verdictLabel: "Veredito de Natal",
    },
    giftQueries: ["lego", "air fryer", "kindle", "jbl flip", "nintendo switch", "smartwatch"],
    suggestions: ["LEGO", "Air Fryer", "Kindle"],
  },
];

export type EventOccurrence = { event: CommerceEvent; date: string; start: string; end: string; daysLeft: number };

/** Data de hoje no fuso de São Paulo (AAAA-MM-DD). */
export function todaySP(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);

export function occurrence(event: CommerceEvent, today: string): EventOccurrence {
  const year = Number(today.slice(0, 4));
  // A ocorrência relevante é a deste ano, ou a do próximo se esta já terminou.
  for (const y of [year, year + 1]) {
    const date = event.dateOf(y);
    const end = addDays(date, event.tail);
    if (end >= today) return { event, date, start: addDays(date, -event.lead), end, daysLeft: daysBetween(today, date) };
  }
  const date = event.dateOf(year + 1);
  return { event, date, start: addDays(date, -event.lead), end: addDays(date, event.tail), daysLeft: daysBetween(today, date) };
}

/** Evento em campanha hoje (o de data mais próxima, se houver sobreposição), ou null. */
export function activeEvent(today = todaySP()): EventOccurrence | null {
  const live = EVENTS.map(e => occurrence(e, today)).filter(o => o.start <= today && today <= o.end);
  live.sort((a, b) => Math.abs(a.daysLeft) - Math.abs(b.daysLeft));
  return live[0] ?? null;
}

/** Próximos eventos em ordem de data (inclui o ativo). */
export function upcomingEvents(today = todaySP()): EventOccurrence[] {
  return EVENTS.map(e => occurrence(e, today)).sort((a, b) => a.date.localeCompare(b.date));
}

export function eventBySlug(slug: string): CommerceEvent | undefined {
  return EVENTS.find(e => e.slug === slug);
}

const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

/** Texto honesto do selo da home: só a data real, nada de "só hoje" inventado. */
export function eventLabel(o: EventOccurrence): string {
  const { event, date, daysLeft } = o;
  if (daysLeft > 1) return `${event.name} ${shortDate(date)} · faltam ${daysLeft} dias`;
  if (daysLeft === 1) return `${event.name} é amanhã, ${shortDate(date)}`;
  if (daysLeft === 0) return `Hoje é ${event.name}`;
  return `Ainda dá tempo: ${event.name}`;
}

/** Texto padrão quando nenhuma data está em campanha. */
export const EVERGREEN = {
  title: "Está barato mesmo?",
  titleSoft: "A gente checa o histórico.",
  lead: "Cole o link ou digite o produto. Mostramos quanto ele costuma custar, se subiu antes de “cair” e onde está mais barato agora.",
  thermometerTitle: "Os mais buscados, com veredito.",
  verdictLabel: "Veredito de preço",
  accent: "#2854ec",
  suggestions: ["iPhone 16", "PlayStation 5", "Air Fryer", "Kindle"],
};
