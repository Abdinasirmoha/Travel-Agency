import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X, DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../api';
import { usePermissions } from '../context/AuthContext';

 export default function Expenses() {
 const { hasPermission } = usePermissions();
 const [expenses, setExpenses] = useState([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingExpense, setEditingExpense] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 const [formData, setFormData] = useState({
 title: '',
 amount: '',
 date: '',
 category: 'Office',
 status: 'Paid',
 notes: ''
 });

 useEffect(() => {
 loadExpenses();
 }, []);

 const loadExpenses = async () => {
 try {
 setIsLoading(true);
 const data = await fetchExpenses();
 setExpenses(data);
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const submitData = { ...formData };
 if (!submitData.date) delete submitData.date;

 if (editingExpense) {
 await updateExpense(editingExpense._id, submitData);
 } else {
 await createExpense(submitData);
 }
 setIsModalOpen(false);
 setEditingExpense(null);
 resetForm();
 loadExpenses();
 } catch (err) {
 setError(err.message);
 }
 };

 const handleDelete = async (id) => {
 if (window.confirm('Are you sure you want to delete this expense?')) {
 try {
 await deleteExpense(id);
 loadExpenses();
 } catch (err) {
 setError(err.message);
 }
 }
 };

 const openEditModal = (expense) => {
 setEditingExpense(expense);
 setFormData({
 title: expense.title,
 amount: expense.amount,
 date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
 category: expense.category,
 status: expense.status,
 notes: expense.notes || ''
 });
 setIsModalOpen(true);
 };

 const resetForm = () => {
 setFormData({
 title: '',
 amount: '',
 date: '',
 category: 'Office',
 status: 'Paid',
 notes: ''
 });
 };

 const filteredExpenses = expenses.filter(expense => 
 expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 expense.category.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const stats = useMemo(() => {
 const totalAmount = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
 const paidAmount = expenses.filter(e => e.status === 'Paid').reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
 const pendingAmount = expenses.filter(e => e.status === 'Pending').reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
 return {
 total: totalAmount,
 paid: paidAmount,
 pending: pendingAmount,
 count: expenses.length
 };
 }, [expenses]);

 if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Expenses...</div>;

 if (!hasPermission('Expenses', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Expenses module.</p>
     </div>
   );
 }

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 {error && (
 <div className="bg-white text-slate-500 px-4 py-3 rounded-xl flex items-center justify-between">
 <span>{error}</span>
 <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
 </div>
 )}

 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expenses</h1>
 <p className="text-slate-500 mt-1">Manage company spending and operational costs</p>
 </div>
 {hasPermission('Expenses', 'create') && (
   <button
   onClick={() => {
   resetForm();
   setEditingExpense(null);
   setIsModalOpen(true);
   }}
   className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
   >
   <Plus className="w-5 h-5 mr-2" />
   Record Expense
   </button>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <DollarSign className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Total Expenses</p>
 <h3 className="text-3xl font-bold text-slate-900">${stats.total.toLocaleString()}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <CheckCircle className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Paid Amount</p>
 <h3 className="text-3xl font-bold text-slate-900">${stats.paid.toLocaleString()}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-white text-slate-500">
 <Clock className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Pending Amount</p>
 <h3 className="text-3xl font-bold text-slate-900">${stats.pending.toLocaleString()}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <TrendingUp className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Expense Count</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.count}</h3>
 </div>
 </div>

 <div className="card">
 <div className="p-4  flex justify-between items-center  rounded-t-xl">
 <div className="relative w-96">
 <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search expenses..."
 className="border border-slate-200 w-full pl-10 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-slate-200 bg-white">
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
 <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {filteredExpenses.map((expense) => (
 <tr key={expense._id} className="hover:bg-slate-50 transition-colors">
 <td className="py-4 px-6">
 <div className="font-medium text-slate-900">{expense.title}</div>
 {expense.notes && <div className="text-sm text-slate-500">{expense.notes}</div>}
 </td>
 <td className="py-4 px-6">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
 {expense.category}
 </span>
 </td>
 <td className="py-4 px-6">
 <div className="font-medium text-slate-900">${expense.amount?.toLocaleString()}</div>
 </td>
 <td className="py-4 px-6 text-slate-500">
 {new Date(expense.date).toLocaleDateString()}
 </td>
 <td className="py-4 px-6">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
 expense.status === 'Paid' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
 }`}>
 {expense.status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Expenses', 'edit') && (
   <button onClick={() => openEditModal(expense)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit2 className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Expenses', 'delete') && (
   <button onClick={() => handleDelete(expense._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
   <Trash2 className="w-4 h-4" />
   </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
 <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
 <h2 className="text-xl font-bold text-slate-900">
 {editingExpense ? 'Edit Expense' : 'Add New Expense'}
 </h2>
 <button 
 onClick={() => setIsModalOpen(false)}
 className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="p-6">
 <div className="grid grid-cols-2 gap-6">
 <div className="col-span-2">
 <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
 <input
 type="text"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.title}
 onChange={(e) => setFormData({...formData, title: e.target.value})}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">Amount *</label>
 <input
 type="number"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.amount}
 onChange={(e) => setFormData({...formData, amount: e.target.value})}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
 <input
 type="date"
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.date}
 onChange={(e) => setFormData({...formData, date: e.target.value})}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
 <select
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.category}
 onChange={(e) => setFormData({...formData, category: e.target.value})}
 >
 <option value="Office">Office</option>
 <option value="Marketing">Marketing</option>
 <option value="Salary">Salary</option>
 <option value="Utilities">Utilities</option>
 <option value="Other">Other</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
 <select
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.status}
 onChange={(e) => setFormData({...formData, status: e.target.value})}
 >
 <option value="Paid">Paid</option>
 <option value="Pending">Pending</option>
 </select>
 </div>

 <div className="col-span-2">
 <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
 <textarea
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow min-h-[100px]"
 value={formData.notes}
 onChange={(e) => setFormData({...formData, notes: e.target.value})}
 ></textarea>
 </div>
 </div>

 <div className="mt-8 flex justify-end space-x-3">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20"
 >
 {editingExpense ? 'Update Expense' : 'Save Expense'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
