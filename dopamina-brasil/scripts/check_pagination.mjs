import axios from 'axios';
import * as cheerio from 'cheerio';

async function checkPagination() {
  console.log('Fetching search page...');
  const { data } = await axios.get('https://dopamineshopping.com/pt-br/buscar');
  const $ = cheerio.load(data);
  
  const products = $('a.group').length;
  console.log(`Found ${products} products on the first page.`);
  
  // Check if there is next page link
  const nextLinks = $('a:contains("Próxima"), a:contains("Next")').length;
  console.log(`Next page links found: ${nextLinks}`);
  
  // Or check if __NEXT_DATA__ contains all products
  const nextData = $('#__NEXT_DATA__').html();
  if (nextData) {
    const json = JSON.parse(nextData);
    console.log('NextData found, length:', nextData.length);
  } else {
    console.log('No __NEXT_DATA__ found. It is likely using app router without inline state, or RSC payload.');
  }
}

checkPagination().catch(console.error);
