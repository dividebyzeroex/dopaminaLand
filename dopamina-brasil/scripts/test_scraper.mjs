import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

async function fetchProducts() {
  console.log('Fetching search page...');
  const { data } = await axios.get('https://dopamineshopping.com/pt-br/buscar?faixa=0-50000&ordem=avaliados');
  const $ = cheerio.load(data);
  
  const products = [];
  
  $('a.group').each((i, el) => {
    const slug = $(el).attr('href')?.split('/').pop();
    const imgSrc = $(el).find('img').attr('src');
    const name = $(el).find('h3').text().trim();
    const rawPrice = $(el).find('p.font-display').text().trim(); // R$ 10.369,99
    
    // Parse price
    const priceNum = parseFloat(rawPrice.replace(/[^\d,]/g, '').replace(',', '.'));
    
    if (name && slug && imgSrc) {
      products.push({
        id: i + 1,
        slug,
        name,
        shortName: name.split(' ').slice(0, 4).join(' '),
        category: 'todos', // will need to be categorized
        price: priceNum || 999.99,
        salePrice: priceNum || 999.99,
        discount: 15,
        rating: 4.8,
        reviews: Math.floor(Math.random() * 5000) + 100,
        imageUrl: `https://dopamineshopping.com${imgSrc}`,
        localImage: `/produtos/${imgSrc.split('/').pop()}`
      });
    }
  });
  
  console.log(`Found ${products.length} products.`);
  await fs.writeFile('scratch_scraped.json', JSON.stringify(products, null, 2));
}

fetchProducts().catch(console.error);
