import React, { useEffect, useState } from 'react';
import { Briefcase, FileCheck2, Clock, CheckCircle2, XCircle, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { MentorshipRequest } from '../../types';

export const MentorshipManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getMentorshipRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = requests.filter(r => statusFilter === 'All' || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentorship Token Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional tracking of all capstone and advisory pairing tokens. (Private messages are strictly confidential).
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
        >
          <option value="All">All Token Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Accepted">Accepted & Active</option>
          <option value="Rejected">Declined</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Request Token</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Faculty Advisor</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Focus Area</th>
                <th className="px-4 py-3.5">Submitted</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#7A1528]">
                    {req.token}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{req.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{req.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {req.facultyName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {req.facultyDepartment}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {req.mentoringArea}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status}
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
