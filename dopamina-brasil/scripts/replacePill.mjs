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

function replacePill() {
  const targetDir = './src';
  
  walkDir(targetDir, function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/💊/g, '⚡');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Replaced pill in: ${filePath}`);
    }
  });
}

replacePill();
