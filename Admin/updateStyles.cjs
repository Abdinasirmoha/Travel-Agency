const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  // Primary to blue
  { regex: /primary-/g, replacement: 'blue-' },
  { regex: /bg-success\/10 text-success/g, replacement: 'bg-blue-50 text-blue-600' },
  
  // Status badges (emerald/green)
  { regex: /bg-emerald-50/g, replacement: 'bg-blue-50' },
  { regex: /text-emerald-500/g, replacement: 'text-blue-500' },
  { regex: /text-emerald-600/g, replacement: 'text-blue-600' },
  { regex: /text-emerald-700/g, replacement: 'text-blue-700' },
  { regex: /border-emerald-100/g, replacement: 'border-blue-100' },
  { regex: /border-t-emerald-700/g, replacement: 'border-slate-100' },
  { regex: /border-emerald-[0-9]+/g, replacement: 'border-blue-200' },
  
  // Status badges (red/amber/yellow/orange for inactive/pending)
  { regex: /bg-red-50 text-red-500/g, replacement: 'bg-white border border-slate-200 text-slate-500' },
  { regex: /bg-red-50 text-red-600/g, replacement: 'bg-white border border-slate-200 text-slate-500' },
  { regex: /bg-red-50/g, replacement: 'bg-white' },
  { regex: /text-red-500/g, replacement: 'text-slate-500' },
  { regex: /text-red-600/g, replacement: 'text-slate-500' },
  { regex: /border-t-red-[0-9]+/g, replacement: 'border-slate-100' },
  { regex: /border-red-[0-9]+/g, replacement: 'border-slate-200' },

  { regex: /bg-amber-50 text-amber-600/g, replacement: 'bg-white border border-slate-200 text-slate-500' },
  { regex: /bg-amber-50/g, replacement: 'bg-white' },
  { regex: /text-amber-500/g, replacement: 'text-slate-500' },
  { regex: /text-amber-600/g, replacement: 'text-slate-500' },
  { regex: /border-t-amber-[0-9]+/g, replacement: 'border-slate-100' },
  { regex: /border-amber-[0-9]+/g, replacement: 'border-slate-200' },
  
  { regex: /bg-yellow-50 text-yellow-600/g, replacement: 'bg-white border border-slate-200 text-slate-500' },
  { regex: /bg-yellow-50/g, replacement: 'bg-white' },
  { regex: /text-yellow-500/g, replacement: 'text-slate-500' },
  { regex: /text-yellow-600/g, replacement: 'text-slate-500' },
  { regex: /border-t-yellow-[0-9]+/g, replacement: 'border-slate-100' },
  
  { regex: /bg-orange-50 text-orange-600/g, replacement: 'bg-white border border-slate-200 text-slate-500' },
  { regex: /bg-orange-50/g, replacement: 'bg-white' },
  { regex: /text-orange-500/g, replacement: 'text-slate-500' },
  { regex: /text-orange-600/g, replacement: 'text-slate-500' },

  // Status badges (indigo/purple/cyan/blue)
  { regex: /bg-indigo-50/g, replacement: 'bg-blue-50' },
  { regex: /text-indigo-600/g, replacement: 'text-blue-600' },
  { regex: /text-indigo-700/g, replacement: 'text-blue-700' },
  { regex: /border-indigo-100/g, replacement: 'border-blue-100' },

  { regex: /bg-purple-50/g, replacement: 'bg-blue-50' },
  { regex: /text-purple-600/g, replacement: 'text-blue-600' },
  { regex: /border-t-purple-[0-9]+/g, replacement: 'border-slate-100' },
  { regex: /border-purple-[0-9]+/g, replacement: 'border-blue-200' },

  { regex: /bg-cyan-50/g, replacement: 'bg-blue-50' },
  { regex: /text-cyan-600/g, replacement: 'text-blue-600' },
  { regex: /border-t-cyan-[0-9]+/g, replacement: 'border-slate-100' },
  { regex: /border-cyan-[0-9]+/g, replacement: 'border-blue-200' },

  // Inactive gray badges
  { regex: /bg-slate-100 text-slate-500/g, replacement: 'bg-white border border-slate-200 text-slate-500' },
  
  // Specific buttons like Filters
  { regex: /hover:bg-slate-50"/g, replacement: 'hover:bg-blue-50 hover:text-blue-600"' },
  { regex: /hover:text-slate-600 bg-slate-50 hover:bg-slate-100/g, replacement: 'hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-100' },
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
console.log('Update complete.');
