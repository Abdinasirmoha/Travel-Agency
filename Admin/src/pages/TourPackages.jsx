import { Search, Plus, X, Edit, Trash2, Map, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTourPackages, createTourPackage, updateTourPackage, deleteTourPackage } from '../api';
import { usePermissions } from '../context/AuthContext';

 export default function TourPackages() {
 const { hasPermission } = usePermissions();
 const [packages, setPackages] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 
 const [searchQuery, setSearchQuery] = useState('');
 
 const [formData, setFormData] = useState({
 name: '', destination: '', category: 'Leisure', durationDays: 7, basePrice: 0, includesFlight: false, includesHotel: false, description: ''
 });

 const loadData = () => {
 setLoading(true);
 fetchTourPackages()
 .then(data => setPackages(data))
 .catch(err => console.error(err))
 .finally(() => setLoading(false));
 };

 useEffect(() => {
 loadData();
 }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 setFormData({ name: '', destination: '', category: 'Leisure', durationDays: 7, basePrice: 0, includesFlight: false, includesHotel: false, description: '' });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (pkg) => {
 setEditingId(pkg._id);
 setFormData({
 name: pkg.name,
 destination: pkg.destination,
 category: pkg.category || 'Leisure',
 durationDays: pkg.durationDays,
 basePrice: pkg.basePrice,
 includesFlight: pkg.includesFlight || false,
 includesHotel: pkg.includesHotel || false,
 description: pkg.description || ''
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this Tour Package?')) return;
 try {
 await deleteTourPackage(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete Tour Package");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 if (editingId) {
 await updateTourPackage(editingId, formData);
 } else {
 await createTourPackage(formData);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save", error);
 alert(`Failed to save: ${error.message}`);
 }
 };

 const filteredData = packages.filter(pkg => 
 pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 pkg.destination.toLowerCase().includes(searchQuery.toLowerCase())
 );

 if (loading) return <div className="p-8 text-center text-slate-500">Loading Tour Packages...</div>;

 if (!hasPermission('Tours', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Tours module.</p>
     </div>
   );
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 mb-1">Tour Packages</h1>
 <p className="text-slate-500 text-sm">Design and manage travel packages and itineraries.</p>
 </div>
 <div className="flex space-x-3">
 {hasPermission('Tours', 'create') && (
   <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ">
   <Plus className="w-4 h-4 mr-2" />
   Add Package
   </button>
 )}
 </div>
 </div>

 <div className="bg-white rounded-xl p-4 overflow-hidden flex flex-wrap gap-4 items-center">
 <div className="flex-1 min-w-[300px]">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
 <input 
 value={searchQuery} 
 onChange={e => setSearchQuery(e.target.value)} 
 type="text" 
 placeholder="Search by name or destination..." 
 className="w-[400px]  border border-slate-300 pl-10 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
 />
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Package Details</th>
 <th className="px-6 py-4">Category</th>
 <th className="px-6 py-4">Duration</th>
 <th className="px-6 py-4">Inclusions</th>
 <th className="px-6 py-4">Base Price</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredData.map((pkg) => (
 <tr key={pkg._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center">
 <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center mr-3">
 <Map className="w-5 h-5" />
 </div>
 <div>
 <p className="font-bold text-slate-900">{pkg.name}</p>
 <p className="text-xs text-slate-500">{pkg.destination}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 font-medium text-slate-700">
 <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-600">
 {pkg.category || 'Leisure'}
 </span>
 </td>
 <td className="px-6 py-4 text-slate-600 font-medium">{pkg.durationDays} Days</td>
 <td className="px-6 py-4">
 <div className="flex space-x-2">
 {pkg.includesFlight ? (
 <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium"><CheckCircle className="w-3 h-3 mr-1" /> Flight</span>
 ) : (
 <span className="flex items-center text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-medium"><XCircle className="w-3 h-3 mr-1" /> Flight</span>
 )}
 {pkg.includesHotel ? (
 <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium"><CheckCircle className="w-3 h-3 mr-1" /> Hotel</span>
 ) : (
 <span className="flex items-center text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-medium"><XCircle className="w-3 h-3 mr-1" /> Hotel</span>
 )}
 </div>
 </td>
 <td className="px-6 py-4 font-bold text-blue-600">${pkg.basePrice.toFixed(2)}</td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Tours', 'edit') && (
   <button onClick={() => handleOpenEdit(pkg)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Tours', 'delete') && (
   <button onClick={() => handleDelete(pkg._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
   <Trash2 className="w-4 h-4" />
   </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 {filteredData.length === 0 && (
 <tr>
 <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No tour packages found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh] flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Tour Package' : 'New Tour Package'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Package Name</label>
 <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. 7 Days in Paris" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Destination</label>
 <input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} type="text" placeholder="e.g. France" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
 <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Religious">Religious</option>
 <option value="Adventure">Adventure</option>
 <option value="Leisure">Leisure</option>
 <option value="Cultural">Cultural</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (Days)</label>
 <input required value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value === '' ? '' : Number(e.target.value)})} type="number" min="1" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Base Price ($)</label>
 <input required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value === '' ? '' : Number(e.target.value)})} type="number" step="0.01" min="0" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="flex space-x-6">
 <label className="flex items-center space-x-3 cursor-pointer">
 <div className="relative flex items-center">
 <input type="checkbox" checked={formData.includesFlight} onChange={e => setFormData({...formData, includesFlight: e.target.checked})} className="w-5 h-5 border-slate-300 rounded text-blue-600 focus:ring-blue-500" />
 </div>
 <span className="text-sm font-medium text-slate-700">Includes Flight</span>
 </label>
 <label className="flex items-center space-x-3 cursor-pointer">
 <div className="relative flex items-center">
 <input type="checkbox" checked={formData.includesHotel} onChange={e => setFormData({...formData, includesHotel: e.target.checked})} className="w-5 h-5 border-slate-300 rounded text-blue-600 focus:ring-blue-500" />
 </div>
 <span className="text-sm font-medium text-slate-700">Includes Hotel</span>
 </label>
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Itinerary details..." rows="3" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"></textarea>
 </div>

 <div className="pt-6 mt-auto">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Tour Package' : 'Save Tour Package'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
