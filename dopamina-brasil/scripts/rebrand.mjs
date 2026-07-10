import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function rebrand() {
  const targetDir = './src';
  
  walkDir(targetDir, function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Tailwind colors
    content = content.replace(/bg-magenta/g, 'bg-neon');
    content = content.replace(/text-magenta/g, 'text-neon');
    content = content.replace(/border-magenta/g, 'border-neon');
    content = content.replace(/from-magenta/g, 'from-neon');
    content = content.replace(/to-magenta/g, 'to-neon');
    content = content.replace(/via-magenta/g, 'via-neon');
    
    content = content.replace(/bg-violet/g, 'bg-purple');
    content = content.replace(/text-violet/g, 'text-purple');
    content = content.replace(/border-violet/g, 'border-purple');
    content = content.replace(/from-violet/g, 'from-purple');
    content = content.replace(/to-violet/g, 'to-purple');
    content = content.replace(/via-violet/g, 'via-purple');

    // Naming & Emojis
    content = content.replace(/dopamina 💊/g, 'dopaminando ⚡');
    content = content.replace(/Dopamina 💊/g, 'Dopaminando ⚡');
    content = content.replace(/Dopamina Land/g, 'Dopaminando');
    content = content.replace(/\bDopamina\b/g, 'Dopaminando');
    
    // Replace "dopamina" (lowercase) carefully: 
    // Ignore if preceded by '://', or '-', or '.', or '/' to protect URLs and imports
    // Regex: lookbehind not allowed in old node, but we can use capturing groups
    content = content.replace(/([^a-zA-Z0-9_\-\/\.:])dopamina([^a-zA-Z0-9_\-\.])/g, '$1dopaminando$2');

    // Copy checkout changes
    content = content.replace(/Fatura zerada\./g, 'Cartão Blindado.');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Rebranded: ${filePath}`);
    }
  });
}

rebrand();
