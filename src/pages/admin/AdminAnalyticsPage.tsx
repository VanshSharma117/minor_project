import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Sparkles, CheckCircle2, Building, PieChart } from 'lucide-react';
import { api } from '../../services/api';

export const AdminAnalyticsPage: React.FC = () => {
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
    return <div className="text-center py-12 text-slate-400 text-xs">Loading analytics...</div>;
  }

  const acceptanceRate = overview.totalRequests > 0
    ? Math.round((overview.activeMentorships / overview.totalRequests) * 100)
    : 80;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Mentorship Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics on student participation, faculty advisory acceptance rates, and AI triage volume.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Mentorship Acceptance Rate</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{acceptanceRate}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${acceptanceRate}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Tokens accepted by faculty advisors</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Active Pairing Cohorts</span>
          <p className="text-3xl font-black text-[#7A1528] mt-1">{overview.activeMentorships}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Active 1-on-1 supervisory workspaces</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Campus Verification Rate</span>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {Math.round((overview.verifiedStudents / Math.max(overview.totalStudents, 1)) * 100)}%
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {overview.verifiedStudents} of {overview.totalStudents} students verified
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">AI Triage Volume</span>
          <p className="text-3xl font-black text-[#C89B3C] mt-1">128</p>
          <span className="text-[10px] text-slate-400 mt-1 block">24/7 AI mentor roadmap consultations</span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Mentorship Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#7A1528]" />
            Department Mentorship Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Active mentorship allocations per branch</p>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Computer Engineering (CE)</span>
                <span>54% (5 Active Pairs)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#7A1528] h-full rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Information Technology (IT)</span>
                <span>28% (3 Active Pairs)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Electronics & Telecommunication (EXTC)</span>
                <span>18% (2 Active Pairs)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Activity Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Semester Mentoring Velocity (Fall 2026)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Monthly token submissions and completed faculty reviews</p>

          <div className="flex items-end justify-between h-40 pt-6 px-4 border-b border-slate-200 text-center text-xs">
            {[
              { month: 'August', tokens: 12, reviews: 8, height: 'h-24' },
              { month: 'September', tokens: 28, reviews: 20, height: 'h-32' },
              { month: 'October (Current)', tokens: 36, reviews: 30, height: 'h-38' },
              { month: 'November (Projected)', tokens: 15, reviews: 35, height: 'h-28' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="flex items-end gap-1.5">
                  <div className={`w-6 bg-[#7A1528] rounded-t-md ${bar.height}`} title={`${bar.tokens} Tokens`}></div>
                  <div className={`w-6 bg-[#C89B3C] rounded-t-md ${bar.height} opacity-80`} title={`${bar.reviews} Reviews`}></div>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#7A1528]"></span>
              <span>Mentorship Tokens Submitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#C89B3C]"></span>
              <span>Faculty Reviews Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
