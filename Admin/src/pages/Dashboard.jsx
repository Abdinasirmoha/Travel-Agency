import { Users, Calendar, PlaneTakeoff, DollarSign, TrendingUp, TrendingDown, Plus, FileText, Ticket } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import { fetchAdvancedDashboardStats, fetchDashboardCharts, fetchPayments, fetchInvoices } from '../api';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
const VISA_COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'];

/* Animated counter hook */
function useCountUp(target, duration = 1000) {
 const [count, setCount] = useState(0);
 const raf = useRef(null);
 useEffect(() => {
 if (!target) { setCount(0); return; }
 let start = null;
 const step = (ts) => {
 if (!start) start = ts;
 const progress = Math.min((ts - start) / duration, 1);
 setCount(Math.floor(progress * target));
 if (progress < 1) raf.current = requestAnimationFrame(step);
 };
 raf.current = requestAnimationFrame(step);
 return () => cancelAnimationFrame(raf.current);
 }, [target, duration]);
 return count;
}

/* Individual animated stat card */
function StatCard({ icon: Icon, label, value, prefix = '', color, bgColor, trend, borderColor = 'border-t-blue-500' }) {
 const animated = useCountUp(Number(value) || 0, 900);
 return (
 <div className={`bg-white rounded-xl p-6 border border-slate-200 border-t-4 hover: transition-all duration-200 ${borderColor}`}>
 <div className="flex justify-between items-start mb-4">
 <div className={`p-2.5 rounded-lg ${bgColor}`}>
 <Icon className={`w-5 h-5 ${color}`} />
 </div>
 {trend !== undefined && (
 <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-500'}`}>
 {trend >= 0 ? `+${trend}%` : `${trend}%`}
 </div>
 )}
 </div>
 <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-1">{label}</p>
 <h3 className="text-2xl font-bold text-slate-900">
 {prefix}{animated.toLocaleString()}
 </h3>
 </div>
 );
}

