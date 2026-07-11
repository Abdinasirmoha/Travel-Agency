const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  // success
  { regex: /text-success/g, replacement: 'text-blue-600' },
  { regex: /bg-success\/10/g, replacement: 'bg-blue-50' },
  { regex: /bg-success/g, replacement: 'bg-blue-600' },
  
  // danger
  { regex: /text-danger/g, replacement: 'text-slate-500' },
  { regex: /bg-danger\/10/g, replacement: 'bg-white border border-slate-200' },
  { regex: /bg-danger/g, replacement: 'bg-white text-slate-500' },

  // warning
  { regex: /text-warning/g, replacement: 'text-slate-500' },
  { regex: /bg-warning\/10/g, replacement: 'bg-white border border-slate-200' },
  { regex: /bg-warning/g, replacement: 'bg-white text-slate-500' },

  // all other specific colors
  { regex: /(text|bg|border|border-t|border-b|border-l|border-r)-(emerald|green|indigo|purple|cyan|violet|fuchsia|pink|rose|teal)-(\d+)/g, replacement: '$1-blue-$3' },
  
  { regex: /(text|bg|border|border-t|border-b|border-l|border-r)-(red|amber|yellow|orange)-(\d+)/g, replacement: '$1-slate-$3' },

  // specifically catch those weird ones like bg-violet-50 text-violet-700 -> it will now be bg-blue-50 text-blue-700
  // and text-orange-700 -> text-slate-700
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
      });
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('Update 2 complete.');
