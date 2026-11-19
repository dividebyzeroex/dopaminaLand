/** Black Friday 2026: sexta-feira, 27 de novembro. */
export const BLACK_FRIDAY = "2026-11-27";

/** Texto honesto sobre a data (nada de "só hoje" inventado). */
export function blackFridayLabel(now = new Date()): string {
  const today = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const target = new Date(`${BLACK_FRIDAY}T00:00:00`);
  const days = Math.ceil((target.getTime() - new Date(today.toDateString()).getTime()) / 86400000);
  if (days > 1) return `Black Friday 27/11 · faltam ${days} dias`;
  if (days === 1) return "Black Friday é amanhã, 27/11";
  if (days === 0) return "Hoje é Black Friday";
  if (days >= -3) return "Semana da Black Friday";
  return "Histórico de preços · veredito honesto";
}
