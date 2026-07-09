import axios from 'axios';
import * as cheerio from 'cheerio';

async function testNext() {
  const { data } = await axios.get('https://dopamineshopping.com/pt-br/buscar');
  const $ = cheerio.load(data);
  const nextLinks = $('a:contains("Próxima"), a:contains("Next")');
  console.log(`Next link href: ${nextLinks.attr('href')}`);
}

testNext().catch(console.error);
