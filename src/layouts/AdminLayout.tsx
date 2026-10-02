import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Award,
  Users,
  Briefcase,
  Megaphone,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Simplified Admin Navigation (6 items + Logout)
  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students/verification', label: 'Student Verification', icon: UserCheck },
    { to: '/admin/faculty/verification', label: 'Faculty Verification', icon: Award },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/mentorships', label: 'Mentorships', icon: Briefcase },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sticky top-22">
            {/* Admin identity */}
            <div className="p-3 bg-[#7A1528]/10 rounded-xl mb-4 border border-[#7A1528]/25">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#7A1528] text-white flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5 text-[#C89B3C]" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-[#7A1528] truncate">{user?.name || 'Dean of Academics'}</p>
                  <p className="text-[11px] text-slate-600 truncate">Dean / Admin</p>
                </div>
              </div>
            </div>

            {/* Navigation items */}
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
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
