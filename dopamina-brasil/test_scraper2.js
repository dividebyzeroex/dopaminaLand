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
    
    const firstCard = $('[data-testid="product-card::card"]').first();
    const firstPriceStr = firstCard.find('[data-testid="product-card::price"]').text();
    const firstName = firstCard.find('[data-testid="product-card::name"]').text();
    const firstUrl = firstCard.attr('href');
    const firstImage = firstCard.find('[data-testid="product-card::image"]').attr('src');
    
    // Sometimes the link is an absolute URL, sometimes relative
    let productUrl = firstUrl;
    if (productUrl && !productUrl.startsWith('http')) {
      productUrl = `https://www.buscape.com.br${productUrl}`;
    }
    
    if (!firstPriceStr) return null;
    
    const numericMatch = firstPriceStr.replace(/[^0-9,]/g, '').replace(',', '.');
    const price = parseFloat(numericMatch);
    
    console.log("Scraped:", firstName, "Price:", price, "URL:", productUrl);
    return { name: firstName, price: price, url: productUrl };
  } catch (err) {
    console.error(err);
    return null;
  }
}

scrapeBuscape("Iphone 13 128gb").then(console.log);
