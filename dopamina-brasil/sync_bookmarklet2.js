const fs = require('fs');

const injectorPath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/public/extension/dopamina-injector.js';
const pagePath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/src/app/extensao/page.tsx';

let injectorCode = fs.readFileSync(injectorPath, 'utf8');

// A safer way to put it in a template literal: escape backticks and ${}
const escapedCode = injectorCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');

let pageCode = fs.readFileSync(pagePath, 'utf8');

// Replace everything between const bookmarkletCode = `javascript:void((function () { ... })()
const regex = /const bookmarkletCode = `javascript:void\(\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\)\)`;/;
pageCode = pageCode.replace(regex, `const bookmarkletCode = \`javascript:void((function () { ${escapedCode} })())\`;`);

fs.writeFileSync(pagePath, pageCode);
console.log("Fixed bookmarklet safely!");
