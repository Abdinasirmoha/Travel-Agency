const fs = require('fs');
const path = require('path');

const fullPath = path.join(__dirname, 'src/pages/Users.jsx');
if (fs.existsSync(fullPath)) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Replace stats cards in Users.jsx
  content = content.replace(/className="bg-white rounded-xl p-6 border border-slate-200 overflow-hidden"/g, 
    'className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden"');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated Users.jsx');
  } else {
    console.log('No matches or already updated in Users.jsx');
  }
}
