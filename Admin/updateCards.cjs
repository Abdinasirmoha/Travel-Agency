const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  // Remove shadows and gray borders from cards, add the blue top border
  // Note: We'll target the common card classes
  { 
    regex: /bg-white rounded-xl p-6 shadow-sm border border-slate-100/g, 
    replacement: 'bg-white rounded-xl p-6 border-t-4 border-t-blue-500 overflow-hidden' 
  },
  { 
    regex: /bg-white rounded-xl p-4 shadow-sm border border-slate-100/g, 
    replacement: 'bg-white rounded-xl p-4 border-t-4 border-t-blue-500 overflow-hidden' 
  },
  { 
    regex: /bg-white rounded-xl p-5 shadow-sm border border-slate-100/g, 
    replacement: 'bg-white rounded-xl p-5 border-t-4 border-t-blue-500 overflow-hidden' 
  },
  { 
    regex: /bg-white rounded-xl shadow-sm border border-slate-100/g, 
    replacement: 'bg-white rounded-xl border-t-4 border-t-blue-500 overflow-hidden' 
  },
  { 
    regex: /border-b border-slate-100/g, 
    replacement: 'border-b-0' 
  },
  {
    regex: /divide-slate-100/g,
    replacement: 'divide-transparent'
  },
  {
    regex: /shadow-sm/g,
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
      replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
      });
      // specific fix for some cards that might have had border-blue-200 etc
      content = content.replace(/border-t-4 border-blue-[234]00/g, 'border-t-4 border-t-blue-500');
      content = content.replace(/border border-slate-100/g, '');
      content = content.replace(/border border-slate-200/g, '');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('Card styles updated.');
