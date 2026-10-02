import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { MentorshipRequest } from '../../types';

export const StudentRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await api.getMentorshipRequests();
        setRequests(data);
      } catch (err) {
        console.error('Failed to load mentorship requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const getStatusBadge = (status: MentorshipRequest['status']) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Faculty Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentorship Requests & Tokens</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track token statuses, faculty approvals, and formal capstone supervisory assignments.
          </p>
        </div>

        <Link
          to="/student/find-mentor"
          className="px-4 py-2 bg-[#7A1528] text-white text-xs font-bold rounded-xl hover:bg-[#631020] self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Find Another Mentor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading mentorship tokens...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No mentorship requests yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't requested mentorship from any faculty member. Browse faculty in your department to generate a request token.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/student/find-mentor"
              className="px-4 py-2 bg-[#7A1528] text-white text-xs font-bold rounded-xl hover:bg-[#631020]"
            >
              Browse Faculty
            </Link>
            <Link
              to="/student/ai-mentor"
              className="px-4 py-2 bg-rose-50 text-[#7A1528] text-xs font-bold rounded-xl hover:bg-rose-100 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
              Consult EduPilot AI
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-black text-[#7A1528] bg-[#7A1528]/10 px-2.5 py-1 rounded-lg border border-[#7A1528]/25">
                    {req.token}
                  </span>
                  <span className="text-xs text-slate-500">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Faculty Guide:</span>
                  <p className="font-bold text-slate-900">{req.facultyName}</p>
                  <p className="text-slate-500 text-[11px]">{req.facultyDepartment}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Mentoring Area & Goal:</span>
                  <p className="font-semibold text-slate-900">{req.mentoringArea}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{req.studentGoal}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Meeting Preference:</span>
                  <p className="font-semibold text-slate-900">{req.preferredMeetingMode} Mode</p>
                  <p className="text-slate-500 text-[11px]">{req.preferredTime}</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-0.5">Reason:</span>
                <p className="leading-relaxed">{req.reason}</p>
              </div>

              {/* If Rejected: Show Explanation + Fallback to AI Mentor / Other Faculty */}
              {req.status === 'Rejected' && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-950">Faculty Note:</p>
                    <p className="mt-0.5 leading-relaxed">{req.rejectionReason || 'Faculty is currently at maximum student capacity for this semester.'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        to="/student/find-mentor"
                        className="px-3 py-1 bg-white border border-rose-300 text-rose-800 font-bold rounded-lg hover:bg-rose-100"
                      >
                        Find Another Faculty Mentor
                      </Link>
                      <Link
                        to="/student/ai-mentor"
                        className="px-3 py-1 bg-[#7A1528] text-white font-bold rounded-lg hover:bg-[#631020] flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-[#C89B3C]" />
                        Get AI Guidance Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* If Accepted: Link directly to Mentorship Workspace */}
              {req.status === 'Accepted' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Mentorship is active and ready for collaborative milestones.
                  </span>
                  <Link
                    to="/student/my-mentor"
                    className="font-bold text-[#7A1528] hover:underline flex items-center gap-1"
                  >
                    Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
