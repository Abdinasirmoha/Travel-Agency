import { Search, Download, Plus, MapPin, Navigation, MoreVertical, X, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchFlights, createFlight, updateFlight, deleteFlight } from '../api';
import { usePermissions } from '../context/AuthContext';

const mockFlights = [
 { _id: '1', flightNumber: 'EK-202', airline: 'Emirates', airlineLogo: 'EM', route: 'DXB-JFK', departureTime: new Date(new Date().setHours(8, 30)), arrivalTime: new Date(new Date().setHours(21, 15)), status: 'ON TIME', seatsAvailable: 308, totalSeats: 350, type: 'International' },
 { _id: '2', flightNumber: 'SQ-12', airline: 'Singapore Air', airlineLogo: 'SQ', route: 'SIN-LHR', departureTime: new Date(new Date().setHours(23, 55)), arrivalTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(6, 20)), status: 'DELAYED', seatsAvailable: 268, totalSeats: 280, type: 'International' },
 { _id: '3', flightNumber: 'LH-456', airline: 'Lufthansa', airlineLogo: 'LH', route: 'FRA-HND', departureTime: new Date(new Date().setHours(14, 10)), arrivalTime: new Date(new Date().setHours(9, 35)), status: 'SCHEDULED', seatsAvailable: 78, totalSeats: 220, type: 'International' },
];

 export default function Flights() {
 const { hasPermission } = usePermissions();
 const [flightsData, setFlightsData] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [filterAirline, setFilterAirline] = useState('All Carriers');
 const [filterType, setFilterType] = useState('All');
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);

 const [formData, setFormData] = useState({
 flightNumber: '', airline: '', airlineLogo: '', route: '', departureTime: '', arrivalTime: '', status: 'SCHEDULED', seatsAvailable: 0, totalSeats: 0, price: 0, type: 'International'
 });

 const loadData = () => {
 setLoading(true);
 fetchFlights()
 .then(data => {
 setFlightsData(data.length > 0 ? data : mockFlights);
 })
 .catch(err => {
 console.error(err);
 setFlightsData(mockFlights);
 })
 .finally(() => setLoading(false));
 };

 useEffect(() => {
 loadData();
 }, []);

 const handleOpenAdd = () => {
 setEditingId(null);
 setFormData({
 flightNumber: '', airline: '', airlineLogo: '', route: '', departureTime: '', arrivalTime: '', status: 'SCHEDULED', seatsAvailable: 0, totalSeats: 0, price: 0, type: 'International'
 });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (flight) => {
 setEditingId(flight._id || flight.id);
 const toLocalISO = (d) => {
 if (!d) return '';
 const date = new Date(d);
 return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
 };

 setFormData({
 flightNumber: flight.flightNumber || '',
 airline: flight.airline || '',
 airlineLogo: flight.airlineLogo || '',
 route: flight.route || (flight.routeFrom && flight.routeTo ? `${flight.routeFrom}-${flight.routeTo}` : ''),
 departureTime: toLocalISO(flight.departureTime || flight.depTime),
 arrivalTime: toLocalISO(flight.arrivalTime || flight.arrTime),
 status: flight.status || 'SCHEDULED',
 seatsAvailable: flight.seatsAvailable !== undefined ? flight.seatsAvailable : (flight.totalSeats - (flight.seatsUsed || 0)),
 totalSeats: flight.totalSeats || 0,
 price: flight.price || 0,
 type: flight.type || 'International'
 });
 setIsModalOpen(true);
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this flight?')) return;
 try {
 await deleteFlight(id);
 loadData();
 } catch (error) {
 console.error("Failed to delete", error);
 alert("Failed to delete flight");
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const dataToSubmit = { ...formData };
 
 // Auto-generate airline logo from airline name if not present
 if (!dataToSubmit.airlineLogo && dataToSubmit.airline) {
 dataToSubmit.airlineLogo = dataToSubmit.airline.substring(0, 2).toUpperCase();
 }
 
 if (editingId) {
 await updateFlight(editingId, dataToSubmit);
 } else {
 await createFlight(dataToSubmit);
 }
 setIsModalOpen(false);
 loadData();
 } catch (error) {
 console.error("Failed to save flight", error);
 alert("Failed to save flight");
 }
 };

 const filteredFlights = flightsData.filter(f => {
 const airlineMatch = filterAirline === 'All Carriers' || f.airline === filterAirline;
 let typeMatch = true;
 if (filterType !== 'All') {
 typeMatch = f.type === filterType || (f.routeFrom === f.routeTo && filterType === 'Domestic') || (f.routeFrom !== f.routeTo && filterType === 'International');
 }
 return airlineMatch && typeMatch;
 });

 const airlines = ['All Carriers', ...new Set(flightsData.map(f => f.airline))];

 const formatTime = (d) => {
 if (!d) return 'N/A';
 // If it's a string like "08:30" (legacy mock data) return it
 if (typeof d === 'string' && !d.includes('T')) return d;
 return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 const getStatusColor = (status) => {
 switch(status) {
 case 'ON TIME': return 'bg-blue-50 text-blue-600';
 case 'DELAYED': return 'bg-white text-slate-500';
 case 'CANCELLED': return 'bg-white text-slate-500';
 default: return 'bg-slate-100 text-slate-600';
 }
 };

 if (loading) return <div className="p-8 text-center text-slate-500">Loading Flights...</div>;

 if (!hasPermission('Flights', 'view')) {
   return (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
         <X className="w-8 h-8 text-red-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
       <p className="text-slate-500 max-w-md">You do not have permission to view the Flights module.</p>
     </div>
   );
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Flight Operations</h1>
 <p className="text-slate-500 mt-1">Manage active flights, routes, and capacities</p>
 </div>
 <div className="flex space-x-3">
 <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm">
 <Download className="w-4 h-4 mr-2" />
 Export Log
 </button>
 {hasPermission('Flights', 'create') && (
   <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-600/20">
   <Plus className="w-4 h-4 mr-2" />
   Add Flight
   </button>
 )}
 </div>
 </div>

  {/* ── Stat Cards (Based on Flights functionality) ── */}
  {(() => {
    const activeFlights = flightsData.filter(f => f.status === 'SCHEDULED' || f.status === 'ON TIME').length;
    const delayedFlights = flightsData.filter(f => f.status === 'DELAYED').length;
    
    // Revenue calculated from booked seats * price
    const estimatedRevenue = flightsData.reduce((sum, f) => {
      const bookedSeats = Math.max(0, (f.totalSeats || 0) - (f.seatsAvailable || 0));
      return sum + (bookedSeats * (f.price || 0));
    }, 0);
    
    const cancelledFlights = flightsData.filter(f => f.status === 'CANCELLED').length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Flights */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Active Flights</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{activeFlights}</h3>
            <span className="text-sm font-medium text-blue-600">Active</span>
          </div>
        </div>
        {/* Delayed Flights */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Delayed Flights</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{delayedFlights}</h3>
            <span className="text-sm font-medium text-blue-600">Urgent</span>
          </div>
        </div>
        {/* Estimated Revenue */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Estimated Revenue</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">${estimatedRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            <span className="text-sm font-medium text-blue-600">Live</span>
          </div>
        </div>
        {/* Cancelled Flights */}
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-500 mb-2">Cancelled Flights</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{cancelledFlights}</h3>
            <span className="text-sm font-medium text-blue-600">Total</span>
          </div>
        </div>
      </div>
    );
  })()}

 <div className="bg-white rounded-xl p-4  overflow-hidden flex flex-wrap gap-4 items-center">
 <div className="flex-1 min-w-[200px]">
 <label className="block text-sm font-semibold text-slate-700 mb-1">Airlines</label>
 <select value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
 {airlines.map(airline => (
 <option key={airline} value={airline}>{airline}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 min-w-[200px]">
 <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Date</label>
 <input type="date" className="border border-slate-200 w-full rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 "/>
 </div>
 <div className="flex-1 min-w-[200px]">
 <label className="block text-xs font-semibold text-slate-700 mb-1">Flight Type</label>
 <div className="flex space-x-2">
 <button onClick={() => setFilterType(filterType === 'International' ? 'All' : 'International')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === 'International' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>International</button>
 <button onClick={() => setFilterType(filterType === 'Domestic' ? 'All' : 'Domestic')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === 'Domestic' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Domestic</button>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
 <tr>
 <th className="px-6 py-4">Flight Number</th>
 <th className="px-6 py-4">Airline</th>
 <th className="px-6 py-4">Route</th>
 <th className="px-6 py-4">Dep / Arr</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Price</th>
 <th className="px-6 py-4">Seats</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {filteredFlights.map((f) => {
 const routeParts = f.route ? f.route.split('-') : [f.routeFrom, f.routeTo];
 const seatsUsed = f.totalSeats - (f.seatsAvailable !== undefined ? f.seatsAvailable : (f.totalSeats - f.seatsUsed));
 return (
 <tr key={f._id || f.id} className="hover:bg-white transition-colors">
 <td className="px-6 py-4 font-bold text-blue-600">{f.flightNumber}</td>
 <td className="px-6 py-4">
 <div className="flex items-center">
 <div className="w-6 h-6 rounded bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center mr-3">{f.airlineLogo}</div>
 <span className="font-medium text-slate-900">{f.airline}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-slate-600">
 <div className="flex items-center">
 {routeParts[0]} <MapPin className="w-3 h-3 mx-2 text-slate-400" /> {routeParts[1]}
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="font-bold text-slate-900">{formatTime(f.departureTime || f.depTime)}</p>
 <p className="text-xs text-slate-500">{formatTime(f.arrivalTime || f.arrTime)}</p>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusColor(f.status)}`}>
 &bull; {f.status}
 </span>
 </td>
 <td className="px-6 py-4 font-bold text-slate-900">
 ${f.price || 0}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 mb-1">
 <span>{seatsUsed}/{f.totalSeats}</span>
 </div>
 <div className="w-24 bg-slate-100 rounded-full h-1">
 <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${(seatsUsed/f.totalSeats)*100}%` }}></div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2">
 {hasPermission('Flights', 'edit') && (
   <button onClick={() => handleOpenEdit(f)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
   <Edit className="w-4 h-4" />
   </button>
 )}
 {hasPermission('Flights', 'delete') && (
   <button onClick={() => handleDelete(f._id || f.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
 <span className="text-slate-500">Showing {filteredFlights.length} flights</span>
 </div>
 </div>

 {/* Modal for Adding/Editing Flight */}
 {isModalOpen && (
 <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl overflow-y-auto max-h-[90vh] min-h-[600px] flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Flight Details' : 'Add New Flight'}</h2>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Flight Number</label>
 <input required value={formData.flightNumber} onChange={e => setFormData({...formData, flightNumber: e.target.value})} type="text" placeholder="e.g. EK-202" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Airline</label>
 <input required value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})} type="text" placeholder="e.g. Emirates" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Departure Time</label>
 <input required value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} type="datetime-local" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Arrival Time</label>
 <input required value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} type="datetime-local" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Total Seats</label>
 <input required value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: e.target.value === '' ? '' : Number(e.target.value)})} type="number" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Seats Available</label>
 <input required value={formData.seatsAvailable} onChange={e => setFormData({...formData, seatsAvailable: e.target.value === '' ? '' : Number(e.target.value)})} type="number" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Flight Type</label>
 <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="International">International</option>
 <option value="Domestic">Domestic</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Flight Status</label>
 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow">
 <option value="SCHEDULED">Scheduled</option>
 <option value="ON TIME">On Time</option>
 <option value="DELAYED">Delayed</option>
 <option value="CANCELLED">Cancelled</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">Ticket Price ($)</label>
 <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} type="number" step="0.01" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
 </div>
 </div>

 <div className="mt-auto pt-6">
 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20">
 {editingId ? 'Update Flight Details' : 'Save New Flight'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
