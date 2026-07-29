import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Buscar os últimos eventos de busca para extrair as queries reais
    const { data, error } = await supabase
      .from('intent_events')
      .select('metadata, created_at')
      .eq('event_type', 'super_search')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const uniqueQueries = new Set<string>();
    const recentSearches: string[] = [];

    if (data) {
      for (const event of data) {
        const query = event.metadata?.query?.trim();
        // Ignora buscas vazias ou por URL longa
        if (query && !query.startsWith('http') && !uniqueQueries.has(query)) {
          uniqueQueries.add(query);
          recentSearches.push(query);
        }
        if (recentSearches.length >= 5) break;
      }
    }

    // Fallback caso o banco não tenha buscas reais suficientes
    const fallbacks = [
      "iPhone 15 Pro Max 256GB",
      "PlayStation 5 Slim 1TB",
      "Samsung Galaxy S24 Ultra",
      "Smart TV LG OLED 55\"",
      "MacBook Air M3 16GB"
    ];

    while (recentSearches.length < 5) {
      const fb = fallbacks.shift();
      if (fb && !uniqueQueries.has(fb)) {
        recentSearches.push(fb);
      }
    }

    return NextResponse.json({ searches: recentSearches });
  } catch (error) {
    console.error("Erro ao buscar pesquisas recentes:", error);
    // Retorna fallback em caso de erro
    return NextResponse.json({ 
      searches: [
        "iPhone 15 Pro Max 256GB",
        "PlayStation 5 Slim 1TB",
        "Samsung Galaxy S24 Ultra",
        "Smart TV LG OLED 55\"",
        "MacBook Air M3 16GB"
      ] 
    });
  }
}
