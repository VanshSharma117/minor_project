import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Clock,
  CheckCircle2,
  Send,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { subscribeToMessages } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Task, Goal, MentorshipRequest, Message } from '../../types';

export const MyMentoringPage: React.FC = () => {
  const { user } = useAuth();
  const [activeData, setActiveData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMentoring() {
      try {
        const [ment, taskList, goalList, reqList, msgList] = await Promise.all([
          api.getActiveMentorship(),
          api.getTasks(),
          api.getGoals(),
          api.getMentorshipRequests(),
          api.getMessages()
        ]);
        setActiveData(ment);
        setTasks(taskList);
        setGoals(goalList);
        setRequests(reqList);
        setMessages(msgList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMentoring();
  }, []);

  // Real-time Socket.IO subscription for instant message delivery
  useEffect(() => {
    if (!activeData?.active?.id && !user?.id) return;

    const unsubscribe = subscribeToMessages(user?.id, activeData?.active?.id, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return unsubscribe;
  }, [user?.id, activeData?.active?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeData?.active) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const msg = await api.sendMessage(
        activeData.active.facultyId,
        textToSend,
        activeData.active.id
      );
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setNewMessage(textToSend);
    }
  };

  const handleMarkTaskComplete = async (taskId: string) => {
    try {
      const updated = await api.updateTaskStatus(taskId, { status: 'Completed' });
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading mentoring workspace...</div>;
  }

  // ==========================================
  // CASE 1: NO ACTIVE MENTOR YET
  // ==========================================
  if (!activeData?.active) {
    const pendingReqs = requests.filter(r => r.status === 'Pending');

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Mentoring</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your active faculty advisory relationship.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <UserCheck className="w-7 h-7" />
          </div>

          <h2 className="text-base font-bold text-slate-900">
            You don't have a faculty mentor yet.
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Find a faculty mentor in your department or start an AI guidance session for instant roadmaps.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              to="/student/find-mentor"
              className="px-5 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Find a Mentor
            </Link>
            <Link
              to="/student/ai-mentor"
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#7A1528] text-xs font-bold rounded-xl border border-rose-200/80 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#C89B3C]" />
              Talk to EduPilot AI
            </Link>
          </div>
        </div>

        {/* Show pending tokens if any */}
        {pendingReqs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h3 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Mentorship Requests ({pendingReqs.length})
            </h3>
            <div className="space-y-2.5">
              {pendingReqs.map(req => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{req.facultyName}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[11px] text-[#7A1528]">{req.token}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{req.mentoringArea}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
                    Pending Approval
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // CASE 2: ACTIVE MENTORSHIP WORKSPACE
  // ==========================================
  const { active, faculty } = activeData;
  const currentGoal = goals[0];
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header: Faculty Name, Department, Mentorship Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={faculty?.user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
              alt={active.facultyName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{active.facultyName}</h1>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active Mentor
                </span>
              </div>
              <p className="text-xs text-slate-500">{active.facultyDepartment}</p>
              <p className="text-[11px] text-[#7A1528] font-medium mt-0.5">
                Token: <span className="font-mono font-semibold">{active.requestToken}</span> • Area: {active.mentoringArea}
              </p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-[#7A1528] hover:bg-[#631020] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{showChat ? 'Hide Chat' : 'Message Mentor'}</span>
            </button>
            <Link
              to="/student/tasks"
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
            >
              View Tasks
            </Link>
          </div>
        </div>

        {/* 2. Current Goal & Progress */}
        {currentGoal && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800">Current Goal: {currentGoal.title}</span>
              <span className="font-bold text-[#7A1528]">{currentGoal.progressPercentage}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#7A1528] h-full rounded-full transition-all duration-500"
                style={{ width: `${currentGoal.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Embedded Chat Section (Toggleable) */}
      {showChat && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <h3 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#7A1528]" />
            Messages with {active.facultyName}
          </h3>

          <div className="max-h-72 overflow-y-auto space-y-2.5 mb-3 p-4 bg-stone-50/70 rounded-2xl border border-stone-200/70">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No messages yet. Send a greeting to start your mentoring conversation!</p>
            ) : (
              messages.map(m => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-page`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-md ${
                      isMe
                        ? 'bg-[#7A1528] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-stone-200/80 rounded-bl-xs shadow-2xs'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                        <span className={`font-bold ${isMe ? 'text-amber-200' : 'text-slate-900'}`}>
                          {isMe ? 'You' : active.facultyName}
                        </span>
                        <span className={isMe ? 'text-rose-200' : 'text-slate-400'}>
                          {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a message to your mentor..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50/60 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white text-xs font-bold rounded-xl shadow-xs btn-press cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 4. Current Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#7A1528]" />
            Current Tasks
          </h3>
          <Link to="/student/tasks" className="text-xs font-semibold text-[#7A1528] hover:underline">
            Manage All
          </Link>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-2.5">
            {tasks.map(task => (
              <div
                key={task.id}
                className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Due: {task.deadline}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {task.status}
                  </span>
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => handleMarkTaskComplete(task.id)}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-[11px] font-semibold"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
