const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');

const replacements = [
  // Backgrounds
  { regex: /bg-\[#09090b\]/g, replace: 'bg-background' },
  { regex: /bg-\[#111\]/g, replace: 'bg-surface-light' },
  { regex: /bg-\[#121214\](?:\/90)?/g, replace: 'bg-white' },
  { regex: /bg-black(?:\/[0-9]+)?/g, replace: 'bg-surface-light' },
  { regex: /bg-zinc-900(?:\/[0-9]+)?/g, replace: 'bg-surface-light' },
  { regex: /bg-slate-900(?:\/[0-9]+)?/g, replace: 'bg-surface-light' },
  { regex: /bg-white(?:\/[0-9]+)?/g, replace: 'bg-surface-light' }, // this one is tricky, could replace actual white backgrounds, but in dark mode bg-white/5 is used for panels. We'll refine it:
  { regex: /bg-white\/[0-9]+/g, replace: 'bg-surface-lighter' },
  { regex: /bg-gradient-to-r/g, replace: 'bg-gradient-to-r' }, // keep gradients
  
  // Borders
  { regex: /border-white\/[0-9]+/g, replace: 'border-border' },
  { regex: /border-zinc-[0-9]+/g, replace: 'border-border' },
  
  // Text
  { regex: /text-white/g, replace: 'text-foreground' },
  { regex: /text-gray-[34]00/g, replace: 'text-muted' },
  { regex: /text-gray-500/g, replace: 'text-muted-light' },
  { regex: /text-zinc-[34]00/g, replace: 'text-muted' },
  { regex: /text-zinc-200/g, replace: 'text-foreground' },
  
  // Hover states
  { regex: /hover:bg-white\/[0-9]+/g, replace: 'hover:bg-surface-lighter' },
  { regex: /hover:bg-zinc-900(?:\/[0-9]+)?/g, replace: 'hover:bg-surface-lighter' },
  { regex: /hover:border-white\/[0-9]+/g, replace: 'hover:border-primary/30' },
  { regex: /hover:text-white/g, replace: 'hover:text-primary' },
  
  // Specific Neon elements
  { regex: /text-neon/g, replace: 'text-primary' },
  { regex: /bg-neon(?:\/[0-9]+)?/g, replace: 'bg-primary' },
  { regex: /border-neon/g, replace: 'border-primary' },
  { regex: /shadow-\[0_0_[^\]]+\]/g, replace: 'shadow-sm' }, // remove heavy glows
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      // Additional cleanups
      content = content.replace(/backdrop-blur-(?:sm|md)/g, ''); // remove blurs as they look weird on pure white
      content = content.replace(/shadow-2xl/g, 'shadow-md');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(componentsDir);
console.log('Migration complete.');
