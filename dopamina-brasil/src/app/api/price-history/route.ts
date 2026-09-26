import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function extractQueryFromUrl(inputUrl: string): string {
  try {
    const parsed = new URL(inputUrl);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || '';
    
    const clean = lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\.html?$/i, '')
      .replace(/\b(dp|p|pd|produto)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return clean || 'iPhone 17 Apple';
  } catch (e) {
    return inputUrl;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let query = searchParams.get('q') || searchParams.get('query');
    const inputUrl = searchParams.get('url');
    const currentPriceStr = searchParams.get('current_price') || searchParams.get('storePrice');

    if (!query && inputUrl) {
      query = extractQueryFromUrl(inputUrl);
    }

    if (!query) {
      return NextResponse.json({ error: 'Missing parameter "q" or "url"' }, { status: 400, headers: corsHeaders });
    }

    let currentPrice = currentPriceStr ? parseFloat(currentPriceStr) : null;

    // 1. Live Real Scraper on Buscapé / Bondfaro Engine
    const buscapeUrl = `https://www.buscape.com.br/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(buscapeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch external Buscapé data' }, { status: 500, headers: corsHeaders });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const firstCard = $('[data-testid="product-card::card"]').first();
    const firstPriceStr = firstCard.find('[data-testid="product-card::price"]').text();
    const firstName = firstCard.find('[data-testid="product-card::name"]').text();
    let firstUrl = firstCard.attr('href');
    let firstImage = firstCard.find('[data-testid="product-card::image"] img').attr('src') || firstCard.find('img').first().attr('src');
    
    // Scrape real market alternatives from the next 3 cards
    const market_alternatives: any[] = [];
    $('[data-testid="product-card::card"]').slice(1, 4).each((i, el) => {
      const name = $(el).find('[data-testid="product-card::name"]').text();
      let priceStr = $(el).find('[data-testid="product-card::price"]').text();
      let link = $(el).attr('href');
      let image = $(el).find('[data-testid="product-card::image"] img').attr('src') || $(el).find('img').first().attr('src');

      if (link && !link.startsWith('http')) {
        link = `https://www.buscape.com.br${link}`;
      }
      
      let price = 0;
      if (priceStr) {
        const num = priceStr.replace(/[^0-9,]/g, '').replace(',', '.');
        if (num) price = parseFloat(num);
      }
      
      if (name && price > 0) {
        market_alternatives.push({ name, price, link, image });
      }
    });
    
    if (firstUrl && !firstUrl.startsWith('http')) {
      firstUrl = `https://www.buscape.com.br${firstUrl}`;
    }

    let scrapedPrice = 0;
    if (firstPriceStr) {
      const numericMatch = firstPriceStr.replace(/[^0-9,]/g, '').replace(',', '.');
      if (numericMatch) {
        scrapedPrice = parseFloat(numericMatch);
      }
    }

    // A search result is not evidence of a price when its card cannot be parsed.
    if (!scrapedPrice || !firstName || !firstUrl) {
      return NextResponse.json({ success: false, error: 'Preço verificável indisponível para esta busca.' }, { status: 404, headers: corsHeaders });
    }

    const hasComparison = currentPrice !== null && Number.isFinite(currentPrice) && currentPrice > 0;
    if (!hasComparison) currentPrice = scrapedPrice;

    const observedPrice = currentPrice ?? scrapedPrice;
    const diff = hasComparison ? Math.max(0, ((observedPrice - scrapedPrice) / observedPrice) * 100) : 0;
    const isFomoAlert = hasComparison && observedPrice > scrapedPrice;
    const savings = hasComparison ? Math.max(0, observedPrice - scrapedPrice) : 0;

    let message = !hasComparison
      ? 'Preço encontrado nesta consulta. Confira o produto, frete e condições na loja antes de comprar.'
      : isFomoAlert
        ? `Encontramos um resultado ${diff.toFixed(1)}% mais barato nesta consulta. Confira se é o mesmo produto e as condições da oferta.`
        : 'O preço informado está próximo do resultado encontrado nesta consulta.';

    return NextResponse.json({
      success: true,
      query,
      scraped_name: firstName || query,
      image: firstImage,
      scraped_price: scrapedPrice,
      current_price: observedPrice,
      overpriced_percent: parseFloat(diff.toFixed(1)),
      savings: parseFloat(savings.toFixed(2)),
      has_comparison: hasComparison,
      checked_at: new Date().toISOString(),
      url: firstUrl || buscapeUrl,
      is_fomo_alert: isFomoAlert,
      message,
      // These estimates are not measured market facts and must not be sold as such.
      price_history: [],
      review_authenticity: null,
      net_price_breakdown: null,
      future_price_prediction: null,
      cost_per_use_calc: null,
      freight_audit: null,
      market_alternatives: market_alternatives,
      detected_triggers: []
    }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
