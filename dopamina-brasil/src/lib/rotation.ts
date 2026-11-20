/**
 * Seleção da vitrine: entradas prioritárias (já escolhidas) + populares.
 * Os primeiros `fixedTop` ficam; o restante reveza conforme a janela de tempo.
 * Respeita o limite por grupo e o total. Função pura (testada em tests/trending.test.ts).
 */
export type Candidate = { path: string; group: string };

export function pickRotating<T extends Candidate>(
  priority: T[],
  popular: T[],
  opts: { total: number; fixedTop: number; perGroup: number; window: number },
): T[] {
  const chosen: T[] = [];
  const perGroup = new Map<string, number>();
  const take = (entry: T) => {
    if (chosen.length >= opts.total || chosen.some(c => c.path === entry.path)) return false;
    const n = perGroup.get(entry.group) ?? 0;
    if (n >= opts.perGroup) return false;
    perGroup.set(entry.group, n + 1);
    chosen.push(entry);
    return true;
  };
  for (const entry of priority) take(entry);
  const fixed = Math.max(0, opts.fixedTop - chosen.length);
  let placed = 0;
  const rest: T[] = [];
  for (const entry of popular) {
    if (placed < fixed && take(entry)) placed++;
    else if (!chosen.some(c => c.path === entry.path)) rest.push(entry);
  }
  const offset = rest.length ? ((opts.window % rest.length) + rest.length) % rest.length : 0;
  for (const entry of [...rest.slice(offset), ...rest.slice(0, offset)]) take(entry);
  return chosen;
}
