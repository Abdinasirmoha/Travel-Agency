import { useState, useEffect } from 'react';
import { 
 fetchReportRevenue, fetchReportInvoices, fetchReportPayments, 
 fetchReportBookings, fetchReportVisas, fetchReportExpenses 
} from '../../api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

const computeDateRange = (filter, custom) => {
 const now = new Date();
 let start = null;
 let end = null;

 switch(filter) {
 case 'Today':
 start = new Date(now.setHours(0,0,0,0));
 end = new Date(now);
 end.setHours(23,59,59,999);
 break;
 case 'This Week':
 const first = now.getDate() - now.getDay();
 start = new Date(now.setDate(first));
 start.setHours(0,0,0,0);
 end = new Date(start);
 end.setDate(end.getDate() + 6);
 end.setHours(23,59,59,999);
 break;
 case 'This Month':
 start = new Date(now.getFullYear(), now.getMonth(), 1);
 end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
 end.setHours(23,59,59,999);
 break;
 case 'This Year':
 start = new Date(now.getFullYear(), 0, 1);
 end = new Date(now.getFullYear(), 11, 31);
 end.setHours(23,59,59,999);
 break;
 case 'Custom':
 if (custom.start) {
 start = new Date(custom.start);
 start.setHours(0,0,0,0);
 }
 if (custom.end) {
 end = new Date(custom.end);
 end.setHours(23,59,59,999);
 }
 break;
 default:
 start = null;
 end = null;
 }
 return { startDate: start?.toISOString(), endDate: end?.toISOString() };
};

export default function TablesTab({ dateFilter, customRange }) {
 const [activeTable, setActiveTable] = useState('Revenue');
 const [data, setData] = useState([]);
 const [isLoading, setIsLoading] = useState(false);

 const tabs = ['Revenue', 'Invoices', 'Payments', 'Bookings', 'Visa', 'Expenses'];

 useEffect(() => {
 loadData();
 }, [activeTable, dateFilter, customRange]);

 const loadData = async () => {
 setIsLoading(true);
 try {
 const { startDate, endDate } = computeDateRange(dateFilter, customRange);
 console.log("Tables fetching for range:", { activeTable, dateFilter, startDate, endDate });
 if (dateFilter === 'Custom' && (!startDate || !endDate)) {
 setIsLoading(false);
 return;
 }

 const filters = { startDate, endDate };
 let resData = [];
 
 switch(activeTable) {
 case 'Revenue': resData = await fetchReportRevenue(filters); break;
 case 'Invoices': resData = await fetchReportInvoices(filters); break;
 case 'Payments': resData = await fetchReportPayments(filters); break;
 case 'Bookings': resData = await fetchReportBookings(filters); break;
 case 'Visa': resData = await fetchReportVisas(filters); break;
 case 'Expenses': resData = await fetchReportExpenses(filters); break;
 }
 setData(resData);
 } catch (error) {
 console.error(error);
 setData([]);
 } finally {
 setIsLoading(false);
 }
 };

 const handleExportExcel = () => {
 const ws = XLSX.utils.json_to_sheet(data.map(item => flattenObj(item)));
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, activeTable);
 XLSX.writeFile(wb, `${activeTable}_Report.xlsx`);
 };

 const handleExportPDF = () => {
 const doc = new jsPDF();
 doc.text(`${activeTable} Report`, 14, 15);
 
 // Very basic column generation based on data keys
 if (data.length > 0) {
 const flattened = data.map(item => flattenObj(item));
 const head = [Object.keys(flattened[0])];
 const body = flattened.map(item => Object.values(item).map(v => String(v || '')));
 
 doc.autoTable({
 head: head,
 body: body,
 startY: 20,
 theme: 'grid',
 styles: { fontSize: 8 }
 });
 }
 
 doc.save(`${activeTable}_Report.pdf`);
 };

 // Helper to flatten nested objects for Excel/PDF exports
 const flattenObj = (obj, parent = '', res = {}) => {
 for (let key in obj) {
 if (key === '_id' || key === '__v') continue;
 let propName = parent ? parent + '_' + key : key;
 if (typeof obj[key] == 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
 flattenObj(obj[key], propName, res);
 } else {
 res[propName] = obj[key];
 }
 }
 return res;
 };

 return (
 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 
 <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
 <div className="flex space-x-2">
 {tabs.map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTable(tab)}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
 activeTable === tab ? 'bg-blue-600 text-white ' : 'text-slate-600 hover:bg-slate-200'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>
 <div className="flex space-x-2">
 <button onClick={handleExportExcel} className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold hover:bg-blue-100">
 <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
 </button>
 <button onClick={handleExportPDF} className="flex items-center px-3 py-1.5 bg-white text-slate-700 rounded-md text-xs font-bold hover:bg-slate-100">
 <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
 </button>
 </div>
 </div>

 <div className="p-6 overflow-x-auto">
 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
 <span className="ml-3 text-slate-500">Loading {activeTable} Data...</span>
 </div>
 ) : data.length === 0 ? (
 <div className="text-center py-12 text-slate-500">No data found for this period.</div>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-slate-200 bg-white">
 {Object.keys(flattenObj(data[0])).slice(0, 7).map(key => (
 <th key={key} className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">{key.replace(/_/g, ' ')}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {data.map((row, i) => {
 const flatRow = flattenObj(row);
 return (
 <tr key={i} className="hover:bg-white transition-colors">
 {Object.values(flatRow).slice(0, 7).map((val, j) => (
 <td key={j} className="py-3 px-4 text-sm text-slate-700">
 {val === null || val === undefined ? '-' : 
 (Array.isArray(val) ? `${val.length} items` : 
 (typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val).substring(0, 30)))}
 </td>
 ))}
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 <div className="px-6 py-4 bg-white border-t border-slate-200 text-sm text-slate-500 flex justify-between">
 <span>Showing {data.length} records</span>
 {/* Pagination stub */}
 <div className="flex space-x-2">
 <button className="px-3 py-1 bg-white rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled>Previous</button>
 <button className="px-3 py-1 bg-white rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled>Next</button>
 </div>
 </div>
 </div>
 );
}
