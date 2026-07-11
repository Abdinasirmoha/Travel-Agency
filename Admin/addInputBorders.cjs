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
      
      // Add border border-slate-200 to inputs and selects if not already present
      // We look for className="... and insert it if 'border' is missing
      
      const replaceFunc = (match, p1, p2) => {
        if (!p2.includes('border')) {
          return `${p1}border border-slate-200 ${p2}`;
        }
        return match;
      };

      content = content.replace(/(<(?:input|select|textarea)[^>]*className=")([^"]*)(")/g, replaceFunc);
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
// Layout, Header, Sidebar
['Layout', 'Header', 'Sidebar'].forEach(cmp => {
  const p = path.join(__dirname, 'src', 'components', `${cmp}.jsx`);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/(<(?:input|select|textarea)[^>]*className=")([^"]*)(")/g, (match, p1, p2) => {
      if (!p2.includes('border')) {
        return `${p1}border border-slate-200 ${p2}`;
      }
      return match;
    });
    fs.writeFileSync(p, content, 'utf8');
  }
});

console.log('Borders added to all inputs and selects.');
