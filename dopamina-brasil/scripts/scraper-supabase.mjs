import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { id: 'games', url: 'https://dopamineshopping.com/pt-br/buscar?cat=games' },
  { id: 'tecnologia', url: 'https://dopamineshopping.com/pt-br/buscar?cat=tech' },
  { id: 'beleza', url: 'https://dopamineshopping.com/pt-br/buscar?cat=beleza' },
  { id: 'moda', url: 'https://dopamineshopping.com/pt-br/buscar?cat=moda' },
  { id: 'casa', url: 'https://dopamineshopping.com/pt-br/buscar?cat=casa' }
];

const BASE_URL = 'https://dopamineshopping.com';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function uploadImageToSupabase(imageUrl, filename) {
  try {
    // Check if it already exists
    const { data: existingData } = await supabase.storage.from('produtos').list('', { search: filename });
    if (existingData && existingData.length > 0) {
      const { data } = supabase.storage.from('produtos').getPublicUrl(filename);
      return data.publicUrl;
    }

    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('produtos')
      .upload(filename, buffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error(`Failed to upload ${filename} to Supabase:`, error.message);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('produtos').getPublicUrl(filename);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Failed to process image ${imageUrl}:`, error.message);
    return null;
  }
}

async function scrapeCategoryPage(category, pageUrl) {
  console.log(`Scraping ${pageUrl}...`);
  try {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);
    const products = [];

    $('a.group').each((i, el) => {
      const href = $(el).attr('href');
      if (!href || !href.includes('/produto/')) return;
      
      const slug = href.split('/').pop();
      const imgSrc = $(el).find('img').attr('src');
      const name = $(el).find('h3').text().trim();
      const priceText = $(el).find('p.font-display').text().trim();
      const originalPriceText = $(el).find('p.line-through').text().trim() || null;
      
      if (name && slug && imgSrc && priceText) {
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

        products.push({
          slug,
          name,
          short_name: name.split(' ').slice(0, 5).join(' '),
          category: category.id,
          price,
          sale_price: salePrice,
          discount,
          rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1), // Fake rating
          reviews: Math.floor(Math.random() * 5000) + 100,
          originalImgSrc: `${BASE_URL}${imgSrc}`
        });
      }
    });

    const nextLink = $('a:contains("Próxima"), a:contains("Next")').attr('href');
    return { products, nextLink: nextLink ? `${BASE_URL}${nextLink}` : null };
  } catch (error) {
    console.error(`Error scraping ${pageUrl}:`, error.message);
    return { products: [], nextLink: null };
  }
}

async function run() {
  console.log('Starting Supabase Crawler...');

  let totalUpserted = 0;

  for (const cat of CATEGORIES) {
    let currentPageUrl = cat.url;
    
    while (currentPageUrl) {
      const { products, nextLink } = await scrapeCategoryPage(cat, currentPageUrl);
      
      for (const prod of products) {
        const filename = prod.originalImgSrc.split('/').pop();
        const publicUrl = await uploadImageToSupabase(prod.originalImgSrc, filename);

        if (publicUrl) {
          prod.image_url = publicUrl;
          
          // Upsert to Supabase
          const { error } = await supabase
            .from('products')
            .upsert({
              slug: prod.slug,
              name: prod.name,
              short_name: prod.short_name,
              category: prod.category,
              price: prod.price,
              sale_price: prod.sale_price,
              discount: prod.discount,
              rating: parseFloat(prod.rating),
              reviews: prod.reviews,
              image_url: prod.image_url
            }, { onConflict: 'slug' });

          if (error) {
            console.error(`Supabase Upsert Error for ${prod.slug}:`, error.message);
          } else {
            console.log(`Inserted: ${prod.slug}`);
            totalUpserted++;
          }
        }
        await delay(300); // 300ms delay to avoid rate limit
      }
      
      currentPageUrl = nextLink;
      
      // Proceeding without limits for the full catalog
    }
  }

  console.log(`\nFinished! Upserted ${totalUpserted} products to Supabase.`);
}

run().catch(console.error);
