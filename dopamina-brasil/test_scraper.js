const cheerio = require('cheerio');

async function scrapeBuscape(query) {
  try {
    const url = `https://www.buscape.com.br/search?q=${encodeURIComponent(query)}`;
    console.log("Fetching:", url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      console.log("Error fetching, status:", res.status);
      return;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Check if we got cloudflare block
    if (html.includes('Cloudflare') || html.includes('Just a moment...')) {
      console.log("Blocked by Cloudflare!");
      return;
    }
    
    // Find the first product price
    // Buscapé structure usually has .Price_Value__... or similar
    const firstPrice = $('[data-testid="product-card::price"]').first().text();
    const firstName = $('[data-testid="product-card::name"]').first().text();
    
    console.log("First Name:", firstName);
    console.log("First Price:", firstPrice);
    
    // Alternatively, look for NEXT_DATA
    const nextData = $('#__NEXT_DATA__').html();
    if (nextData) {
      const data = JSON.parse(nextData);
      console.log("Found Next Data!");
      // The state might have the products
      // Let's just print a piece of it
      console.log("Keys in Next Data:", Object.keys(data));
    }
    
  } catch (err) {
    console.log("Scrape error:", err);
  }
}

scrapeBuscape("Iphone 13 128gb");
