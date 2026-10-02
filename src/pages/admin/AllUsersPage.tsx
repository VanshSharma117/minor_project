import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Search, ShieldCheck, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export const AllUsersPage: React.FC = () => {
  const location = useLocation();
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Set default filter based on current route path
  const initialRole: 'All' | 'student' | 'faculty' = location.pathname.endsWith('/students')
    ? 'student'
    : location.pathname.endsWith('/faculty')
    ? 'faculty'
    : 'All';

  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'faculty'>(initialRole);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (location.pathname.endsWith('/students')) {
      setRoleFilter('student');
    } else if (location.pathname.endsWith('/faculty')) {
      setRoleFilter('faculty');
    } else {
      setRoleFilter('All');
    }
  }, [location.pathname]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [stu, fac] = await Promise.all([
          api.getAdminStudents(),
          api.getAdminFaculty()
        ]);
        setStudents(stu);
        setFaculty(fac);
      } catch (err) {
        console.error('Failed to load user directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const allUsers = [
    ...(Array.isArray(students) ? students : []).map(s => ({ ...s.user, profile: s.profile })),
    ...(Array.isArray(faculty) ? faculty : []).map(f => ({ ...f.user, profile: f.profile }))
  ];

  const filtered = allUsers.filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.profile?.department && u.profile.department.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus User Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete institutional roster of enrolled students and faculty advisors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#7A1528] transition-all"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#7A1528] transition-all"
          >
            <option value="All">All Roles ({allUsers.length})</option>
            <option value="student">Students Only ({students.length})</option>
            <option value="faculty">Faculty Mentors Only ({faculty.length})</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">College Email</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.role === 'faculty' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {user.profile?.department || 'Engineering'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {user.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
