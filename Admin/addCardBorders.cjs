const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Invoices.jsx',
  'src/pages/Payments.jsx',
  'src/pages/Expenses.jsx',
  'src/pages/Staff.jsx',
  'src/pages/Reports/DashboardTab.jsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    // For Invoices and Payments which have p-5 and hover classes
    content = content.replace(/className="bg-white rounded-xl p-5 border border-slate-200 overflow-hidden hover:border-[^"]+"/g, 
      'className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden"');
      
    // For Invoices and Payments that already have border-t-4 border-slate-200
    content = content.replace(/className="bg-white rounded-xl p-5 border border-slate-200 overflow-hidden border-t-4 border-slate-200 hover:border-[^"]+"/g, 
      'className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden"');

    // For Expenses and Staff which have p-6
    content = content.replace(/className="bg-white rounded-xl p-6 border border-slate-200 overflow-hidden"/g, 
      'className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden"');

    // For Reports/DashboardTab.jsx
    content = content.replace(/className=\{`bg-white rounded-xl p-6 border \$\{border\}[^`]+`\}/g,
      'className={`bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 relative overflow-hidden group`}');

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Updated', filePath);
    } else {
      console.log('No matches or already updated in', filePath);
    }
  }
});
