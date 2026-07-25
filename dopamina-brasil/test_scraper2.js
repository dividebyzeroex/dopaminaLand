const cheerio = require('cheerio');

async function scrapeBuscape(query) {
  try {
    const url = `https://www.buscape.com.br/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) return null;
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const firstPriceStr = $('[data-testid="product-card::price"]').first().text();
    const firstName = $('[data-testid="product-card::name"]').first().text();
    
    if (!firstPriceStr) return null;
    
    // Extract numeric value from "R$ 2.888,88"
    const numericMatch = firstPriceStr.replace(/[^0-9,]/g, '').replace(',', '.');
    const price = parseFloat(numericMatch);
    
    console.log("Scraped:", firstName, "Price:", price);
    return { name: firstName, price: price };
  } catch (err) {
    return null;
  }
}

scrapeBuscape("Iphone 13 128gb");
