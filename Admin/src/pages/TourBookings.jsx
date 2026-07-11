import { Search, Plus, X, Edit, Trash2, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTourBookings, fetchTourPackages, fetchCustomers, createTourBooking, updateTourBooking, deleteTourBooking } from '../api';

export default function TourBookings() {
 const [bookings, setBookings] = useState([]);
 const [tourPackages, setTourPackages] = useState([]);
 const [customersList, setCustomersList] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('All');

 const [formData, setFormData] = useState({
 customer: '', package: '', travelDate: '', status: 'Pending', totalAmount: 0, currency: 'USD', paymentStatus: 'Unpaid'
 });

 const loadData = () => {
 setLoading(true);
 Promise.all([fetchTourBookings(), fetchTourPackages(), fetchCustomers()])
 .then(([bookingsData, pkgsData, cData]) => {
 setBookings(bookingsData);
 setTourPackages(pkgsData);
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
 customer: customersList.length > 0 ? customersList[0]._id : '', 
 package: tourPackages.length > 0 ? tourPackages[0]._id : '', 
 travelDate: new Date().toISOString().split('T')[0],
 status: 'Pending', 
 totalAmount: 0, 
 currency: 'USD', 
 paymentStatus: 'Unpaid' 
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (bkg) => {
 setEditingId(bkg._id);
 setFormData({
 customer: bkg.customer ? (typeof bkg.customer === 'object' ? bkg.customer._id : bkg.customer) : '',
 package: bkg.package ? (typeof bkg.package === 'object' ? bkg.package._id : bkg.package) : '',
 travelDate: bkg.travelDate ? new Date(bkg.travelDate).toISOString().split('T')[0] : '',
 status: bkg.status || 'Pending',
 totalAmount: bkg.totalAmount || 0,
 currency: bkg.currency || 'USD',
 paymentStatus: bkg.paymentStatus || 'Unpaid'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this Tour Booking?')) return;
 try {
 await deleteTourBooking(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete Booking");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.package || !formData.customer) {
 alert("Please ensure both a customer and a package are selected!");
 return;
 }

 const selectedPkgForSubmit = tourPackages.find(p => p._id === formData.package);
 const finalAmount = formData.totalAmount !== 0 ? formData.totalAmount : (selectedPkgForSubmit ? (selectedPkgForSubmit.basePrice || 0) : 0);

 const dataToSubmit = { ...formData, totalAmount: finalAmount };

 try {
 if (editingId) {
 await updateTourBooking(editingId, dataToSubmit);
 } else {
 await createTourBooking(dataToSubmit);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save booking", error);
 alert(`Failed to save: ${error.message}`);
 }
 };

 const getStatusColor = (status) => {
 switch(status) {
 case 'Confirmed': return 'bg-blue-50 text-blue-600';
 case 'Pending': return 'bg-white text-slate-500';
 case 'Cancelled': return 'bg-white text-slate-500';
 default: return 'bg-slate-100 text-slate-600';
 }
 };

 const selectedPkg = tourPackages.find(p => p._id === formData.package) || null;

 // Sync totalAmount if not set manually
 useEffect(() => {
 if (selectedPkg && !editingId && formData.totalAmount === 0) {
 setFormData(prev => ({ ...prev, totalAmount: selectedPkg.basePrice || 0 }));
 }
 }, [formData.package, selectedPkg, editingId]);

 const filteredData = bookings.filter(bkg => {
 const customerObj = typeof bkg.customer === 'object' ? bkg.customer : null;
 const nameMatch = (customerObj?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const passportMatch = (customerObj?.passportNo || '').toLowerCase().includes(searchQuery.toLowerCase());
 const statusMatch = filterStatus === 'All' || bkg.status === filterStatus;
 return (nameMatch || passportMatch) && statusMatch;
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
 <h1 className="text-2xl font-bold text-blue-600 mb-1">Tour Bookings</h1>
  </div>
 <div className="flex space-x-3">
 <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ">
 <Plus className="w-4 h-4 mr-2" />
 New Booking
 </button>
 </div>
  </div>

  {/* ── Stat Cards (Tour Bookings Functionality) ── */}
  {(() => {
    const today = new Date().toDateString();
    const bookingsToday = bookings.filter(b => new Date(b.createdAt || Date.now()).toDateString() === today).length;
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bookings Today */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Bookings Today</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{bookingsToday}</h3>
            <span className="text-sm font-medium text-blue-600">Active</span>
          </div>
        </div>
        {/* Pending Bookings */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Pending Bookings</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{pendingCount}</h3>
            <span className="text-sm font-medium text-blue-600">Urgent</span>
          </div>
        </div>
        {/* Confirmed Bookings */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Confirmed Bookings</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{confirmedCount}</h3>
            <span className="text-sm font-medium text-blue-600">Success</span>
          </div>
        </div>
        {/* Collected Revenue */}
        <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Collected Revenue</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            <span className="text-sm font-medium text-blue-600">Live</span>
          </div>
        </div>
      </div>
    );
  })()}

 <div className="bg-white rounded-xl p-4  overflow-hidden flex flex-wrap gap-4 items-center">
 <div className="flex-1 min-w-[200px]">
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
 <input 
 type="text" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by customer or passport..." 
 className="w-[400px]  border border-slate-300 pl-9 pr-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
 />
 </div>
 </div>
 <div className="w-48">
 <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 <option value="All">All Booking Status</option>
 <option value="Pending">Pending</option>
 <option value="Confirmed">Confirmed</option>
 <option value="Cancelled">Cancelled</option>
 </select>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Customer</th>
 <th className="px-6 py-4">Package Details</th>
 <th className="px-6 py-4">Travel Date</th>
 <th className="px-6 py-4">Total Amount</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Payment</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredData.map((bkg) => {
 const customerObj = typeof bkg.customer === 'object' ? bkg.customer : null;
 const pkgObj = typeof bkg.package === 'object' ? bkg.package : null;
 const name = customerObj?.name || 'Unknown';
 const passport = customerObj?.passportNo || 'N/A';
 const gender = customerObj?.gender || 'Male';
 const pkgName = pkgObj?.name || 'Unknown Package';
 const destination = pkgObj?.destination || '';

 return (
 <tr key={bkg._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center">
 <img src={getAvatar(name, gender)} alt={name} className="w-10 h-10 rounded-full object-cover mr-3 bg-slate-100" />
 <div>
 <p className="font-medium text-slate-900">{name}</p>
 <p className="text-xs text-slate-500">Pass: {passport}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-900">{pkgName}</p>
 {destination && <p className="text-xs text-slate-500">{destination}</p>}
 </td>
 <td className="px-6 py-4">
 <p className="font-medium text-slate-700">
 {bkg.travelDate ? new Date(bkg.travelDate).toLocaleDateString() : 'TBD'}
 </p>
 </td>
 <td className="px-6 py-4">
 <p className="font-bold text-slate-900">{bkg.currency} {bkg.totalAmount.toFixed(2)}</p>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusColor(bkg.status)}`}>
 &bull; {bkg.status}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
 bkg.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
 bkg.paymentStatus === 'Partially Paid' ? 'bg-amber-50 text-amber-600' :
 bkg.paymentStatus === 'Unpaid' ? 'bg-red-50 text-red-600' :
 'bg-slate-50 text-slate-500'
 }`}>
 &bull; {bkg.paymentStatus}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <button onClick={() => handleOpenEdit(bkg)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
 <Edit className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(bkg._id)} className="p-2 text-slate-400 hover:text-slate-500 transition-colors ml-1">
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 );
 })}
 {filteredData.length === 0 && (
 <tr>
 <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No bookings found.</td>
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
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Booking' : 'New Tour Booking'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Customer <span className="text-slate-500">*</span></label>
 <select required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 {customersList.length === 0 && <option value="">No Customers Available</option>}
 {customersList.map(c => (
 <option key={c._id} value={c._id}>
 {c.name} - {c.passportNo}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Tour Package <span className="text-slate-500">*</span></label>
 <select required value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 {tourPackages.length === 0 && <option value="">No Packages Available</option>}
 {tourPackages.map(p => (
 <option key={p._id} value={p._id}>
 {p.name} ({p.destination}) - ${p.basePrice}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Travel Date <span className="text-slate-500">*</span></label>
 <input 
 required 
 value={formData.travelDate} 
 onChange={e => setFormData({...formData, travelDate: e.target.value})} 
 type="date" 
 className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" 
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount</label>
 <input 
 required 
 value={formData.totalAmount} 
 onChange={e => setFormData({...formData, totalAmount: e.target.value === '' ? '' : Number(e.target.value)})} 
 type="number" 
 className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" 
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
 <input required value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Pending">Pending</option>
 <option value="Confirmed">Confirmed</option>
 <option value="Cancelled">Cancelled</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Payment</label>
 <select value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Paid">Paid</option>
 <option value="Unpaid">Unpaid</option>
 </select>
 </div>
 </div>

 <div className="pt-6 mt-auto">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Booking' : 'Save Booking'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