export default function Dashboard() {
 const [isLoading, setIsLoading] = useState(true);
 const [stats, setStats] = useState(null);
 const [charts, setCharts] = useState({
 trendData: [],
 bookingStatus: [],
 visaStatus: [],
 expenseBreakdown: []
 });
 const [recentPayments, setRecentPayments] = useState([]);
 const [recentInvoices, setRecentInvoices] = useState([]);

 useEffect(() => {
 const load = async () => {
 try {
 setIsLoading(true);
 const [statsData, chartsData, payments, invoices] = await Promise.all([
 fetchAdvancedDashboardStats().catch(() => null),
 fetchDashboardCharts().catch(() => ({ trendData: [], bookingStatus: [], visaStatus: [], expenseBreakdown: [] })),
 fetchPayments().catch(() => []),
 fetchInvoices().catch(() => []),
 ]);
 if (statsData) setStats(statsData);
 setCharts(chartsData);
 // Only show Completed payments in recent activity
 setRecentPayments(payments.filter(p => p.status === 'Completed' || !p.status).slice(0, 4));
 setRecentInvoices(invoices.slice(0, 4));
 } catch (err) {
 console.error('Dashboard error:', err);
 } finally {
 setIsLoading(false);
 }
 };
 load();
 // Auto-refresh every 15s so dashboard reflects real-time payment status
 const interval = setInterval(load, 15000);
 return () => clearInterval(interval);
 }, []);

 if (isLoading) {
 return (
 <div className="space-y-6 animate-pulse">
 {/* skeleton header */}
 <div className="flex justify-between items-start">
 <div>
 <div className="h-7 bg-slate-200 rounded w-52 mb-2" />
 <div className="h-4 bg-slate-100 rounded w-72" />
 </div>
 <div className="flex gap-3">
 <div className="h-9 bg-slate-200 rounded-lg w-32" />
 <div className="h-9 bg-slate-200 rounded-lg w-32" />
 </div>
 </div>
 {/* skeleton cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 h-36">
 <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4" />
 <div className="h-3 bg-slate-100 rounded w-24 mb-2" />
 <div className="h-8 bg-slate-200 rounded w-20" />
 </div>
 ))}
 </div>
 {/* skeleton chart */}
 <div className="bg-white rounded-xl p-6 border border-slate-200 h-80">
 <div className="h-5 bg-slate-200 rounded w-48 mb-6" />
 <div className="h-56 bg-slate-100 rounded-xl" />
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* ── Top Stat Cards ── */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard
 icon={Users}
 label="Total Customers"
 value={stats?.totalCustomers}
 color="text-blue-600"
 bgColor="bg-blue-50"
 trend={12}
 borderColor="border-t-blue-500"
 />
 <StatCard
 icon={Calendar}
 label="Total Bookings"
 value={stats?.totalBookings}
 color="text-blue-600"
 bgColor="bg-blue-50"
 trend={8}
 borderColor="border-t-blue-500"
 />
 <StatCard
    icon={Ticket}
    label="Total Tickets"
    value={stats?.totalFlights}
    color="text-blue-600"
    bgColor="bg-blue-50"
    trend={-3}
    borderColor="border-t-blue-500"
  />
 <StatCard
 icon={DollarSign}
 label="Total Revenue"
 value={stats?.totalRevenue}
 prefix="$"
 color="text-blue-600"
 bgColor="bg-blue-50"
 trend={15}
 borderColor="border-t-blue-500"
 />
 </div>

 {/* ── Mini Stats Row ── */}
 <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
 {[
 { label: 'INVOICES', value: stats?.totalInvoices || 0 },
 { label: 'VISAS', value: stats?.totalVisas || 0 },
 { label: 'TOURS', value: stats?.totalPackagesSold || 0 },
 { label: 'UNPAID INV',value: stats?.unpaidInvoices || 0, color: 'text-slate-500' },
 { label: 'EXPENSES', value: `$${(stats?.totalExpenses || 0).toLocaleString()}` },
 { label: 'NET PROFIT',value: `$${(stats?.netProfit || 0).toLocaleString()}`, color: 'text-blue-600' },
 ].map(stat => (
 <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200 transition-all duration-200">
 <p className="text-xs text-slate-500 font-semibold tracking-wider mb-1">{stat.label}</p>
 <p className={`text-lg font-bold ${stat.color || 'text-slate-900'}`}>{stat.value}</p>
 </div>
 ))}
 </div>

 {/* ── Charts Row ── */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Area chart */}
 <div className="lg:col-span-2 bg-white rounded-xl p-6 overflow-hidden">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-bold text-slate-900">Revenue & Bookings Trend</h2>
 </div>
 <div className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={charts.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="colorBook" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
 <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
 <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
 <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
 <Tooltip />
 <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
 <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBook)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Donut - Services Breakdown */}
 <div className="bg-white rounded-xl p-6 overflow-hidden flex flex-col">
 <h2 className="text-lg font-bold text-slate-900 mb-2">Services Breakdown</h2>
 <div className="flex-1 min-h-[200px] relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={charts.bookingStatus} innerRadius={60} outerRadius={82} paddingAngle={4} dataKey="value" stroke="none">
 {charts.bookingStatus.map((_, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="text-3xl font-bold text-slate-900">
   {charts.bookingStatus.reduce((sum, item) => sum + (item.value || 0), 0)}
 </span>
 <span className="text-xs text-slate-500">Total Services</span>
 </div>
 </div>
 <div className="flex flex-wrap justify-center gap-4 mt-4">
 {charts.bookingStatus.map((status, idx) => (
 <div key={status.name} className="flex items-center">
 <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
 <span className="text-xs text-slate-600">{status.name}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* ── Secondary Charts ── */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-white rounded-xl p-6 overflow-hidden flex flex-col">
 <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Visa Approval Status</h2>
 <div className="flex-1 min-h-[160px] relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={charts.visaStatus} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} stroke="none">
 {charts.visaStatus.map((_, index) => (
 <Cell key={`cell-${index}`} fill={VISA_COLORS[index % VISA_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
  <span className="text-2xl font-bold text-slate-900">
    {charts.visaStatus.reduce((sum, item) => sum + (item.value || 0), 0)}
  </span>
  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
 </div>
 </div>
 <div className="flex flex-wrap justify-center gap-4 mt-2">
 {charts.visaStatus.map((status, idx) => (
 <div key={status.name} className="flex items-center text-[10px] text-slate-500">
 <span className="w-2 h-2 mr-1 rounded-full inline-block" style={{ backgroundColor: VISA_COLORS[idx % VISA_COLORS.length] }} />
 {status.name}
 </div>
 ))}
 </div>
 </div>


 <div className="bg-white rounded-xl p-6 overflow-hidden flex flex-col">
 <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Expense Breakdown</h2>
 <div className="flex-1 min-h-[160px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.expenseBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
 <Tooltip cursor={{ fill: '#f1f5f9' }} />
 <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* ── Tables Row ── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Recent Invoices */}
 <div className="bg-white rounded-xl p-6 overflow-hidden">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-bold text-slate-900">Recent Invoices</h2>
 <Link to="/invoices" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase ">
 <tr>
 <th className="px-4 py-3">Invoice</th>
 <th className="px-4 py-3">Customer</th>
 <th className="px-4 py-3">Date</th>
 <th className="px-4 py-3 text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-transparent">
 {recentInvoices.map(inv => (
 <tr key={inv._id} className="hover:bg-blue-50/50 transition-colors">
 <td className="px-4 py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
 <td className="px-4 py-3">
 <p className="font-medium text-slate-900">{inv.customer?.firstName} {inv.customer?.lastName}</p>
 </td>
 <td className="px-4 py-3 text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
 <td className="px-4 py-3 text-right">
 <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
    inv.status === 'Paid'           ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    inv.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border-amber-200' :
    inv.status === 'Unpaid'         ? 'bg-red-50 text-red-600 border-red-200' :
                                      'bg-slate-100 text-slate-600 border-slate-200'
  }`}>
  {inv.status}
  </span>
 </td>
 </tr>
 ))}
 {recentInvoices.length === 0 && (
 <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No recent invoices</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Recent Payments */}
 <div className="bg-white rounded-xl p-6 overflow-hidden">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-bold text-slate-900">Recent Payments</h2>
 <Link to="/payments" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
 </div>
 <div className="space-y-4">
 {recentPayments.map(payment => (
 <div key={payment._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
 <div className="flex items-center">
 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4 border border-blue-100">
 <DollarSign className="w-5 h-5 text-blue-600" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900">Payment for {payment.invoice?.invoiceNumber || 'Direct'}</p>
 <p className="text-xs text-slate-500">{payment.paymentMethod} &bull; {new Date(payment.paymentDate).toLocaleDateString()}</p>
 </div>
 </div>
 <p className="text-sm font-bold text-blue-600">+${payment.amountPaid?.toLocaleString()}</p>
 </div>
 ))}
 {recentPayments.length === 0 && (
 <p className="text-center text-slate-400 py-8">No recent payments</p>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
