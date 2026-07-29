const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/TrendingProductsShowcase.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { regex: /text-white/g, replace: 'text-foreground' },
  { regex: /border-white\/10/g, replace: 'border-border' },
  { regex: /border-white\/5/g, replace: 'border-border' },
  { regex: /bg-white\/\[0\.02\]/g, replace: 'bg-surface' },
  { regex: /bg-white\/5/g, replace: 'bg-surface-light' },
  { regex: /bg-white\/10/g, replace: 'bg-surface-light border border-border' },
  { regex: /bg-\[\#0a0a0f\]\/90/g, replace: 'bg-white' },
  { regex: /bg-black\/50/g, replace: 'bg-surface-light' },
  { regex: /text-gray-[34]00/g, replace: 'text-muted' },
  { regex: /text-gray-600/g, replace: 'text-muted-light' },
  { regex: /bg-\[\#22c55e\] text-black/g, replace: 'bg-primary text-primary-foreground' },
  { regex: /hover:bg-white/g, replace: 'hover:bg-primary/90' },
  { regex: /hover:bg-white\/20/g, replace: 'hover:bg-surface-lighter' },
  { regex: /text-\[\#22c55e\]/g, replace: 'text-primary' },
  { regex: /bg-\[\#22c55e\]\/20/g, replace: 'bg-primary/10' },
  { regex: /border-\[\#22c55e\]\/40/g, replace: 'border-primary/20' },
  { regex: /hover:border-\[\#22c55e\]\/40/g, replace: 'hover:border-primary/40' },
  { regex: /border-\[\#22c55e\]/g, replace: 'border-primary' },
  { regex: /hover:bg-\[\#22c55e\]\/30/g, replace: 'hover:bg-primary/20' },
];

for (const { regex, replace } of replacements) {
  content = content.replace(regex, replace);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed TrendingProductsShowcase.tsx');
