import { Search, Plus, X, Edit, Trash2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCargo, fetchCustomers, createCargo, updateCargo, deleteCargo } from '../api';
import { usePermissions } from '../context/AuthContext';

 export default function Cargo() {
 const { hasPermission } = usePermissions();
 const [cargoList, setCargoList] = useState([]);
 const [customersList, setCustomersList] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('All');

 const [formData, setFormData] = useState({
 sender: '', receiverName: '', receiverPhone: '', origin: '', destination: '', 
 weightKg: 0, contentDescription: '', shippingDate: '', 
 status: 'Pending', totalAmount: 0, currency: 'USD', paymentStatus: 'Unpaid'
 });

 const loadData = () => {
 setLoading(true);
 Promise.all([fetchCargo(), fetchCustomers()])
 .then(([cargoData, cData]) => {
 setCargoList(cargoData);
 setCustomersList(cData);
 })
 .catch(err => console.error(err))
 .finally(() => setLoading(false));
 };

 useEffect(() => {
 loadData();
 }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 setFormData({ 
 sender: customersList.length > 0 ? customersList[0]._id : '', 
 receiverName: '', receiverPhone: '', origin: '', destination: '', 
 weightKg: 0, contentDescription: '', 
 shippingDate: new Date().toISOString().split('T')[0],
 status: 'Pending', totalAmount: 0, currency: 'USD', paymentStatus: 'Unpaid' 
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (cargo) => {
 setEditingId(cargo._id);
 setFormData({
 sender: cargo.sender ? (typeof cargo.sender === 'object' ? cargo.sender._id : cargo.sender) : '',
 receiverName: cargo.receiverName || '',
 receiverPhone: cargo.receiverPhone || '',
 origin: cargo.origin || '',
 destination: cargo.destination || '',
 weightKg: cargo.weightKg || 0,
 contentDescription: cargo.contentDescription || '',
 shippingDate: cargo.shippingDate ? new Date(cargo.shippingDate).toISOString().split('T')[0] : '',
 status: cargo.status || 'Pending',
 totalAmount: cargo.totalAmount || 0,
 currency: cargo.currency || 'USD',
 paymentStatus: cargo.paymentStatus || 'Unpaid'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this Shipment?')) return;
 try {
 await deleteCargo(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete Shipment");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.sender) {
 alert("Please select a Sender (Customer)!");
 return;
 }

 try {
 if (editingId) {
 await updateCargo(editingId, formData);
 } else {
 await createCargo(formData);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save shipment", error);
 alert(`Failed to save: ${error.message}`);
 }
 };

 const getStatusColor = (status) => {
 switch(status) {
 case 'Delivered': return 'bg-blue-50 text-blue-600';
 case 'In Transit': return 'bg-blue-50 text-blue-600';
 case 'Arrived': return 'bg-blue-50 text-blue-600';
 case 'Pending': return 'bg-white text-slate-500';
 case 'Cancelled': return 'bg-white text-slate-500';
 default: return 'bg-slate-100 text-slate-600';
 }
 };

 const filteredData = cargoList.filter(c => {
 const senderObj = typeof c.sender === 'object' ? c.sender : null;
 const nameMatch = (senderObj?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const receiverMatch = (c.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase());
 const destMatch = (c.destination || '').toLowerCase().includes(searchQuery.toLowerCase());
 const statusMatch = filterStatus === 'All' || c.status === filterStatus;
 return (nameMatch || receiverMatch || destMatch) && statusMatch;
 });

 const getAvatar = (name, gender) => {
 if (!name) return 'https://randomuser.me/api/portraits/men/1.jpg';
 const id = (name.length * 13) % 90 + 1;
 return `https://randomuser.me/api/portraits/${gender === 'Female' ? 'women' : 'men'}/${id}.jpg`;
 };

 if (loading) return <div className="p-8 text-center text-slate-500">Loading Cargo Shipments...</div>;

 if (!hasPermission('Cargo', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Cargo module.</p>
     </div>
   );
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 mb-1">Cargo Shipments</h1>
 <p className="text-slate-500 text-sm">Manage global logistics and freight forwardings.</p>
  </div>
 <div className="flex space-x-3">
 {hasPermission('Cargo', 'create') && (
   <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ">
   <Plus className="w-4 h-4 mr-2" />
   New Shipment
   </button>
 )}
 </div>
 </div>

  {/* ── Stat Cards (Cargo Functionality) ── */}
  {(() => {
    const today = new Date().toDateString();
    const shipmentsToday = cargoList.filter(c => new Date(c.shippingDate || c.createdAt || Date.now()).toDateString() === today).length;
    const pendingCount = cargoList.filter(c => c.status === 'Pending').length;
    const inTransitCount = cargoList.filter(c => c.status === 'In Transit').length;
    const totalRevenue = cargoList.filter(c => c.paymentStatus === 'Paid').reduce((sum, c) => sum + (c.totalAmount || 0), 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shipments Today */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Shipments Today</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{shipmentsToday}</h3>
            <span className="text-sm font-medium text-blue-600">Active</span>
          </div>
        </div>
        {/* Pending */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Pending</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{pendingCount}</h3>
            <span className="text-sm font-medium text-blue-600">Urgent</span>
          </div>
        </div>
        {/* In Transit */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">In Transit</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{inTransitCount}</h3>
            <span className="text-sm font-medium text-blue-600">Live</span>
          </div>
        </div>
        {/* Collected Revenue */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Collected Revenue</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            <span className="text-sm font-medium text-blue-600">Live</span>
          </div>
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
 placeholder="Search by sender, receiver, or destination..." 
 className="w-[400px]  border border-slate-300 pl-9 pr-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
 />
 </div>
 </div>
 <div className="w-48">
 <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 <option value="All">All Shipment Status</option>
 <option value="Pending">Pending</option>
 <option value="In Transit">In Transit</option>
 <option value="Arrived">Arrived</option>
 <option value="Delivered">Delivered</option>
 <option value="Cancelled">Cancelled</option>
 </select>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Sender</th>
 <th className="px-6 py-4">Receiver</th>
 <th className="px-6 py-4">Route & Details</th>
 <th className="px-6 py-4">Amount</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Payment</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredData.map((cargo) => {
 const senderObj = typeof cargo.sender === 'object' ? cargo.sender : null;
 const name = senderObj?.name || 'Unknown';
 const gender = senderObj?.gender || 'Male';

 return (
 <tr key={cargo._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center">
 <img src={getAvatar(name, gender)} alt={name} className="w-10 h-10 rounded-full object-cover mr-3 bg-slate-100" />
 <div>
 <p className="font-medium text-slate-900">{name}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{cargo.receiverName}</p>
 <p className="text-xs text-slate-500">{cargo.receiverPhone}</p>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{cargo.origin} &rarr; {cargo.destination}</p>
 <p className="text-xs text-slate-500">{cargo.weightKg} kg - {cargo.contentDescription}</p>
 </td>
 <td className="px-6 py-4">
 <p className="font-bold text-slate-900">{cargo.currency} {cargo.totalAmount.toFixed(2)}</p>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusColor(cargo.status)}`}>
 &bull; {cargo.status}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
 cargo.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
 cargo.paymentStatus === 'Partially Paid' ? 'bg-amber-50 text-amber-600' :
 cargo.paymentStatus === 'Unpaid' ? 'bg-red-50 text-red-600' :
 'bg-slate-50 text-slate-500'
 }`}>
 &bull; {cargo.paymentStatus}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Cargo', 'edit') && (
   <button onClick={() => handleOpenEdit(cargo)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Cargo', 'delete') && (
   <button onClick={() => handleDelete(cargo._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
 <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No shipments found.</td>
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
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Shipment' : 'New Shipment'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 
 <div className="bg-slate-50 p-4 rounded-xl space-y-4">
 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sender & Receiver</h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Sender (Customer) <span className="text-slate-500">*</span></label>
 <select required value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 {customersList.length === 0 && <option value="">No Customers Available</option>}
 {customersList.map(c => (
 <option key={c._id} value={c._id}>
 {c.name} - {c.phone}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Receiver Name <span className="text-slate-500">*</span></label>
 <input required value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} type="text" placeholder="e.g. John Doe" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div className="col-start-2">
 <label className="block text-sm font-semibold text-slate-700 mb-1">Receiver Phone <span className="text-slate-500">*</span></label>
 <input required value={formData.receiverPhone} onChange={e => setFormData({...formData, receiverPhone: e.target.value})} type="text" placeholder="e.g. +971 50 123 4567" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>
 </div>

 <div className="bg-slate-50 p-4 rounded-xl space-y-4">
 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shipment Details</h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Origin <span className="text-slate-500">*</span></label>
 <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} type="text" placeholder="e.g. Mogadishu" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Destination <span className="text-slate-500">*</span></label>
 <input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} type="text" placeholder="e.g. Dubai" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (Kg) <span className="text-slate-500">*</span></label>
 <input required value={formData.weightKg} onChange={e => setFormData({...formData, weightKg: e.target.value === '' ? '' : Number(e.target.value)})} type="number" step="0.1" min="0" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Content Description</label>
 <input value={formData.contentDescription} onChange={e => setFormData({...formData, contentDescription: e.target.value})} type="text" placeholder="e.g. Electronics, Clothing" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Shipping Date</label>
 <input required value={formData.shippingDate} onChange={e => setFormData({...formData, shippingDate: e.target.value})} type="date" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Total Amount</label>
 <input required value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value === '' ? '' : Number(e.target.value)})} type="number" step="0.01" min="0" className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Pending">Pending</option>
 <option value="In Transit">In Transit</option>
 <option value="Arrived">Arrived</option>
 <option value="Delivered">Delivered</option>
 <option value="Cancelled">Cancelled</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">Payment</label>
 <select value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Paid">Paid</option>
 <option value="Unpaid">Unpaid</option>
 </select>
 </div>
 </div>

 <div className="pt-6 mt-auto">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Shipment' : 'Save Shipment'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
