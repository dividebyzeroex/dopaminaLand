const fs = require('fs');

const injectorPath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/public/extension/dopamina-injector.js';
const pagePath = '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/src/app/extensao/page.tsx';

// 1. Read injector code
let injectorCode = fs.readFileSync(injectorPath, 'utf8');

// 2. Extremely basic minification (just enough for bookmarklet, removing newlines and double spaces)
// We have to be careful with comments. Let's remove // comments first.
injectorCode = injectorCode.replace(/\/\/.*$/gm, '');
injectorCode = injectorCode.replace(/\n/g, '');
injectorCode = injectorCode.replace(/\s{2,}/g, ' ');
// Handle template literals inside string safely if needed, but for our simple minifier:
// Let's just create the bookmarklet wrapper
const bookmarklet = `javascript:void(${injectorCode})`;

// 3. Read page.tsx
let pageCode = fs.readFileSync(pagePath, 'utf8');

// 4. Replace the old bookmarklet string
pageCode = pageCode.replace(/const bookmarkletCode = `javascript:void\(.*\)`;/, `const bookmarkletCode = \`${bookmarklet}\`;`);

fs.writeFileSync(pagePath, pageCode);
console.log("Synced bookmarklet!");
