import { Search, Plus, X, Edit, Trash2, FileText, CreditCard, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInvoices, fetchCustomers, createInvoice, updateInvoice, deleteInvoice, fetchTickets, fetchVisaApplications, fetchTourBookings, fetchCargo } from '../api';
import { usePermissions } from '../context/AuthContext';

 export default function Invoices() {
 const { hasPermission } = usePermissions();
 const [invoices, setInvoices] = useState([]);
 const [customers, setCustomers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [unbilledData, setUnbilledData] = useState([]);
 const navigate = useNavigate();
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('All');

 const [formData, setFormData] = useState({
 invoiceNumber: '',
 customer: '',
 date: new Date().toISOString().split('T')[0],
 dueDate: '',
 items: [{ description: '', amount: 0 }],
 status: 'Unpaid',
 currency: 'USD'
 });

 const loadData = () => {
 setLoading(true);
 Promise.all([fetchInvoices(), fetchCustomers()])
 .then(([invData, cData]) => {
 setInvoices(invData);
 setCustomers(cData);
 })
 .catch(err => console.error(err))
 .finally(() => setLoading(false));
 };

 useEffect(() => {
  loadData();
  // Auto-refresh every 10s so admin sees online payment updates in real-time
  const interval = setInterval(loadData, 10000);
  return () => clearInterval(interval);
  }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 setFormData({ 
 invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
 customer: customers.length > 0 ? customers[0]._id : '',
 date: new Date().toISOString().split('T')[0],
 dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
 items: [{ description: '', amount: 0 }],
 status: 'Unpaid',
 currency: 'USD'
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (invoice) => {
 setEditingId(invoice._id);
 setFormData({
 invoiceNumber: invoice.invoiceNumber,
 customer: invoice.customer ? (typeof invoice.customer === 'object' ? invoice.customer._id : invoice.customer) : '',
 date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : '',
 dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
 items: invoice.items.length > 0 ? invoice.items : [{ description: '', amount: 0 }],
 status: invoice.status || 'Unpaid',
 currency: invoice.currency || 'USD'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this invoice?')) return;
 try {
 await deleteInvoice(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete Invoice");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.customer) {
 alert("Please select a Customer!");
 return;
 }

 // Auto calculate total
 const totalAmount = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
 const submitData = { ...formData, totalAmount };

 try {
 if (editingId) {
 await updateInvoice(editingId, submitData);
 } else {
 await createInvoice(submitData);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save", error);
 alert(`Failed to save: ${error.message}`);
 }
 };

 const addItem = () => {
 setFormData({ ...formData, items: [...formData.items, { description: '', amount: 0 }] });
 };

 const updateItem = (index, field, value) => {
 const newItems = [...formData.items];
 newItems[index][field] = value;
 setFormData({ ...formData, items: newItems });
 };

 const removeItem = (index) => {
 const newItems = formData.items.filter((_, i) => i !== index);
 setFormData({ ...formData, items: newItems.length > 0 ? newItems : [{ description: '', amount: 0 }] });
 };

 const getStatusColor = (status) => {
  switch(status) {
  case 'Paid':           return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  case 'Partially Paid': return 'bg-amber-50 text-amber-700 border border-amber-200';
  case 'Unpaid':         return 'bg-red-50 text-red-600 border border-red-200';
  case 'Draft':          return 'bg-slate-100 text-slate-600 border border-slate-200';
  default:               return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
  };

 const filteredData = invoices.filter(inv => {
 const senderObj = typeof inv.customer === 'object' ? inv.customer : null;
 const nameMatch = (senderObj?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const invMatch = (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
 const statusMatch = filterStatus === 'All' || inv.status === filterStatus;
 return (nameMatch || invMatch) && statusMatch;
 });

 const getAvatar = (name, gender) => {
 if (!name) return 'https://randomuser.me/api/portraits/men/1.jpg';
 const id = (name.length * 13) % 90 + 1;
 return `https://randomuser.me/api/portraits/${gender === 'Female' ? 'women' : 'men'}/${id}.jpg`;
 };

 if (loading) return <div className="p-8 text-center text-slate-500">Loading Invoices...</div>;

 if (!hasPermission('Finance', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Finance module.</p>
     </div>
   );
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 mb-1">Invoices</h1>
 <p className="text-slate-500 text-sm">Manage billing and collect payments from customers.</p>
 </div>
 <div className="flex space-x-3">
 {hasPermission('Finance', 'create') && (
   <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
   <Plus className="w-4 h-4 mr-2" />
   Create Invoice
   </button>
 )}
 </div>
 </div>

 {/* ── Stat Cards ── */}
 {(() => {
 const totalInvoices = invoices.length;
 const totalAmount = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
 const paidCount = invoices.filter(i => i.status === 'Paid').length;
 const paidAmount = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.totalAmount || 0), 0);
 const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length;
 const unpaidAmount = invoices.filter(i => i.status === 'Unpaid').reduce((s, i) => s + (i.totalAmount || 0), 0);
 const partialCount = invoices.filter(i => i.status === 'Partially Paid').length;
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 {/* Total */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-blue-50"><FileText className="w-5 h-5 text-blue-600" /></div>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Invoices</p>
 <h3 className="text-3xl font-bold text-slate-900">{totalInvoices}</h3>
 <p className="text-xs text-slate-400 mt-1">${totalAmount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} total value</p>
 </div>
 {/* Paid */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-blue-50"><CheckCircle className="w-5 h-5 text-blue-600" /></div>
 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{totalInvoices ? Math.round(paidCount/totalInvoices*100) : 0}%</span>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Paid</p>
 <h3 className="text-3xl font-bold text-black">{paidCount}</h3>
 <p className="text-xs text-black mt-1">${paidAmount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} collected</p>
 </div>
 {/* Unpaid */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-white"><AlertCircle className="w-5 h-5 text-slate-500" /></div>
 <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full">{totalInvoices ? Math.round(unpaidCount/totalInvoices*100) : 0}%</span>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Unpaid</p>
 <h3 className="text-3xl font-bold text-black">{unpaidCount}</h3>
 <p className="text-xs text-slate-400 mt-1">${unpaidAmount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} outstanding</p>
 </div>
 {/* Partial */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-white"><Clock className="w-5 h-5 text-slate-500" /></div>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Partially Paid</p>
 <h3 className="text-3xl font-bold text-black">{partialCount}</h3>
 <p className="text-xs text-slate-400 mt-1">Awaiting balance</p>
 </div>
 </div>
 );
 })()}

 <div className="bg-white rounded-xl p-4  overflow-hidden flex flex-wrap gap-4 items-center">
 <div className="flex-1 min-w-[250px]">
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
 <input 
 type="text" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by Invoice # or Customer..." 
 className="w-[400px]  border border-slate-300 pl-9 pr-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
 />
 </div>
 </div>
 <div className="w-48">
 <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 <option value="All" className="text-black">All Statuses</option>
 <option value="Draft">Draft</option>
 <option value="Unpaid">Unpaid</option>
 <option value="Partially Paid">Partially Paid</option>
 <option value="Paid">Paid</option>
 </select>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Invoice</th>
 <th className="px-6 py-4">Customer</th>
 <th className="px-6 py-4">Date / Due</th>
 <th className="px-6 py-4">Amount</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredData.map((inv) => {
 const customerObj = typeof inv.customer === 'object' ? inv.customer : null;
 const name = customerObj?.name || 'Unknown';
 const gender = customerObj?.gender || 'Male';

 return (
 <tr key={inv._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-4">
 <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
 <p className="text-xs text-slate-500">{inv.items?.length || 0} items</p>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center">
 <img src={getAvatar(name, gender)} alt={name} className="w-8 h-8 rounded-full object-cover mr-3 bg-slate-100" />
 <div>
 <p className="font-medium text-slate-900">{name}</p>
 <p className="text-xs text-slate-500">{customerObj?.phone}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{new Date(inv.date).toLocaleDateString()}</p>
 <p className="text-xs text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{inv.currency} {inv.totalAmount?.toFixed(2)}</p>
 {inv.amountPaid > 0 && (
 <p className="text-xs text-blue-600 font-medium">Paid: {inv.currency} {inv.amountPaid.toFixed(2)}</p>
 )}
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusColor(inv.status)}`}>
 &bull; {inv.status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Finance', 'create') && (
   <button 
   onClick={() => navigate(`/payments?invoice=${inv._id}`)} 
   className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
   title="Record Payment"
   >
   <CreditCard className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Finance', 'edit') && (
   <button onClick={() => handleOpenEdit(inv)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Finance', 'delete') && (
   <button onClick={() => handleDelete(inv._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
   <Trash2 className="w-4 h-4" />
   </button>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 {filteredData.length === 0 && (
 <tr>
 <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh] flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Invoice' : 'New Invoice'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 
 <div className="bg-slate-50 p-4 rounded-xl space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Invoice # <span className="text-slate-500">*</span></label>
 <input required value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} type="text" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div className="col-span-3">
 <label className="block text-sm font-semibold text-slate-700 mb-1">Customer <span className="text-slate-500">*</span></label>
 <select required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 {customers.length === 0 && <option value="">No Customers Available</option>}
 {customers.map(c => (
 <option key={c._id} value={c._id}>
 {c.name} - {c.phone}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
 <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
 <input required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} type="date" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Draft">Draft</option>
 <option value="Unpaid">Unpaid</option>
 <option value="Partially Paid">Partially Paid</option>
 <option value="Paid">Paid</option>
 </select>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <h3 className="text-sm font-bold text-slate-700">Line Items</h3>
 <button type="button" onClick={addItem} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
 <Plus className="w-3 h-3 mr-1" /> Add Item
 </button>
 </div>
 
 {formData.items.map((item, index) => (
 <div key={index} className="flex gap-3 items-start">
 <div className="flex-1">
 <input 
 required 
 value={item.description} 
 onChange={(e) => updateItem(index, 'description', e.target.value)} 
 placeholder="Description (e.g. Visa Fee)" 
 type="text" 
 className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" 
 />
 </div>
 <div className="w-32">
 <input 
 required 
 value={item.amount} 
 onChange={(e) => updateItem(index, 'amount', e.target.value === '' ? '' : Number(e.target.value))} 
 placeholder="Amount" 
 type="number" 
 min="0"
 step="0.01"
 className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" 
 />
 </div>
 <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-400 hover:text-slate-500 transition-colors mt-0.5">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))}

 <div className="flex justify-end pt-4 border-t border-slate-100">
 <div className="w-48 flex justify-between items-center text-lg">
 <span className="font-semibold text-slate-500">Total:</span>
 <span className="font-bold text-slate-900">{formData.currency} {totalCalculated.toFixed(2)}</span>
 </div>
 </div>
 </div>

 <div className="pt-6 mt-auto">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Invoice' : 'Save Invoice'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
