import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Shield, Check, ShieldAlert } from 'lucide-react';
import { fetchRoles, createRole, updateRole, deleteRole } from '../api';
import { usePermissions } from '../context/AuthContext';

const MODULES = [
 'Dashboard', 'Customers', 'Flights', 'Tickets', 'Visas', 
 'Tours', 'Cargo', 'Finance', 'Expenses', 'Staff', 'Users', 'Roles',
 'Reports', 'Notifications', 'Settings'
];

 export default function Roles() {
 const { hasPermission } = usePermissions();
 const [roles, setRoles] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingRole, setEditingRole] = useState(null);

 const defaultPermissions = MODULES.reduce((acc, module) => {
 acc[module] = { view: false, create: false, edit: false, delete: false };
 return acc;
 }, {});

 const [formData, setFormData] = useState({
 name: '',
 description: '',
 permissions: defaultPermissions
 });

 const loadRoles = () => {
 setIsLoading(true);
 fetchRoles()
 .then(data => setRoles(data))
 .catch(err => setError(err.message))
 .finally(() => setIsLoading(false));
 };

 useEffect(() => {
 loadRoles();
 }, []);

 const resetForm = () => {
 setFormData({ name: '', description: '', permissions: defaultPermissions });
 };

 const handleOpenEdit = (role) => {
 setEditingRole(role);
 const parsedPermissions = { ...defaultPermissions };
 if (role.permissions) {
 Object.keys(role.permissions).forEach(key => {
 if (parsedPermissions[key]) {
 parsedPermissions[key] = role.permissions[key];
 }
 });
 }
 setFormData({
 name: role.name,
 description: role.description || '',
 permissions: parsedPermissions
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this role? This might affect users assigned to it.')) return;
 try {
 await deleteRole(id);
 loadRoles();
 } catch (err) {
 setError(err.message);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 if (editingRole) {
 await updateRole(editingRole._id, formData);
 } else {
 await createRole(formData);
 }
 setIsModalOpen(false);
 resetForm();
 setEditingRole(null);
 loadRoles();
 } catch (err) {
 setError(err.message);
 }
 };

 const togglePermission = (module, action) => {
 setFormData(prev => ({
 ...prev,
 permissions: {
 ...prev.permissions,
 [module]: {
 ...prev.permissions[module],
 [action]: !prev.permissions[module][action]
 }
 }
 }));
 };

 const toggleRow = (module, value) => {
 setFormData(prev => ({
 ...prev,
 permissions: {
 ...prev.permissions,
 [module]: { view: value, create: value, edit: value, delete: value }
 }
 }));
 };

 if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Roles...</div>;

 if (!hasPermission('Roles', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Roles module.</p>
     </div>
   );
 }

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 {error && (
 <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center justify-between">
 <span>{error}</span>
 <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
 </div>
 )}

 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
 <ShieldAlert className="w-6 h-6 text-blue-600" /> Role Management
 </h1>
 <p className="text-slate-500">Create roles and configure granular permissions</p>
 </div>
 {hasPermission('Roles', 'create') && (
   <button
   onClick={() => {
   resetForm();
   setEditingRole(null);
   setIsModalOpen(true);
   }}
   className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
   >
   <Plus className="w-5 h-5 mr-2" />
   Create Role
   </button>
 )}
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Role Name</th>
 <th className="px-6 py-4">Description</th>
 <th className="px-6 py-4 text-center">Modules Accessed</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {roles.map((role) => {
 const modulesAccessed = Object.values(role.permissions || {}).filter(p => p.view || p.create || p.edit || p.delete).length;
 return (
 <tr key={role._id} className="hover:bg-white transition-colors group">
 <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
 <ShieldAlert className="w-4 h-4" />
 </div>
 {role.name}
 </td>
 <td className="px-6 py-4 text-slate-500">{role.description || '-'}</td>
 <td className="px-6 py-4 text-center">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
 {modulesAccessed} Modules
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Roles', 'edit') && (
   <button onClick={() => handleOpenEdit(role)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit2 className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Roles', 'delete') && (
   <button onClick={() => handleDelete(role._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
   <Trash2 className="w-4 h-4" />
   </button>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 {roles.length === 0 && (
 <tr>
 <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
 No roles found. Create one to get started.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-xl p-6 border border-slate-200 w-full max-w-4xl shadow-xl overflow-y-auto max-h-[90vh]">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-slate-900">
 {editingRole ? 'Edit Role Permissions' : 'Create New Role'}
 </h2>
 <button 
 onClick={() => setIsModalOpen(false)}
 className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">Role Name *</label>
 <input
 type="text"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 placeholder="e.g., Administrator"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
 <input
 type="text"
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 placeholder="Brief description of this role"
 />
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-0 pb-2">Module Permissions</h3>
 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b border-slate-200 bg-white">
 <tr>
 <th className="px-6 py-4 w-1/3">Module Name</th>
 <th className="px-4 py-4 text-center">View</th>
 <th className="px-4 py-4 text-center">Create</th>
 <th className="px-4 py-4 text-center">Edit</th>
 <th className="px-4 py-4 text-center">Delete</th>
 <th className="px-4 py-4 text-right">Quick Select</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 bg-white">
 {MODULES.map(module => (
 <tr key={module} className="hover:bg-white">
 <td className="px-6 py-3 font-medium text-slate-900">{module}</td>
 {['view', 'create', 'edit', 'delete'].map(action => (
 <td key={action} className="px-4 py-3 text-center">
 <label className="inline-flex items-center cursor-pointer">
 <input 
 type="checkbox" 
 className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50"
 checked={formData.permissions[module][action]}
 onChange={() => togglePermission(module, action)}
 />
 </label>
 </td>
 ))}
 <td className="px-4 py-3 text-right">
 <button 
 type="button"
 onClick={() => toggleRow(module, true)}
 className="text-xs font-medium text-blue-600 hover:text-blue-700 mr-3"
 >
 All
 </button>
 <button 
 type="button"
 onClick={() => toggleRow(module, false)}
 className="text-xs font-medium text-slate-500 hover:text-slate-700"
 >
 None
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
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
 {editingRole ? 'Update Role' : 'Save Role'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
