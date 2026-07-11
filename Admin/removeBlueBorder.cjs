const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  { 
    regex: /border-t-4 border-t-blue-500/g, 
    replacement: '' 
  },
  { 
    regex: /border-t-4 border-blue-500/g, 
    replacement: '' 
  }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We do NOT want to remove the prop 'borderColor="border-t-blue-500"' from Dashboard.jsx
      // because that is for the Top Stat Cards, which the user liked.
      // So let's only replace the literal CSS class strings that we added to div classNames.
      
      content = content.replace(/ border-t-4 border-t-blue-500/g, '');
      content = content.replace(/ border-t-4 border-blue-500/g, '');
      
      // Clean up multiple spaces that might have been left
      content = content.replace(/  +/g, ' ');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('Blue top borders removed.');
