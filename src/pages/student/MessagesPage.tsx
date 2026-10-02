import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import { subscribeToMessages } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeData, setActiveData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadChat() {
      try {
        const [ment, msgList] = await Promise.all([
          api.getActiveMentorship(),
          api.getMessages()
        ]);
        setActiveData(ment);
        setMessages(msgList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, []);

  const isFaculty = user?.role === 'faculty';
  const facultyActiveList = isFaculty ? (activeData?.actives || []) : [];
  const currentFacultyMentee = facultyActiveList[selectedStudentIdx] || null;

  // Active mentorship details depending on user role
  const activeMentorshipId = isFaculty
    ? currentFacultyMentee?.mentorship?.id
    : activeData?.active?.id;

  const otherPersonName = isFaculty
    ? (currentFacultyMentee?.mentorship?.studentName || 'Student')
    : (activeData?.active?.facultyName || 'Faculty Mentor');

  const otherPersonAvatar = isFaculty
    ? currentFacultyMentee?.student?.user?.avatarUrl
    : activeData?.faculty?.user?.avatarUrl;

  const otherPersonSubtitle = isFaculty
    ? `${currentFacultyMentee?.student?.profile?.department || 'Department'} • Semester ${currentFacultyMentee?.student?.profile?.semester || ''}`
    : `${activeData?.faculty?.profile?.department || activeData?.active?.facultyDepartment || 'Department'} • Office: ${activeData?.faculty?.profile?.officeLocation || 'Campus'}`;

  const otherPersonToken = isFaculty
    ? currentFacultyMentee?.mentorship?.requestToken
    : activeData?.active?.requestToken;

  const mentoringArea = isFaculty
    ? currentFacultyMentee?.mentorship?.mentoringArea
    : activeData?.active?.mentoringArea;

  const recipientId = isFaculty
    ? currentFacultyMentee?.student?.user?.id
    : activeData?.active?.facultyId;

  // Real-time Socket.IO subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessages(user.id, activeMentorshipId, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return unsubscribe;
  }, [user?.id, activeMentorshipId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedStudentIdx]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const msg = await api.sendMessage(
        recipientId,
        textToSend,
        activeMentorshipId
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

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading messaging center...</div>;
  }

  // CASE 1: Student has no active mentor
  if (!isFaculty && !activeData?.active) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-base text-slate-900">Direct Human Faculty Chat</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Direct private messaging is reserved for verified faculty-student pairs with an approved mentorship request token.
        </p>

        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-left">
          <p className="font-bold text-xs text-[#7A1528] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C89B3C]" /> EduPilot AI Mentor is Ready 24/7
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Need immediate guidance without waiting for faculty office hours? Chat with your AI Mentor anytime.
          </p>
          <Link
            to="/student/ai-mentor"
            className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-[#7A1528] text-white rounded-lg text-xs font-bold"
          >
            <span>Ask EduPilot AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // CASE 2: Faculty has no active mentees
  if (isFaculty && facultyActiveList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-base text-slate-900">Direct Student Messages</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          You currently have no active students assigned. Accept incoming mentorship requests from your Requests queue to begin direct advising.
        </p>
        <Link
          to="/faculty/requests"
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#7A1528] text-white text-xs font-bold rounded-xl shadow-xs"
        >
          <span>View Mentorship Requests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Filter messages for current active conversation
  const displayedMessages = messages.filter(m => {
    if (activeMentorshipId && m.mentorshipId) {
      return m.mentorshipId === activeMentorshipId;
    }
    if (recipientId) {
      return (
        (m.senderId === user?.id && m.recipientId === recipientId) ||
        (m.senderId === recipientId && m.recipientId === user?.id)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Faculty multi-student selector if faculty has multiple active students */}
      {isFaculty && facultyActiveList.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">Student:</span>
          {facultyActiveList.map((item: any, idx: number) => (
            <button
              key={item.mentorship.id}
              onClick={() => setSelectedStudentIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                idx === selectedStudentIdx
                  ? 'bg-[#7A1528] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.mentorship.studentName}
            </button>
          ))}
        </div>
      )}

      {/* Human Faculty / Student Chat Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherPersonAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={otherPersonName}
              className="w-12 h-12 rounded-xl object-cover border"
            />
            <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900">{otherPersonName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {isFaculty ? 'Mentee' : 'Verified Faculty'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {otherPersonSubtitle}
            </p>
            {otherPersonToken && (
              <span className="text-[10px] font-mono text-[#7A1528] font-bold">
                Token: {otherPersonToken}
              </span>
            )}
          </div>
        </div>

        {mentoringArea && (
          <div className="hidden sm:block text-right text-xs">
            <span className="text-slate-400 block text-[10px]">Mentoring Focus:</span>
            <span className="font-semibold text-slate-800">{mentoringArea}</span>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {displayedMessages.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No messages yet. Send a greeting to start the mentoring discussion!</p>
            </div>
          ) : (
            displayedMessages.map(msg => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#7A1528] text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`font-bold text-[10px] ${isMe ? 'text-rose-200' : 'text-[#7A1528]'}`}>
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      <span className={`text-[9px] ${isMe ? 'text-rose-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Type your message to ${otherPersonName.split(' ')[0]}...`}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-[#7A1528] hover:bg-[#631020] disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
