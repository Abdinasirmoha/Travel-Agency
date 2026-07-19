import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X, Users, UserCheck, UserX, DollarSign } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api';
import { usePermissions } from '../context/AuthContext';

 export default function Staff() {
 const { hasPermission } = usePermissions();
 const [staffList, setStaffList] = useState([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingStaff, setEditingStaff] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 const [formData, setFormData] = useState({
 name: '',
 phone: '',
 jobTitle: 'Staff',
 salary: '',
 joinDate: '',
 isSystemUser: false
 });

 useEffect(() => {
 loadStaff();
 }, []);

 const loadStaff = async () => {
 try {
 setIsLoading(true);
 const data = await fetchUsers();
 setStaffList(data);
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
 if (!submitData.joinDate) delete submitData.joinDate;

 if (editingStaff) {
 await updateUser(editingStaff._id, submitData);
 } else {
 await createUser({ ...submitData, isSystemUser: false });
 }
 setIsModalOpen(false);
 setEditingStaff(null);
 resetForm();
 loadStaff();
 } catch (err) {
 setError(err.message);
 }
 };

 const handleDelete = async (id) => {
 if (window.confirm('Are you sure you want to delete this staff member?')) {
 try {
 await deleteUser(id);
 loadStaff();
 } catch (err) {
 setError(err.message);
 }
 }
 };

 const openEditModal = (staff) => {
 setEditingStaff(staff);
 setFormData({
 name: staff.name || '',
 phone: staff.phone || '',
 jobTitle: staff.jobTitle || 'Staff',
 salary: staff.salary || '',
 joinDate: staff.joinDate ? new Date(staff.joinDate).toISOString().split('T')[0] : '',
 isSystemUser: staff.isSystemUser !== false
 });
 setIsModalOpen(true);
 };

 const resetForm = () => {
 setFormData({
 name: '',
 phone: '',
 jobTitle: 'Staff',
 salary: '',
 joinDate: '',
 isSystemUser: false
 });
 };

 const filteredStaff = staffList.filter(staff => {
 const roleName = staff.isSystemUser === false ? staff.jobTitle : (staff.role ? staff.role.name : '');
 return staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
 (roleName && roleName.toLowerCase().includes(searchQuery.toLowerCase()));
 });

 const stats = useMemo(() => {
 const totalStaff = staffList.length;
 const activeStaff = staffList.filter(s => s.status === 'Active').length;
 const inactiveStaff = staffList.filter(s => s.status === 'Inactive').length;
 const totalSalary = staffList.filter(s => s.status === 'Active').reduce((sum, s) => sum + (Number(s.salary) || 0), 0);
 return {
 total: totalStaff,
 active: activeStaff,
 inactive: inactiveStaff,
 salary: totalSalary
 };
 }, [staffList]);

 if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Staff...</div>;

 if (!hasPermission('Staff', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Staff module.</p>
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
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
 <p className="text-slate-500 mt-1">Manage employee records and payroll information</p>
 </div>
 {hasPermission('Staff', 'create') && (
   <button
   onClick={() => {
   resetForm();
   setEditingStaff(null);
   setIsModalOpen(true);
   }}
   className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
   >
   <Plus className="w-5 h-5 mr-2" />
   Add Staff
   </button>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <Users className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Total Staff</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <UserCheck className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Active Staff</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.active}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-slate-50 text-slate-600">
 <UserX className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Inactive Staff</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.inactive}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <DollarSign className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Monthly Salary Total</p>
 <h3 className="text-3xl font-bold text-slate-900">${stats.salary.toLocaleString()}</h3>
 </div>
 </div>

 <div className="card">
 <div className="p-4 flex justify-between items-center bg-slate-50 rounded-t-xl">
 <div className="relative w-96">
 <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search staff..."
 className="border border-slate-300 w-[400px] pl-10 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-slate-200 bg-white">
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
 <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
 <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {filteredStaff.map((staff) => (
 <tr key={staff._id} className="hover:bg-slate-50 transition-colors">
 <td className="py-4 px-6">
 <div className="font-medium text-slate-900">{staff.name}</div>
 </td>
 <td className="py-4 px-6">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
 {staff.isSystemUser === false ? staff.jobTitle : (staff.role ? staff.role.name : 'No Role')}
 </span>
 </td>
 <td className="py-4 px-6">
 <div className="text-sm text-slate-900">{staff.email}</div>
 <div className="text-xs text-slate-500">{staff.phone}</div>
 </td>
 <td className="py-4 px-6">
 <div className="font-medium text-slate-900">${staff.salary?.toLocaleString()}</div>
 </td>
 <td className="py-4 px-6">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
 staff.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
 }`}>
 {staff.status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Staff', 'edit') && (
   <button onClick={() => openEditModal(staff)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit2 className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Staff', 'delete') && (
   <button onClick={() => handleDelete(staff._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
 {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
 {editingStaff?.isSystemUser !== false && (
 <div className="col-span-2">
 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
 <strong>Note:</strong> You are editing the HR details for a System User: <strong>{editingStaff?.name} ({editingStaff?.email})</strong>. To change their name, email, or role, please go to the Users page.
 </div>
 </div>
 )}

 {(!editingStaff || editingStaff.isSystemUser === false) && (
 <>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
 <input
 type="text"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 />
 </div>
 
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-sm font-medium text-slate-700 mb-2">Job Title *</label>
 <input
 type="text"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.jobTitle}
 onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
 />
 </div>
 </>
 )}

 <div className="col-span-2 sm:col-span-1">
 <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
 <input
 type="text"
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 />
 </div>
 
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-sm font-medium text-slate-700 mb-2">Salary *</label>
 <input
 type="number"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.salary}
 onChange={(e) => setFormData({...formData, salary: e.target.value})}
 />
 </div>

 <div className="col-span-2 sm:col-span-1">
 <label className="block text-sm font-medium text-slate-700 mb-2">Join Date</label>
 <input
 type="date"
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.joinDate}
 onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
 />
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
 {editingStaff ? 'Update Staff' : 'Save Staff'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
