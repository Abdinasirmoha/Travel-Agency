const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace text-slate-900 with text-blue-600 ONLY inside <h1 ...>
      content = content.replace(/(<h1[^>]*className="[^"]*)text-slate-900([^"]*")/g, '$1text-blue-600$2');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('All page headers have been updated to blue.');
