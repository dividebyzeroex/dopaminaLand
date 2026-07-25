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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const currentPriceStr = searchParams.get('current_price');

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400, headers: corsHeaders });
    }

    const currentPrice = currentPriceStr ? parseFloat(currentPriceStr) : null;

    // 1. Web Scraper Real no Buscapé
    const url = `https://www.buscape.com.br/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch external data' }, { status: 500, headers: corsHeaders });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const firstCard = $('[data-testid="product-card::card"]').first();
    const firstPriceStr = firstCard.find('[data-testid="product-card::price"]').text();
    const firstName = firstCard.find('[data-testid="product-card::name"]').text();
    let firstUrl = firstCard.attr('href');
    
    if (firstUrl && !firstUrl.startsWith('http')) {
      firstUrl = `https://www.buscape.com.br${firstUrl}`;
    }

    let scrapedPrice = currentPrice || 100; // fallback
    if (firstPriceStr) {
      const numericMatch = firstPriceStr.replace(/[^0-9,]/g, '').replace(',', '.');
      if (numericMatch) {
        scrapedPrice = parseFloat(numericMatch);
      }
    }

    let message = `Encontramos uma oferta mais em conta no mercado.`;
    let isFomoAlert = false;
    
    if (currentPrice && currentPrice > scrapedPrice) {
      const diff = ((currentPrice - scrapedPrice) / currentPrice) * 100;
      message = `🚨 Cuidado! Este produto está ${diff.toFixed(1)}% mais barato no mercado. Não caia no FOMO!`;
      isFomoAlert = true;
    } else if (currentPrice && currentPrice <= scrapedPrice) {
      message = `✅ Preço Justo. O valor está alinhado com o piso do mercado.`;
    }

    return NextResponse.json({
      success: true,
      scraped_name: firstName || query,
      scraped_price: scrapedPrice,
      current_price: currentPrice,
      url: firstUrl || url, // If we couldn't parse the card, fallback to search url
      is_fomo_alert: isFomoAlert,
      message
    }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
