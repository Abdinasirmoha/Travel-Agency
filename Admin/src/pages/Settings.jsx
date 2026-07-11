import { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  BellRing, 
  Palette, 
  Save, 
  CheckCircle2,
  Smartphone,
  Mail,
  Lock,
  Globe,
  User,
  Camera,
  Send,
  ChevronDown,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { useEffect } from 'react';
import { fetchCustomers, sendCustomerEmail } from '../api';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User, desc: 'Personal details & avatar' },
  { id: 'general', label: 'General', icon: Building2, desc: 'Agency details & localization' },
  { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Passwords & 2FA' },
  { id: 'notifications', label: 'Notifications', icon: BellRing, desc: 'Email & SMS preferences' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Themes & UI settings' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  // Form states (mock data)
  const [generalData, setGeneralData] = useState({
    agencyName: 'EliteTravel Pro',
    email: 'admin@elitetravel.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Avenue, Suite 100, New York, NY',
    currency: 'USD',
    timezone: 'America/New_York'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: true
  });

  const [notificationData, setNotificationData] = useState({
    emailAlerts: true,
    smsAlerts: false,
    systemUpdates: true,
    marketing: false
  });

  const [appearanceData, setAppearanceData] = useState({
    theme: 'light',
    compactMode: false
  });

  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchCustomers()
      .then(data => {
        // Fallback to empty array if no data
        setCustomersList(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to load customers for email dropdown", err);
        setCustomersList([]);
      });
  }, []);

  const toggleCustomerSelect = (id) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(cId => cId !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const toggleAllCustomers = () => {
    if (selectedCustomers.length === customersList.length && customersList.length > 0) {
      setSelectedCustomers([]);
    } else {
      // API typically returns _id for MongoDB records
      setSelectedCustomers(customersList.map(c => c._id || c.id));
    }
  };

  const handleSendEmail = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer to message.');
      return;
    }
    if (!emailMessage.trim()) {
      alert('Please enter a message to send.');
      return;
    }
    setIsSending(true);
    
    try {
      await sendCustomerEmail(selectedCustomers, emailMessage);
      alert(`Message successfully sent to ${selectedCustomers.length} customer(s)!`);
      setEmailMessage('');
      setSelectedCustomers([]);
    } catch (error) {
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">My Profile</h3>
              <p className="text-sm text-slate-500 mb-6">Manage your personal account details and profile picture.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white shadow-lg relative group overflow-hidden">
                  A
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-800">
                  Change Avatar
                </button>
              </div>

              <div className="flex-1 space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" defaultValue="Admin User" className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                  <input type="text" defaultValue="Super Administrator" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Personal Bio</label>
                  <textarea rows="3" defaultValue="Overseeing operations at EliteTravel Pro." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">General Settings</h3>
              <p className="text-sm text-slate-500 mb-6">Manage your basic agency information and localization preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Agency Name</label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={generalData.agencyName}
                    onChange={(e) => setGeneralData({...generalData, agencyName: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={generalData.email}
                    onChange={(e) => setGeneralData({...generalData, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Smartphone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={generalData.phone}
                    onChange={(e) => setGeneralData({...generalData, phone: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Address</label>
                <input
                  type="text"
                  value={generalData.address}
                  onChange={(e) => setGeneralData({...generalData, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Currency</label>
                <select
                  value={generalData.currency}
                  onChange={(e) => setGeneralData({...generalData, currency: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KES">KES (Ksh)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                <div className="relative">
                  <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={generalData.timezone}
                    onChange={(e) => setGeneralData({...generalData, timezone: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                    <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Security Settings</h3>
              <p className="text-sm text-slate-500 mb-6">Update your password and enhance your account security.</p>
            </div>

            <div className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200 my-8" />

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-4">Two-Factor Authentication (2FA)</h4>
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">Require 2FA for this account</p>
                  <p className="text-xs text-slate-500 mt-0.5">Adds an extra layer of security using a mobile authenticator app.</p>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securityData.twoFactorAuth ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={securityData.twoFactorAuth}
                    onChange={() => setSecurityData({...securityData, twoFactorAuth: !securityData.twoFactorAuth})}
                  />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityData.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Notification Preferences</h3>
              <p className="text-sm text-slate-500 mb-6">Control how and when you receive alerts from the system.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'emailAlerts', title: 'Email Alerts', desc: 'Receive critical system updates via email.' },
                { id: 'smsAlerts', title: 'SMS Notifications', desc: 'Get text messages for urgent bookings and payments.' },
                { id: 'systemUpdates', title: 'System Updates', desc: 'Show in-app toast notifications for application changes.' },
                { id: 'marketing', title: 'Marketing Emails', desc: 'Receive promotional materials and news from EliteTravel.' },
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationData[item.id] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={notificationData[item.id]}
                      onChange={() => setNotificationData({...notificationData, [item.id]: !notificationData[item.id]})}
                    />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationData[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              ))}
            </div>

            <hr className="border-slate-200 my-8" />

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Email to Customer</h4>
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Customers</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                      className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-between"
                    >
                      <div className="flex items-center absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className={selectedCustomers.length === 0 ? "text-slate-400" : "text-slate-900 font-medium"}>
                        {selectedCustomers.length === 0 
                          ? "Select customers to message..." 
                          : `${selectedCustomers.length} customer${selectedCustomers.length > 1 ? 's' : ''} selected`}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {isCustomerDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={toggleAllCustomers}
                            className="flex items-center w-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            {selectedCustomers.length === customersList.length && customersList.length > 0 ? (
                              <CheckSquare className="w-5 h-5 mr-3 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 mr-3 text-slate-400" />
                            )}
                            Select All
                          </button>
                        </div>
                        <div className="p-2 space-y-1">
                          {customersList.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-center text-slate-500">No customers found.</div>
                          ) : (
                            customersList.map(customer => {
                              const customerId = customer._id || customer.id;
                              return (
                                <button
                                  key={customerId}
                                  type="button"
                                  onClick={() => toggleCustomerSelect(customerId)}
                                  className="flex items-center w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  {selectedCustomers.includes(customerId) ? (
                                    <CheckSquare className="w-5 h-5 mr-3 text-blue-600 shrink-0" />
                                  ) : (
                                    <Square className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{customer.name}</span>
                                    <span className="text-xs text-slate-500">{customer.email}</span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea 
                    rows="4" 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write your message here..." 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-70"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isSending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Appearance & Theme</h3>
              <p className="text-sm text-slate-500 mb-6">Customize the look and feel of your admin dashboard.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Color Theme</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${appearanceData.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="light" 
                      className="sr-only"
                      checked={appearanceData.theme === 'light'}
                      onChange={() => setAppearanceData({...appearanceData, theme: 'light'})}
                    />
                    <div className="w-full h-24 bg-white rounded-lg shadow-sm border border-slate-200 mb-3 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                    <p className="text-center text-sm font-bold text-slate-800">Light Mode</p>
                  </label>

                  <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${appearanceData.theme === 'dark' ? 'border-blue-500 bg-slate-800' : 'border-slate-200 hover:border-slate-300 bg-slate-900'}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="dark" 
                      className="sr-only"
                      checked={appearanceData.theme === 'dark'}
                      onChange={() => setAppearanceData({...appearanceData, theme: 'dark'})}
                    />
                    <div className="w-full h-24 bg-slate-800 rounded-lg shadow-sm border border-slate-700 mb-3 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                      </div>
                    </div>
                    <p className="text-center text-sm font-bold text-white">Dark Mode</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Compact Mode</p>
                    <p className="text-xs text-slate-500 mt-0.5">Reduces spacing in tables and lists to fit more data on screen.</p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appearanceData.compactMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={appearanceData.compactMode}
                      onChange={() => setAppearanceData({...appearanceData, compactMode: !appearanceData.compactMode})}
                    />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearanceData.compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage application preferences, security, and configurations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[600px]">
        {/* Left/Top Sidebar Menu */}
        <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 shrink-0 p-4 overflow-x-auto">
          <nav className="flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-1 min-w-max md:min-w-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center md:items-start p-3 rounded-xl transition-all text-left ${
                    isActive 
                      ? 'bg-slate-50 shadow-sm border border-slate-200' 
                      : 'border border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 shrink-0 ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                      {tab.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{tab.desc}</p>
                  </div>
                  <div className="md:hidden pr-2">
                    <p className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                      {tab.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          <form onSubmit={handleSave} className="flex-1 flex flex-col">
            <div className="flex-1 p-8">
              {renderTabContent()}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="text-sm font-medium">
                {isSaved && (
                  <span className="flex items-center text-emerald-600 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Settings saved successfully!
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
