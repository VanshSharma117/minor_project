import React, { useEffect, useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  User,
  Clock,
  Sparkles,
  X,
  FileText,
  AlertCircle,
  Check,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MentorshipRequest } from '../../types';

export const FacultyRequestsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection Modal
  const [rejectingReq, setRejectingReq] = useState<MentorshipRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Student Profile Modal
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getMentorshipRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (req: MentorshipRequest) => {
    try {
      const res = await api.acceptMentorshipRequest(req.id);
      setRequests(requests.map(r => r.id === req.id ? res.request : r));
      await refreshProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;

    try {
      const res = await api.rejectMentorshipRequest(rejectingReq.id, rejectionReason);
      setRequests(requests.map(r => r.id === rejectingReq.id ? res.request : r));
      setRejectingReq(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    }
  };

  const handleOpenStudentProfile = async (req: MentorshipRequest) => {
    try {
      const data = await api.getStudentProfile(req.studentId);
      setViewingStudent({ ...data, req });
    } catch (err) {
      alert('Unable to load student profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentorship Request Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming student mentorship tokens, AI summaries, and approve or decline requests.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No mentorship requests</h3>
          <p className="text-xs text-slate-500 mt-1">All student tokens have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isPending = req.status === 'Pending';
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-[#7A1528] bg-rose-50 px-2 py-1 rounded-md border border-[#7A1528]/20">
                      {req.token}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{req.studentName}</span>
                    <span className="text-[11px] text-slate-500">
                      ({req.studentDepartment} • Sem {req.studentSemester})
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mentoring Area:</span>
                    <p className="font-bold text-slate-800">{req.mentoringArea}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Goal:</span>
                    <p className="text-slate-700">{req.studentGoal}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Preferred Mode & Time:</span>
                    <p className="text-slate-700">{req.preferredMeetingMode} • {req.preferredTime}</p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/80">
                  <span className="font-bold text-slate-700 block mb-0.5">Student Statement:</span>
                  <p className="leading-relaxed">{req.reason}</p>
                </div>

                {/* AI Summary if attached */}
                {req.aiSummaryAttached && (
                  <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>Attached AI Mentoring Assessment</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900">
                      <div>Skills: <strong>{req.aiSummaryAttached.currentSkills.join(', ')}</strong></div>
                      <div>Recommended Focus: <strong>{req.aiSummaryAttached.recommendedMentoringArea}</strong></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenStudentProfile(req)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" /> View Student Profile
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectingReq(req)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req)}
                        className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Mentorship
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Decline Mentorship Request</h3>
            <p className="text-slate-500 mb-3">Token: {rejectingReq.token} from {rejectingReq.studentName}</p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Declining (Optional - sent to student)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Currently at maximum student capacity for this semester. Recommended connecting with Prof. Priya Patel."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Preview Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewingStudent.user?.avatarUrl}
                  alt={viewingStudent.user?.name}
                  className="w-12 h-12 rounded-xl object-cover border"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{viewingStudent.user?.name}</h3>
                  <p className="text-[11px] text-slate-500">
                    {viewingStudent.profile?.studentId} • {viewingStudent.profile?.department} (Sem {viewingStudent.profile?.semester})
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold">CGPA: {viewingStudent.profile?.cgpa || '8.85'} / 10.0</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Career Goal</span>
                <p className="p-2 bg-slate-50 rounded-lg border">{viewingStudent.profile?.careerGoal}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Technical Skills</span>
                <div className="flex flex-wrap gap-1">
                  {viewingStudent.profile?.skills?.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Areas of Interest</span>
                <div className="flex flex-wrap gap-1">
                  {viewingStudent.profile?.interests?.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
