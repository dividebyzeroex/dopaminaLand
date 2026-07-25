const fs = require('fs');

const injectorPath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/public/extension/dopamina-injector.js';
const pagePath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/src/app/extensao/page.tsx';

let injectorCode = fs.readFileSync(injectorPath, 'utf8');
const escapedCode = injectorCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');

let pageCode = fs.readFileSync(pagePath, 'utf8');
const lines = pageCode.split('\n');

// Line 10 (index 9) is the bookmarklet code
lines[9] = `  const bookmarkletCode = \`javascript:void((function () { ${escapedCode} })())\`;`;

fs.writeFileSync(pagePath, lines.join('\n'));
console.log("Fixed bookmarklet perfectly!");
