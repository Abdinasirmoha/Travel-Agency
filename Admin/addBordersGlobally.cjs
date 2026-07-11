const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  // The first round of scripts stripped out border border-slate-100 and shadow-sm
  // So now we have things like 'bg-white rounded-xl p-4 overflow-hidden'
  // Or 'bg-white rounded-xl overflow-hidden overflow-hidden'
  // We want to restore a clean border-slate-200 and shadow-sm so they look like cards again.
  {
    regex: /bg-white rounded-xl p-6 (?!shadow-\[|border )/g,
    replacement: 'bg-white rounded-xl p-6 border border-slate-200 shadow-sm '
  },
  {
    regex: /bg-white rounded-xl p-5 (?!shadow-\[|border )/g,
    replacement: 'bg-white rounded-xl p-5 border border-slate-200 shadow-sm '
  },
  {
    regex: /bg-white rounded-xl p-4 (?!shadow-\[|border )/g,
    replacement: 'bg-white rounded-xl p-4 border border-slate-200 shadow-sm '
  },
  {
    // For tables without padding
    regex: /bg-white rounded-xl overflow-hidden/g,
    replacement: 'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'
  },
  {
    // Fix any double overflow-hidden
    regex: /overflow-hidden overflow-hidden/g,
    replacement: 'overflow-hidden'
  },
  {
    // Fix duplicate borders if any
    regex: /border border-slate-200 shadow-sm border border-slate-200 shadow-sm/g,
    replacement: 'border border-slate-200 shadow-sm'
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
      
      replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
      });
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('Borders and shadows restored to all cards.');
