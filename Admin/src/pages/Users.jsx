import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Users, Mail, Shield, CheckCircle, XCircle, UserCheck, ShieldAlert, User, Check } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser, fetchRoles } from '../api';

const MODULES = [
 'Dashboard', 'Customers', 'Flights', 'Tickets', 'Visas', 
 'Tours', 'Cargo', 'Finance', 'Expenses', 'Staff', 'Users', 'Roles'
];

export default function UsersPage() {
 const [users, setUsers] = useState([]);
 const [roles, setRoles] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingUser, setEditingUser] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');

 const defaultPermissions = MODULES.reduce((acc, module) => {
 acc[module] = { view: false, create: false, edit: false, delete: false };
 return acc;
 }, {});

 const [formData, setFormData] = useState({
 name: '',
 email: '',
 password: '',
 role: '',
 status: 'Active',
 permissions: defaultPermissions,
 isSystemUser: true
 });

 const loadData = async () => {
 setIsLoading(true);
 try {
 const [usersData, rolesData] = await Promise.all([
 fetchUsers(),
 fetchRoles()
 ]);
 setUsers(usersData);
 setRoles(rolesData);
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 }, []);

 const resetForm = () => {
 setFormData({ 
 name: '', 
 email: '', 
 password: '', 
 role: roles.length > 0 ? roles[0]._id : '', 
 status: 'Active',
 permissions: defaultPermissions,
 isSystemUser: true
 });
 };

 const handleOpenEdit = (user) => {
 setEditingUser(user);
 
 // Parse user's custom permissions or fallback to default
 const parsedPermissions = { ...defaultPermissions };
 if (user.permissions) {
 Object.keys(user.permissions).forEach(key => {
 if (parsedPermissions[key]) {
 parsedPermissions[key] = user.permissions[key];
 }
 });
 }

 setFormData({
 name: user.name,
 email: user.email,
 password: '', // Do not populate password on edit
 role: user.role ? user.role._id : '',
 status: user.status,
 permissions: parsedPermissions,
 isSystemUser: true
 });
 setIsModalOpen(true);
 };

 const handleRoleChange = (e) => {
 const roleId = e.target.value;
 const selectedRole = roles.find(r => r._id === roleId);
 
 let newPermissions = { ...defaultPermissions };
 if (selectedRole && selectedRole.permissions) {
 Object.keys(selectedRole.permissions).forEach(key => {
 if (newPermissions[key]) {
 newPermissions[key] = { ...selectedRole.permissions[key] };
 }
 });
 }

 setFormData({
 ...formData,
 role: roleId,
 permissions: newPermissions
 });
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

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this user?')) return;
 try {
 await deleteUser(id);
 loadData();
 } catch (err) {
 setError(err.message);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const submitData = { ...formData };
 if (editingUser && !submitData.password) {
 delete submitData.password; // Do not update password if left blank on edit
 }

 if (editingUser) {
 await updateUser(editingUser._id, submitData);
 } else {
 await createUser(submitData);
 }
 setIsModalOpen(false);
 resetForm();
 setEditingUser(null);
 loadData();
 } catch (err) {
 setError(err.message);
 }
 };

 const filteredUsers = users.filter(u => 
 u.isSystemUser !== false &&
 (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())))
 );

 const stats = useMemo(() => {
 const systemUsers = users.filter(u => u.isSystemUser !== false);
 const totalUsers = systemUsers.length;
 const activeUsers = systemUsers.filter(u => u.status === 'Active').length;
 const adminUsers = systemUsers.filter(u => u.role && u.role.name.toLowerCase().includes('admin')).length;
 const standardUsers = totalUsers - adminUsers;

 return {
 total: totalUsers,
 active: activeUsers,
 admin: adminUsers,
 standard: standardUsers
 };
 }, [users]);

 if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Users...</div>;

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 {error && (
 <div className="bg-white text-slate-500 px-4 py-3 rounded-xl flex items-center justify-between">
 <span>{error}</span>
 <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
 </div>
 )}

 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
 <Users className="w-6 h-6 text-blue-600" /> User Management
 </h1>
  </div>
 <button
 onClick={() => {
 resetForm();
 setEditingUser(null);
 setIsModalOpen(true);
 }}
 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors "
 >
 <Plus className="w-5 h-5 mr-2" />
 Create User
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <Users className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Total System Users</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <UserCheck className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Active Accounts</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.active}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
 <ShieldAlert className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Administrators</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.admin}</h3>
 </div>

 <div className="bg-white rounded-xl p-6 border border-slate-200 border-t-4 border-t-blue-500 overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-xl bg-white text-slate-500">
 <User className="w-6 h-6" />
 </div>
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1">Standard Users</p>
 <h3 className="text-3xl font-bold text-slate-900">{stats.standard}</h3>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
 <div className="p-4 border-b-0 bg-white flex justify-between items-center">
 <input
 type="text"
 placeholder="Search users..."
 className="border border-slate-200 w-full max-w-sm px-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">User</th>
 <th className="px-6 py-4">Assigned Role</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Last Login</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredUsers.map((user) => (
 <tr key={user._id} className="hover:bg-white transition-colors group">
 <td className="px-6 py-4">
 <div className="flex items-center">
 <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mr-3">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="font-medium text-slate-900">{user.name}</p>
 <div className="flex items-center text-xs text-slate-500 mt-0.5">
 <Mail className="w-3 h-3 mr-1" /> {user.email}
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
 <Shield className="w-3 h-3 mr-1.5" />
 {user.role ? user.role.name : 'No Role'}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-500'}`}>
 {user.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
 {user.status}
 </span>
 </td>
 <td className="px-6 py-4 text-slate-500">
 {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
 </td>
 <td className="px-6 py-4">
 <div className="flex justify-end space-x-2">
 <button 
 onClick={() => handleOpenEdit(user)}
 className="p-1.5 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-md transition-all "
 >
 <Edit2 className="w-4 h-4" />
 </button>
 <button 
 onClick={() => handleDelete(user._id)}
 className="p-1.5 bg-white text-slate-400 hover:text-slate-500 hover:border-slate-200 hover:bg-white rounded-md transition-all ml-2"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {filteredUsers.length === 0 && (
 <tr>
 <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
 No users found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

  {isModalOpen && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
  <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
  
  {/* Sticky Header */}
  <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white shrink-0">
  <h2 className="text-xl font-extrabold text-slate-800">
  {editingUser ? 'Edit User Profile' : 'Create New User'}
  </h2>
  <button 
  type="button"
  onClick={() => setIsModalOpen(false)}
  className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition-colors"
  >
  <X className="w-5 h-5" />
  </button>
  </div>
  
  <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
  
  {/* Scrollable Body */}
  <div className="px-8 py-6 overflow-y-auto flex-1 space-y-10 bg-white">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
 <input
 type="text"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 placeholder="John Doe"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
 <input
 type="email"
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 placeholder="john@example.com"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">
 Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
 {!editingUser && '*'}
 </label>
 <input
 type="password"
 required={!editingUser}
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 value={formData.password}
 onChange={(e) => setFormData({...formData, password: e.target.value})}
 placeholder="••••••••"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Role Base Template *</label>
 <select
 required
 className="border border-slate-200 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow bg-white"
 value={formData.role}
 onChange={handleRoleChange}
 >
 <option value="" disabled>Select a role...</option>
 {roles.map(r => (
 <option key={r._id} value={r._id}>{r.name}</option>
 ))}
 </select>
 {roles.length === 0 && (
 <p className="text-xs text-slate-500 mt-2">
 No roles found. Please create a role first in Role Permissions.
 </p>
 )}
 <p className="text-xs text-slate-500 mt-1">Selecting a role auto-fills the custom permissions below.</p>
 </div>
 </div>

  <div>
  <div className="mb-5">
  <h3 className="text-lg font-bold text-slate-800">Custom User Permissions</h3>
    </div>
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
  <table className="w-full text-sm text-left">
  <thead className="text-[11px] text-slate-500 font-bold tracking-wider uppercase border-b border-slate-200 bg-slate-50">
  <tr>
  <th className="px-6 py-4 w-1/3">Module Name</th>
  <th className="px-4 py-4 text-center">View</th>
  <th className="px-4 py-4 text-center">Create</th>
  <th className="px-4 py-4 text-center">Edit</th>
  <th className="px-4 py-4 text-center">Delete</th>
  <th className="px-6 py-4 text-right">Quick Select</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-100 bg-white">
 {MODULES.map(module => (
 <tr key={module} className="hover:bg-white">
  <td className="px-6 py-4 font-semibold text-slate-700">{module}</td>
  {['view', 'create', 'edit', 'delete'].map(action => (
  <td key={action} className="px-4 py-4 text-center">
  <button
  type="button"
  onClick={() => togglePermission(module, action)}
  className={`w-5 h-5 rounded flex items-center justify-center transition-all border-2 mx-auto ${
  formData.permissions[module][action] 
  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30' 
  : 'bg-white border-blue-400 text-transparent hover:border-blue-600 hover:shadow-sm'
  }`}
  >
  <Check className="w-3.5 h-3.5 stroke-[3]" />
  </button>
  </td>
  ))}
  <td className="px-6 py-4 text-right">
  <button 
  type="button"
  onClick={() => toggleRow(module, true)}
  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors mr-2"
  >
  All
  </button>
  <button 
  type="button"
  onClick={() => toggleRow(module, false)}
  className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
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

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Status</label>
 <div className="flex gap-4">
 <label className="flex items-center cursor-pointer">
 <input 
 type="radio" 
 name="status" 
 value="Active"
 checked={formData.status === 'Active'}
 onChange={(e) => setFormData({...formData, status: e.target.value})}
 className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
 />
 <span className="ml-2 text-sm text-slate-700 font-medium">Active</span>
 </label>
 <label className="flex items-center cursor-pointer">
 <input 
 type="radio" 
 name="status" 
 value="Inactive"
 checked={formData.status === 'Inactive'}
 onChange={(e) => setFormData({...formData, status: e.target.value})}
 className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
 />
 <span className="ml-2 text-sm text-slate-700 font-medium">Inactive</span>
 </label>
 </div>
 </div>

  </div>
  
  {/* Sticky Footer */}
  <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4 shrink-0 rounded-b-2xl">
  <button
  type="button"
  onClick={() => setIsModalOpen(false)}
  className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all shadow-sm"
  >
  Cancel
  </button>
  <button
  type="submit"
  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
  >
  {editingUser ? 'Update User Profile' : 'Save New User'}
  </button>
  </div>
  </form>
  </div>
  </div>
  )}
 </div>
 );
}
