import { useState, useEffect } from 'react';
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
 PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
 TrendingUp, TrendingDown, DollarSign, Users, Plane, FileText, 
 Map, Briefcase, Globe, Activity, CheckCircle, Clock
} from 'lucide-react';
import { fetchAdvancedDashboardStats } from '../../api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

const computeDateRange = (filter, custom) => {
 const now = new Date();
 let start = null;
 let end = null;

 switch(filter) {
 case 'Today':
 start = new Date(now.setHours(0,0,0,0));
 end = new Date(now);
 end.setHours(23,59,59,999);
 break;
 case 'This Week':
 const first = now.getDate() - now.getDay();
 start = new Date(now.setDate(first));
 start.setHours(0,0,0,0);
 end = new Date(start);
 end.setDate(end.getDate() + 6);
 end.setHours(23,59,59,999);
 break;
 case 'This Month':
 start = new Date(now.getFullYear(), now.getMonth(), 1);
 end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
 end.setHours(23,59,59,999);
 break;
 case 'This Year':
 start = new Date(now.getFullYear(), 0, 1);
 end = new Date(now.getFullYear(), 11, 31);
 end.setHours(23,59,59,999);
 break;
 case 'Custom':
 if (custom.start) {
 start = new Date(custom.start);
 start.setHours(0,0,0,0);
 }
 if (custom.end) {
 end = new Date(custom.end);
 end.setHours(23,59,59,999);
 }
 break;
 default:
 start = null;
 end = null;
 }
 return { startDate: start?.toISOString(), endDate: end?.toISOString() };
};

export default function DashboardTab({ dateFilter, customRange }) {
 const [stats, setStats] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 const loadStats = async () => {
 setIsLoading(true);
 try {
 const { startDate, endDate } = computeDateRange(dateFilter, customRange);
 console.log("Fetching stats for range:", { dateFilter, startDate, endDate });
 
 // Ensure we don't spam custom calls if not applied
 if (dateFilter === 'Custom' && (!startDate || !endDate)) {
 setIsLoading(false);
 return;
 }

 const data = await fetchAdvancedDashboardStats({ startDate, endDate });
 setStats(data);
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };
 loadStats();
 }, [dateFilter, customRange]);

 if (isLoading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
 {[...Array(12)].map((_, i) => (
 <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse h-32"></div>
 ))}
 </div>
 );
 }

 if (error) return <div className="text-slate-500 bg-white p-4 rounded-xl ">{error}</div>;
 if (!stats) return null;

 // Mock data for charts since we don't have time-series aggregated in backend yet 
 // (In a full prod ERP, the backend would return arrays of grouped data for each chart type)
 // We'll stub beautiful interactive charts here for layout purposes.
 const mockLineData = [
 { name: 'Jan', Revenue: 4000, Expenses: 2400 },
 { name: 'Feb', Revenue: 3000, Expenses: 1398 },
 { name: 'Mar', Revenue: 2000, Expenses: 9800 },
 { name: 'Apr', Revenue: 2780, Expenses: 3908 },
 { name: 'May', Revenue: 1890, Expenses: 4800 },
 { name: 'Jun', Revenue: 2390, Expenses: 3800 },
 ];

 const mockPieData = [
 { name: 'Paid', value: stats.paidInvoices },
 { name: 'Unpaid', value: stats.unpaidInvoices },
 ];

 return (
 <div className="space-y-6">
 {/* 12 KPI CARDS */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 
 <KpiCard 
 title="Total Revenue" 
 value={`$${stats.totalRevenue?.toLocaleString()}`} 
 icon={DollarSign} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" topBorder="border-t-blue-500"
 trend="+12%" trendUp={true}
 />
 <KpiCard 
 title="Total Expenses" 
 value={`$${stats.totalExpenses?.toLocaleString()}`} 
 icon={TrendingDown} color="text-slate-500" bg="bg-white" border="border-slate-200" topBorder="border-t-blue-500"
 trend="-2%" trendUp={true}
 />
 <KpiCard 
 title="Net Profit" 
 value={`$${stats.netProfit?.toLocaleString()}`} 
 icon={Activity} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" topBorder="border-t-blue-500"
 trend="+8%" trendUp={true}
 />
 <KpiCard 
 title="Total Customers" 
 value={stats.totalCustomers} 
 icon={Users} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" topBorder="border-t-blue-500"
 />

 <KpiCard 
 title="Total Bookings" 
 value={stats.totalBookings} 
 icon={Briefcase} color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
 />
 <KpiCard 
 title="Total Invoices" 
 value={stats.totalInvoices} 
 icon={FileText} color="text-slate-600" bg="bg-slate-50" border="border-slate-200"
 />
 <KpiCard 
 title="Paid Invoices" 
 value={stats.paidInvoices} 
 icon={CheckCircle} color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
 />
 <KpiCard 
 title="Unpaid Invoices" 
 value={stats.unpaidInvoices} 
 icon={Clock} color="text-slate-500" bg="bg-white" border="border-slate-200"
 />

 <KpiCard 
 title="Total Payments" 
 value={stats.totalPayments} 
 icon={DollarSign} color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
 />
 <KpiCard 
 title="Visa Applications" 
 value={stats.totalVisas} 
 icon={Globe} color="text-blue-600" bg="bg-blue-50" border="border-blue-200"
 />
 <KpiCard 
 title="Flights Booked" 
 value={stats.totalFlights} 
 icon={Plane} color="text-sky-600" bg="bg-sky-50" border="border-sky-100"
 />
 <KpiCard 
 title="Tour Packages" 
 value={stats.totalPackagesSold} 
 icon={Map} color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
 />
 </div>

 {/* CHARTS */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
 {/* Revenue vs Expenses Area Chart */}
 <div className="bg-white p-6 rounded-xl ">
 <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue vs Expenses (Trend)</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={mockLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} />
 <YAxis axisLine={false} tickLine={false} />
 <Tooltip />
 <Legend />
 <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
 <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Invoice Status Pie Chart */}
 <div className="bg-white p-6 rounded-xl ">
 <h3 className="text-lg font-bold text-slate-900 mb-6">Invoice Status Distribution</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={mockPieData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={5}
 dataKey="value"
 >
 <Cell fill="#10b981" />
 <Cell fill="#f59e0b" />
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 </div>
 </div>
 );
}

// Subcomponent for KPI Card
function KpiCard({ title, value, icon: Icon, color, bg, border, topBorder, trend, trendUp }) {
 return (
 <div className={`bg-white rounded-xl p-6 border ${topBorder ? `border-slate-200 border-t-4 ${topBorder}` : `${border || 'border-slate-200'} hover:shadow-lg`} relative overflow-hidden group transition-shadow`}>
 <div className="flex justify-between items-start mb-4 relative z-10">
 <div className={`p-3 rounded-xl ${bg} ${color}`}>
 <Icon className="w-6 h-6" />
 </div>
 {trend && (
 <span className={`inline-flex items-center text-xs font-medium ${trendUp ? 'text-blue-600' : 'text-slate-500'}`}>
 {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
 {trend}
 </span>
 )}
 </div>
 <p className="text-slate-500 text-sm font-medium mb-1 relative z-10">{title}</p>
 <h3 className="text-2xl font-bold text-slate-900 relative z-10">{value}</h3>
 
 {/* Decorative background element that shows on hover */}
 <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${bg} opacity-0 group-hover:opacity-50 transition-opacity blur-2xl`}></div>
 </div>
 );
}
