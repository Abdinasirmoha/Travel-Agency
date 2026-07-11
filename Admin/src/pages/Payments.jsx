import { Search, Plus, X, Edit, Trash2, Briefcase, DollarSign, CreditCard, Banknote, TrendingUp, Globe, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchPayments, fetchCustomers, fetchInvoices, createPayment, updatePayment, deletePayment } from '../api';

export default function Payments() {
 const [payments, setPayments] = useState([]);
 const [customers, setCustomers] = useState([]);
 const [invoices, setInvoices] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');

 const location = useLocation();
 const navigate = useNavigate();

 const [formData, setFormData] = useState({
 receiptNumber: '',
 customer: '',
 invoice: '',
 amountPaid: 0,
 paymentDate: new Date().toISOString().split('T')[0],
 paymentMethod: 'Cash',
 reference: '',
 currency: 'USD'
 });

 const loadData = () => {
 setLoading(true);
 Promise.all([fetchPayments(), fetchCustomers(), fetchInvoices()])
 .then(([pData, cData, iData]) => {
 setPayments(pData);
 setCustomers(cData);
 setInvoices(iData);

 if (location.state?.autoOpen) {
 const inv = iData.find(i => i._id === location.state.invoiceId);
 setFormData({ 
 receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
 customer: location.state.customerId || '',
 invoice: location.state.invoiceId || '',
 amountPaid: inv ? Math.max(0, inv.totalAmount - (inv.amountPaid || 0)) : 0,
 paymentDate: new Date().toISOString().split('T')[0],
 paymentMethod: 'Cash',
 reference: '',
 currency: inv ? inv.currency : 'USD'
 });
 setIsModalOpen(true);
 // Clear state so it doesn't re-open on refresh
 window.history.replaceState({}, document.title);
 }
 })
 .catch(err => console.error(err))
 .finally(() => setLoading(false));
 };

 useEffect(() => {
  loadData();
  // Auto-refresh every 10s to reflect Mobile Money payment status changes in real-time
  const interval = setInterval(loadData, 10000);
  return () => clearInterval(interval);
  }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 setFormData({ 
 receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
 customer: customers.length > 0 ? customers[0]._id : '',
 invoice: '',
 amountPaid: 0,
 paymentDate: new Date().toISOString().split('T')[0],
 paymentMethod: 'Cash',
 reference: '',
 currency: 'USD'
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (payment) => {
 setEditingId(payment._id);
 setFormData({
 receiptNumber: payment.receiptNumber,
 customer: payment.customer ? (typeof payment.customer === 'object' ? payment.customer._id : payment.customer) : '',
 invoice: payment.invoice ? (typeof payment.invoice === 'object' ? payment.invoice._id : payment.invoice) : '',
 amountPaid: payment.amountPaid || 0,
 paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
 paymentMethod: payment.paymentMethod || 'Cash',
 reference: payment.reference || '',
 currency: payment.currency || 'USD'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this payment?')) return;
 try {
 await deletePayment(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete Payment");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.customer) {
 alert("Please select a Customer!");
 return;
 }
 
 const submitData = { ...formData };
 if (!submitData.invoice) delete submitData.invoice; // Remove if empty

 try {
 if (editingId) {
 await updatePayment(editingId, submitData);
 } else {
 await createPayment(submitData);
 }
 setIsModalOpen(false);
 
 // If they came from Quick Pay, send them back to invoices
 if (location.state?.autoOpen) {
 navigate('/invoices');
 } else {
 loadData();
 }
 } catch (error) {
 console.error("Failed to save", error);
 alert(`Failed to save: ${error.message}`);
 }
 };

 const filteredData = payments.filter(pay => {
 const senderObj = typeof pay.customer === 'object' ? pay.customer : null;
 const nameMatch = (senderObj?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const recMatch = (pay.receiptNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
 return nameMatch || recMatch;
 });

 const getAvatar = (name, gender) => {
 if (!name) return 'https://randomuser.me/api/portraits/men/1.jpg';
 const id = (name.length * 13) % 90 + 1;
 return `https://randomuser.me/api/portraits/${gender === 'Female' ? 'women' : 'men'}/${id}.jpg`;
 };

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 mb-1">Payments</h1>
  </div>
 <div className="flex space-x-3">
 <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ">
 <Plus className="w-4 h-4 mr-2" />
 New Payment
 </button>
 </div>
 </div>

 {/* ── Stat Cards ── */}
 {(() => {
  const totalPayments = payments.length;
  const completed      = payments.filter(p => p.status === 'Completed');
  const totalCollected = completed.reduce((s, p) => s + (p.amountPaid || 0), 0);

  // Cash: admin-entered cash receipts
  const cashCount = completed.filter(p => p.paymentMethod === 'Cash').length;
  const cashTotal = completed.filter(p => p.paymentMethod === 'Cash').reduce((s, p) => s + (p.amountPaid || 0), 0);

  // Card / Bank: Credit Card + Bank Transfer (admin)
  const cardCount = completed.filter(p => ['Bank Transfer', 'Credit Card'].includes(p.paymentMethod)).length;
  const cardTotal = completed.filter(p => ['Bank Transfer', 'Credit Card'].includes(p.paymentMethod)).reduce((s, p) => s + (p.amountPaid || 0), 0);

  // Online / EVC: Mobile Money via WaafiPay customer portal
  const onlineCount = completed.filter(p => p.paymentMethod === 'Mobile Money').length;
  const onlineTotal = completed.filter(p => p.paymentMethod === 'Mobile Money').reduce((s, p) => s + (p.amountPaid || 0), 0);
  const pendingMobileCount = payments.filter(p => p.paymentMethod === 'Mobile Money' && p.status === 'Pending').length;

  const todayTotal = completed
  .filter(p => new Date(p.paymentDate).toDateString() === new Date().toDateString())
  .reduce((s, p) => s + (p.amountPaid || 0), 0);
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
 {/* Total */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-blue-50"><DollarSign className="w-5 h-5 text-blue-600" /></div>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Payments</p>
 <h3 className="text-2xl font-bold text-slate-900">{totalPayments}</h3>
 <p className="text-xs text-slate-400 mt-1">${totalCollected.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} collected</p>
 </div>
 {/* Today */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-blue-50"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Today's Collection</p>
 <h3 className="text-2xl font-bold text-black">${todayTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</h3>
 <p className="text-xs text-slate-400 mt-1">Received today</p>
 </div>
 {/* Cash */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-blue-50"><Banknote className="w-5 h-5 text-blue-600" /></div>
 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{cashCount} txns</span>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Cash</p>
 <h3 className="text-2xl font-bold text-black">${cashTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</h3>
 <p className="text-xs text-slate-400 mt-1">{totalPayments ? Math.round(cashCount/totalPayments*100) : 0}% of payments</p>
 </div>
 {/* Card / Bank */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-blue-50"><CreditCard className="w-5 h-5 text-blue-600" /></div>
 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{cardCount} txns</span>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Card / Bank</p>
 <h3 className="text-2xl font-bold text-black">${cardTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</h3>
 <p className="text-xs text-slate-400 mt-1">{totalPayments ? Math.round(cardCount/totalPayments*100) : 0}% of payments</p>
 </div>
 {/* Online / EVC Plus — Mobile Money via WaafiPay */}
 <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-4  border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-3">
 <div className="p-2.5 rounded-xl bg-emerald-50"><Smartphone className="w-5 h-5 text-blue-500" /></div>
 <div className="flex flex-col items-end gap-1">
   <span className="text-xs font-bold text-blue-500 bg-emerald-50 px-2 py-0.5 rounded-full">{onlineCount} txns</span>
   {pendingMobileCount > 0 && (
     <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">{pendingMobileCount} pending</span>
   )}
 </div>
 </div>
 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Online / EVC</p>
 <h3 className="text-2xl font-bold text-black">${onlineTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</h3>
 <p className="text-xs text-slate-400 mt-1">{totalPayments ? Math.round(onlineCount/totalPayments*100) : 0}% of payments</p>
 </div>
 </div>
 );
 })()}

 <div className="bg-white rounded-xl p-4 overflow-hidden flex flex-wrap gap-4 items-center">
 <div className="flex-1 min-w-[250px]">
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
 <input 
 type="text" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by Receipt # or Customer..." 
 className="w-[400px]  border border-slate-300 pl-9 pr-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
 />
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Receipt</th>
 <th className="px-6 py-4">Customer</th>
 <th className="px-6 py-4">Date</th>
 <th className="px-6 py-4">Amount Paid</th>
 <th className="px-6 py-4">Method & Ref</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredData.map((pay) => {
  let customerObj = null;
  if (pay.customer && typeof pay.customer === 'object') customerObj = pay.customer;
  else if (pay.invoice && typeof pay.invoice.customer === 'object') customerObj = pay.invoice.customer;

  const isOnline = pay.paymentMethod === 'Online' || pay.paymentMethod === 'Mobile Money';
  const name = customerObj?.name || (isOnline ? 'Online Customer' : 'Walk-in Customer');
  const gender = customerObj?.gender || 'Male';
  const phone = customerObj?.phone || pay.payerAccountNo || '';

 return (
 <tr key={pay._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-4">
 <p className="font-bold text-slate-900">{pay.receiptNumber}</p>
 {pay.invoice && (
 <p className="text-xs text-slate-500 inline-block px-1.5 py-0.5 rounded mt-1 bg-slate-50">
 {typeof pay.invoice === 'object' ? pay.invoice.invoiceNumber : 'Linked'}
 </p>
 )}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center">
 <img src={getAvatar(name, gender)} alt={name} className="w-8 h-8 rounded-full object-cover mr-3 bg-slate-100" />
 <div>
 <p className="font-medium text-slate-900">{name}</p>
 <p className="text-xs text-slate-500">{phone}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{new Date(pay.paymentDate).toLocaleDateString()}</p>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">
 {pay.currency} {pay.amountPaid?.toFixed(2)}
 </p>
 </td>
 <td className="px-6 py-4">
 <p className={`font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
 pay.paymentMethod === 'Online'
 ? 'bg-blue-50 text-blue-700'
 : pay.paymentMethod === 'Cash'
 ? 'bg-blue-50 text-blue-700'
 : pay.paymentMethod === 'Credit Card'
 ? 'bg-blue-50 text-blue-700'
 : pay.paymentMethod === 'Mobile Money'
 ? 'bg-white text-slate-700'
 : 'bg-slate-100 text-slate-700'
 }`}>
 {pay.paymentMethod === 'Online' && '🌐 '}{pay.paymentMethod}
 </p>
 <p className="text-xs text-slate-500 mt-1">{pay.reference || 'No Ref'}</p>
 </td>
  <td className="px-6 py-4">
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    pay.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
    pay.status === 'Pending'   ? 'bg-amber-50 text-amber-700 border border-amber-200' :
    pay.status === 'Failed'    ? 'bg-red-50 text-red-600 border border-red-200' :
                                 'bg-slate-100 text-slate-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${
      pay.status === 'Completed' ? 'bg-emerald-500' :
      pay.status === 'Pending'   ? 'bg-amber-500 animate-pulse' :
      pay.status === 'Failed'    ? 'bg-red-500' : 'bg-slate-400'
    }`} />
    {pay.status || 'Completed'}
  </span>
  </td>
 <td className="px-6 py-4 text-right">
 <button onClick={() => handleOpenEdit(pay)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
 <Edit className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(pay._id)} className="p-2 text-slate-400 hover:text-slate-500 transition-colors ml-1">
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 );
 })}
 {filteredData.length === 0 && (
 <tr>
 <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No payments found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl overflow-y-auto max-h-[90vh] flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Payment' : 'New Payment Receipt'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 
 <div className="bg-slate-50 p-4 rounded-xl space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Receipt # <span className="text-slate-500">*</span></label>
 <input required value={formData.receiptNumber} onChange={e => setFormData({...formData, receiptNumber: e.target.value})} type="text" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Date</label>
 <input required value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} type="date" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div>
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
 
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Invoice (Optional)</label>
 <select value={formData.invoice} onChange={e => setFormData({...formData, invoice: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow bg-white">
 <option value="">-- No Invoice (Direct Payment) --</option>
 {invoices.filter(i => i.customer?._id === formData.customer || i.customer === formData.customer).map(inv => (
 <option key={inv._id} value={inv._id}>
 {inv.invoiceNumber} (Total: ${inv.totalAmount}) - {inv.status}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Paid <span className="text-slate-500">*</span></label>
 <input required value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value === '' ? '' : Number(e.target.value)})} type="number" step="0.01" min="0" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
 <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Cash">Cash</option>
 <option value="Bank Transfer">Bank Transfer</option>
 <option value="Credit Card">Credit Card</option>
 <option value="Mobile Money">Mobile Money</option>
 <option value="Online">🌐 Online</option>
 </select>
 </div>
 <div className="col-span-2">
 <label className="block text-sm font-semibold text-slate-700 mb-1">Reference (Check #, Txn ID)</label>
 <input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} type="text" placeholder="e.g. TR-12345678" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="pt-6 mt-auto">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Payment' : 'Save Payment Receipt'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
