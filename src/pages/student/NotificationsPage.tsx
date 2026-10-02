import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, ExternalLink, Sparkles, Calendar, CheckSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Notification } from '../../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mentorship':
        return <FileText className="w-4 h-4 text-[#7A1528]" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-[#C89B3C]" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            System updates, faculty task assignments, meeting invitations, and administrative announcements.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#7A1528]" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500 mt-1">You will receive alerts here when faculty respond or assign tasks.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 transition-colors flex items-start gap-3.5 ${
                !n.read ? 'bg-amber-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1528] mt-1 hover:underline"
                  >
                    Open View <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
