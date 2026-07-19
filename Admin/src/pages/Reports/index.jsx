import { useState } from 'react';
import { Download, Printer, Filter, ChevronRight, FileSpreadsheet, X } from 'lucide-react';
import DashboardTab from './DashboardTab';
import TablesTab from './TablesTab';
import { usePermissions } from '../../context/AuthContext';

 export default function ReportsIndex() {
 const { hasPermission } = usePermissions();
 const [activeTab, setActiveTab] = useState('dashboard');
 const [dateFilter, setDateFilter] = useState('This Month');
 const [customRange, setCustomRange] = useState({ start: '', end: '' });
 const [appliedRange, setAppliedRange] = useState({ start: '', end: '' });

 if (!hasPermission('Reports', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Reports module.</p>
     </div>
   );
 }

 // Export handlers
 const handleExportPDF = () => {
 window.print(); // Fallback to print
 };

 const handleExportExcel = () => {
 alert('Excel Export will be triggered from the specific table view.');
 };

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 {/* Header & Breadcrumbs */}
 <div>

 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-2xl font-bold text-blue-600">Enterprise Reports</h1>
  </div>
 
 <div className="flex items-center space-x-3">
 <select 
 value={dateFilter}
 onChange={(e) => setDateFilter(e.target.value)}
 className="px-4 py-2 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 >
 <option value="Today">Today</option>
 <option value="This Week">This Week</option>
 <option value="This Month">This Month</option>
 <option value="This Year">This Year</option>
 <option value="All Time">All Time</option>
 <option value="Custom">Custom Range</option>
 </select>

 <button className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 " title="Filter Options">
 <Filter className="w-5 h-5" />
 </button>
 <button onClick={handleExportExcel} className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 " title="Export to Excel">
 <FileSpreadsheet className="w-5 h-5" />
 </button>
 <button onClick={handleExportPDF} className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 " title="Print / PDF">
 <Printer className="w-5 h-5" />
 </button>
 </div>
 </div>

 {dateFilter === 'Custom' && (
 <div className="mt-4 flex justify-end">
 <div className="flex items-center space-x-2 bg-white p-2 rounded-lg ">
 <input 
 type="date" 
 className="border border-slate-200 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 value={customRange.start}
 onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
 />
 <span className="text-slate-400 text-sm">to</span>
 <input 
 type="date" 
 className="border border-slate-200 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 value={customRange.end}
 onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
 />
 <button 
 onClick={() => setAppliedRange(customRange)}
 className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
 >
 Apply
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Tabs */}
 <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit -mt-3">
 <button
 onClick={() => setActiveTab('dashboard')}
 className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
 activeTab === 'dashboard' 
 ? 'bg-white text-blue-700 ' 
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
 }`}
 >
 Dashboard Overview
 </button>
 <button
 onClick={() => setActiveTab('tables')}
 className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
 activeTab === 'tables' 
 ? 'bg-white text-blue-700 ' 
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
 }`}
 >
 Data Tables & Ledgers
 </button>
 </div>

 {/* Content */}
 <div className="mt-6">
 {activeTab === 'dashboard' && (
 <DashboardTab dateFilter={dateFilter} customRange={appliedRange} />
 )}
 {activeTab === 'tables' && (
 <TablesTab dateFilter={dateFilter} customRange={appliedRange} />
 )}
 </div>
 </div>
 );
}
