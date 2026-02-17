import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function NotificationSystem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [preview, setPreview] = useState(null);
  const [waNumber, setWaNumber] = useState('');
  const [sendingWa, setSendingWa] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const raw = localStorage.getItem('gf_notifications');
      const list = raw ? JSON.parse(raw) : [];
      setNotifications(Array.isArray(list) ? list.reverse() : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handler = () => loadNotifications();
    window.addEventListener('gf_notifications_updated', handler);
    return () => window.removeEventListener('gf_notifications_updated', handler);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      // In real app, make API call to mark as read
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      // In real app, make API call to mark all as read
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Update UI state
      const updated = notifications.filter(notif => notif.id !== notificationId);
      setNotifications(updated);
      // Persist deletion to localStorage so it doesn't reappear after refresh
      const raw = localStorage.getItem('gf_notifications');
      const base = raw ? JSON.parse(raw) : [];
      const persisted = Array.isArray(base) ? base.filter(n => n.id !== notificationId) : [];
      localStorage.setItem('gf_notifications', JSON.stringify(persisted));
      window.dispatchEvent(new Event('gf_notifications_updated'));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (type) => {
    const icons = {
      bid: '📝',
      order: '📦',
      payment: '💰',
      message: '💬',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      bid: 'border-l-4 border-blue-500',
      order: 'border-l-4 border-green-500',
      payment: 'border-l-4 border-yellow-500',
      message: 'border-l-4 border-purple-500',
      system: 'border-l-4 border-gray-500'
    };
    return colors[type] || 'border-l-4 border-gray-300';
  };

  const formatDate = (date) => {
    const dt = date instanceof Date ? date : new Date(date);
    if (isNaN(dt.getTime())) {
      try {
        return new Date().toLocaleString('en-IN');
      } catch {
        return 'Just now';
      }
    }
    const now = new Date();
    const diff = now.getTime() - dt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return dt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const filteredNotifications = notifications.filter(notif => {
    const roleOk = !user?.userType ? true : (notif.targetRole ? notif.targetRole === user.userType : true);
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return roleOk;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (loading) {
    return (
      <div className="main-container">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Notifications</h1>
        <div className="flex items-center space-x-4">
          <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {/* {unreadCount} */}
          </span>
          <button 
            onClick={markAllAsRead}
            className="btn-action btn-bid"
          >
            Mark All Read
          </button>
        </div>
      </div>
      <br /><br />

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-farm-green text-farm-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'unread'
              ? 'border-b-2 border-farm-green text-farm-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'read'
              ? 'border-b-2 border-farm-green text-farm-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">No notifications</h3>
            <p className="text-gray-600">
              {activeTab === 'unread' ? 'All caught up! No unread notifications.' : 'Notifications will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-4 border ${getNotificationColor(notification.type)} ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(() => {
                        const parts = [formatDate(notification.createdAt)];
                        const tail = notification.orderId
                          ? `Order #${notification.orderId}`
                          : (notification.type === 'offer' ? 'Offer' : null);
                        if (tail) parts.push(tail);
                        return parts.join(' • ');
                      })()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                  {notification.type === 'offer' && notification.data && user?.userType === 'buyer' && (
                    <button
                      onClick={() => setPreview(notification.data)}
                      className="text-sm text-green-700 hover:text-green-900"
                    >
                      View Offer Email
                    </button>
                  )}
                  {notification.type === 'offer' && notification.data && user?.userType === 'farmer' && (
                    <button
                      onClick={() => navigate(`/offer/${notification.data.listingId}`, { state: { req: { _id: notification.data.listingId, title: notification.data.productTitle, postedBy: { name: notification.data.buyerName, email: notification.data.buyerEmail } } } })}
                      className="text-sm text-green-700 hover:text-green-900"
                    >
                      Go to Offer
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {notification.type === 'offer' && notification.data && user?.userType === 'buyer' && (
                <div className="mt-3 text-sm text-gray-700">
                  <div>Farmer: <span className="font-semibold">{notification.data.farmerName}</span> • <a href={`mailto:${notification.data.farmerEmail}`} className="text-blue-600 underline">{notification.data.farmerEmail}</a></div>
                </div>
              )}
              {notification.type === 'offer' && notification.data && user?.userType === 'farmer' && (
                <div className="mt-3 text-sm text-gray-700">
                  <div>Buyer: <span className="font-semibold">{notification.data.buyerName}</span> • Product: <span className="font-semibold">{notification.data.productTitle}</span></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-2">{preview.subject}</h2>
            <p className="text-sm text-gray-600 mb-4">From: {preview.farmerName} &lt;{preview.farmerEmail}&gt;</p>
            <pre style={{ whiteSpace: 'pre-wrap' }} className="text-gray-800">{preview.body}</pre>
            <div className="flex justify-end gap-2 mt-4">
              <a href={`mailto:${preview.farmerEmail}?subject=Re: ${encodeURIComponent(preview.subject)}`} className="btn-action btn-bid">Reply</a>
              <button onClick={() => setPreview(null)} className="btn-action btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
      <br />
      <br />

      {/* WhatsApp Integration */}
      <div className="mt-8 card">
        <h2 className="text-xl font-bold mb-4">WhatsApp Notifications</h2>
        <p className="text-gray-600 mb-4">
          Provide Your WhatsApp number For Further Communication
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="whatsapp-notifications"
            className="w-5 h-5"
          />
          <label htmlFor="whatsapp-notifications" className="text-gray-700">
            Enable WhatsApp Communication
          </label>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
          <input
            type="tel"
            className="w-full p-2 border rounded"
            placeholder="Enter your WhatsApp number"
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
          />
        </div>
        <button
          className="btn-action btn-bid mt-4"
          disabled={sendingWa}
          onClick={async () => {
            if (!waNumber || !user) return;
            try {
              setSendingWa(true);
              const raw = localStorage.getItem('gf_notifications');
              const list = raw ? JSON.parse(raw) : [];
              const role = user?.userType;
              let target = null;
              for (const n of [...list].reverse()) {
                if (n.type === 'offer' && (!role || n.targetRole === role)) {
                  target = n;
                  break;
                }
              }
              if (!target) {
                alert('No recent offer found to send number against');
                setSendingWa(false);
                return;
              }
              const data = target.data || {};
              const isBuyer = role === 'buyer';
              const toEmail = isBuyer ? data.farmerEmail : data.buyerEmail;
              if (!toEmail) {
                alert('Counterpart email not available for this notification');
                setSendingWa(false);
                return;
              }
              const SERVICE_ID = (import.meta.env?.VITE_EMAILJS_SERVICE_ID) || window.VITE_EMAILJS_SERVICE_ID || (() => { try { return localStorage.getItem('emailjs_service_id') || ''; } catch { return ''; } })() || 'service_7bk854s';
              const TEMPLATE_ID = (import.meta.env?.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID) || window.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID || (() => { try { return localStorage.getItem('emailjs_notification_template_id') || ''; } catch { return ''; } })() || 'template_xlrhr43';
              const PUBLIC_KEY = (import.meta.env?.VITE_EMAILJS_PUBLIC_KEY) || window.VITE_EMAILJS_PUBLIC_KEY || (() => { try { return localStorage.getItem('emailjs_public_key') || ''; } catch { return ''; } })() || 'O5nV1iLn6oKn3kwEH';
              const emailjs = window.emailjs;
              if (!emailjs || !PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
                alert('Email service not configured');
                setSendingWa(false);
                return;
              }
              try { emailjs.init(PUBLIC_KEY); } catch (err) { console.warn('EmailJS init failed', err); }
              const paramsObj = { to_email: String(toEmail), whatsapp_number: String(waNumber) };
              const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, paramsObj, PUBLIC_KEY);
              if (!(result && result.status === 200)) {
                console.warn('EmailJS result:', result);
              }
              alert('WhatsApp number sent by email');
            } catch (err) {
              alert('Failed to send WhatsApp number');
              console.warn('Send WhatsApp number failed', err);
            } finally {
              setSendingWa(false);
            }
          }}
        >
          {sendingWa ? 'Sending...' : 'Send WhatsApp Number'}
        </button>
      </div>
    </div>
  );
}

