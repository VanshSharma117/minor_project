import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Clock,
  Briefcase,
  Cpu,
  Building,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Megaphone
} from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getAdminOverview();
        setOverview(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading institutional analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#7A1528] to-[#5A0F1D] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-amber-300 border border-white/15 mb-2">
          <span>Campus Administration Portal</span>
          <span>•</span>
          <span>Dean of Academics Office</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Institutional Mentorship Directorate</h1>
        <p className="text-xs text-rose-100 mt-1 max-w-xl">
          Oversee campus identity verifications, faculty advisory allocations, active capstone relationships, and audit logs.
        </p>
      </div>

      {/* Critical Action Banner if Verifications are Pending */}
      {(overview.pendingStudents > 0 || overview.pendingFaculty > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950">Pending Verification Queue</p>
              <p className="text-amber-800 text-[11px]">
                {overview.pendingStudents} students and {overview.pendingFaculty} faculty accounts require identity validation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/students/verification"
              className="px-3.5 py-1.5 bg-[#7A1528] text-white font-bold rounded-lg hover:bg-[#631020]"
            >
              Verify Students ({overview.pendingStudents})
            </Link>
            <Link
              to="/admin/faculty/verification"
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
            >
              Verify Faculty
            </Link>
          </div>
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overview.totalStudents}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {overview.verifiedStudents} verified on campus
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Faculty Advisors</span>
            <GraduationCap className="w-4 h-4 text-[#7A1528]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overview.totalFaculty}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {overview.verifiedFaculty} verified advisors
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Mentorships</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overview.activeMentorships}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across 3 engineering departments
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Mentorship Tokens</span>
            <FileCheck2 className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overview.totalRequests}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            {overview.pendingRequests} tokens in faculty review
          </p>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Academic Departments</h3>
            <p className="text-[11px] text-slate-500">Mentorship coverage across verified degree branches</p>
          </div>
          <Link to="/admin/departments" className="text-xs font-bold text-[#7A1528] hover:underline">
            Manage Departments &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {overview.departments.map((dept: Department) => (
            <div key={dept.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-black text-[#7A1528] bg-rose-50 px-2 py-0.5 rounded">
                {dept.code}
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">{dept.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">HOD: {dept.headOfDepartment}</p>

              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <span>Faculty: <strong>{dept.totalFaculty}</strong></span>
                <span>Students: <strong>{dept.totalStudents}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
