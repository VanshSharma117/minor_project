import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckSquare,
  Clock,
  ChevronRight,
  CheckCircle2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Task, MentorshipRequest, MatchScoreBreakdown } from '../../types';
import { MatchScoreBadge } from '../../components/common/MatchScoreBadge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeMentorship, setActiveMentorship] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [recommendations, setRecommendations] = useState<MatchScoreBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [mentData, taskData, reqData, matchData] = await Promise.all([
          api.getActiveMentorship(),
          api.getTasks(),
          api.getMentorshipRequests(),
          api.getMatchRecommendations()
        ]);
        setActiveMentorship(mentData);
        setTasks(taskData);
        setRequests(reqData);
        setRecommendations(matchData.recommendations.slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-stone-200/70 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-stone-200/60 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Hero (Section 7) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-[#4A0A17] to-[#7A1528] rounded-3xl p-7 sm:p-8 text-white shadow-xs border border-[#8E1B31]/30">
        {/* Subtle decorative graphic representing student → mentor → growth */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-72 h-44 opacity-25 pointer-events-none hidden md:flex items-center justify-center">
          <svg viewBox="0 0 240 140" className="w-full h-full text-white overflow-visible">
            {/* Curved trajectory path */}
            <path
              d="M 20,110 Q 110,90 140,50 T 220,20"
              stroke="#C89B3C"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="5,5"
            />
            {/* Student Node */}
            <circle cx="20" cy="110" r="7" fill="#C89B3C" />
            <text x="20" y="132" fill="#E5C06E" fontSize="9" fontWeight="600" textAnchor="middle">Student</text>
            
            {/* Mentor Node */}
            <circle cx="140" cy="50" r="8" fill="#FFFFFF" />
            <text x="140" y="36" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">Mentor</text>
            
            {/* Growth Node */}
            <circle cx="220" cy="20" r="9" fill="#C89B3C" />
            <text x="220" y="6" fill="#E5C06E" fontSize="9" fontWeight="700" textAnchor="middle">Growth ✦</text>
          </svg>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E5C06E] text-xs font-semibold mb-3 border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EduPilot AI Mentoring Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'Vansh'} 👋
          </h1>
          <p className="text-sm text-stone-200 mt-2 font-normal leading-relaxed">
            Your next opportunity could start with the right mentor.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/student/find-mentor"
              className="px-5 py-2.5 bg-[#C89B3C] hover:bg-[#B38728] text-slate-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 btn-press"
            >
              <Search className="w-4 h-4" />
              <span>Find a Mentor</span>
            </Link>
            <Link
              to="/student/ai-mentor"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs flex items-center gap-2 btn-press"
            >
              <Sparkles className="w-4 h-4 text-[#C89B3C]" />
              <span>Ask EduPilot AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Four Useful Stat Cards with Hover Lift (Section 8 & 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Mentor */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">My Mentor</span>
              {activeMentorship?.active ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Not Assigned
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-xl bg-[#7A1528]/10 text-[#7A1528] flex items-center justify-center font-bold shrink-0 text-base">
                👨‍🏫
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {activeMentorship?.active ? activeMentorship.active.facultyName : 'No Mentor Assigned'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {activeMentorship?.active ? `${activeMentorship.active.mentoringArea || 'Academic Guidance'}` : 'Search faculty database'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs">
            {activeMentorship?.active ? (
              <Link to="/student/my-mentoring" className="text-[#7A1528] font-bold flex items-center gap-1 hover:underline">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Chat &rarr;</span>
              </Link>
            ) : (
              <Link to="/student/find-mentor" className="text-[#7A1528] font-bold hover:underline flex items-center gap-1">
                <span>Find a Mentor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Card 2: Mentorship Status */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Mentorship Status</span>
              <span className="text-stone-300 text-xs">●</span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {activeMentorship?.active ? 'Active Mentorship' : 'Open for Requests'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {activeMentorship?.active ? `Token: ${activeMentorship.active.requestToken}` : 'Select a professor'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs">
            <span className="text-slate-500 text-[11px] flex items-center gap-1">
              {activeMentorship?.active ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified advisory link
                </span>
              ) : (
                'Submit request to connect'
              )}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Pending Requests</span>
              <Clock className="w-4 h-4 text-stone-300" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-black text-slate-900 tabular-nums">
                {String(pendingRequestsCount).padStart(2, '0')}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                {pendingRequestsCount === 1 ? 'Request in Review' : 'Requests in Review'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs">
            <Link to="/student/my-mentoring" className="text-[#7A1528] font-semibold hover:underline flex items-center gap-1">
              <span>{pendingRequestsCount > 0 ? 'View request tokens' : 'All tokens resolved'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Tasks Pending */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Tasks</span>
              <CheckSquare className="w-4 h-4 text-stone-300" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-black text-slate-900 tabular-nums">
                {String(pendingTasksCount).padStart(2, '0')}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                Tasks Pending
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs">
            <Link to="/student/tasks" className="text-[#7A1528] font-semibold hover:underline flex items-center gap-1">
              <span>View all deliverables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Section 10: Faculty Unavailable Fallback Box */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div>
          <p className="font-bold text-slate-900 text-sm">Can't find an available faculty mentor?</p>
          <p className="text-slate-600 text-xs mt-0.5">
            Get immediate guidance from EduPilot AI while you wait for human mentorship.
          </p>
        </div>
        <Link
          to="/student/ai-mentor"
          className="px-4 py-2 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs btn-press"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
          <span>Talk to EduPilot AI ✦</span>
        </Link>
      </div>

      {/* 4. Two Columns: Recommended Mentors + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Mentors (2-3 clean cards) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recommended Mentors</h2>
            <Link to="/student/find-mentor" className="text-xs font-semibold text-[#7A1528] hover:underline flex items-center gap-1">
              Explore All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.map(rec => (
              <div
                key={rec.facultyId}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs card-hover flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#7A1528] text-[#C89B3C] font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                    {rec.facultyName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{rec.facultyName}</h3>
                      <MatchScoreBadge score={rec.overallScore} breakdown={rec} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{rec.designation} • {rec.facultyDepartment}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {rec.matchingTags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to="/student/find-mentor"
                  className="px-3.5 py-1.5 text-xs font-bold text-[#7A1528] bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors self-start sm:self-auto btn-press"
                >
                  Request Mentorship &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Small Recent Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Tasks</h2>
            <Link to="/student/tasks" className="text-xs font-semibold text-[#7A1528] hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs card-hover">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">You're all caught up 🎉</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No deliverables pending.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span className="truncate">{task.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Due: {task.deadline}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
