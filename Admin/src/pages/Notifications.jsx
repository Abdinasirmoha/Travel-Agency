import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Package, Plane, FileText, Briefcase, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem('elite_token');
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto refresh every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = sessionStorage.getItem('elite_token');
      await fetch(`${API_URL}/notifications/${id}/read`, { 
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('elite_token');
      await fetch(`${API_URL}/notifications/read-all`, { 
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Visa': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'Ticket': return <Plane className="w-5 h-5 text-blue-500" />;
      case 'Tour': return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'Cargo': return <Package className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'Visa': return 'bg-purple-100';
      case 'Ticket': return 'bg-blue-100';
      case 'Tour': return 'bg-amber-100';
      case 'Cargo': return 'bg-emerald-100';
      default: return 'bg-slate-100';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications
          </h1>
          <p className="text-sm text-slate-500">You have {unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">All Caught Up!</h3>
            <p className="text-sm text-slate-500">You don't have any new notifications right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 font-semibold tracking-wider uppercase border-b-0 bg-white">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Notification</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {notifications.map((notification) => (
                  <tr 
                    key={notification._id} 
                    className="hover:bg-blue-50/50 transition-colors bg-white"
                  >
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[300px]">
                      <h4 className={`text-sm font-bold ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-xs mt-0.5 ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                        {notification.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-500">
                        {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {!notification.isRead ? (
                        <button 
                          onClick={() => markAsRead(notification._id)}
                          className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Read
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Read
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
