import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  MessageSquare,
  Calendar,
  Target,
  CheckSquare,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Building,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Task, Goal, Appointment, Message } from '../../types';
import { AIMentorNotice } from '../../components/common/CampusBadge';

export const MyMentorPage: React.FC = () => {
  const { user } = useAuth();
  const [activeData, setActiveData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const [ment, taskList, goalList, aptList, msgList] = await Promise.all([
          api.getActiveMentorship(),
          api.getTasks(),
          api.getGoals(),
          api.getAppointments(),
          api.getMessages()
        ]);
        setActiveData(ment);
        setTasks(taskList);
        setGoals(goalList);
        setAppointments(aptList);
        setMessages(msgList);
      } catch (err) {
        console.error('Error loading mentorship workspace:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeData?.active) return;

    try {
      const msg = await api.sendMessage(
        activeData.active.facultyId,
        newMessage,
        activeData.active.id
      );
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading mentorship workspace...</div>;
  }

  // ==========================================
  // SECTION 16: FACULTY UNAVAILABLE FALLBACK
  // ==========================================
  if (!activeData?.active) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900">
            Your faculty mentor may not be immediately available.
          </h2>

          <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Faculty members are currently in department lectures, evaluating capstones, or your mentorship request is in queue.
          </p>

          <div className="mt-6 p-5 bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 rounded-2xl text-left">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#7A1528] text-[#C89B3C] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Meet EduPilot AI Mentor</h4>
                <span className="text-[11px] text-slate-500">Instant 24/7 Academic First-Line Guidance</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              Get immediate roadmap planning, skill-gap analysis, capstone project ideation, or prepare a formal summary before connecting with faculty.
            </p>

            <Link
              to="/student/ai-mentor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7A1528] hover:bg-[#631020] text-white text-xs font-bold shadow-xs shadow-[#7A1528]/25 transition-all"
            >
              <span>Start AI Mentoring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <Link to="/student/find-mentor" className="text-[#7A1528] font-bold hover:underline">
              Search Available Faculty Mentors &rarr;
            </Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link to="/student/requests" className="text-slate-600 font-medium hover:underline">
              View Pending Token Requests
            </Link>
          </div>
        </div>

        <AIMentorNotice />
      </div>
    );
  }

  // ==========================================
  // ACTIVE MENTORSHIP WORKSPACE
  // ==========================================
  const { faculty, active } = activeData;

  return (
    <div className="space-y-6">
      {/* Mentor Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={faculty?.user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={active.facultyName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{active.facultyName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Faculty Guide
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {faculty?.profile?.designation} • {active.facultyDepartment}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                <span>Token: <strong className="font-mono text-[#7A1528]">{active.requestToken}</strong></span>
                <span>•</span>
                <span>Office: <strong>{faculty?.profile?.officeLocation || 'Academic Block B'}</strong></span>
                <span>•</span>
                <span>Hours: <strong>{faculty?.profile?.officeHours || 'Mon & Thu 2-4 PM'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/appointments"
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C89B3C]" />
              Schedule Review
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Mentorship Communication & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chat & Interaction */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Chat Workspace */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-bold text-xs text-slate-900">
                  Direct Faculty Channel with {active.facultyName}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Encrypted Campus Channel</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No messages yet. Send an update or question to your faculty mentor.
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-3 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-[#7A1528] text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className={`text-[10px] font-bold ${isMe ? 'text-rose-200' : 'text-[#7A1528]'}`}>
                            {msg.senderName}
                          </span>
                          <span className={`text-[9px] ${isMe ? 'text-rose-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Share your progress update, code link, or question..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#7A1528] hover:bg-[#631020] text-white rounded-xl shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Tasks & Goal Summary */}
        <div className="space-y-6">
          {/* Assigned Tasks Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-slate-900">Faculty Assigned Tasks</h3>
              <Link to="/student/tasks" className="text-[11px] text-[#7A1528] font-bold hover:underline">
                View All
              </Link>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No pending faculty tasks</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{task.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">Due: {task.deadline}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal & Milestone Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-slate-900">Capstone Roadmap Milestones</h3>
              <Link to="/student/goals" className="text-[11px] text-[#7A1528] font-bold hover:underline">
                Manage Goals
              </Link>
            </div>

            {goals.length > 0 && goals[0] && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">{goals[0].title}</p>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-[#7A1528]">{goals[0].progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A1528] h-full rounded-full"
                    style={{ width: `${goals[0].progressPercentage}%` }}
                  ></div>
                </div>

                <div className="mt-3 space-y-1.5">
                  {goals[0].milestones.slice(0, 3).map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${m.completed ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={m.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
