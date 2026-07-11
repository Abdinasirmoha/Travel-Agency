import { Search, Globe, Moon, Sun, Bell, CheckCircle, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lang, setLang] = useState('English');

  const notifRef = useRef(null);
  const langRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (langRef.current && !langRef.current.contains(event.target)) setShowLang(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLangSelect = (newLang) => {
    setLang(newLang);
    setShowLang(false);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  // Generate avatar initials from user name
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.name || 'Admin';
  const displayTitle = user?.isSystemUser
    ? 'Super Admin'
    : (user?.role && typeof user.role === 'object' ? user.role.name : user?.role)
      || user?.jobTitle
      || 'Staff';
  const avatarBg = user?.isSystemUser ? 'bg-violet-600'
    : (user?.role?.name === 'Manager' || user?.jobTitle === 'Manager') ? 'bg-indigo-600'
    : 'bg-primary-600';

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-end px-6 sticky top-0 z-10 transition-colors">

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 text-slate-500 relative">

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setShowLang(!showLang); setShowNotifications(false); setShowUserMenu(false); }}
              className="hover:text-slate-900 transition-colors flex items-center"
            >
              <Globe className="w-5 h-5" />
            </button>
            {showLang && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-50 mb-1">Select Language</div>
                {['English', 'Arabic', 'Somali', 'French'].map(l => (
                  <button
                    key={l}
                    onClick={() => handleLangSelect(l)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors flex justify-between items-center"
                  >
                    {l}
                    {lang === l && <CheckCircle className="w-4 h-4 text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button onClick={toggleDarkMode} className="hover:text-slate-900 transition-colors">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowLang(false); setShowUserMenu(false); }}
              className="relative hover:text-slate-900 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <div className="px-4 py-2 flex justify-between items-center border-b border-slate-50 mb-1">
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                  <span className="text-xs text-primary-600 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm text-slate-800 font-medium">New Booking Received</p>
                    <p className="text-xs text-slate-500 mt-0.5">Alex booked a flight to Dubai.</p>
                    <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm text-slate-800 font-medium">Invoice Paid</p>
                    <p className="text-xs text-slate-500 mt-0.5">Invoice #INV-2048 has been paid.</p>
                    <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm text-slate-800 font-medium">System Update</p>
                    <p className="text-xs text-slate-500 mt-0.5">New dashboard features are live!</p>
                    <p className="text-[10px] text-slate-400 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="px-4 py-2 text-center border-t border-slate-50 mt-1">
                  <span className="text-xs text-primary-600 cursor-pointer hover:underline font-medium">View All Notifications</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowLang(false); }}
            className="flex items-center pl-6 border-l border-slate-200 hover:opacity-80 transition-opacity"
          >
            <div className="text-right mr-3 hidden md:block">
              <p className="text-sm font-semibold text-slate-800">{displayName}</p>
              <p className="text-xs text-slate-500">{displayTitle}</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center border-2 border-white/30`}>
              <span className="text-white text-sm font-bold">{getInitials(displayName)}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email || ''}</p>
                <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  ● Active
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors flex items-center gap-3">
                  <User className="w-4 h-4" />
                  My Profile
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
