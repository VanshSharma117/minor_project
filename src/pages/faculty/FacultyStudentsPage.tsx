import React, { useEffect, useState, useRef } from 'react';
import { Users, X, CheckSquare, MessageSquare, Target, User, Send } from 'lucide-react';
import { api } from '../../services/api';
import { subscribeToMessages } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';

export const FacultyStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentMessages, setStudentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick message from modal
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getActiveMentorship();
        setActiveStudents(data.actives || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // When a student is selected, load conversation and subscribe to real-time Socket.IO
  useEffect(() => {
    if (!selectedStudent) {
      setStudentMessages([]);
      return;
    }

    const mentorshipId = selectedStudent.mentorship?.id;
    const studentUserId = selectedStudent.student?.user?.id;

    async function loadMessages() {
      try {
        const allMsgs = await api.getMessages(mentorshipId);
        const filtered = allMsgs.filter(m =>
          (mentorshipId && m.mentorshipId === mentorshipId) ||
          (studentUserId && (m.senderId === studentUserId || m.recipientId === studentUserId))
        );
        setStudentMessages(filtered);
      } catch (err) {
        console.error('Failed to load messages for student modal:', err);
      }
    }
    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = subscribeToMessages(user?.id, mentorshipId, (msg) => {
      setStudentMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return unsubscribe;
  }, [selectedStudent, user?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [studentMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedStudent) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSendingMsg(true);

    try {
      const newMsg = await api.sendMessage(
        selectedStudent.student.user.id,
        textToSend,
        selectedStudent.mentorship.id
      );
      setStudentMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err: any) {
      alert(err.message || 'Failed to send');
      setMessageText(textToSend);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Students</h1>
        <p className="text-xs text-slate-500 mt-1">
          Active students assigned under your direct mentoring supervision.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading mentees...</div>
      ) : activeStudents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-800">No active students</h3>
          <p className="text-xs text-slate-500 mt-1">Accept pending mentorship requests to begin mentoring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeStudents.map(item => (
            <div
              key={item.mentorship.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={item.student.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={item.mentorship.studentName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.mentorship.studentName}</h3>
                    <p className="text-xs text-slate-500">
                      {item.student.profile?.department || 'B.Tech IT'} • Semester {item.student.profile?.semester || 7}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mb-3">
                  <p>
                    <span className="text-slate-400">Goal:</span>{' '}
                    <strong>{item.student.profile?.careerGoal || 'AI/ML Engineer'}</strong>
                  </p>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Progress:</span>
                      <span className="font-bold text-[#7A1528]">{item.student.profile?.profileCompletion || 65}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7A1528] h-full rounded-full"
                        style={{ width: `${item.student.profile?.profileCompletion || 65}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(item)}
                className="w-full py-2 text-xs font-bold rounded-xl bg-[#7A1528] text-white hover:bg-[#631020] shadow-xs cursor-pointer"
              >
                View Student
              </button>
            </div>
          ))}
        </div>
      )}

      {/* View Student Modal (Section 8: Profile, Goals, Tasks, Messages, Progress) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.student.user?.avatarUrl}
                  alt={selectedStudent.mentorship.studentName}
                  className="w-12 h-12 rounded-xl object-cover border"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedStudent.mentorship.studentName}</h3>
                  <p className="text-slate-500">
                    {selectedStudent.student.profile?.department} • Semester {selectedStudent.student.profile?.semester}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-slate-700">
              {/* Profile Details */}
              <div>
                <span className="font-bold text-slate-900 block mb-1">Student Goal & Skills</span>
                <p className="text-slate-600 mb-2">Goal: <strong>{selectedStudent.student.profile?.careerGoal}</strong></p>
                <div className="flex flex-wrap gap-1">
                  {selectedStudent.student.profile?.skills?.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-bold text-slate-900">Overall Progress</span>
                  <span className="font-bold text-[#7A1528]">{selectedStudent.student.profile?.profileCompletion || 65}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A1528] h-full rounded-full"
                    style={{ width: `${selectedStudent.student.profile?.profileCompletion || 65}%` }}
                  ></div>
                </div>
              </div>

              {/* Real-time Message Thread with Student */}
              <div>
                <span className="font-bold text-slate-900 block mb-1.5 flex items-center justify-between">
                  <span>Conversation with {selectedStudent.mentorship.studentName}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Chat
                  </span>
                </span>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2">
                  {studentMessages.length === 0 ? (
                    <p className="text-slate-400 text-[11px] text-center py-3">No messages yet. Send guidance below!</p>
                  ) : (
                    studentMessages.map(m => {
                      const isMe = m.senderId === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                            isMe ? 'bg-[#7A1528] text-white' : 'bg-white text-slate-800 border'
                          }`}>
                            <div className="flex justify-between items-center gap-2 mb-0.5 text-[10px]">
                              <span className={`font-bold ${isMe ? 'text-rose-200' : 'text-[#7A1528]'}`}>
                                {isMe ? 'You' : m.senderName}
                              </span>
                              <span className={isMe ? 'text-rose-200' : 'text-slate-400'}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="leading-relaxed">{m.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message or instruction..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !messageText.trim()}
                    className="px-3.5 py-2 bg-[#7A1528] hover:bg-[#631020] disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 border rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
