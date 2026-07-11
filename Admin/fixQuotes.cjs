const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

function fixFile(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;
  
  let newContent = "";
  let i = 0;
  while (i < content.length) {
    let match = content.indexOf('className="border border-slate-200 ', i);
    if (match === -1) {
      newContent += content.substring(i);
      break;
    }
    
    // Append everything up to the match
    newContent += content.substring(i, match);
    
    // Now we are at 'className="border border-slate-200 '
    let j = match;
    let clsStr = "";
    
    // Advance j past 'className="'
    while (j < content.length && content[j] !== '"') {
      clsStr += content[j];
      j++;
    }
    clsStr += '"'; // Include the opening quote
    j++;
    
    let inClass = true;
    while (j < content.length && inClass) {
      if (content[j] === '"') {
        clsStr += content[j];
        j++;
        inClass = false;
      } else if (content.substring(j, j + 2) === '/>' || content[j] === '>') {
        clsStr += '"';
        inClass = false;
      } else if (content[j] === '\n') {
        clsStr += '"';
        inClass = false;
      } else if (content.substring(j).match(/^\s+\w+=/)) {
        clsStr += '"';
        inClass = false;
      } else if (content.substring(j).match(/^\s+\{/)) {
        clsStr += '"';
        inClass = false;
      } else {
        clsStr += content[j];
        j++;
      }
    }
    
    newContent += clsStr;
    i = j;
  }
  
  if (original !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log("Fixed missing quotes in", fullPath);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      fixFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
['Layout', 'Header', 'Sidebar'].forEach(cmp => {
  const p = path.join(__dirname, 'src', 'components', `${cmp}.jsx`);
  if (fs.existsSync(p)) fixFile(p);
});
