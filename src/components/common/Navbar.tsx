import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification } from '../../types';
import { EduPilotLogo } from './EduPilotLogo';

export const Navbar: React.FC = () => {
  const { user, profile, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const handleSwitchDemo = async (role: 'student' | 'faculty' | 'admin') => {
    setShowDemoMenu(false);
    await switchDemoRole(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'faculty') navigate('/faculty/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Campus Brand & Logo */}
        <div className="flex items-center gap-3">
          <Link
            to={user ? (user.role === 'student' ? '/student/dashboard' : user.role === 'faculty' ? '/faculty/dashboard' : '/admin/dashboard') : '/'}
            className="flex items-center gap-2.5 group"
          >
            <EduPilotLogo size="sm" showTagline />
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Demo Persona Switcher (CRITICAL for College Minor Project Demonstration) */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors"
              title="Quick demo role switch for faculty evaluators"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Demo Switcher</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">College Project Persona Switch</p>
                  <p className="text-xs text-slate-600 mt-0.5">Switch role to inspect permissions & workflows:</p>
                </div>

                <button
                  onClick={() => handleSwitchDemo('student')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Aarav Mehta</span>
                    <span className="block text-[11px] text-slate-500">Student • Computer Eng.</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 font-bold">Student</span>
                </button>

                <button
                  onClick={() => handleSwitchDemo('faculty')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Dr. Rahul Sharma</span>
                    <span className="block text-[11px] text-slate-500">Faculty • AI / ML</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-bold">Faculty</span>
                </button>

                <button
                  onClick={() => handleSwitchDemo('admin')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Dr. Vikram Malhotra</span>
                    <span className="block text-[11px] text-slate-500">Dean of Academics</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#7A1528]/15 text-[#7A1528] font-bold">Admin</span>
                </button>
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 animate-page overflow-hidden">
                    <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-[#7A1528]" /> Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#7A1528] text-white">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-[#7A1528] font-semibold hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-xs text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-all hover:bg-slate-50 flex items-start gap-2.5 ${
                              !n.read ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            {!n.read ? (
                              <span className="w-2 h-2 rounded-full bg-[#7A1528] mt-1 shrink-0"></span>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-200 mt-1 shrink-0"></span>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                                <span>{n.title}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={() => setShowNotifications(false)}
                                  className="mt-1 text-[11px] text-[#7A1528] font-bold inline-flex items-center gap-1 hover:underline"
                                >
                                  View Details &rarr;
                                </Link>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] capitalize text-slate-500 font-medium">{user.role}</span>
                      {user.verificationStatus === 'Verified' && (
                        <span className="text-[10px] text-emerald-600 flex items-center font-bold">
                          • <ShieldCheck className="w-3 h-3 inline ml-0.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={user.role === 'student' ? '/student/profile' : user.role === 'faculty' ? '/faculty/profile' : '/admin/settings'}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>

                    {user.role === 'student' && (
                      <Link
                        to="/student/ai-mentor"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[#7A1528] font-semibold hover:bg-rose-50"
                      >
                        <Sparkles className="w-4 h-4 text-[#C89B3C]" /> EduPilot AI Mentor
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register/student"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7A1528] hover:bg-[#631020] rounded-lg shadow-xs shadow-[#7A1528]/20 transition-all"
              >
                Campus Registration
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
