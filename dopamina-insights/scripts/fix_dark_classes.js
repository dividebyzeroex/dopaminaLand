const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/components/dashboard');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { regex: /bg-zinc-950(?:\/\d+)?/g, replace: 'bg-surface-light' },
];

let changedCount = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }

  // specific for TabHeaderBanner
  if (file === 'TabHeaderBanner.tsx') {
    content = content.replace(/from-slate-950 via-slate-900 to-(\w+)-950\/30/g, 'from-white via-surface-light to-$1-500/10');
    content = content.replace(/text-(\w+)-400/g, 'text-$1-600');
  }
  
  if (file === 'AutomatedInsightsEngine.tsx') {
      content = content.replace(/text-foreground/g, 'text-foreground');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', file);
    changedCount++;
  }
}

console.log('Fixed', changedCount, 'files');
