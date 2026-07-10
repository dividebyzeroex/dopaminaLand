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

function fixDopamina() {
  const targetDir = './src';
  
  walkDir(targetDir, function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace "dopaminando" with "dopamina" globally
    content = content.replace(/dopaminando/g, 'dopamina');
    content = content.replace(/Dopaminando/g, 'Dopamina');
    
    // Now restore the brand name in specific places we want it to stay "dopaminando"
    
    // 1. In layout.tsx
    if (filePath.endsWith('layout.tsx')) {
      content = content.replace(/dopamina ⚡ — Compre o que quiser/g, 'dopaminando ⚡ — Compre o que quiser');
      content = content.replace(/"dopamina"/g, '"dopaminando"'); // Keywords
    }

    // 2. In manifest.ts
    if (filePath.endsWith('manifest.ts')) {
      content = content.replace(/name: 'Dopamina'/g, "name: 'dopaminando'");
      content = content.replace(/short_name: 'Dopamina'/g, "short_name: 'dopaminando'");
    }

    // 3. In Header.tsx (Logo)
    if (filePath.endsWith('Header.tsx')) {
      // The logo text:
      content = content.replace(/>\s*dopamina\s*<\/span>/, '>dopaminando</span>');
      // But the search bar placeholder should be: buscar na dopaminando ou dopamina? User says "only the logo is dopaminando".
      // Wait, "buscar dopaminando" -> "buscar dopamina" is correct for the search input placeholder?
      // Let's leave placeholder as "buscar dopamina"
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed in: ${filePath}`);
    }
  });
}

fixDopamina();
