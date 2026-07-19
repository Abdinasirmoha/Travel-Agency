import { NavLink, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  Ticket, 
  Map, 
  Briefcase, 
  PieChart, 
  HelpCircle, 
  Settings, 
  LogOut,
  FileText,
  Globe,
  Package,
  DollarSign,
  Shield,
  UserCheck,
  Compass,
  CreditCard,
  Receipt,
  Bell
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth, usePermissions } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', module: 'Dashboard' },
  { name: 'Customers', icon: Users, path: '/customers', module: 'Customers' },
  { name: 'Flights', icon: Plane, path: '/flights', module: 'Flights' },
  { name: 'Tickets', icon: Ticket, path: '/tickets', module: 'Tickets' },
  { name: 'Visa Applications', icon: FileText, path: '/visa-applications', module: 'Visas' },
  { name: 'Visa Types', icon: Globe, path: '/visa-types', module: 'Visas' },
  { name: 'Cargo', icon: Package, path: '/cargo', module: 'Cargo' },
  { name: 'Tour Packages', icon: Map, path: '/tour-packages', module: 'Tours' },
  { name: 'Tour Bookings', icon: Briefcase, path: '/tour-bookings', module: 'Tours' },
  { name: 'Invoices', icon: Receipt, path: '/invoices', module: 'Finance' },
  { name: 'Payments', icon: CreditCard, path: '/payments', module: 'Finance' },
  { name: 'Expenses', icon: DollarSign, path: '/expenses', module: 'Expenses' },
  { name: 'Staff', icon: UserCheck, path: '/staff', module: 'Staff' },
  { name: 'Reports', icon: PieChart, path: '/reports', module: 'Reports' },
];

const systemItems = [
  { name: 'Notifications', icon: Bell, path: '/notifications', module: 'Notifications' },
  { name: 'System Users', icon: Users, path: '/users', module: 'Users' },
  { name: 'Roles & Access', icon: Shield, path: '/roles', module: 'Roles' },
  { name: 'Settings', icon: Settings, path: '/settings', module: 'Settings' },
];

const NavItem = ({ to, icon: Icon, label, badgeCount }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out relative overflow-hidden',
        isActive
          ? 'bg-blue-600/10 text-blue-400'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      )
    }
  >
    {({ isActive }) => (
      <>
        {/* Active Indicator Line */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
        )}
        
        <Icon className={clsx(
          "w-5 h-5 mr-3 transition-all duration-200", 
          isActive 
            ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
            : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
        )} />
        <span className="truncate flex-1">{label}</span>
        
        {badgeCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]">
            {badgeCount}
          </span>
        )}
      </>
    )}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = sessionStorage.getItem('elite_token');
        if (!token) return;
        
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUnreadCount(data.filter(n => !n.isRead).length);
          }
        }
      } catch (err) {
        console.error('Failed to fetch notifications badge', err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.username || user?.email || 'Admin';

  const displayRole = (user?.role?.name === 'Super Admin' || (!user?.role && user?.isSystemUser))
    ? 'Super Admin'
    : (user?.role && typeof user.role === 'object' ? user.role.name : user?.role)
      || user?.jobTitle
      || 'Staff';

  const avatarBg = user?.isSystemUser
    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
    : user?.role?.name === 'Manager' || user?.jobTitle === 'Manager'
      ? 'bg-gradient-to-br from-indigo-500 to-blue-600'
      : 'bg-gradient-to-br from-emerald-400 to-teal-500';

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col h-full relative z-20 transition-all duration-300">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0B1120] rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
              EliteTravel Pro
            </h1>
            <p className="text-[10px] font-medium text-blue-400 uppercase tracking-widest mt-0.5">Workspace</p>
          </div>
        </div>
      </div>
      
      {/* Scrollable Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <ul className="space-y-1">
            {navItems.map((item) => {
              if (item.module && !hasPermission(item.module, 'view')) return null;
              return (
                <li key={item.name}>
                  <NavItem to={item.path} icon={item.icon} label={item.name} />
                </li>
              );
            })}
          </ul>
        </div>
        
        <div>
          <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            System
          </h3>
          <ul className="space-y-1">
            {systemItems.map((item) => {
              if (item.module && !hasPermission(item.module, 'view')) return null;
              return (
                <li key={item.name}>
                  <NavItem 
                    to={item.path} 
                    icon={item.icon} 
                    label={item.name} 
                    badgeCount={item.name === 'Notifications' ? unreadCount : 0}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/60 shrink-0 bg-slate-900/50">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#0B1120] border border-slate-800/80 shadow-inner">
          <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold shadow-lg shrink-0 border-2 border-[#0B1120]`}>
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-200 truncate">{displayName}</p>
            <p className="text-xs font-medium text-slate-500 truncate capitalize">{displayRole}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 px-2">
          <button className="flex items-center text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors">
            <HelpCircle className="w-4 h-4 mr-1.5" />
            Support
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
