const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.jsx'));

const colorRegex = /\b(?:bg|text|border|ring|shadow)-([a-z]+)(?:-\d+(?:\/\d+)?)?\b/g;
const ignoreList = ['transparent', 'current', 'auto', 'hidden', 'none', 'sans', 'sm', 'md', 'lg', 'xl', '2xl'];

files.forEach(file => {
  const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
  let match;
  const colors = new Set();
  
  while ((match = colorRegex.exec(content)) !== null) {
    const color = match[1];
    if (!ignoreList.includes(color) && color.length > 2) {
      colors.add(color);
    }
  }
  
  // also check for literal white/black
  if (content.includes('bg-white') || content.includes('text-white')) colors.add('white');
  if (content.includes('bg-black') || content.includes('text-black')) colors.add('black');

  console.log(`- **${file.replace('.jsx', '')}**: ${Array.from(colors).sort().join(', ')}`);
});
