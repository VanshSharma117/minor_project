import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';
import { User, StudentProfile } from '../../types';

export const StudentVerificationPage: React.FC = () => {
  const [students, setStudents] = useState<Array<{ user: User; profile?: StudentProfile }>>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await api.getAdminStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'Verified' | 'Rejected' | 'Suspended') => {
    try {
      await api.verifyStudent(userId, newStatus);
      setStudents(students.map(item =>
        item.user.id === userId
          ? { ...item, user: { ...item.user, verificationStatus: newStatus } }
          : item
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  const filtered = students.filter(s => {
    if (filterStatus !== 'All' && s.user.verificationStatus !== filterStatus) return false;
    if (search) {
      const term = search.toLowerCase();
      const matchName = s.user.name.toLowerCase().includes(term);
      const matchEmail = s.user.email.toLowerCase().includes(term);
      const matchId = s.profile?.studentId.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Identity Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Validate enrolled college credentials. Only verified students are permitted into mentoring matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">
            {students.filter(s => s.user.verificationStatus === 'Pending').length} Pending Validation
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search by student name, enrollment ID, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
        >
          <option value="All">All Verification Statuses</option>
          <option value="Pending">Pending Only</option>
          <option value="Verified">Verified Only</option>
          <option value="Suspended">Suspended</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Student Details</th>
                <th className="px-4 py-3.5">Enrollment ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No student records found.</td>
                </tr>
              ) : (
                filtered.map(({ user, profile }) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                      {profile?.studentId || 'Pending'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{profile?.department}</td>
                    <td className="px-4 py-3.5 font-medium">Sem {profile?.semester || 1} (Div {profile?.division})</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Aug 10, 2026'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                        user.verificationStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        user.verificationStatus === 'Suspended' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {user.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.verificationStatus !== 'Verified' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                          >
                            Verify
                          </button>
                        )}
                        {user.verificationStatus !== 'Suspended' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Suspended')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold"
                          >
                            Suspend
                          </button>
                        )}
                        {user.verificationStatus === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
