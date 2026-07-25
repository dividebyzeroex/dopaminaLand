const fs = require('fs');

const injectorPath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/public/extension/dopamina-injector.js';
const pagePath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/src/app/extensao/page.tsx';

let injectorCode = fs.readFileSync(injectorPath, 'utf8');

const finalUrl = "javascript:void(eval(decodeURIComponent('" + encodeURIComponent(`(function(){${injectorCode}})()`).replace(/'/g, "%27") + "')))";

let pageCode = fs.readFileSync(pagePath, 'utf8');

const regex = /const bookmarkletCode = [\s\S]*?\/\/ Bypass React 19/m;
pageCode = pageCode.replace(regex, `const bookmarkletCode = "${finalUrl}";\n\n  // Bypass React 19`);

fs.writeFileSync(pagePath, pageCode);
console.log("Safe bookmarklet synced!");
