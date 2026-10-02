import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  UserCheck,
  Sparkles,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Compass,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { AIMentorNotice } from '../components/common/CampusBadge';

export const StudentLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Human-designed Student Navigation (Aligned with EduPilot Brand)
  const navItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/find-mentor', label: 'Find Mentor', icon: Search },
    { to: '/student/my-mentoring', label: 'My Mentoring', icon: UserCheck },
    { to: '/student/ai-mentor', label: 'AI Mentor', icon: Sparkles, isAI: true },
    { to: '/student/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-campus-pattern flex flex-col font-sans text-slate-800">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Modern Academic Sidebar (Section 6) */}
        <aside className="w-60 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sticky top-22">
            {/* Top Brand Identity Mark in Sidebar */}
            <div className="flex items-center gap-2.5 px-2 py-2 mb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-[#7A1528] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Compass className="w-4 h-4 text-[#C89B3C]" />
              </div>
              <div className="overflow-hidden">
                <p className="font-extrabold text-xs text-slate-900 tracking-tight leading-tight flex items-center gap-1">
                  EduPilot <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-rose-50 text-[#7A1528] border border-rose-200/50">AI</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium">AI Mentoring</p>
              </div>
            </div>

            {/* Student Persona Pill */}
            <div className="p-3 bg-stone-50/80 rounded-xl mb-3 border border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.name}
                  className="w-9 h-9 rounded-xl object-cover border border-stone-200"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {(profile as any)?.department || 'Computer Engineering'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Student
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation items with subtle burgundy active state & left accent indicator */}
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
                          : item.isAI
                          ? 'text-indigo-900 bg-indigo-50/60 hover:bg-indigo-100/70 hover:translate-x-0.5'
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
                          isActive
                            ? 'text-white'
                            : item.isAI
                            ? 'text-indigo-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`} />
                        <span className="truncate">{item.label}</span>
                        {item.isAI && !isActive && (
                          <span className="ml-auto text-[9px] font-bold text-indigo-600">✦</span>
                        )}
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

        {/* Main Content Area with smooth entrance animation */}
        <main className="flex-1 min-w-0 animate-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
