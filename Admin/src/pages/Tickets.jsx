import { Filter, Download, Plane, AlertCircle, CheckCircle, Clock, Plus, X, Edit, Trash2, Search } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { fetchTickets, fetchFlights, fetchCustomers, createTicket, updateTicket, deleteTicket } from '../api';
import { usePermissions } from '../context/AuthContext';

const mockTickets = [
 { _id: '1', passengerName: 'Julianne H. Moore', passportNo: 'P-982341', pnr: 'XJ78PQ', flightDetails: { route: 'DXB-JFK', airline: 'Emirates' }, issuanceStatus: 'Issued', totalAmount: 1420.00, currency: 'USD', paymentStatus: 'Paid', gender: 'Female' },
 { _id: '2', passengerName: 'Marcus Sterling', passportNo: 'P-112390', pnr: 'MK44LW', flightDetails: { route: 'SIN-LHR', airline: 'Singapore Air' }, issuanceStatus: 'Pending', totalAmount: 2850.50, currency: 'USD', paymentStatus: 'Unpaid', gender: 'Male' },
];

// Stats calculation will happen dynamically based on ticketsData

 export default function Tickets() {
 const { hasPermission } = usePermissions();
 const [ticketsData, setTicketsData] = useState([]);
 const [flightsList, setFlightsList] = useState([]);
 const [customersList, setCustomersList] = useState([]);
 const [loading, setLoading] = useState(true);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);

 const [searchQuery, setSearchQuery] = useState('');
 const [filterPayment, setFilterPayment] = useState('All');

 const [formData, setFormData] = useState({
 customer: '', flightDetails: '', price: 0, profit: 0, discount: 0, currency: 'USD', paymentStatus: 'Unpaid'
 });

 const getAvatar = (name, gender) => {
 if (!name) return 'https://randomuser.me/api/portraits/men/1.jpg';
 const id = (name.length * 13) % 90 + 1;
 return `https://randomuser.me/api/portraits/${gender === 'Female' ? 'women' : 'men'}/${id}.jpg`;
 };

 const loadData = () => {
 setLoading(true);
 Promise.all([fetchTickets(), fetchFlights(), fetchCustomers()])
 .then(([tData, fData, cData]) => {
 setTicketsData(tData.length > 0 ? tData : mockTickets);
 setFlightsList(fData);
 setCustomersList(cData);
 })
 .catch(err => {
 console.error(err);
 setTicketsData(mockTickets);
 })
 .finally(() => setLoading(false));
 };

 useEffect(() => {
 loadData();
 }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 const firstFlight = flightsList.length > 0 ? flightsList[0] : null;
 setFormData({
 customer: customersList.length > 0 ? customersList[0]._id : '',
 flightDetails: firstFlight ? firstFlight._id : '',
 price: firstFlight ? (firstFlight.price || 0) : 0,
 profit: 0,
 discount: 0,
 currency: 'USD',
 paymentStatus: 'Unpaid'
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (ticket) => {
 setEditingId(ticket._id || ticket.id);
 setFormData({
 customer: ticket.customer ? (typeof ticket.customer === 'object' ? ticket.customer._id : ticket.customer) : (customersList.length > 0 ? customersList[0]._id : ''),
 flightDetails: typeof ticket.flightDetails === 'object' ? ticket.flightDetails._id : ticket.flightDetails,
 price: ticket.price || 0,
 totalAmount: ticket.totalAmount || (typeof ticket.amount === 'string' ? parseFloat(ticket.amount.replace(/[^0-9.]/g, '')) : 0),
 profit: ticket.profit || 0,
 discount: ticket.discount || 0,
 currency: ticket.currency || ticket.curr || 'USD',
 paymentStatus: ticket.paymentStatus || ticket.payment || 'Unpaid'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this ticket?')) return;
 try {
 await deleteTicket(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete ticket");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 // if flightDetails or customer is empty, warn
 if (!formData.flightDetails || !formData.customer) {
 alert("Please ensure both a flight and a customer are selected!");
 return;
 }
 
 const finalAmount = (parseFloat(formData.price) || 0) + (parseFloat(formData.profit) || 0) - (parseFloat(formData.discount) || 0);

 const dataToSubmit = { ...formData, totalAmount: finalAmount };

 try {
 if (editingId) {
 await updateTicket(editingId, dataToSubmit);
 } else {
 await createTicket(dataToSubmit);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save ticket", error);
 alert("Failed to save ticket");
 }
 };

  const getPaymentColor = (payment) => {
  switch(payment) {
  case 'Paid': return 'text-emerald-600 bg-emerald-50';
  case 'Partially Paid': return 'text-amber-600 bg-amber-50';
  case 'Unpaid': return 'text-red-600 bg-red-50';
  case 'Refunded': return 'text-slate-500 bg-slate-100';
  default: return 'text-slate-500 bg-slate-100';
  }
  };

 const calculatedTotal = (parseFloat(formData.price) || 0) + (parseFloat(formData.profit) || 0) - (parseFloat(formData.discount) || 0);

 // Dynamic Stats Calculation
 const stats = {
 todayCount: 0,
 unpaidCount: 0,
 partialCount: 0,
 totalRevenue: 0,
 chartData: []
 };

 const today = new Date().toISOString().split('T')[0];
 const last7Days = Array.from({length: 7}, (_, i) => {
 const d = new Date();
 d.setDate(d.getDate() - (6 - i));
 return d.toISOString().split('T')[0];
 });

 const chartMap = {};
 last7Days.forEach(date => {
 const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })[0];
 chartMap[date] = { name: dayName, issued: 0, pending: 0 };
 });

 ticketsData.forEach(t => {
 const dateCreated = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : today;
 if (dateCreated === today) stats.todayCount++;
 if (t.paymentStatus === 'Unpaid') stats.unpaidCount++;
 if (t.paymentStatus === 'Partially Paid') stats.partialCount++;
 if (t.paymentStatus === 'Refunded') stats.refundCount = (stats.refundCount || 0) + 1;
 
 const amount = t.totalAmount !== undefined ? t.totalAmount : parseFloat((t.amount||'0').toString().replace(/[^0-9.]/g, ''));
 stats.totalRevenue += amount || 0;

 if (chartMap[dateCreated]) {
 if (t.paymentStatus === 'Paid') {
 chartMap[dateCreated].issued++;
 } else {
 chartMap[dateCreated].pending++;
 }
 }
 });

 stats.chartData = Object.values(chartMap);

 if (loading) return <div className="p-8 text-center text-slate-500">Loading Tickets...</div>;

 if (!hasPermission('Tickets', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Tickets module.</p>
     </div>
   );
 }

 return (
 <div className="space-y-6">
  {/* Header */}
  <div className="flex justify-between items-end">
  <div>
  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ticket Management</h1>
  <p className="text-slate-500 mt-1">Issue and manage passenger flight tickets</p>
  </div>
  <div className="flex space-x-3">
  <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm">
  <Download className="w-4 h-4 mr-2" /> Export
  </button>
  {hasPermission('Tickets', 'create') && (
    <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-600/20">
    <Plus className="w-4 h-4 mr-2" /> Issue Ticket
    </button>
  )}
  </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
  <p className="text-sm font-semibold text-slate-500 mb-2">Tickets Today</p>
  <div className="flex items-baseline gap-2">
  <h3 className="text-3xl font-bold text-slate-900">{stats.todayCount}</h3>
  <span className="text-sm font-medium text-blue-600">Active</span>
  </div>
  </div>
  <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
  <p className="text-sm font-semibold text-slate-500 mb-2">Pending Issuance</p>
  <div className="flex items-baseline gap-2">
  <h3 className="text-3xl font-bold text-slate-900">{stats.unpaidCount}</h3>
  <span className="text-sm font-medium text-blue-600">Urgent</span>
  </div>
  </div>
  <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
  <p className="text-sm font-semibold text-slate-500 mb-2">Total Revenue</p>
  <div className="flex items-baseline gap-2">
  <h3 className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
  <span className="text-sm font-medium text-blue-600">Live</span>
  </div>
  </div>
  <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
  <p className="text-sm font-semibold text-slate-500 mb-2">Refund Requests</p>
  <div className="flex items-baseline gap-2">
  <h3 className="text-3xl font-bold text-slate-900">{stats.refundCount || 0}</h3>
  <span className="text-sm font-medium text-blue-600">Last 24h</span>
  </div>
  </div>
  </div>

  <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
  <div className="flex-1 min-w-[200px]">
  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Search Passenger</label>
  <div className="relative">
  <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
  <input 
  type="text" 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search by passenger name..." 
  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200 bg-slate-50 focus:bg-white transition-all" 
  />
  </div>
  </div>
  <div className="w-52">
  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Payment Status</label>
  <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all">
  <option value="All">All Payments</option>
  <option value="Paid">Paid</option>
  <option value="Unpaid">Unpaid</option>
  </select>
  </div>
  </div>

  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
  <div className="overflow-x-auto">
  <table className="w-full text-sm text-left">
  <thead>
  <tr className="bg-blue-50/60 text-xs text-slate-500 font-bold tracking-wider uppercase">
  <th className="px-6 py-4">Passenger</th>
  <th className="px-6 py-4">Passenger Name</th>
  <th className="px-6 py-4">Flight Details</th>
  <th className="px-6 py-4">Total Amount</th>
  <th className="px-6 py-4">Status</th>
  <th className="px-6 py-4 text-right">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-50">
 {ticketsData.filter(t => {
 const customerObj = typeof t.customer === 'object' ? t.customer : null;
 const nameMatch = (customerObj?.name || t.passengerName || t.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const paymentMatch = filterPayment === 'All' || (t.paymentStatus || t.payment) === filterPayment;
 return nameMatch && paymentMatch;
 }).map((t) => {
 const customerObj = typeof t.customer === 'object' ? t.customer : null;
 const name = customerObj?.name || t.passengerName || t.name;
 const passport = customerObj?.passportNo || t.passportNo || t.passport;
 const gender = customerObj?.gender || t.gender || 'Male';
 const payment = t.paymentStatus || t.payment;
 const amount = t.totalAmount !== undefined ? t.totalAmount : parseFloat((t.amount||'0').toString().replace(/[^0-9.]/g, ''));
 
 let flightNumber = 'Unknown Flight';
 let flightAirline = 'Unknown Airline';
 if (t.flightDetails && typeof t.flightDetails === 'object') {
 flightNumber = t.flightDetails.flightNumber || 'Unknown Flight';
 flightAirline = t.flightDetails.airline || 'Unknown Airline';
 } else if (t.flightNumber) {
 // Fallback for mock legacy data
 flightNumber = t.flightNumber;
 flightAirline = t.airline;
 }

 return (
  <tr key={t._id || t.id} className="hover:bg-blue-50/40 transition-colors group">
  <td className="px-6 py-3.5">
  <img src={t.photo || t.img || getAvatar(name, gender)} alt={name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
  </td>
  <td className="px-6 py-3.5">
  <p className="font-semibold text-slate-800">{name}</p>
  <p className="text-xs text-slate-400 mt-0.5">🪪 {passport}</p>
  </td>
  <td className="px-6 py-3.5">
  <div className="flex items-center gap-2 mb-0.5">
  <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
  <Plane className="w-3.5 h-3.5 text-blue-500" />
  </div>
  <span className="font-semibold text-slate-800 text-sm">{flightAirline}</span>
  </div>
  <p className="text-xs text-slate-400 pl-8">Flight #{flightNumber}</p>
  </td>
  <td className="px-6 py-3.5">
  <p className="font-bold text-slate-900 text-base">{t.currency || t.curr} {amount.toFixed(2)}</p>
  </td>
  <td className="px-6 py-3.5">
  <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${getPaymentColor(payment)}`}>
  {payment}
  </span>
  </td>
  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex items-center justify-end gap-2">
  {hasPermission('Tickets', 'edit') && (
    <button onClick={() => handleOpenEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
    <Edit className="w-4 h-4" />
    </button>
  )}
  {hasPermission('Tickets', 'delete') && (
    <button onClick={() => handleDelete(t._id || t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
    <Trash2 className="w-4 h-4" />
    </button>
  )}
  </div>
  </td>
  </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
 <span className="text-slate-500">Showing {ticketsData.length} tickets</span>
 <div className="flex space-x-1">
 <button className="px-3 py-1 rounded text-slate-600 hover:bg-blue-50 hover:text-blue-600">&lt;</button>
 <button className="px-3 py-1 bg-blue-600 text-white rounded font-medium">1</button>
 <button className="px-3 py-1 rounded text-slate-600 hover:bg-blue-50 hover:text-blue-600">2</button>
 <button className="px-3 py-1 rounded text-slate-600 hover:bg-blue-50 hover:text-blue-600">3</button>
 <span className="px-2 py-1 text-slate-400">...</span>
 <button className="px-3 py-1 rounded text-slate-600 hover:bg-blue-50 hover:text-blue-600">48</button>
 <button className="px-3 py-1 rounded text-slate-600 hover:bg-blue-50 hover:text-blue-600">&gt;</button>
 </div>
 </div>
 </div>

 {/* Issuance Trends */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-bold text-slate-900">Issuance Trends</h2>
 <div className="flex space-x-4">
 <div className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>Issued</div>
 <div className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2 h-2 rounded-full bg-blue-200 mr-2"></span>Pending</div>
 </div>
 </div>
 <div className="h-48">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={stats.chartData} margin={{top:0, right:0, left:0, bottom:0}} barGap={0}>
 <Bar dataKey="pending" stackId="a" fill="#bfdbfe" radius={[0, 0, 4, 4]} />
 <Bar dataKey="issued" stackId="a" fill="#2563eb" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden">
 <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-6 uppercase">Recent Activity</h2>
 <div className="space-y-6">
 {ticketsData.slice(0, 3).map((t, idx) => (
 <div key={t._id || idx} className="flex items-start">
 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 mt-1 shrink-0">
 <CheckCircle className="w-4 h-4" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900">Ticket for <span className="font-bold">{t.customer?.name || 'Unknown'}</span></p>
 <p className="text-xs text-slate-500 mt-1">{new Date(t.createdAt || Date.now()).toLocaleDateString()}</p>
 </div>
 </div>
 ))}
 {ticketsData.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
 </div>
 </div>
 </div>

 {/* Modal for Adding/Editing Ticket */}
 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl overflow-y-auto max-h-[90vh] min-h-[600px] flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Ticket Details' : 'Add New Ticket'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Assignment <span className="text-slate-500">*</span></label>
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
 <label className="block text-sm font-semibold text-slate-700 mb-2">Flight Assignment <span className="text-slate-500">*</span></label>
 <select
 required
 value={formData.flightDetails}
 onChange={e => {
 const selectedFlight = flightsList.find(f => f._id === e.target.value);
 setFormData({
 ...formData,
 flightDetails: e.target.value,
 price: selectedFlight ? (selectedFlight.price || 0) : formData.price
 });
 }}
 className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
 >
 {flightsList.length === 0 && <option value="">No Flights Available</option>}
 {flightsList.map(f => (
 <option key={f._id} value={f._id}>
 {f.airline} #{f.flightNumber} · ${f.price || 0}
 </option>
 ))}
 </select>
 </div>

 {/* Pricing Breakdown Section */}
 <div className="bg-slate-50 rounded-xl p-6 space-y-6">
 <h3 className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2">Pricing Breakdown</h3>
 
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Ticket Price</label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
 <input 
 type="number" 
 value={formData.price} 
 onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} 
 className="w-full pl-8 pr-4 py-3 bg-white rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow " 
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Profit</label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">+</span>
 <input 
 type="number" 
 value={formData.profit} 
 onChange={e => setFormData({...formData, profit: e.target.value === '' ? '' : Number(e.target.value)})} 
 className="w-full pl-8 pr-4 py-3 bg-white rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow " 
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6 pt-2">
 <div>
 <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Discount</label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">-</span>
 <input 
 type="number" 
 value={formData.discount} 
 onChange={e => setFormData({...formData, discount: e.target.value === '' ? '' : Number(e.target.value)})} 
 className="w-full pl-8 pr-4 py-3 bg-white rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow " 
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Final Price</label>
 <div className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-lg font-bold text-white flex justify-between items-center">
 <span>Total:</span>
 <span>${calculatedTotal.toFixed(2)}</span>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
 <input required value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Status</label>
 <select value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="Paid">Paid</option>
 <option value="Unpaid">Unpaid</option>
 </select>
 </div>
 </div>

 <div className="mt-auto pt-6">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Ticket Details' : 'Save New Ticket'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Analytics moved to top */}
 </div>
 );
}
