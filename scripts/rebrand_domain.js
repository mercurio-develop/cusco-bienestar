const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/unlockcusco\.app/g, 'cuscobienestar.com');
  content = content.replace(/UnlockCusco\.app/g, 'cuscobienestar.com');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next')) {
        traverseDir(fullPath);
      }
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.json') || fullPath.endsWith('.md')) {
        replaceInFile(fullPath);
      }
    }
  });
}

traverseDir(process.cwd());