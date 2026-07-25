const fs = require('fs');

const codePath = 'public/extension/dopamina-injector.js';
const pagePath = 'src/app/extensao/page.tsx';

let code = fs.readFileSync(codePath, 'utf8');
// Remove single line comments
code = code.replace(/\/\/.*$/gm, '');
// Remove multi line comments
code = code.replace(/\/\*[\s\S]*?\*\//g, '');
// Remove newlines and compress spaces
code = code.replace(/\n/g, '').replace(/\s{2,}/g, ' ');

// Wrap in IIFE and encode for the bookmarklet properly.
// The easiest way to get a bulletproof JS string literal is to use JSON.stringify.
const bookmarklet = 'javascript:void((function(){' + code + '})())';
const jsLiteral = JSON.stringify(bookmarklet); // This produces "javascript:..."

let page = fs.readFileSync(pagePath, 'utf8');

// Replace the entire bookmarkletCode variable declaration
page = page.replace(/const bookmarkletCode = [\s\S]*?(?=\n\n|\n  \/\/)/, `const bookmarkletCode = ${jsLiteral};`);

fs.writeFileSync(pagePath, page);
