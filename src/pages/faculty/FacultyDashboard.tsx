import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MentorshipRequest } from '../../types';

export const FacultyDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [activeData, setActiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewingRequest, setViewingRequest] = useState<MentorshipRequest | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [reqList, mentData] = await Promise.all([
          api.getMentorshipRequests(),
          api.getActiveMentorship()
        ]);
        setRequests(reqList);
        setActiveData(mentData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const res = await api.acceptMentorshipRequest(id);
      setRequests(requests.map(r => r.id === id ? res.request : r));
    } catch (err: any) {
      alert(err.message || 'Failed to accept');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await api.rejectMentorshipRequest(id, 'Faculty reached capacity for this semester.');
      setRequests(requests.map(r => r.id === id ? res.request : r));
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const activeCount = activeData?.actives?.length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Welcome Message */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome, {user?.name || 'Professor'} 👋
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming student mentorship requests and oversee your active mentees.
        </p>
      </div>

      {/* 2. Three Simple Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Pending Requests</span>
            <p className="text-3xl font-black text-amber-700 tabular-nums">{String(pendingRequests.length).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tokens awaiting approval</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: My Students */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">My Students</span>
            <p className="text-3xl font-black text-[#7A1528] tabular-nums">{String(activeCount).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Directly assigned mentees</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#7A1528] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Active Mentorships */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Active Mentorships</span>
            <p className="text-3xl font-black text-emerald-700 tabular-nums">{String(activeCount).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active project workspaces</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Section: Mentorship Requests */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Mentorship Requests</h2>
          <span className="text-xs text-slate-400">{pendingRequests.length} in queue</span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No pending mentorship requests in your queue.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.studentName}</span>
                    <span className="font-mono text-[11px] text-[#7A1528] bg-rose-50 px-2 py-0.5 rounded font-bold">
                      {req.token}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {req.studentDepartment} • Semester {req.studentSemester}
                  </p>
                  <p className="text-slate-700 mt-1">
                    <strong>Reason:</strong> {req.reason}
                  </p>
                </div>

                {/* 3 Simple Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setViewingRequest(req)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Request Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{viewingRequest.studentName}</h3>
                <p className="text-slate-500">{viewingRequest.studentDepartment} • Semester {viewingRequest.studentSemester}</p>
              </div>
              <button onClick={() => setViewingRequest(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-700">
              <p><strong>Request Token:</strong> <span className="font-mono text-[#7A1528]">{viewingRequest.token}</span></p>
              <p><strong>Mentoring Area:</strong> {viewingRequest.mentoringArea}</p>
              <p><strong>Student Goal:</strong> {viewingRequest.studentGoal}</p>
              <p><strong>Preferred Meeting:</strong> {viewingRequest.preferredMeetingMode}</p>
              <div className="p-2.5 bg-slate-50 rounded-lg border">
                <strong>Reason:</strong>
                <p className="mt-0.5 text-slate-600">{viewingRequest.reason}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 border rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAccept(viewingRequest.id);
                  setViewingRequest(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
              >
                Accept Mentorship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
