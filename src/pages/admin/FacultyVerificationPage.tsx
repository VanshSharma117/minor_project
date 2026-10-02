import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, XCircle, Search, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';
import { User, FacultyProfile } from '../../types';

export const FacultyVerificationPage: React.FC = () => {
  const [faculty, setFaculty] = useState<Array<{ user: User; profile?: FacultyProfile }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const data = await api.getAdminFaculty();
      setFaculty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: 'Verified' | 'Rejected' | 'Suspended') => {
    try {
      await api.verifyFaculty(userId, status);
      setFaculty(faculty.map(f =>
        f.user.id === userId
          ? { ...f, user: { ...f.user, verificationStatus: status } }
          : f
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filtered = faculty.filter(f => {
    if (search) {
      const term = search.toLowerCase();
      return f.user.name.toLowerCase().includes(term) || f.user.email.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Advisor Credential Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review academic appointments. Only verified faculty are published to students for mentorship tokens.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Faculty Member</th>
                <th className="px-4 py-3.5">Faculty ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ user, profile }) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'}
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
                    {profile?.facultyId || 'FAC-2026'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{profile?.department}</td>
                  <td className="px-4 py-3.5 font-medium">{profile?.designation}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {user.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {user.verificationStatus !== 'Verified' && (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'Verified')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'Suspended')}
                        className="px-2.5 py-1 border rounded-lg text-[11px] text-slate-600 hover:bg-slate-50"
                      >
                        Suspend
                      </button>
                    </div>
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
