import { Search, Filter, RefreshCw, Download, Plus, User, X, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

const mockCustomers = [
 { _id: '1', name: 'Alexander Hamilton', email: 'alex.h@finance.com', passportNo: 'Z12345678', nationality: 'USA', natCode: 'US', contact: '+1 555-0102', gender: 'Male', status: 'Active' },
 { _id: '2', name: 'Sofia Rodriguez', email: 'sofia.r@travel.es', passportNo: 'B98765432', nationality: 'Spain', natCode: 'ES', contact: '+34 912 345 678', gender: 'Female', status: 'Active' },
];

export default function Customers() {
 const [customersData, setCustomersData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 
 const getAvatar = (name, gender) => {
 if (!name) return 'https://randomuser.me/api/portraits/men/1.jpg';
 const id = (name.length * 13) % 90 + 1;
 return `https://randomuser.me/api/portraits/${gender === 'Female' ? 'women' : 'men'}/${id}.jpg`;
 };
 
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('All');
 const [filterNationality, setFilterNationality] = useState('All');
 
 // Form state matches backend schema
 const [formData, setFormData] = useState({
 name: '', email: '', passportNo: '', nationality: '', natCode: 'US', contact: '', gender: 'Male', status: 'Active'
 });

 const loadCustomers = () => {
 setLoading(true);
 fetchCustomers()
 .then(data => {
 setCustomersData(data.length > 0 ? data : mockCustomers);
 })
 .catch(err => {
 console.error(err);
 setCustomersData(mockCustomers);
 })
 .finally(() => setLoading(false));
 };

 useEffect(() => {
 loadCustomers();
 }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 setFormData({ name: '', email: '', passportNo: '', nationality: '', natCode: 'US', contact: '', gender: 'Male', status: 'Active' });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (customer) => {
 setEditingId(customer._id);
 setFormData({
 name: customer.name,
 email: customer.email,
 passportNo: customer.passportNo || customer.passport || '',
 nationality: customer.nationality,
 natCode: customer.natCode || 'US',
 contact: customer.contact || customer.phone || '',
 gender: customer.gender || 'Male',
 status: customer.status || 'Active'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this customer?')) return;
 try {
 await deleteCustomer(id);
 loadCustomers();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete customer");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 if (editingId) {
 await updateCustomer(editingId, formData);
 } else {
 await createCustomer(formData);
 }
 setIsModalOpen(false);
 loadCustomers(); // Reload data
 } catch (error) {
 console.error("Failed to save customer", error);
 alert(`Failed to save customer: ${error.message}`);
 }
 };

 const filteredCustomers = customersData.filter(c => {
 const searchMatch = 
 c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (c.passportNo || c.passport || '').toLowerCase().includes(searchQuery.toLowerCase());
 
 const statusMatch = filterStatus === 'All' || c.status === filterStatus;
 const nationalityMatch = filterNationality === 'All' || c.nationality === filterNationality;
 
 return searchMatch && statusMatch && nationalityMatch;
 });

 const nationalities = ['All', ...new Set(customersData.map(c => c.nationality))];

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 mb-1">Customer Management</h1>
  </div>
 <div className="flex space-x-3">
 <button className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ">
 <Download className="w-4 h-4 mr-2" />
 Export PDF
 </button>
 <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ">
 <Plus className="w-4 h-4 mr-2" />
 Add New Customer
 </button>
 </div>
 </div>

 <div className="bg-white rounded-xl p-4  overflow-hidden flex flex-wrap gap-4 items-center justify-between">
 <div className="flex items-center flex-1 min-w-[300px]">
 <div className="relative w-full max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 " />
 <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Search by name, email, or passport..." className="w-full pl-10 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-300 transition-shadow" />
 </div>
 </div>
 <div className="flex space-x-3">
 <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className=" rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 <option value="All">Status: All</option>
 <option value="Active">Active</option>
 <option value="Inactive">Inactive</option>
 </select>
 <select value={filterNationality} onChange={e => setFilterNationality(e.target.value)} className=" rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 {nationalities.map(n => (
 <option key={n} value={n}>{n === 'All' ? 'Nationality: All' : n}</option>
 ))}
 </select>
 <button className="flex items-center px-3 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-600">
 <Filter className="w-4 h-4 mr-2" />
 Filters
 </button>
 <button onClick={loadCustomers} className="p-2 bg-white text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600">
 <RefreshCw className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Icon</th>
 <th className="px-6 py-4">Customer Name</th>
 <th className="px-6 py-4">Passport No.</th>
 <th className="px-6 py-4">Nationality</th>
 <th className="px-6 py-4">Contact</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredCustomers.map((c) => (
 <tr key={c._id || c.id} className="hover:bg-blue-50/50 transition-colors">
 <td className="px-6 py-4">
 <img src={c.photo || c.img || getAvatar(c.name, c.gender)} alt={c.name} className="w-10 h-10 rounded-full object-cover bg-white" />
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{c.name}</p>
 <p className="text-xs text-slate-500">{c.email}</p>
 </td>
 <td className="px-6 py-4 text-slate-600 font-medium">{c.passportNo || c.passport}</td>
 <td className="px-6 py-4">
 <div className="flex items-center">
 <span className="text-slate-900 mr-2">{c.nationality}</span>
 <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-bold">{c.natCode}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="text-slate-900">{c.contact || c.phone}</p>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${c.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-500 border border-slate-200'}`}>
 {c.status}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <button onClick={() => handleOpenEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
 <Edit className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(c._id)} className="p-2 text-slate-400 hover:text-slate-500 transition-colors ml-1">
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
 <span className="text-slate-500">Showing {filteredCustomers.length} customers</span>
 </div>
 </div>

 {/* Modal for Adding/Editing Customer */}
 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl overflow-y-auto max-h-[90vh] min-h-[600px] flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Customer Details' : 'Add New Customer'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors ">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
 <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
 <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Passport No.</label>
 <input required value={formData.passportNo} onChange={e => setFormData({...formData, passportNo: e.target.value})} type="text" placeholder="Passport ID" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 
 <div className="flex gap-6">
 <div className="flex-1">
 <label className="block text-sm font-semibold text-slate-700 mb-2">Nationality</label>
 <input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} type="text" placeholder="e.g. USA" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div className="w-32">
 <label className="block text-sm font-semibold text-slate-700 mb-2">Code</label>
 <input required value={formData.natCode} onChange={e => setFormData({...formData, natCode: e.target.value})} type="text" placeholder="US" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>
 
 <div className="flex gap-6">
 <div className="flex-1">
 <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
 <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 </select>
 </div>
 <div className="flex-1">
 <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
 <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} type="text" placeholder="+1..." className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>
 
 <div className="mt-auto pt-6">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Customer Details' : 'Save New Customer'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
