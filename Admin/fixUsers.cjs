const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Users.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// We want to delete lines 341 to 535 (inclusive).
// Line numbers are 1-indexed, array is 0-indexed.
// So we remove indices 340 to 534.
const newLines = [
  ...lines.slice(0, 340),
  ...lines.slice(535)
];

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Fixed Users.jsx syntax by removing duplicated block.');
