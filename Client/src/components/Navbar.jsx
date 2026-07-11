import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomer } from '../context/AuthContext';
import { Plane, FileText, MapPin, Globe, LogOut, User, Receipt, ChevronDown, Home, Info, CreditCard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { customer, logout } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); setDropdownOpen(false); };
  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/',        label: 'Home',    icon: Home    },
    { to: '/flights', label: 'Flights', icon: Plane   },
    { to: '/visa',    label: 'Visa',    icon: FileText },
    { to: '/tourism', label: 'Tourism', icon: MapPin  },
    { to: '/about',   label: 'About',   icon: Info    },
  ];

  const profileMenuItems = [
    { to: '/my-invoices', label: 'My Invoices', icon: Receipt,    desc: 'View & pay your invoices'  },
    { to: '/flights',     label: 'Book Flight', icon: Plane,      desc: 'Browse available flights'  },
    { to: '/visa',        label: 'Apply Visa',  icon: FileText,   desc: 'Visa application services' },
    { to: '/tourism',     label: 'Tour Booking',icon: MapPin,     desc: 'Explore tour packages'     },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 flex items-center justify-between" style={{ height: '70px' }}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <Globe className="w-5 h-5 text-white" />
          </div>
          EliteTravel
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {customer ? (
            /* ── Profile Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                  dropdownOpen
                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-primary-200 hover:bg-primary-50/50'
                }`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight max-w-[120px] truncate">{customer.name?.split(' ')[0]}</p>
                  <p className="text-xs text-slate-400 leading-tight">Customer</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in">
                  {/* Profile header */}
                  <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30 shrink-0">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{customer.name}</p>
                        <p className="text-slate-300 text-xs truncate">{customer.email}</p>
                        {customer.phone && <p className="text-slate-400 text-xs">{customer.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {profileMenuItems.map(({ to, label, icon: Icon, desc }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group ${
                          to === '/my-invoices' ? 'border-b border-slate-100' : ''
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          to === '/my-invoices'
                            ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${to === '/my-invoices' ? 'text-primary-700' : 'text-slate-700'}`}>{label}</p>
                          <p className="text-xs text-slate-400 truncate">{desc}</p>
                        </div>
                        {to === '/my-invoices' && (
                          <span className="ml-auto text-[10px] font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full shrink-0">
                            New
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 px-4 py-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                <User className="w-4 h-4" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
