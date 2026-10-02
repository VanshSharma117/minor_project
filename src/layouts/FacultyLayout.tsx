import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Users,
  MessageSquare,
  CheckSquare,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { AIMentorNotice } from '../components/common/CampusBadge';
import { FacultyProfile } from '../types';

export const FacultyLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const facProfile = profile as FacultyProfile | null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Simplified Faculty Navigation (7 items + Logout)
  const navItems = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/requests', label: 'Requests', icon: Inbox },
    { to: '/faculty/students', label: 'My Students', icon: Users },
    { to: '/faculty/messages', label: 'Messages', icon: MessageSquare },
    { to: '/faculty/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/faculty/profile', label: 'Profile', icon: User },
    { to: '/faculty/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-campus-pattern flex flex-col font-sans text-slate-800">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Modern Faculty Sidebar */}
        <aside className="w-60 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sticky top-22">
            {/* Top Brand Identity Mark */}
            <div className="flex items-center gap-2.5 px-2 py-2 mb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-[#7A1528] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Compass className="w-4 h-4 text-[#C89B3C]" />
              </div>
              <div className="overflow-hidden">
                <p className="font-extrabold text-xs text-slate-900 tracking-tight leading-tight flex items-center gap-1">
                  EduPilot <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60">FACULTY</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Faculty Advisory</p>
              </div>
            </div>

            {/* Faculty mini-card */}
            <div className="p-3 bg-stone-50/80 rounded-xl mb-3 border border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.name}
                  className="w-9 h-9 rounded-xl object-cover border border-stone-200"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{facProfile?.designation || 'Associate Professor'}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Faculty Mentor
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation items with left indicator and burgundy active state */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#7A1528] text-white shadow-xs pl-4'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/70 hover:translate-x-0.5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-1.5 top-2 bottom-2 w-1 bg-[#C89B3C] rounded-full" />
                        )}
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-2 pt-2.5 border-t border-slate-100 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <AIMentorNotice compact />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 animate-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
