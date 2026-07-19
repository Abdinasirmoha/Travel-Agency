import { Search, Plus, X, Edit, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchVisaApplications, fetchVisaTypes, fetchCustomers, createVisaApplication, updateVisaApplication, deleteVisaApplication } from '../api';
import { usePermissions } from '../context/AuthContext';

 export default function VisaApplications() {
 const { hasPermission } = usePermissions();
 const [applications, setApplications] = useState([]);
 const [visaTypes, setVisaTypes] = useState([]);
 const [customersList, setCustomersList] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('All');

 const [formData, setFormData] = useState({
 customer: '', visaType: '', status: 'Pending', totalAmount: 0, currency: 'USD', paymentStatus: 'Unpaid'
 });

 const loadData = () => {
 setLoading(true);
 Promise.all([fetchVisaApplications(), fetchVisaTypes(), fetchCustomers()])
 .then(([appsData, vtData, cData]) => {
 setApplications(appsData);
 setVisaTypes(vtData);
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
 visaType: visaTypes.length > 0 ? visaTypes[0]._id : '', 
 status: 'Pending', 
 totalAmount: 0, 
 currency: 'USD', 
 paymentStatus: 'Unpaid' 
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (app) => {
 setEditingId(app._id);
 setFormData({
 customer: app.customer ? (typeof app.customer === 'object' ? app.customer._id : app.customer) : '',
 visaType: app.visaType ? (typeof app.visaType === 'object' ? app.visaType._id : app.visaType) : '',
 status: app.status || 'Pending',
 totalAmount: app.totalAmount || 0,
 currency: app.currency || 'USD',
 paymentStatus: app.paymentStatus || 'Unpaid'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this Application?')) return;
 try {
 await deleteVisaApplication(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete Application");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.visaType || !formData.customer) {
 alert("Please ensure both a customer and a visa type are selected!");
 return;
 }

 const selectedVTForSubmit = visaTypes.find(v => v._id === formData.visaType);
 const finalAmount = formData.totalAmount !== 0 ? formData.totalAmount : (selectedVTForSubmit ? (selectedVTForSubmit.basePrice || 0) : 0);

 const dataToSubmit = { ...formData, totalAmount: finalAmount };

 try {
 if (editingId) {
 await updateVisaApplication(editingId, dataToSubmit);
 } else {
 await createVisaApplication(dataToSubmit);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save application", error);
 alert(`Failed to save: ${error.message}`);
 }
 };

 const getStatusColor = (status) => {
 switch(status) {
 case 'Approved': return 'bg-blue-50 text-blue-600';
 case 'Pending': return 'bg-white text-slate-500';
 case 'Rejected': return 'bg-white text-slate-500';
 default: return 'bg-slate-100 text-slate-600';
 }
 };

 const selectedVT = visaTypes.find(v => v._id === formData.visaType) || null;
 const vtBasePrice = selectedVT ? (selectedVT.basePrice || 0) : 0;

 // Sync totalAmount if not set manually
 useEffect(() => {
 if (selectedVT && !editingId && formData.totalAmount === 0) {
 setFormData(prev => ({ ...prev, totalAmount: selectedVT.basePrice || 0 }));
 }
 }, [formData.visaType, selectedVT, editingId]);

 const filteredData = applications.filter(app => {
 const customerObj = typeof app.customer === 'object' ? app.customer : null;
 const nameMatch = (customerObj?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const passportMatch = (customerObj?.passportNo || '').toLowerCase().includes(searchQuery.toLowerCase());
 const statusMatch = filterStatus === 'All' || app.status === filterStatus;
 return (nameMatch || passportMatch) && statusMatch;
 });

 const getAvatar = (name, gender) => {
 if (!name) return 'https://randomuser.me/api/portraits/men/1.jpg';
 const id = (name.length * 13) % 90 + 1;
 return `https://randomuser.me/api/portraits/${gender === 'Female' ? 'women' : 'men'}/${id}.jpg`;
 };

 if (loading) return <div className="p-8 text-center text-slate-500">Loading Visa Applications...</div>;

 if (!hasPermission('Visas', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Visas module.</p>
     </div>
   );
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visa Applications</h1>
 <p className="text-slate-500 mt-1">Process and track customer visa requests</p>
 </div>
 {hasPermission('Visas', 'create') && (
   <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
   <Plus className="w-4 h-4 mr-2" />
   New Application
   </button>
 )}
 </div>

  {/* ── Stat Cards (Visa Functionality) ── */}
  {(() => {
    const today = new Date().toDateString();
    const applicationsToday = applications.filter(a => new Date(a.createdAt || Date.now()).toDateString() === today).length;
    const pendingVisas = applications.filter(a => a.status === 'Pending').length;
    const approvedVisas = applications.filter(a => a.status === 'Approved').length;
    const totalRevenue = applications.filter(a => a.paymentStatus === 'Paid').reduce((sum, a) => sum + (a.totalAmount || 0), 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Applications Today */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Applications Today</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{applicationsToday}</h3>
            <span className="text-sm font-medium text-blue-600">Active</span>
          </div>
        </div>
        {/* Pending Visas */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Pending Visas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{pendingVisas}</h3>
            <span className="text-sm font-medium text-blue-600">Urgent</span>
          </div>
        </div>
        {/* Approved Visas */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Approved Visas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{approvedVisas}</h3>
            <span className="text-sm font-medium text-blue-600">Success</span>
          </div>
        </div>
        {/* Total Revenue */}
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

 <div className="bg-white rounded-xl p-4  overflow-hidden flex flex-wrap gap-4 items-center">
 <div className="flex-1 min-w-[200px]">
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
 <input 
 type="text" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by applicant or passport..." 
 className="w-[400px]  border border-slate-300 pl-9 pr-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
 />
 </div>
 </div>
 <div className="w-48">
 <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 <option value="All">All Application Status</option>
 <option value="Pending">Pending</option>
 <option value="Approved">Approved</option>
 <option value="Rejected">Rejected</option>
 </select>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Applicant</th>
 <th className="px-6 py-4">Visa Details</th>
 <th className="px-6 py-4">Total Amount</th>
 <th className="px-6 py-4">App Status</th>
 <th className="px-6 py-4">Payment</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredData.map((app) => {
 const customerObj = typeof app.customer === 'object' ? app.customer : null;
 const vtObj = typeof app.visaType === 'object' ? app.visaType : null;
 const name = customerObj?.name || 'Unknown';
 const passport = customerObj?.passportNo || 'N/A';
 const gender = customerObj?.gender || 'Male';
 const visaName = vtObj?.name || 'Unknown Visa';
 const country = vtObj?.country || '';

 return (
 <tr key={app._id} className="hover:bg-white transition-colors">
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
 <p className="font-medium text-slate-900">{visaName}</p>
 {country && <p className="text-xs text-slate-500">{country}</p>}
 </td>
 <td className="px-6 py-4">
 <p className="font-bold text-slate-900">{app.currency} {app.totalAmount.toFixed(2)}</p>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusColor(app.status)}`}>
 &bull; {app.status}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
  app.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
  app.paymentStatus === 'Partially Paid' ? 'bg-amber-50 text-amber-600' :
  app.paymentStatus === 'Unpaid' ? 'bg-red-50 text-red-600' :
  'bg-slate-50 text-slate-500'
 }`}>
 &bull; {app.paymentStatus}
 </span>
 </td>

 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Visas', 'edit') && (
   <button onClick={() => handleOpenEdit(app)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Visas', 'delete') && (
   <button onClick={() => handleDelete(app._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
 <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No applications found.</td>
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
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Application' : 'New Visa Application'}</h2>
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
 <label className="block text-sm font-semibold text-slate-700 mb-2">Visa Type <span className="text-slate-500">*</span></label>
 <select required value={formData.visaType} onChange={e => setFormData({...formData, visaType: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 {visaTypes.length === 0 && <option value="">No Visas Available</option>}
 {visaTypes.map(v => (
 <option key={v._id} value={v._id}>
 {v.name} ({v.country}) - ${v.basePrice}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
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
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
 <input required value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">App Status</label>
 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Pending">Pending</option>
 <option value="Approved">Approved</option>
 <option value="Rejected">Rejected</option>
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
 {editingId ? 'Update Application' : 'Save Application'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
