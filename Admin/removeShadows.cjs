const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  // Remove shadow-sm
  {
    regex: / shadow-sm/g,
    replacement: ''
  },
  // Remove custom drop shadows e.g. shadow-[0_2px_10px_rgba(0,0,0,0.06)]
  {
    regex: / shadow-\[[^\]]+\]/g,
    replacement: ''
  },
  // Remove hover shadows e.g. hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]
  {
    regex: / hover:shadow-\[[^\]]+\]/g,
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
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
// also do Layout and Sidebar
const layoutPath = path.join(__dirname, 'src', 'components', 'Layout.jsx');
if (fs.existsSync(layoutPath)) {
  let layout = fs.readFileSync(layoutPath, 'utf8');
  replacements.forEach(r => { layout = layout.replace(r.regex, r.replacement); });
  fs.writeFileSync(layoutPath, layout, 'utf8');
}
const sidebarPath = path.join(__dirname, 'src', 'components', 'Sidebar.jsx');
if (fs.existsSync(sidebarPath)) {
  let sidebar = fs.readFileSync(sidebarPath, 'utf8');
  replacements.forEach(r => { sidebar = sidebar.replace(r.regex, r.replacement); });
  fs.writeFileSync(sidebarPath, sidebar, 'utf8');
}
const headerPath = path.join(__dirname, 'src', 'components', 'Header.jsx');
if (fs.existsSync(headerPath)) {
  let header = fs.readFileSync(headerPath, 'utf8');
  replacements.forEach(r => { header = header.replace(r.regex, r.replacement); });
  fs.writeFileSync(headerPath, header, 'utf8');
}

console.log('All shadows removed globally.');
