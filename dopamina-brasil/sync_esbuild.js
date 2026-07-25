const fs = require('fs');

const minifiedCode = fs.readFileSync('minified.js', 'utf8').trim();
const pagePath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/src/app/extensao/page.tsx';

let pageCode = fs.readFileSync(pagePath, 'utf8');

const finalUrl = `javascript:void((function(){${minifiedCode}})())`;
const jsString = JSON.stringify(finalUrl);

const regex = /const bookmarkletCode = [\s\S]*?\/\/ Bypass React 19/m;
pageCode = pageCode.replace(regex, `const bookmarkletCode = ${jsString};\n\n  // Bypass React 19`);

fs.writeFileSync(pagePath, pageCode);
console.log("Minified bookmarklet synced with 100% safety!");
