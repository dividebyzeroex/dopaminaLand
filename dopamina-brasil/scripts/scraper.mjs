import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

// Mapeamento das URLs para nossas categorias internas
const CATEGORIES = [
  { id: 'games', url: 'https://dopamineshopping.com/pt-br/buscar?cat=games' },
  { id: 'tecnologia', url: 'https://dopamineshopping.com/pt-br/buscar?cat=tech' },
  { id: 'beleza', url: 'https://dopamineshopping.com/pt-br/buscar?cat=beleza' },
  { id: 'moda', url: 'https://dopamineshopping.com/pt-br/buscar?cat=moda' },
  { id: 'casa', url: 'https://dopamineshopping.com/pt-br/buscar?cat=casa' }
];

const BASE_URL = 'https://dopamineshopping.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'produtos');
const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');

async function downloadImage(url, filename) {
  const filepath = path.join(PUBLIC_DIR, filename);
  try {
    // Check if it already exists to save time
    await fs.access(filepath);
    return true;
  } catch {
    // File doesn't exist, proceed to download
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(filepath, response.data);
    return true;
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error.message);
    return false;
  }
}

async function scrapeCategory(category) {
  console.log(`\nScraping category: ${category.id}...`);
  try {
    const { data } = await axios.get(category.url);
    const $ = cheerio.load(data);
    const products = [];
    
    // As in dopamineshopping.com, products are inside a grid and have a specific 'a.group' selector
    $('a.group').each((i, el) => {
      // Limit to 30 products per category
      if (i >= 30) return;

      const href = $(el).attr('href');
      if (!href || !href.includes('/produto/')) return;
      
      const slug = href.split('/').pop();
      const imgSrc = $(el).find('img').attr('src');
      const name = $(el).find('h3').text().trim();
      
      // Prices usually are inside a p.font-display
      const priceText = $(el).find('p.font-display').text().trim(); // e.g. R$ 10.369,99
      
      // Original price might be a line-through p
      const originalPriceText = $(el).find('p.line-through').text().trim() || null;
      
      if (name && slug && imgSrc && priceText) {
        // Parse numbers
        const cleanPrice = priceText.replace(/[^\d,]/g, '').replace(',', '.');
        let salePrice = parseFloat(cleanPrice) || 0;
        
        let price = salePrice;
        if (originalPriceText) {
          const cleanOriginal = originalPriceText.replace(/[^\d,]/g, '').replace(',', '.');
          price = parseFloat(cleanOriginal) || salePrice;
        }

        if (price === 0) price = 999.99;
        if (salePrice === 0) salePrice = 999.99;

        let discount = 0;
        if (price > salePrice) {
          discount = Math.round(((price - salePrice) / price) * 100);
        }

        const filename = imgSrc.split('/').pop();
        
        products.push({
          id: slug,
          slug: slug,
          name: name,
          shortName: name.split(' ').slice(0, 5).join(' '),
          category: category.id,
          price: price,
          salePrice: salePrice,
          discount: discount,
          rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1), // Random rating between 4.2 and 5.0
          reviews: Math.floor(Math.random() * 5000) + 100,
          imageUrl: `${BASE_URL}${imgSrc}`,
          localImage: `/produtos/${filename}`
        });
      }
    });

    return products;
  } catch (error) {
    console.error(`Failed to scrape ${category.id}:`, error.message);
    return [];
  }
}

async function run() {
  console.log('Starting crawler...');
  
  // Ensure directories exist
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  let allProducts = [];

  for (const cat of CATEGORIES) {
    const catProducts = await scrapeCategory(cat);
    console.log(`Found ${catProducts.length} products in ${cat.id}.`);
    
    // Download images
    for (const prod of catProducts) {
      const filename = path.basename(prod.localImage);
      await downloadImage(prod.imageUrl, filename);
    }
    
    allProducts.push(...catProducts);
  }

  // Deduplicate by ID
  const uniqueProducts = [];
  const seenIds = new Set();
  
  for (const p of allProducts) {
    if (!seenIds.has(p.id)) {
      // Create a sequential ID to match our previous structure if needed,
      // but it's better to just use slug or string id.
      seenIds.add(p.id);
      uniqueProducts.push(p);
    }
  }

  // Re-assign IDs as incremental integers if that's how it was originally
  const finalizedProducts = uniqueProducts.map((p, index) => ({
    ...p,
    id: (index + 1).toString()
  }));

  console.log(`\nSuccessfully scraped ${finalizedProducts.length} unique products.`);
  
  // Write the file
  await fs.writeFile(DATA_FILE, JSON.stringify(finalizedProducts, null, 2), 'utf-8');
  console.log(`Saved catalog to ${DATA_FILE}.`);
}

run().catch(console.error);
